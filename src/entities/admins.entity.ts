import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseModel } from './model.entity';
import { FacultiesRepository } from './faculties.entity';
import { UniversitiesRepository } from './universities.entity';

@Entity("systemadmins")
export class AdminsRepository extends BaseModel {

    @Column({
        name: 'adminname',
        type: 'varchar',
        unique: true
    })
    adminname: string;

    @Column({
        name: 'password',
        type: 'varchar'
    })
    password: string;

    @Column({
        name: 'role',
        type: 'varchar'
    })
    role: string;

    @ManyToOne(type => UniversitiesRepository, university => university.admins)
    @JoinColumn({name: "university_id"})
    university: UniversitiesRepository;

    @ManyToOne(type => FacultiesRepository, faculty => faculty.courses)
    @JoinColumn({name: "faculty_id"})
    faculty: FacultiesRepository;
}