import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm'
import { BaseModel } from './model.entity';
import { FacultiesRepository } from './faculties.entity';

@Entity("locations")
export class LocationRepository extends BaseModel {

    @Column({
        name: 'latitude',
        type: 'varchar'
    })
    latitude: string;

    @Column({
        name: 'longitude',
        type: 'varchar'
    })
    longitude: string;

    @ManyToOne(type => FacultiesRepository, faculty => faculty.locations)
    @JoinColumn({name: "faculty_id"})
    faculty: FacultiesRepository;
}