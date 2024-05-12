import { Entity, Column,  ManyToOne, JoinColumn } from 'typeorm'
import { BaseModel } from './model.entity';
import { Faculty } from './faculty.entity';
import { Department } from './department.entity';

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

    @ManyToOne(type => Department, department => department.sciences)
    @JoinColumn({name: "department_id"})
    department: Department;

}