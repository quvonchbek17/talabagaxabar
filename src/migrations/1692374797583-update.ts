import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1692374797583 implements MigrationInterface {
    name = 'Update1692374797583'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "systemadmins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT Now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT Now(), "adminname" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL, "university_id" uuid, "faculty_id" uuid, CONSTRAINT "UQ_2f5df01655318814120227695dd" UNIQUE ("adminname"), CONSTRAINT "PK_2d4967cfc9efd6cf66fea4d9a9b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "botusers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT Now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT Now(), "fullname" character varying NOT NULL, "phone" character varying NOT NULL, "language" character varying NOT NULL, "username" character varying NOT NULL, "chat_id" character varying NOT NULL, "faculty_id" uuid, CONSTRAINT "PK_caaae635fdb2305ed0ed72d3168" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rooms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT Now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT Now(), "name" character varying NOT NULL, "capacity" integer NOT NULL, "floor" character varying NOT NULL, "faculty_id" uuid, CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "locations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT Now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT Now(), "latitude" character varying NOT NULL, "longitude" character varying NOT NULL, "faculty_id" uuid, CONSTRAINT "PK_7cc1c9e3853b94816c094825e74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "botadmins" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT Now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT Now(), "fullname" character varying NOT NULL, "phone" character varying NOT NULL, "language" character varying NOT NULL, "username" character varying NOT NULL, "chat_id" character varying NOT NULL, "faculty_id" uuid, CONSTRAINT "PK_e8b66fd5054b9d1249f8c67dd7e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "sciences" ADD "room_id" uuid`);
        await queryRunner.query(`ALTER TABLE "systemadmins" ADD CONSTRAINT "FK_9046e982aa383a38a86d2f2047a" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "systemadmins" ADD CONSTRAINT "FK_c0a43861a26ef1facc2c9723d82" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "botusers" ADD CONSTRAINT "FK_9e46f2ba3807b082d6857ff571c" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rooms" ADD CONSTRAINT "FK_077a8345d9698d307ac13052aba" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sciences" ADD CONSTRAINT "FK_a25a30e1ee285c2be2e0b12f39b" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "locations" ADD CONSTRAINT "FK_137ca675f2921c1a0e71883a243" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "botadmins" ADD CONSTRAINT "FK_1d56639690f12e558b93ec8d953" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "botadmins" DROP CONSTRAINT "FK_1d56639690f12e558b93ec8d953"`);
        await queryRunner.query(`ALTER TABLE "locations" DROP CONSTRAINT "FK_137ca675f2921c1a0e71883a243"`);
        await queryRunner.query(`ALTER TABLE "sciences" DROP CONSTRAINT "FK_a25a30e1ee285c2be2e0b12f39b"`);
        await queryRunner.query(`ALTER TABLE "rooms" DROP CONSTRAINT "FK_077a8345d9698d307ac13052aba"`);
        await queryRunner.query(`ALTER TABLE "botusers" DROP CONSTRAINT "FK_9e46f2ba3807b082d6857ff571c"`);
        await queryRunner.query(`ALTER TABLE "systemadmins" DROP CONSTRAINT "FK_c0a43861a26ef1facc2c9723d82"`);
        await queryRunner.query(`ALTER TABLE "systemadmins" DROP CONSTRAINT "FK_9046e982aa383a38a86d2f2047a"`);
        await queryRunner.query(`ALTER TABLE "sciences" DROP COLUMN "room_id"`);
        await queryRunner.query(`DROP TABLE "botadmins"`);
        await queryRunner.query(`DROP TABLE "locations"`);
        await queryRunner.query(`DROP TABLE "rooms"`);
        await queryRunner.query(`DROP TABLE "botusers"`);
        await queryRunner.query(`DROP TABLE "systemadmins"`);
    }

}
