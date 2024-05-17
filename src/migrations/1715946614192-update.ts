import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1715946614192 implements MigrationInterface {
    name = 'Update1715946614192'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedules" ADD "faculty_id" uuid`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD CONSTRAINT "FK_20b5719dd9fcfa4df1707590cba" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT "FK_20b5719dd9fcfa4df1707590cba"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP COLUMN "faculty_id"`);
    }

}
