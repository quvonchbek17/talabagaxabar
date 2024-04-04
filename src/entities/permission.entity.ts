import { Entity, Column, ManyToOne, JoinColumn, ManyToMany } from 'typeorm'
import { BaseModel, Admin } from '@entities';

@Entity("permissions")
export class Permission extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar',
        unique: true
    })
    path: string;

    @Column({
        name: 'desc',
        type: 'varchar',
        nullable: true
    })
    desc: string;

    @ManyToMany(type => Admin, admin => admin.permissions, {onDelete: "SET NULL"})
    admins?: Admin[];

}