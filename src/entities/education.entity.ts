import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { BaseModel } from './model.entity';
import { Faculty } from './faculty.entity';
import { Group } from './group.entity';
import { Time } from './time.entity';

@Entity("educations")
export class Education extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @ManyToOne(type => Faculty, faculty => faculty.educations)
    @JoinColumn({name: "faculty_id"})
    faculty: Faculty;

    @OneToMany(type => Group, group => group.education)
    groups: Group[];
}