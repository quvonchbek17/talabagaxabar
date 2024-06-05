import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm'
import { BaseModel } from './model.entity';
import { Group } from './group.entity';
import { Faculty } from './faculty.entity';

@Entity("botadmins")
export class BotAdmin extends BaseModel {

    @Column({
        name: 'fullname',
        type: 'varchar',
        nullable: true
    })
    fullname: string;

    @Column({
        name: 'phone',
        type: 'varchar',
        nullable: true

    })
    phone: string;

    @Column({
        name: 'language',
        type: 'varchar',
        nullable: true
    })
    language: string;

    @Column({
        name: 'username',
        type: 'varchar',
        nullable: true
    })
    username: string;

    @Column({
        name: 'chat_id',
        type: 'bigint',
        unique: true,
        nullable: false
    })
    chat_id: number;

    @ManyToOne(type => Faculty, faculty => faculty.botadmins)
    @JoinColumn({name: "faculty_id"})
    faculty: Faculty;
}