import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { BaseModel } from './model.entity';
import { Faculty } from './faculty.entity';
import { Group } from './group.entity';

@Entity("directions")
export class Direction extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @ManyToOne(type => Faculty, faculty => faculty.directions)
    @JoinColumn({name:"faculty_id"})
    faculty: Faculty

    @OneToMany(type => Group, group => group.direction)
    groups: Group[];
}