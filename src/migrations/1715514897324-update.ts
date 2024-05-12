import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1715514897324 implements MigrationInterface {
    name = 'Update1715514897324'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "teachers_sciences_sciences" ("teachersId" uuid NOT NULL, "sciencesId" uuid NOT NULL, CONSTRAINT "PK_a359aac03a4d24b0eb54829acef" PRIMARY KEY ("teachersId", "sciencesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_470ac240be5e58ccdddff6e137" ON "teachers_sciences_sciences" ("teachersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d868c81f9198e5be5fee49d5cb" ON "teachers_sciences_sciences" ("sciencesId") `);
        await queryRunner.query(`ALTER TABLE "teachers_sciences_sciences" ADD CONSTRAINT "FK_470ac240be5e58ccdddff6e1372" FOREIGN KEY ("teachersId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "teachers_sciences_sciences" ADD CONSTRAINT "FK_d868c81f9198e5be5fee49d5cbf" FOREIGN KEY ("sciencesId") REFERENCES "sciences"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teachers_sciences_sciences" DROP CONSTRAINT "FK_d868c81f9198e5be5fee49d5cbf"`);
        await queryRunner.query(`ALTER TABLE "teachers_sciences_sciences" DROP CONSTRAINT "FK_470ac240be5e58ccdddff6e1372"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d868c81f9198e5be5fee49d5cb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_470ac240be5e58ccdddff6e137"`);
        await queryRunner.query(`DROP TABLE "teachers_sciences_sciences"`);
    }

}
