import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateGroupDto, UpdateGroupDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin, Course, Direction, Education, Group } from '@entities';
import { Repository } from 'typeorm';
import { rolesName } from '@common';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    @InjectRepository(Direction)
    private readonly directionRepo: Repository<Direction>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(Education)
    private readonly educationRepo: Repository<Education>,
  ) {}

  async create(body: CreateGroupDto, adminId: string) {
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

      let checkDuplicate = await this.groupRepo.findOne({
        where: {
          name: body.name,
          faculty: { id: admin.faculty?.id },
          direction: { id: body.direction_id },
          course: { id: body.course_id },
          education: { id: body.education_id }
        }
      });

      if (checkDuplicate) {
        throw new HttpException(
          "Bu guruh avval qo'shilgan",
          HttpStatus.CONFLICT,
        );
      }

      let direction = await this.directionRepo.findOne({
        where: { id: body.direction_id, faculty: {id: admin.faculty?.id} },
      });

      if(!direction){
        throw new HttpException(
          "Bu yo'nalish mavjud emas",
          HttpStatus.NOT_FOUND,
        );
      }

      let course = await this.courseRepo.findOne({
        where: { id: body.course_id, faculty: {id: admin.faculty?.id} },
      });

      if(!course){
        throw new HttpException(
          "Bu kurs mavjud emas",
          HttpStatus.NOT_FOUND,
        );
      }

      let education = await this.educationRepo.findOne({
        where: { id: body.education_id, faculty: {id: admin.faculty?.id} },
      });

      if(!education){
        throw new HttpException(
          "Bu ta'lim turi  mavjud emas",
          HttpStatus.NOT_FOUND,
        );
      }

      let group = this.groupRepo.create({
        name: body.name,
        direction,
        education,
        course,
        faculty: admin.faculty,
      });
      await group.save();
      return {
        statusCode: HttpStatus.OK,
        message: "Guruh saqlandi",
        success: true,
        data: group,
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async get(search: string, direction_id: string, course_id: string, education_id: string, faculty_id: string, page: number, limit: number, adminId: string) {
    try {
      page = page ? page : 1
      limit = limit ? limit : 10

      let admin = await this.adminRepo.findOne({
        where: { id: adminId },
        relations: { faculty: true, role: true },
      });

      let qb = this.groupRepo.createQueryBuilder('g')
      .leftJoinAndSelect('g.course', 'c')
      .leftJoinAndSelect('g.direction', 'd')
      .leftJoinAndSelect('g.education', 'e')
      if(search){
        qb.where('g.name ILike :search', { search: `%${search}%` })
      }

      if(direction_id){
        qb.where('d.id = :directionId', { directionId: direction_id })
      }

      if(course_id){
        qb.where('c.id = :courseId', { courseId: course_id })
      }

      if(education_id){
        qb.where('e.id = :educationId', { educationId: education_id })
      }

      if (admin.role?.name === rolesName.super_admin) {
        qb.innerJoin('g.faculty', 'f')
        .select(['g.id', 'g.name', 'f.id', 'f.name', 'c.id', 'c.name', 'd.id', 'd.name', 'e.id', 'e.name'])

        if(faculty_id){
          qb.where('f.id = :facultyId', { facultyId: faculty_id })
        }
      } else {
        if (!admin.faculty) {
          throw new HttpException(
            "Sizning fakultetingiz yo'q",
            HttpStatus.FORBIDDEN,
          );
        }

        qb.select(['g.id', 'g.name', 'c.id', 'c.name', 'd.id', 'd.name', 'e.id', 'e.name'])
        .andWhere('g.faculty_id = :id', { id: admin.faculty?.id })
      }

      let [groups, count] = await qb
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
          items: groups,
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
        let group = await this.groupRepo.findOne({
          where: { id },
          relations: { faculty: true, direction: true, course: true, education: true },
        });
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: group,
        };
      }

      if (!admin.faculty) {
        throw new HttpException(
          "Sizning fakultetingiz yo'q",
          HttpStatus.FORBIDDEN,
        );
      }
      let group = await this.groupRepo.findOne({
        where: { id, faculty: { id: admin.faculty.id } },
        relations: {direction: true, course: true, education: true}
      });
      if (group) {
        return {
          statusCode: HttpStatus.OK,
          success: true,
          data: group,
        };
      } else {
        throw new HttpException(
          "Sizning fakultetingizda bunday idlik guruh yo'q",
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

  async update(id: string, body: UpdateGroupDto, adminId: string) {
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

      let group = await this.groupRepo.findOne({
        where: { id, faculty: { id: admin.faculty.id } },
        relations: { faculty: true, direction: true, course: true, education: true },
      });

      if (!group) {
        throw new HttpException(
          'Bunday guruh mavjud emas yoki siz uchun ruxsat berilmagan',
          HttpStatus.NOT_FOUND,
        );
      }

      let direction = await this.directionRepo.createQueryBuilder("d")
      .innerJoin('d.faculty', 'f')
      .where('d.id = :directionId AND f.id = :facultyId', {directionId: body.direction_id, facultyId: admin.faculty?.id})
      .getOne()

      if(body.direction_id && !direction){
        throw new HttpException(
          "Bunday yo'nalish mavjud emas yoki siz uchun ruxsat berilmagan",
          HttpStatus.NOT_FOUND,
        );
      }

      let education = await this.educationRepo.createQueryBuilder("e")
      .innerJoin('e.faculty', 'f')
      .where('e.id = :educationId AND f.id = :facultyId', {educationId: body.education_id, facultyId: admin.faculty?.id})
      .getOne()

      if(body.education_id && !education){
        throw new HttpException(
          "Bunday ta'lim turi mavjud emas yoki siz uchun ruxsat berilmagan",
          HttpStatus.NOT_FOUND,
        );
      }

      let course = await this.courseRepo.createQueryBuilder("c")
      .innerJoin('c.faculty', 'f')
      .where('c.id = :courseId AND f.id = :facultyId', {courseId: body.course_id, facultyId: admin.faculty?.id})
      .getOne()

      if(body.course_id && !course){
        throw new HttpException(
          'Bunday kurs mavjud emas yoki siz uchun ruxsat berilmagan',
          HttpStatus.NOT_FOUND,
        );
      }


      let checkDuplicate = await this.groupRepo.createQueryBuilder('g')
      .innerJoin('g.faculty', 'f')
      .leftJoinAndSelect('g.direction', 'd')
      .leftJoinAndSelect('g.course', 'c')
      .leftJoinAndSelect('g.education', 'e')
      .where('g.id != :groupId AND g.name = :name AND d.id = :directionId AND c.id = :courseId AND e.id = :educationId  AND f.id = :facultyId',
       {groupId: group.id ,name: body.name, directionId: body.direction_id || group.direction?.id, educationId:body.education_id || group.education?.id, courseId: body.course_id || group.course?.id, facultyId: admin.faculty?.id })
      .getOne()

      if (checkDuplicate) {
        throw new HttpException(
          'Bu guruh allaqachon mavjud',
          HttpStatus.CONFLICT,
        );
      }

      group.name = body.name || group.name
      group.direction = direction || group.direction
      group.course = course || group.course
      group.education = education || group.education
      group.updated_at = new Date()

      await this.groupRepo.save(group)
      return {
        success: true,
        message: 'Yangilandi',
        statusCode: HttpStatus.OK,
        data: await this.groupRepo.findOne({ where: { id }, relations: {direction: true, course:true, education: true} }),
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

      let group = await this.groupRepo.findOne({
        where: { id, faculty: {id: admin.faculty.id}}
      });

      if (group) {
        await this.groupRepo.remove(group);
        return {
          success: true,
          statusCode: HttpStatus.OK,
          message: "O'chirildi",
        };
      } else {
        throw new HttpException(
          "Bunday guruh turi yo'q",
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
