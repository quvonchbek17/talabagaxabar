import { registerAs } from "@nestjs/config"
interface AppConfig {
    readonly host: string,
    readonly port: number
}

export const appConfig = registerAs("app", (): AppConfig => ({
    host: String(process.env.HOST),
    port: Number(process.env.PORT)
}))