import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1716313979439 implements MigrationInterface {
    name = 'Update1716313979439'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teachers" ADD "degree" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teachers" DROP COLUMN "degree"`);
    }

}
