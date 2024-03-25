import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm'
import { BaseModel } from './model.entity';
import { Faculty } from './faculty.entity';

@Entity("locations")
export class Location extends BaseModel {

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

    @ManyToOne(type => Faculty, faculty => faculty.locations)
    @JoinColumn({name: "faculty_id"})
    faculty: Faculty;
}