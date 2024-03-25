import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseModel } from './model.entity';
import { Faculty } from './faculty.entity';
import { University } from './university.entity';
import { AdminRole } from './adminrole.entity';

@Entity("systemadmins")
export class Admin extends BaseModel {

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

    @ManyToOne(type => AdminRole, role => role.admins)
    @JoinColumn({name: "role_id"})
    role: AdminRole;

    @ManyToOne(type => University, university => university.admins)
    @JoinColumn({name: "university_id"})
    university: University;

    @ManyToOne(type => Faculty, faculty => faculty.courses)
    @JoinColumn({name: "faculty_id"})
    faculty: Faculty;
}