import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRoomDto, UpdateRoomDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin, Room } from '@entities';
import { rolesName } from '@common';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}

  async create(body: CreateRoomDto, adminId: string) {
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
      let checkDuplicate = await this.roomRepo.findOne({
        where: {
          name: body.name,
          floor: body.floor,
          capacity: body.capacity,
          faculty: { id: admin.faculty?.id },
        },
      });

      if (checkDuplicate) {
        throw new HttpException(
          "Bu xona avval qo'shilgan",
          HttpStatus.CONFLICT,
        );
      }

      let department = this.roomRepo.create({
        ...body,
        faculty: admin.faculty,
      });
      await department.save();
      return {
        statusCode: HttpStatus.OK,
        message: 'Xona saqlandi',
        success: true,
        data: department,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async get(
    search: string,
    capacityTo: number,
    capacityFrom: number,
    floor: number,
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

      let qb = this.roomRepo.createQueryBuilder('r');

      if(search){
        qb.where('r.name ILike :search', {
          search: `%${search}%`,
        });
      }

      if (admin.role?.name === rolesName.super_admin) {
        qb.innerJoin('r.faculty', 'f')
          .select(['r.id', 'r.name', 'r.capacity', 'r.floor', 'f.id', 'f.name'])

      } else {
        if (!admin.faculty) {
          throw new HttpException(
            "Sizning fakultetingiz yo'q",
            HttpStatus.FORBIDDEN,
          );
        }
        qb.select(['r.id', 'r.name', 'r.capacity', 'r.floor'])
          .andWhere('r.faculty_id = :id', { id: admin.faculty?.id })
      }

      if (floor) {
        qb.andWhere('r.floor = :floor', { floor });
      }

      if (capacityFrom) {
        qb.andWhere('r.capacity >= :capacityFrom', { capacityFrom });
      }

      if (capacityTo) {
        qb.andWhere('r.capacity <= :capacityTo', { capacityTo });
      }

      let [rooms, count] = await qb
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
          items: rooms,
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
        let room = await this.roomRepo.findOne({
          where: { id },
          relations: { faculty: true },
        });

        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: room,
        };
      }

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }
      let room = await this.roomRepo.findOne({
        where: { id, faculty: { id: admin.faculty.id } },
      });
      if (room) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: room,
        };
      } else {
        throw new HttpException(
          "Sizning fakultetingizda bunday idlik xona yo'q",
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

  async update(id: string, body: UpdateRoomDto, adminId: string) {
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

      let room = await this.roomRepo.findOne({
        where: { id, faculty: { id: admin.faculty.id } },
        relations: { faculty: true },
      });

      if (!room) {
        throw new HttpException(
          'Bunday xona mavjud emas yoki siz uchun ruxsat berilmagan',
          HttpStatus.NOT_FOUND,
        );
      }


      let checkDuplicate = await this.roomRepo.createQueryBuilder('r')
      .innerJoin('r.faculty', 'f')
      .where('r.id != :roomId AND r.name = :name AND r.capacity = :capacity AND r.floor = :floor AND f.id = :facultyId',
       {roomId: room.id ,name: body.name, capacity: body.capacity, floor: body.floor, facultyId: admin.faculty?.id })
      .getOne()

      if (checkDuplicate) {
        throw new HttpException(
          'Bu xona allaqachon mavjud',
          HttpStatus.CONFLICT,
        );
      }

      room.name = body.name || room.name
      room.floor = body.floor || room.floor
      room.capacity = body.capacity || room.capacity

      await this.roomRepo.save(room)
      return {
        success: true,
        message: 'Yangilandi',
        statusCode: HttpStatus.OK,
        data: await this.roomRepo.findOne({ where: { id } }),
      };
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

      let room = await this.roomRepo.findOne({
        where: { id, faculty: {id: admin.faculty.id}}
      });

      if (room) {
        await this.roomRepo.remove(room);
        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: "O'chirildi",
        };
      } else {
        throw new HttpException(
          "Bunday xona yo'q",
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
}
