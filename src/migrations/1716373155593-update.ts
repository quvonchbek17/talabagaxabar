import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1716373155593 implements MigrationInterface {
    name = 'Update1716373155593'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "times" ADD "education_id" uuid`);
        await queryRunner.query(`ALTER TABLE "times" ADD CONSTRAINT "FK_f543baf1bac45ce4ce3eefcb16a" FOREIGN KEY ("education_id") REFERENCES "educations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "times" DROP CONSTRAINT "FK_f543baf1bac45ce4ce3eefcb16a"`);
        await queryRunner.query(`ALTER TABLE "times" DROP COLUMN "education_id"`);
    }

}
