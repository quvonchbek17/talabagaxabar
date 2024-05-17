import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1715940131304 implements MigrationInterface {
    name = 'Update1715940131304'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "times" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT Now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT Now(), "name" character varying NOT NULL, "faculty_id" uuid, CONSTRAINT "PK_21a9ce7a877cba720e30089638e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "times" ADD CONSTRAINT "FK_36694795f1e8e3ad9025a316fa0" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "times" DROP CONSTRAINT "FK_36694795f1e8e3ad9025a316fa0"`);
        await queryRunner.query(`DROP TABLE "times"`);
    }

}
