import { Entity, Column, OneToMany, OneToOne, ManyToOne, JoinColumn } from 'typeorm'
import { BaseModel } from './model.entity';
import { Faculty } from './faculty.entity';
import { Department } from './department.entity';

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

}