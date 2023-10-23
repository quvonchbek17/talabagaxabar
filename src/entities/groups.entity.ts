import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { BaseModel } from './model.entity';
import { DirectionsRepository } from './directions.entity';
import { EducationsRepository } from './educations.entity';
import { CoursesRepository } from './courses.entity';
import { BotUserRepository } from './botusers.entity';

@Entity("groups")
export class GroupsRepository extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @ManyToOne(type => DirectionsRepository, direction => direction.groups)
    @JoinColumn({name: "direction_id"})
    direction: DirectionsRepository;

    @ManyToOne(type => EducationsRepository, education => education.groups)
    @JoinColumn({name: "education_id"})
    education: EducationsRepository;

    @ManyToOne(type => CoursesRepository, course => course.groups)
    @JoinColumn({name: "course_id"})
    course: CoursesRepository;

    @OneToMany(type => BotUserRepository, user => user.group)
    users: BotUserRepository[];
}