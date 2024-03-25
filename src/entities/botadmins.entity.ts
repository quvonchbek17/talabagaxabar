import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm'
import { BaseModel } from './model.entity';
import { Group } from './group.entity';
import { Faculty } from './faculty.entity';

@Entity("botadmins")
export class BotAdmin extends BaseModel {

    @Column({
        name: 'fullname',
        type: 'varchar'
    })
    fullname: string;

    @Column({
        name: 'phone',
        type: 'varchar'
    })
    phone: string;

    @Column({
        name: 'language',
        type: 'varchar'
    })
    language: string;

    @Column({
        name: 'username',
        type: 'varchar'
    })
    username: string;

    @Column({
        name: 'chat_id',
        type: 'varchar'
    })
    chat_id: string;

    @ManyToOne(type => Faculty, faculty => faculty.botadmins)
    @JoinColumn({name: "faculty_id"})
    faculty: Faculty;
}