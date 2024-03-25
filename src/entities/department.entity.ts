import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { BaseModel } from './model.entity';
import { Faculty } from './faculty.entity';
import { Teacher } from './teacher.entity';
import { Science } from './science.entity';

@Entity("departments")
export class Department extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @ManyToOne(type => Faculty, faculty => faculty.departments)
    @JoinColumn({name: "faculty_id"})
    faculty: Faculty;

    @OneToMany(type => Teacher, teacher => teacher.department)
    teachers: Teacher[];

    @OneToMany(type => Science, science => science.department)
    sciences: Science[];
}