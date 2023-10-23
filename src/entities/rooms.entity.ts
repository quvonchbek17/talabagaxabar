import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm'
import { BaseModel } from './model.entity';
import { FacultiesRepository } from './faculties.entity';
import { SciencesRepository } from './sciences.entity';

@Entity("rooms")
export class RoomsRepository extends BaseModel {

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

    @ManyToOne(type => FacultiesRepository, faculty => faculty.rooms)
    @JoinColumn({name: "faculty_id"})
    faculty: FacultiesRepository;

    @OneToMany(type => SciencesRepository, science => science.room)
    sciences: SciencesRepository[];
}