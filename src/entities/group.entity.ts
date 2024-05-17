import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { BaseModel } from './model.entity';
import { Direction } from './direction.entity';
import { Education } from './education.entity';
import { Course } from './course.entity';
import { BotUser } from './botuser.entity';
import { Faculty } from './faculty.entity';

@Entity("groups")
export class Group extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @ManyToOne(type => Direction, direction => direction.groups)
    @JoinColumn({name: "direction_id"})
    direction: Direction;

    @ManyToOne(type => Education, education => education.groups)
    @JoinColumn({name: "education_id"})
    education: Education;

    @ManyToOne(type => Course, course => course.groups)
    @JoinColumn({name: "course_id"})
    course: Course;

    @ManyToOne(type => Faculty, faculty => faculty.groups)
    @JoinColumn({name: "faculty_id"})
    faculty: Course;

    @OneToMany(type => BotUser, user => user.group)
    users: BotUser[];
}