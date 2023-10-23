import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm'
import { BaseModel } from './model.entity';
import { GroupsRepository } from './groups.entity';
import { FacultiesRepository } from './faculties.entity';

@Entity("courses")
export class CoursesRepository extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @OneToMany(type => GroupsRepository, group => group.course)
    groups: GroupsRepository[];

    @ManyToOne(type => FacultiesRepository, faculty => faculty.courses)
    @JoinColumn({name: "faculty_id"})
    faculty: FacultiesRepository;
}