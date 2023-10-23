import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { BaseModel } from './model.entity';
import { FacultiesRepository } from './faculties.entity';
import { TeachersRepository } from './teachers.entity';
import { SciencesRepository } from './sciences.entity';

@Entity("departments")
export class DepartmentsRepository extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @ManyToOne(type => FacultiesRepository, faculty => faculty.departments)
    @JoinColumn({name: "faculty_id"})
    faculty: FacultiesRepository;

    @OneToMany(type => TeachersRepository, teacher => teacher.department)
    teachers: TeachersRepository[];

    @OneToMany(type => SciencesRepository, science => science.department)
    sciences: SciencesRepository[];
}