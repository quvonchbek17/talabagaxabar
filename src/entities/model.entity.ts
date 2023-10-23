import { BaseEntity, PrimaryGeneratedColumn, Column } from 'typeorm'

export class BaseModel extends BaseEntity  {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'timestamptz',
        default: () => "Now()"
    })
    created_at: Date;

    @Column({
        type: 'timestamptz',
        default: () => "Now()"
    })
    updated_at: Date
}