import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm'
import { BaseModel } from './model.entity';
import { Group } from './group.entity';
import { Faculty } from './faculty.entity';

@Entity("courses")
export class Course extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @OneToMany(type => Group, group => group.course)
    groups: Group[];

    @ManyToOne(type => Faculty, faculty => faculty.courses)
    @JoinColumn({name: "faculty_id"})
    faculty: Faculty;
}
