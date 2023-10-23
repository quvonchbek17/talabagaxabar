import { Entity, Column, OneToMany, OneToOne, ManyToOne, JoinColumn } from 'typeorm'
import { BaseModel } from './model.entity';
import { FacultiesRepository } from './faculties.entity';
import { DepartmentsRepository } from './departments.entity';
import { RoomsRepository } from './rooms.entity';

@Entity("sciences")
export class SciencesRepository extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @ManyToOne(type => FacultiesRepository, faculty => faculty.sciences)
    @JoinColumn({name: "faculty_id"})
    faculty: FacultiesRepository;

    @ManyToOne(type => RoomsRepository, room => room.sciences)
    @JoinColumn({name: "room_id"})
    room: RoomsRepository;

    @ManyToOne(type => DepartmentsRepository, department => department.sciences)
    @JoinColumn({name: "department_id"})
    department: DepartmentsRepository;

}