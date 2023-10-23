import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm'
import { BaseModel } from './model.entity';
import { GroupsRepository } from './groups.entity';
import { FacultiesRepository } from './faculties.entity';

@Entity("botusers")
export class BotUserRepository extends BaseModel {

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

    @OneToMany(type => GroupsRepository, group => group.users)
    @JoinColumn({name: "group_id"})
    group: GroupsRepository[];

    @ManyToOne(type => FacultiesRepository, faculty => faculty.courses)
    @JoinColumn({name: "faculty_id"})
    faculty: FacultiesRepository;
}