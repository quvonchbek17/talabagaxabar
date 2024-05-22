import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm'
import { BaseModel } from './model.entity';
import { Faculty } from './faculty.entity';
import { Schedule } from './schedule.entity';

@Entity("rooms")
export class Room extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar'
    })
    name: string;

    @Column({
        name: 'capacity',
        type: 'int'
    })
    capacity: number;

    @Column({
        name: 'floor',
        type: 'int'
    })
    floor: number;

    @ManyToOne(type => Faculty, faculty => faculty.rooms)
    @JoinColumn({name: "faculty_id"})
    faculty: Faculty;

    @OneToMany(type => Schedule, schedule => schedule.room)
    schedules: Schedule[];
}