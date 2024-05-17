import { Entity, Column,  ManyToOne, JoinColumn, ManyToMany, OneToMany } from 'typeorm'
import { BaseModel } from './model.entity';
import { Faculty } from './faculty.entity';
import { Teacher } from './teacher.entity';
import { Schedule } from './schedule.entity';

@Entity("sciences")
export class Science extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @ManyToOne(type => Faculty, faculty => faculty.sciences)
    @JoinColumn({name: "faculty_id"})
    faculty: Faculty;

    @ManyToMany(type => Teacher, teachers => teachers.sciences, {onDelete: "SET NULL"})
    teachers?: Teacher[];

    @OneToMany(type => Schedule, schedule => schedule.science)
    schedules: Schedule[];

}