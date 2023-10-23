import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { BaseModel } from './model.entity';
import { FacultiesRepository } from './faculties.entity';
import { GroupsRepository } from './groups.entity';

@Entity("educations")
export class EducationsRepository extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @ManyToOne(type => FacultiesRepository, faculty => faculty.educations)
    @JoinColumn({name: "faculty_id"})
    faculty: FacultiesRepository;

    @OneToMany(type => GroupsRepository, group => group.education)
    groups: GroupsRepository[];
}