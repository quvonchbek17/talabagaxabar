import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1712139428925 implements MigrationInterface {
    name = 'Update1712139428925'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "systemadmins" ADD "img" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "systemadmins" DROP COLUMN "img"`);
    }

}
