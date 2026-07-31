-- Default new members to hiding phone/DOB/student ID, and hide them for all existing members too.
ALTER TABLE "Member" ALTER COLUMN "showDob" SET DEFAULT false;
ALTER TABLE "Member" ALTER COLUMN "showPhone" SET DEFAULT false;
ALTER TABLE "Member" ALTER COLUMN "showStudentId" SET DEFAULT false;

UPDATE "Member"
SET "showDob" = false, "showPhone" = false, "showStudentId" = false
WHERE "showDob" = true OR "showPhone" = true OR "showStudentId" = true;
