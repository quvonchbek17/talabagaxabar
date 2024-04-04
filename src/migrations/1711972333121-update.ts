import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1711972333121 implements MigrationInterface {
    name = 'Update1711972333121'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "permissions" ADD "desc" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "desc"`);
    }

}
