import { registerAs } from "@nestjs/config"
interface DatabaseConfig {
    readonly host: string,
    readonly port: number,
    readonly username: string,
    readonly password: string,
    readonly database: string
}

export const databaseConfig = registerAs("database", (): DatabaseConfig => ({
    host: String(process.env.db_host),
    port: Number(process.env.db_port),
    username: String(process.env.db_username),
    password: String(process.env.db_password),
    database: String(process.env.database)
}))