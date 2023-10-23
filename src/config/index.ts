import { ConfigModule, ConfigModuleOptions} from "@nestjs/config";
import { appConfig } from "./app";
import { databaseConfig } from "./database";

export const config: ConfigModuleOptions = {
    load: [ appConfig, databaseConfig],
    cache: true,
    isGlobal: true
}