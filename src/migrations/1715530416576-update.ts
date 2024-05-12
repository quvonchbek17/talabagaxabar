import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1715530416576 implements MigrationInterface {
    name = 'Update1715530416576'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN "floor"`);
        await queryRunner.query(`ALTER TABLE "rooms" ADD "floor" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rooms" DROP COLUMN "floor"`);
        await queryRunner.query(`ALTER TABLE "rooms" ADD "floor" character varying NOT NULL`);
    }

}
