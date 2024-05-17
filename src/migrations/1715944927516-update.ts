import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1715944927516 implements MigrationInterface {
    name = 'Update1715944927516'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "schedules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT Now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT Now(), "day" character varying NOT NULL, "science_id" uuid, "teacher_id" uuid, "room_id" uuid, "time_id" uuid, "group_id" uuid, CONSTRAINT "PK_7e33fc2ea755a5765e3564e66dd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD CONSTRAINT "FK_c9dd5fab88901a89e9f014befff" FOREIGN KEY ("science_id") REFERENCES "sciences"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD CONSTRAINT "FK_2c027020a88187efddd0dbb8421" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD CONSTRAINT "FK_2b9a68c93adbc74afa109bb2a73" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD CONSTRAINT "FK_c10bb6f423264ea0e519ba57965" FOREIGN KEY ("time_id") REFERENCES "times"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedules" ADD CONSTRAINT "FK_330dc11fecc87ead6c8464d9552" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT "FK_330dc11fecc87ead6c8464d9552"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT "FK_c10bb6f423264ea0e519ba57965"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT "FK_2b9a68c93adbc74afa109bb2a73"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT "FK_2c027020a88187efddd0dbb8421"`);
        await queryRunner.query(`ALTER TABLE "schedules" DROP CONSTRAINT "FK_c9dd5fab88901a89e9f014befff"`);
        await queryRunner.query(`DROP TABLE "schedules"`);
    }

}
