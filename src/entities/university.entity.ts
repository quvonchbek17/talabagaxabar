import { Entity, Column, OneToMany } from 'typeorm'
import { BaseModel } from './model.entity';
import { Faculty } from './faculty.entity';
import { Admin } from './admin.entity';

@Entity("universities")
export class University extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar',
        unique: true
    })
    name: string;

    @OneToMany(faculty => Faculty, faculty => faculty.university)
    faculties: Faculty[]

    @OneToMany(faculty => Admin, admin => admin.university)
    admins: Admin[]
}