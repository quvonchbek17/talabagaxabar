import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { BaseModel } from './model.entity';
import { Faculty } from './faculty.entity';
import { Science } from './science.entity';
import { Teacher } from './teacher.entity';
import { Room } from './room.entity';
import { Time } from './time.entity';
import { Group } from './group.entity';

@Entity("schedules")
export class Schedule extends BaseModel {

    @Column({
        name: 'day',
        type: 'varchar'
    })
    day: string;

    @ManyToOne(type => Science, science => science.schedules)
    @JoinColumn({name: "science_id"})
    science: Science;

    @ManyToOne(type => Teacher, teacher => teacher.schedules)
    @JoinColumn({name: "teacher_id"})
    teacher: Teacher;

    @ManyToOne(type => Room, room => room.schedules)
    @JoinColumn({name: "room_id"})
    room: Room;

    @ManyToOne(type => Time, time => time.schedules)
    @JoinColumn({name: "time_id"})
    time: Time;

    @ManyToOne(type => Group, group => group.schedules)
    @JoinColumn({name: "group_id"})
    group: Group;

    @ManyToOne(type => Faculty, faculty => faculty.sciences)
    @JoinColumn({name: "faculty_id"})
    faculty: Faculty;
}