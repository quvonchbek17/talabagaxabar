import { Entity, Column, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm'
import { BaseModel } from './model.entity';
import { Faculty } from './faculty.entity';
import { University } from './university.entity';
import { Admin } from './admin.entity';

@Entity("adminroles")
export class AdminRole extends BaseModel {

    @Column({
        name: 'name',
        type: 'varchar',
        unique: true
    })
    name: string;

    @OneToMany(type => Admin, admin => admin.role)
    admins: Admin[];
}