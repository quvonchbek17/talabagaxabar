import { Entity, Column, ManyToOne, OneToMany, JoinTable, JoinColumn } from 'typeorm'
import { BaseModel } from './model.entity';
import { UniversitiesRepository } from './universities.entity';
import { DirectionsRepository } from './directions.entity';
import { EducationsRepository } from './educations.entity';
import { DepartmentsRepository } from './departments.entity';
import { SciencesRepository } from './sciences.entity';
import { CoursesRepository } from './courses.entity';
import { AdminsRepository } from './admins.entity';
import { TeachersRepository } from './teachers.entity';
import { RoomsRepository } from './rooms.entity';
import { LocationRepository } from './locations.entity';
import { BotAdminRepository } from './botadmins.entity';

@Entity("faculties")
export class FacultiesRepository extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @ManyToOne((type) => UniversitiesRepository, university => university.faculties)
    @JoinColumn({name: "university_id"})
    university: UniversitiesRepository;

    @OneToMany((type) => DirectionsRepository, direction => direction.faculty)
    directions: DirectionsRepository[];

    @OneToMany((type) => EducationsRepository, education => education.faculty)
    educations: EducationsRepository[];

    @OneToMany((type) => DepartmentsRepository, department => department.faculty)
    departments: DepartmentsRepository[];

    @OneToMany((type) => SciencesRepository, science => science.faculty)
    sciences: SciencesRepository[];

    @OneToMany((type) => CoursesRepository, course => course.faculty)
    courses: CoursesRepository[];

    @OneToMany((type) => TeachersRepository, teacher => teacher.faculty)
    teachers: TeachersRepository[];

    @OneToMany((type) => RoomsRepository, room => room.faculty)
    rooms: RoomsRepository[];

    @OneToMany((type) => LocationRepository, location => location.faculty)
    locations: LocationRepository[];

    @OneToMany((type) => AdminsRepository, admin => admin.faculty)
    admins: AdminsRepository[];

    @OneToMany((type) => BotAdminRepository, botadmin => botadmin.faculty)
    botadmins: BotAdminRepository[];
}