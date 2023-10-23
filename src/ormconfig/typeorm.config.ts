import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm'
import { join } from 'path'
import * as dotenv from "dotenv"
dotenv.config()

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
    useFactory: async(): Promise<TypeOrmModuleOptions> => {
        return {
            type: "postgres",
            host: process.env.db_host,
            port: Number(process.env.db_port),
            password: process.env.db_password,
            database: process.env.database,
            username: process.env.db_username,
            entities: [__dirname + '/../**/*.entity.{js,ts}'],
            migrations: [__dirname + '/../migrations/*{.ts,.js}'],
            logging: true,
            synchronize: false
        }
    }
}