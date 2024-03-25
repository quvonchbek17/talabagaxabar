import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm'
import { BaseModel } from './model.entity';
import { Faculty } from './faculty.entity';
import { Science } from './science.entity';

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
        type: 'varchar'
    })
    floor: string;

    @ManyToOne(type => Faculty, faculty => faculty.rooms)
    @JoinColumn({name: "faculty_id"})
    faculty: Faculty;

    @OneToMany(type => Science, science => science.room)
    sciences: Science[];
}