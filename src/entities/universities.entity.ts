import { Entity, Column, OneToMany } from 'typeorm'
import { BaseModel } from './model.entity';
import { FacultiesRepository } from './faculties.entity';
import { AdminsRepository } from './admins.entity';

@Entity("universities")
export class UniversitiesRepository extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar',
        unique: true
    })
    name: string;

    @OneToMany(faculty => FacultiesRepository, faculty => faculty.university)
    faculties: FacultiesRepository[]

    @OneToMany(faculty => AdminsRepository, admin => admin.university)
    admins: AdminsRepository[]
}