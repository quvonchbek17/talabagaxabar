import { IsUUID } from "class-validator";

export class PermissionParamsIdDto {
    @IsUUID()
    id: string;
}
