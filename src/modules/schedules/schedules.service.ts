import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import * as pdf from 'pdf-creator-node';
import * as path from 'path';
import { v4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Admin,
  Group,
  Room,
  Schedule,
  Science,
  Teacher,
  Time,
} from '@entities';
import { In, Not, Repository } from 'typeorm';
import { rolesName } from '@common';
import { Cache } from 'cache-manager';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,
    @InjectRepository(Science)
    private readonly scienceRepo: Repository<Science>,
    @InjectRepository(Time)
    private readonly timeRepo: Repository<Time>,
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @Inject('CACHE_MANAGER')
    private cacheManager: Cache,
  ) {}

  async createSchedulePdf(groupIds: string[], adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true },
      });

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }
      let { nonExistingGroupIds, existingGroups } =
        await this.checkExistingGroups(groupIds, admin.faculty?.id);
      if (nonExistingGroupIds.length > 0) {
        throw new HttpException(
          `${nonExistingGroupIds.join(', ')} idlik guruhlar mavjud emas`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (existingGroups?.length > 0) {
        let allSchedules = await this.scheduleRepo.find({
          where: { group: { id: In(groupIds) } },
          relations: { group: true },
        });

        let days: Set<string> = new Set();
        for (let schedule of allSchedules) {
          days.add(schedule.day);
        }

        const daysArray: string[] = Array.from(days);

        // Haftaning kunlari tartibi bo'yicha massiv
        const weekDaysOrder: string[] = [
          'Dushanba',
          'Seshanba',
          'Chorshanba',
          'Payshanba',
          'Juma',
          'Shanba',
          'Yakshanba',
        ];

        // Massivni kerakli tartibda joylashtirish
        const sortedDaysArray: string[] = daysArray.sort((a, b) => {
          return weekDaysOrder.indexOf(a) - weekDaysOrder.indexOf(b);
        });

        let schedules = {};
        for (let day of sortedDaysArray) {
          let arr = [];
          for (let group of existingGroups) {
            let schedulesByGroupIds = await this.scheduleRepo.find({
              where: { group: { id: group.id }, day },
              relations: {
                group: true,
                teacher: true,
                science: true,
                room: true,
                time: true,
              },
            });
            arr.push(schedulesByGroupIds);
          }
          schedules[day] = arr;
        }

        const filename = v4() + '_doc' + '.pdf';
        let data = {
          schedules,
          groups: existingGroups,
        };
        Object.keys(data.schedules).forEach((day) => {
          data.schedules[day] = data.schedules[day].map((slot) => {
            return slot.length ? slot : [''];
          });
        });

        // Render the table
        let htmlTop = `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>

            table {
              width: 100%;
              border-collapse: collapse;
            }

            th,
            td {
              border: 1px solid black;
              padding: 8px;
              text-align: center;
            }

            th {
              background-color: #f2f2f2;
            }

            .time-wrapper {
              line-height: 1;
              padding-top: 0.5rem;
              position: relative;
              transform: rotate(180deg);
              white-space: nowrap;
              writing-mode: vertical-rl;
              left: 0;
              width: 25px;
              padding-bottom: 15px;
              box-sizing: border-box;
              text-align: left;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .group-name, .day-name {
              color: red;
              font-weight: bold;
            }

            p {
              margin: 0;
            }


            </style>
            <title>Jadval</title>
          </head>
          <body>`;

        let htmlBottom = ` </body>
          </html>`;
        var html =
          htmlTop +
          `<table border="1" style="width: 100%;"><thead>
        <tr>
        <td class="day-name">Kun</td>
        `;
        data.groups.forEach((group) => {
          html += `<td class="group-name">${group.name}</td>`;
        });
        html += `</tr>
        </thead>
        <tbody>`;

        Object.keys(data.schedules).forEach((day, index) => {
          let maxCount = Math.max(
            ...data.schedules[day].map((el) => el.length),
          );

          for (let i = 0; i < maxCount; i++) {
            if (i === 0) {
              html += `<tr><td class="day-name" rowspan=${maxCount}>${day.substring(
                0,
                2,
              )}</td>`;
            }
            data.schedules[day].forEach((el) => {
              let sched = el[i];
              if (sched) {
                html += `
                <td>
                  ${sched.science?.name},
                  ${sched.teacher?.name[0]}.${sched.teacher?.surname},
                  ${sched.room?.name}
                </td>`;
              } else {
                html += `<td></td>`;
              }
            });

            html += '</tr>';
          }
        });

        html += '</tbody></table>';
        html += htmlBottom;

        let filePath = path.join(
          process.cwd(),
          'src',
          'common',
          'docs',
          filename,
        );

        const document = {
          html: html,
          data,
          path: filePath,
        };
        let option = {
          formate: 'A3',
          orientation: 'portrait',
          border: '2mm',
        };
        await pdf.create(document, option);

        return filePath;
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async create(body: CreateScheduleDto, adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true },
      });

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }
      //////// Time ////////////
      let time = await this.timeRepo.findOne({
        where: { id: body.time_id, faculty: { id: admin.faculty?.id } },
      });

      if (!time) {
        throw new HttpException('Bu vaqt mavjud emas', HttpStatus.NOT_FOUND);
      }
      //////// Teacher ////////////
      let teacher = await this.teacherRepo.findOne({
        where: { id: body.teacher_id, faculty: { id: admin.faculty?.id } },
      });

      if (!teacher) {
        throw new HttpException(
          "Bu o'qituvchi mavjud emas",
          HttpStatus.NOT_FOUND,
        );
      }
      ///////// Science /////////////
      let science = await this.scienceRepo.findOne({
        where: { id: body.science_id, faculty: { id: admin.faculty?.id } },
      });

      if (!science) {
        throw new HttpException('Bu fan mavjud emas', HttpStatus.NOT_FOUND);
      }
      ///////// Room /////////////
      let room = await this.roomRepo.findOne({
        where: { id: body.room_id, faculty: { id: admin.faculty?.id } },
      });

      if (!room) {
        throw new HttpException('Bu xona mavjud emas', HttpStatus.NOT_FOUND);
      }

      ///////// Groups /////////////

      let { nonExistingGroupIds, existingGroups } =
        await this.checkExistingGroups(body?.groups, admin.faculty?.id);
      if (nonExistingGroupIds.length > 0) {
        throw new HttpException(
          `${nonExistingGroupIds.join(', ')} idlik guruhlar mavjud emas`,
          HttpStatus.BAD_REQUEST,
        );
      }
      ///////// Groups Time ////////////
      let busyGroups = [];
      for (let group_id of body.groups) {
        let checkDuplicate = await this.scheduleRepo.findOne({
          where: {
            day: body.day,
            faculty: { id: admin.faculty?.id },
            group: { id: group_id },
            time: { id: body.time_id },
          },
          relations: { group: true, time: true },
        });

        if (checkDuplicate) {
          busyGroups.push(checkDuplicate.group.name);
        }
      }

      if (busyGroups.length > 0) {
        throw new HttpException(
          `${body.day} soat ${time.name} vaqti uchun ${busyGroups.join(
            ', ',
          )} guruhlariga dars avval qo'shilgan`,
          HttpStatus.CONFLICT,
        );
      }
      let schedules = [];
      for (let group of existingGroups) {
        let schedule = this.scheduleRepo.create({
          day: body.day,
          teacher,
          time,
          group,
          science,
          room,
          faculty: admin.faculty,
        });
        await schedule.save();
        delete schedule.faculty;
        schedules.push(schedule);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'Jadvallar saqlandi',
        success: true,
        data: schedules,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async get(
    day: string,
    teacher_id: string,
    time_id: string,
    room_id: string,
    group_id: string,
    science_id: string,
    faculty_id: string,
    page: number,
    limit: number,
    adminId: string,
  ) {
    try {
      page = page ? page : 1;
      limit = limit ? limit : 10;

      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true, role: true },
      });

      let qb = this.scheduleRepo
        .createQueryBuilder('sch')
        .leftJoinAndSelect('sch.room', 'r')
        .leftJoinAndSelect('sch.teacher', 't')
        .leftJoinAndSelect('sch.group', 'g')
        .leftJoinAndSelect('sch.time', 'time')
        .leftJoinAndSelect('sch.science', 's')
        .leftJoinAndSelect('sch.faculty', 'f');

      if (admin.role?.name === rolesName.super_admin) {
        qb.select([
          'sch.id',
          'sch.day',
          't.id',
          't.name',
          't.surname',
          'time.id',
          'time.name',
          'r.id',
          'r.name',
          'r.floor',
          'r.capacity',
          'g.id',
          'g.name',
          's.id',
          's.name',
          'f.id',
          'f.name',
        ]);

        if (faculty_id) {
          qb.andWhere('f.id = :facultyId', { facultyId: faculty_id });
        }
      } else {
        if (!admin.faculty) {
          throw new HttpException(
            "Sizning fakultetingiz yo'q",
            HttpStatus.FORBIDDEN,
          );
        }

        qb.select([
          'sch.id',
          'sch.day',
          't.id',
          't.name',
          't.surname',
          'time.id',
          'time.name',
          'r.id',
          'r.name',
          'r.floor',
          'r.capacity',
          'g.id',
          'g.name',
          's.id',
          's.name',
        ]).andWhere('t.faculty_id = :id', { id: admin.faculty?.id });
      }

      if (day) {
        qb.andWhere('sch.day = :day', {
          day: day,
        });
      }

      if (teacher_id) {
        qb.andWhere('t.id = :teacherId', { teacherId: teacher_id });
      }

      if (science_id) {
        qb.andWhere('s.id = :scienceId', { scienceId: science_id });
      }

      if (time_id) {
        qb.andWhere('time.id = :timeId', { timeId: time_id });
      }

      if (group_id) {
        qb.andWhere('g.id = :groupId', { groupId: group_id });
      }

      if (room_id) {
        qb.andWhere('r.id = :roomId', { roomId: room_id });
      }

      let [schedules, count] = await qb
        .offset((page - 1) * limit)
        .limit(limit)
        .getManyAndCount();
      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'success',
        data: {
          currentPage: page,
          currentCount: limit,
          totalCount: count,
          totalPages: Math.ceil(count / limit),
          items: schedules,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getPublic(group_id: string) {
    try {

      let schedules = await this.scheduleRepo
        .createQueryBuilder('sch')
        .leftJoinAndSelect('sch.room', 'r')
        .leftJoinAndSelect('sch.teacher', 't')
        .leftJoinAndSelect('sch.group', 'g')
        .leftJoinAndSelect('sch.time', 'time')
        .leftJoinAndSelect('sch.science', 's')
        .select([
          'sch.id',
          'sch.day',
          't.id',
          't.name',
          't.surname',
          'time.id',
          'time.name',
          'r.id',
          'r.name',
          'r.floor',
          'r.capacity',
          'g.id',
          'g.name',
          's.id',
          's.name'
        ])
        .where('g.id = :groupId', { groupId: group_id })
        .getMany()

      return {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'success',
        data: schedules
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: string, adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true, role: true },
      });

      if (admin.role?.name === rolesName.super_admin) {
        let schedule = await this.scheduleRepo.findOne({
          where: { id },
          relations: {
            faculty: true,
            science: true,
            time: true,
            group: true,
            room: true,
            teacher: true,
          },
        });
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: schedule,
        };
      }

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }
      let schedule = await this.scheduleRepo.findOne({
        where: { id, faculty: { id: admin.faculty?.id } },
        relations: {
          science: true,
          time: true,
          group: true,
          room: true,
          teacher: true,
        },
      });
      if (schedule) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: schedule,
        };
      } else {
        throw new HttpException(
          "Sizning fakultetingizda bunday idlik jadval yo'q",
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, body: UpdateScheduleDto, adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true },
      });

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }

      let schedule = await this.scheduleRepo.findOne({
        where: { id, faculty: { id: admin.faculty?.id } },
        relations: {
          time: true,
          group: true,
          teacher: true,
          room: true,
          science: true,
          faculty: true,
        },
      });

      if (!schedule) {
        throw new HttpException(
          'Bu idlik jadval mavjud emas yoki sizga ruxsat berilmagan',
          HttpStatus.NOT_FOUND,
        );
      }

      //////// Time ////////////
      let time = await this.timeRepo.findOne({
        where: { id: body.time_id, faculty: { id: admin.faculty?.id } },
      });

      if (!time && body.time_id) {
        throw new HttpException('Bu vaqt mavjud emas', HttpStatus.NOT_FOUND);
      }
      //////// Teacher ////////////
      let teacher = await this.teacherRepo.findOne({
        where: { id: body.teacher_id, faculty: { id: admin.faculty?.id } },
      });

      if (body.teacher_id && !teacher) {
        throw new HttpException(
          "Bu o'qituvchi mavjud emas",
          HttpStatus.NOT_FOUND,
        );
      }
      ///////// Science /////////////
      let science = await this.scienceRepo.findOne({
        where: { id: body.science_id, faculty: { id: admin.faculty?.id } },
      });

      if (body.science_id && !science) {
        throw new HttpException('Bu fan mavjud emas', HttpStatus.NOT_FOUND);
      }
      ///////// Room /////////////
      let room = await this.roomRepo.findOne({
        where: { id: body.room_id, faculty: { id: admin.faculty?.id } },
      });

      if (body.room_id && !room) {
        throw new HttpException('Bu xona mavjud emas', HttpStatus.NOT_FOUND);
      }

      ///////// Groups /////////////

      let { nonExistingGroupIds, existingGroups } =
        await this.checkExistingGroups(body?.groups, admin.faculty?.id);
      if (nonExistingGroupIds?.length > 0 && body.groups?.length > 0) {
        throw new HttpException(
          `${nonExistingGroupIds.join(', ')} idlik guruhlar mavjud emas`,
          HttpStatus.BAD_REQUEST,
        );
      }

      if (existingGroups?.length > 0 && body.groups?.length > 0) {
        let schedules = [];
        let deleteSchedules = await this.scheduleRepo.find({
          where: {
            day: schedule.day,
            teacher: { id: schedule.teacher?.id },
            science: { id: schedule.science?.id },
            time: { id: schedule.time?.id },
            room: { id: schedule.room?.id },
          },
        });

        for (let deleteSchedule of deleteSchedules) {
          await this.scheduleRepo.remove(deleteSchedule);
        }

        for (let group of existingGroups) {
          let newSchedule = this.scheduleRepo.create({
            day: body.day || schedule.day,
            teacher: teacher || schedule.teacher,
            time: time || schedule.time,
            group,
            science: science || schedule.science,
            room: room || schedule.room,
            faculty: admin.faculty,
          });
          await newSchedule.save();
          delete newSchedule.faculty;
          schedules.push(newSchedule);
        }

        return {
          success: true,
          message: 'Yangilandi',
          statusCode: HttpStatus.OK,
          data: schedules,
        };
      } else {
        (schedule.day = body.day || schedule.day),
          (schedule.teacher = teacher || schedule.teacher),
          (schedule.time = time || schedule.time),
          (schedule.science = science || schedule.science),
          (schedule.room = room || schedule.room);
        schedule.updated_at = new Date();

        await this.scheduleRepo.save(schedule);
        delete schedule.faculty;

        return {
          success: true,
          message: 'Yangilandi',
          statusCode: HttpStatus.OK,
          data: schedule,
        };
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async remove(id: string, adminId: string) {
    try {
      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true },
      });

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }

      let schedule = await this.scheduleRepo.findOne({
        where: { id, faculty: { id: admin.faculty?.id } },
      });

      if (schedule) {
        await this.scheduleRepo.remove(schedule);
        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: "O'chirildi",
        };
      } else {
        throw new HttpException("Bunday jadval yo'q", HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async checkExistingGroups(groupIds: string[], faculty_id: string) {
    const nonExistingGroupIds: string[] = [];
    const existingGroups: Group[] = [];
    if (!groupIds?.length) {
      return {};
    }

    for (const groupId of groupIds) {
      const group = await this.groupRepo.findOne({
        where: { id: groupId, faculty: { id: faculty_id } },
      });
      if (!group) {
        nonExistingGroupIds.push(groupId);
      } else {
        existingGroups.push(group);
      }
    }

    return { nonExistingGroupIds, existingGroups };
  }
}
