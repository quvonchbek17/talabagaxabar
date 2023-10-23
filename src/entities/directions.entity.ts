import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { BaseModel } from './model.entity';
import { FacultiesRepository } from './faculties.entity';
import { GroupsRepository } from './groups.entity';

@Entity("directions")
export class DirectionsRepository extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @ManyToOne(type => FacultiesRepository, faculty => faculty.directions)
    @JoinColumn({name:"faculty_id"})
    faculty: FacultiesRepository

    @OneToMany(type => GroupsRepository, group => group.direction)
    groups: GroupsRepository[];
}