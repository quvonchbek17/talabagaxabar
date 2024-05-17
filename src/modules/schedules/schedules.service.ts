import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
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
import { Not, Repository } from 'typeorm';
import { rolesName } from '@common';

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
  ) {}

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
        .leftJoinAndSelect('sch.science', 's');

      if (day) {
        qb.andWhere('sch.day = :day', {
          day: day
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

      if (admin.role?.name === rolesName.super_admin) {
        qb.leftJoinAndSelect('sch.faculty', 'f').select([
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

      if (!time) {
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
      if (nonExistingGroupIds.length > 0) {
        throw new HttpException(
          `${nonExistingGroupIds.join(', ')} idlik guruhlar mavjud emas`,
          HttpStatus.BAD_REQUEST,
        );
      }
      ///////// Groups Time ////////////
      let busyGroups = [];
      if (body.time_id && body.groups?.length > 0) {
        for (let group_id of body.groups) {
          let checkDuplicate = await this.scheduleRepo.findOne({
            where: {
              id: Not(schedule.id),
              day: body.day || schedule.day,
              faculty: { id: admin.faculty?.id },
              group: { id: group_id },
              time: { id: body.time_id || schedule.time?.id },
            },
            relations: { group: true, time: true },
          });

          if (checkDuplicate) {
            busyGroups.push(checkDuplicate.group?.name);
          }
        }
      } else if (body.time_id || body.day) {
        let checkDuplicate = await this.scheduleRepo.findOne({
          where: {
            id: Not(schedule.id),
            day: body.day || schedule.day,
            faculty: { id: admin.faculty?.id },
            group: { id: schedule.group.id },
            time: { id: body.time_id || schedule.time?.id },
          },
          relations: { group: true, time: true },
        });

        if (checkDuplicate) {
          throw new HttpException(
            `${body.day || schedule.day} soat ${
              time.name || schedule.time?.name
            } vaqti uchun ${
              schedule.group.name
            } guruhiga dars avval qo'shilgan`,
            HttpStatus.CONFLICT,
          );
        }
      }

      if (busyGroups.length > 0) {
        throw new HttpException(
          `${body.day || schedule.day} soat ${
            time.name || schedule.time?.name
          } vaqti uchun ${busyGroups.join(
            ', ',
          )} guruhlariga dars avval qo'shilgan`,
          HttpStatus.CONFLICT,
        );
      }

      if (existingGroups.length > 0) {
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
        delete schedule.faculty

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

  async checkExistingGroups(
    groupIds: string[],
    faculty_id: string,
  ): Promise<{ nonExistingGroupIds: string[]; existingGroups: Group[] }> {
    const nonExistingGroupIds: string[] = [];
    const existingGroups: Group[] = [];
    if(groupIds?.length > 0){
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
    }
    return { nonExistingGroupIds, existingGroups };
  }
}
