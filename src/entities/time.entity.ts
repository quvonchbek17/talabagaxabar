import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { BaseModel } from './model.entity';
import { Faculty } from './faculty.entity';
import { Schedule } from './schedule.entity';

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


    @OneToMany(type => Schedule, schedule => schedule.time)
    schedules: Schedule[];
}