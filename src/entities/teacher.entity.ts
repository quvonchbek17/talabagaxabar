import { Entity, Column, OneToMany, OneToOne, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm'
import { BaseModel } from './model.entity';
import { Faculty } from './faculty.entity';
import { Department } from './department.entity';
import { Science } from './science.entity';
import { Schedule } from './schedule.entity';

@Entity("teachers")
export class Teacher extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @Column({
        name: 'surname',
        type: 'varchar'
    })
    surname: string;

    @ManyToOne(type => Department, department => department.teachers)
    @JoinColumn({name: "department_id"})
    department: Department;

    @ManyToOne(type => Faculty, faculty => faculty.teachers)
    @JoinColumn({name: "faculty_id"})
    faculty: Faculty;

    @ManyToMany(type => Science, science => science.teachers, {onDelete: "SET NULL"})
    @JoinTable()
    sciences?: Science[];

    @OneToMany(type => Schedule, schedule => schedule.teacher)
    schedules: Schedule[];

}