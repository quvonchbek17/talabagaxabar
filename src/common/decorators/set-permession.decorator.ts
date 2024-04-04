import { SetMetadata } from '@nestjs/common';

export const PERMISSION = 'permission';
export const SetPermission = (permission: string) =>
  SetMetadata(PERMISSION , permission);
