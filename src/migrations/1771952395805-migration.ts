import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1771952395805 implements MigrationInterface {
  name = 'Migration1771952395805';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."service_type_enum" AS ENUM('hair', 'beard', 'eyebrow', 'skincare', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "service" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "active" boolean NOT NULL DEFAULT true, "deletedAt" TIMESTAMP, "name" character varying, "type" "public"."service_type_enum" NOT NULL DEFAULT 'hair', "price" numeric(10,2), "durationMinutes" integer, CONSTRAINT "PK_85a21558c006647cd76fdce044b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "barber" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "active" boolean NOT NULL DEFAULT true, "deletedAt" TIMESTAMP, "name" character varying, "document" character varying(11), "email" character varying, "cellphone" character varying, CONSTRAINT "UQ_d923108cd4a381f456f99f8dad1" UNIQUE ("email", "document"), CONSTRAINT "PK_393a066f1a87c8642e776ba7054" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."scheduling_status_enum" AS ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show')`,
    );
    await queryRunner.query(
      `CREATE TABLE "scheduling" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "active" boolean NOT NULL DEFAULT true, "deletedAt" TIMESTAMP, "date" TIMESTAMP, "endTime" TIMESTAMP, "status" "public"."scheduling_status_enum" NOT NULL DEFAULT 'pending', "userId" uuid, "barbershopId" uuid, "barberId" uuid, CONSTRAINT "PK_a19510fdc2c3f1c9daff8b6e395" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "barber_shop" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "active" boolean NOT NULL DEFAULT true, "deletedAt" TIMESTAMP, "name" character varying, "document" character varying, "address" character varying, "lat" numeric(10,7), "long" numeric(10,7), "cellphone" character varying, "email" character varying, CONSTRAINT "PK_1f886aa2348269079caccdd1ad4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "active" boolean NOT NULL DEFAULT true, "deletedAt" TIMESTAMP, "name" character varying, "birthdate" TIMESTAMP, "document" character varying, "email" character varying, "password" character varying, "cellphone" character varying(20), "userType" character varying NOT NULL DEFAULT 'user', CONSTRAINT "UQ_335a7b396d5a7b840e2e31200b4" UNIQUE ("email", "document"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "barbershop_business_hours" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "active" boolean NOT NULL DEFAULT true, "deletedAt" TIMESTAMP, "dayOfWeek" integer NOT NULL, "openTime" character varying(5) NOT NULL, "closeTime" character varying(5) NOT NULL, "isOpen" boolean NOT NULL DEFAULT true, "barbershopId" uuid, CONSTRAINT "PK_d24090230f118e7ba5a6451395f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "barbershop_services" ("serviceId" uuid NOT NULL, "barberShopId" uuid NOT NULL, CONSTRAINT "PK_918d7c01233c7915484e23d354a" PRIMARY KEY ("serviceId", "barberShopId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fb87c32c2da706981e4353b7a0" ON "barbershop_services" ("serviceId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_04152bc970f4aef69d46504ae6" ON "barbershop_services" ("barberShopId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "scheduling_services" ("schedulingId" uuid NOT NULL, "serviceId" uuid NOT NULL, CONSTRAINT "PK_c2260441ec48728ee57f7ef847c" PRIMARY KEY ("schedulingId", "serviceId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f87620f6e30d98e802f67b49d" ON "scheduling_services" ("schedulingId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_990fb8d98c937fc73d2adb4529" ON "scheduling_services" ("serviceId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "barbershop_barbers" ("barberShopId" uuid NOT NULL, "barberId" uuid NOT NULL, CONSTRAINT "PK_ad2d74688b7bfda7e1eea38403e" PRIMARY KEY ("barberShopId", "barberId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_55abf62f0d6fb800d53f65cc44" ON "barbershop_barbers" ("barberShopId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_197b686c8784ad37778e778844" ON "barbershop_barbers" ("barberId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "scheduling" ADD CONSTRAINT "FK_b5df7f21de3b47bd5d29c3deb94" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "scheduling" ADD CONSTRAINT "FK_99545198559ecb479007fe01090" FOREIGN KEY ("barbershopId") REFERENCES "barber_shop"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "scheduling" ADD CONSTRAINT "FK_843feaec9e559db38215f0212c9" FOREIGN KEY ("barberId") REFERENCES "barber"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "barbershop_business_hours" ADD CONSTRAINT "FK_a64f73e99e0c7a83234c2f637b7" FOREIGN KEY ("barbershopId") REFERENCES "barber_shop"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "barbershop_services" ADD CONSTRAINT "FK_fb87c32c2da706981e4353b7a01" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "barbershop_services" ADD CONSTRAINT "FK_04152bc970f4aef69d46504ae68" FOREIGN KEY ("barberShopId") REFERENCES "barber_shop"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "scheduling_services" ADD CONSTRAINT "FK_6f87620f6e30d98e802f67b49d5" FOREIGN KEY ("schedulingId") REFERENCES "scheduling"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "scheduling_services" ADD CONSTRAINT "FK_990fb8d98c937fc73d2adb4529d" FOREIGN KEY ("serviceId") REFERENCES "service"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "barbershop_barbers" ADD CONSTRAINT "FK_55abf62f0d6fb800d53f65cc449" FOREIGN KEY ("barberShopId") REFERENCES "barber_shop"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "barbershop_barbers" ADD CONSTRAINT "FK_197b686c8784ad37778e7788440" FOREIGN KEY ("barberId") REFERENCES "barber"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "barbershop_barbers" DROP CONSTRAINT "FK_197b686c8784ad37778e7788440"`,
    );
    await queryRunner.query(
      `ALTER TABLE "barbershop_barbers" DROP CONSTRAINT "FK_55abf62f0d6fb800d53f65cc449"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scheduling_services" DROP CONSTRAINT "FK_990fb8d98c937fc73d2adb4529d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scheduling_services" DROP CONSTRAINT "FK_6f87620f6e30d98e802f67b49d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "barbershop_services" DROP CONSTRAINT "FK_04152bc970f4aef69d46504ae68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "barbershop_services" DROP CONSTRAINT "FK_fb87c32c2da706981e4353b7a01"`,
    );
    await queryRunner.query(
      `ALTER TABLE "barbershop_business_hours" DROP CONSTRAINT "FK_a64f73e99e0c7a83234c2f637b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scheduling" DROP CONSTRAINT "FK_843feaec9e559db38215f0212c9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scheduling" DROP CONSTRAINT "FK_99545198559ecb479007fe01090"`,
    );
    await queryRunner.query(
      `ALTER TABLE "scheduling" DROP CONSTRAINT "FK_b5df7f21de3b47bd5d29c3deb94"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_197b686c8784ad37778e778844"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_55abf62f0d6fb800d53f65cc44"`,
    );
    await queryRunner.query(`DROP TABLE "barbershop_barbers"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_990fb8d98c937fc73d2adb4529"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6f87620f6e30d98e802f67b49d"`,
    );
    await queryRunner.query(`DROP TABLE "scheduling_services"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_04152bc970f4aef69d46504ae6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fb87c32c2da706981e4353b7a0"`,
    );
    await queryRunner.query(`DROP TABLE "barbershop_services"`);
    await queryRunner.query(`DROP TABLE "barbershop_business_hours"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "barber_shop"`);
    await queryRunner.query(`DROP TABLE "scheduling"`);
    await queryRunner.query(`DROP TYPE "public"."scheduling_status_enum"`);
    await queryRunner.query(`DROP TABLE "barber"`);
    await queryRunner.query(`DROP TABLE "service"`);
    await queryRunner.query(`DROP TYPE "public"."service_type_enum"`);
  }
}
