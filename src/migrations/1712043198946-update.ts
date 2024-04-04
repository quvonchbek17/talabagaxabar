import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1712043198946 implements MigrationInterface {
    name = 'Update1712043198946'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "systemadmins" DROP CONSTRAINT "FK_c4b8ea430d3d39b9a5c323b70d7"`);
        await queryRunner.query(`ALTER TABLE "systemadmins" DROP CONSTRAINT "FK_9046e982aa383a38a86d2f2047a"`);
        await queryRunner.query(`ALTER TABLE "systemadmins" DROP CONSTRAINT "FK_c0a43861a26ef1facc2c9723d82"`);
        await queryRunner.query(`ALTER TABLE "systemadmins" DROP COLUMN "role_id"`);
        await queryRunner.query(`ALTER TABLE "systemadmins" DROP COLUMN "university_id"`);
        await queryRunner.query(`ALTER TABLE "systemadmins" DROP COLUMN "faculty_id"`);
        await queryRunner.query(`ALTER TABLE "systemadmins" ADD "roleId" uuid`);
        await queryRunner.query(`ALTER TABLE "systemadmins" ADD "universityId" uuid`);
        await queryRunner.query(`ALTER TABLE "systemadmins" ADD "facultyId" uuid`);
        await queryRunner.query(`ALTER TABLE "systemadmins" ADD CONSTRAINT "FK_8f39eafb35e4ca9110e6408075d" FOREIGN KEY ("roleId") REFERENCES "adminroles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "systemadmins" ADD CONSTRAINT "FK_f13bdcbb9a07620a57694668f84" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "systemadmins" ADD CONSTRAINT "FK_9b2b7ac64a2449b1997419c8991" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "systemadmins" DROP CONSTRAINT "FK_9b2b7ac64a2449b1997419c8991"`);
        await queryRunner.query(`ALTER TABLE "systemadmins" DROP CONSTRAINT "FK_f13bdcbb9a07620a57694668f84"`);
        await queryRunner.query(`ALTER TABLE "systemadmins" DROP CONSTRAINT "FK_8f39eafb35e4ca9110e6408075d"`);
        await queryRunner.query(`ALTER TABLE "systemadmins" DROP COLUMN "facultyId"`);
        await queryRunner.query(`ALTER TABLE "systemadmins" DROP COLUMN "universityId"`);
        await queryRunner.query(`ALTER TABLE "systemadmins" DROP COLUMN "roleId"`);
        await queryRunner.query(`ALTER TABLE "systemadmins" ADD "faculty_id" uuid`);
        await queryRunner.query(`ALTER TABLE "systemadmins" ADD "university_id" uuid`);
        await queryRunner.query(`ALTER TABLE "systemadmins" ADD "role_id" uuid`);
        await queryRunner.query(`ALTER TABLE "systemadmins" ADD CONSTRAINT "FK_c0a43861a26ef1facc2c9723d82" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "systemadmins" ADD CONSTRAINT "FK_9046e982aa383a38a86d2f2047a" FOREIGN KEY ("university_id") REFERENCES "universities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "systemadmins" ADD CONSTRAINT "FK_c4b8ea430d3d39b9a5c323b70d7" FOREIGN KEY ("role_id") REFERENCES "adminroles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
