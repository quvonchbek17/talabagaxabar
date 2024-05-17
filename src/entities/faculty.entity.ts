import { Entity, Column, ManyToOne, OneToMany, JoinTable, JoinColumn } from 'typeorm'
import { BaseModel } from './model.entity';
import { University } from './university.entity';
import { Direction } from './direction.entity';
import { Education } from './education.entity';
import { Department } from './department.entity';
import { Science } from './science.entity';
import { Course } from './course.entity';
import { Admin } from './admin.entity';
import { Teacher } from './teacher.entity';
import { Room } from './room.entity';
import { Location } from './location.entity';
import { BotAdmin } from './botadmins.entity';
import { Group } from './group.entity';
import { Time } from './time.entity';

@Entity("faculties")
export class Faculty extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @ManyToOne((type) => University, university => university.faculties)
    @JoinColumn({name: "university_id"})
    university: University;

    @OneToMany((type) => Direction, direction => direction.faculty)
    directions: Direction[];

    @OneToMany((type) => Education, education => education.faculty)
    educations: Education[];

    @OneToMany((type) => Department, department => department.faculty)
    departments: Department[];

    @OneToMany((type) => Science, science => science.faculty)
    sciences: Science[];

    @OneToMany((type) => Course, course => course.faculty)
    courses: Course[];

    @OneToMany((type) => Teacher, teacher => teacher.faculty)
    teachers: Teacher[];

    @OneToMany((type) => Room, room => room.faculty)
    rooms: Room[];

    @OneToMany((type) => Location, location => location.faculty)
    locations: Location[];

    @OneToMany((type) => Group, group => group.faculty)
    groups: Group[];

    @OneToMany((type) => Time, time => time.faculty)
    times: Time[];

    @OneToMany((type) => Admin, admin => admin.faculty)
    admins: Admin[];

    @OneToMany((type) => BotAdmin, botadmin => botadmin.faculty)
    botadmins: BotAdmin[];
}