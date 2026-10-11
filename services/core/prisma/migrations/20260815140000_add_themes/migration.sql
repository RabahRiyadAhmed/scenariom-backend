CREATE TABLE "themes" (
  "id" UUID NOT NULL,
  "slug" VARCHAR(50) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "description" VARCHAR(500),
  "definition" JSONB NOT NULL,
  "extraData" JSONB,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "themes_slug_key" ON "themes"("slug");
CREATE INDEX "themes_isActive_name_idx" ON "themes"("isActive", "name");
