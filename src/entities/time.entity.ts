import { Entity, Column, ManyToOne, JoinColumn, OneToMany, ManyToMany } from 'typeorm'
import { BaseModel } from './model.entity';
import { Faculty } from './faculty.entity';
import { Schedule } from './schedule.entity';
import { Education } from './education.entity';
import { Group } from './group.entity';

@Entity("times")
export class Time extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @ManyToOne(type => Faculty, faculty => faculty.directions)
    @JoinColumn({name:"faculty_id"})
    faculty: Faculty

    @ManyToMany(type => Group, group => group.times, {onDelete: "SET NULL"})
    groups?: Group[];


    @OneToMany(type => Schedule, schedule => schedule.time)
    schedules: Schedule[];
}