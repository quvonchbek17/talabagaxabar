import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm'
import { BaseModel } from './model.entity';
import { Faculty } from './faculty.entity';
import { Schedule } from './schedule.entity';
import { Education } from './education.entity';

@Entity("times")
export class Time extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @ManyToOne(type => Education, education => education.times)
    @JoinColumn({name:"education_id"})
    education: Education

    @ManyToOne(type => Faculty, faculty => faculty.directions)
    @JoinColumn({name:"faculty_id"})
    faculty: Faculty


    @OneToMany(type => Schedule, schedule => schedule.time)
    schedules: Schedule[];
}