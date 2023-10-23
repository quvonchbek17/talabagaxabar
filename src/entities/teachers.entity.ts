import { Entity, Column, OneToMany, OneToOne, ManyToOne, JoinColumn } from 'typeorm'
import { BaseModel } from './model.entity';
import { FacultiesRepository } from './faculties.entity';
import { DepartmentsRepository } from './departments.entity';

@Entity("teachers")
export class TeachersRepository extends BaseModel {

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

    @ManyToOne(type => DepartmentsRepository, department => department.teachers)
    @JoinColumn({name: "department_id"})
    department: DepartmentsRepository;

    @ManyToOne(type => FacultiesRepository, faculty => faculty.teachers)
    @JoinColumn({name: "faculty_id"})
    faculty: FacultiesRepository;

}