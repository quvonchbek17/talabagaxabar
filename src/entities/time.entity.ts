import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseModel } from './model.entity';
import { Faculty } from './faculty.entity';

@Entity("times")
export class Time extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @ManyToOne(type => Faculty, faculty => faculty.directions)
    @JoinColumn({name:"faculty_id"})
    faculty: Faculty
}