CREATE TYPE "ProjectAction" AS ENUM ('VIEW', 'EDIT_PROJECT', 'MANAGE_ACCESS', 'DELETE_PROJECT');
CREATE TABLE "projects" (
  "id" UUID NOT NULL, "title" VARCHAR(160) NOT NULL, "description" TEXT NOT NULL DEFAULT '',
  "ownerId" UUID NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "project_accesses" (
  "id" UUID NOT NULL, "projectId" UUID NOT NULL, "userId" UUID NOT NULL,
  "actions" "ProjectAction"[] NOT NULL, "note" VARCHAR(500),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "project_accesses_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "projects_ownerId_idx" ON "projects"("ownerId");
CREATE INDEX "project_accesses_userId_idx" ON "project_accesses"("userId");
CREATE UNIQUE INDEX "project_accesses_projectId_userId_key" ON "project_accesses"("projectId", "userId");
ALTER TABLE "project_accesses" ADD CONSTRAINT "project_accesses_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
