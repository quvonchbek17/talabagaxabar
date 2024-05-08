import { Entity, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm'
import { BaseModel, Faculty, University, AdminRole, Permission } from '@entities';

@Entity("systemadmins")
export class Admin extends BaseModel {

    @Column({
        name: 'adminname',
        type: 'varchar',
        unique: true
    })
    adminname: string;

    @Column({
        name: 'fullname',
        type: 'varchar',
        unique: false,
        nullable: true
    })
    fullname: string;

    @Column({
        name: 'password',
        type: 'varchar'
    })
    password: string;

    @Column({
        name: 'img',
        type: 'varchar',
        nullable: true
    })
    img: string;

    @ManyToOne(type => AdminRole, role => role.admins)
    @JoinColumn({name: "role_id"})
    role: AdminRole;

    @ManyToMany(type => Permission, permission => permission.admins, {onDelete: "SET NULL"})
    @JoinTable()
    permissions?: Permission[];

    @ManyToOne(type => University, university => university.admins)
    @JoinColumn({name: "university_id"})
    university: University;

    @ManyToOne(type => Faculty, faculty => faculty.courses)
    @JoinColumn({name: "faculty_id"})
    faculty: Faculty;
}