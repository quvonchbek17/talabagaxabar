import { Entity, Column, OneToMany, OneToOne, ManyToOne, JoinColumn } from 'typeorm'
import { BaseModel } from './model.entity';
import { Faculty } from './faculty.entity';
import { Department } from './department.entity';
import { Room } from './room.entity';

@Entity("sciences")
export class Science extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @ManyToOne(type => Faculty, faculty => faculty.sciences)
    @JoinColumn({name: "faculty_id"})
    faculty: Faculty;

    @ManyToOne(type => Room, room => room.sciences)
    @JoinColumn({name: "room_id"})
    room: Room;

    @ManyToOne(type => Department, department => department.sciences)
    @JoinColumn({name: "department_id"})
    department: Department;

}