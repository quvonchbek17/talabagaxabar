import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1715924850220 implements MigrationInterface {
    name = 'Update1715924850220'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "groups" ADD "faculty_id" uuid`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_605decc6d0626239f9cf391fe2c" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_605decc6d0626239f9cf391fe2c"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN "faculty_id"`);
    }

}
