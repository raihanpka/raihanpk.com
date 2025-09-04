-- CreateTable
CREATE TABLE "public"."Views" (
    "slug" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Views_pkey" PRIMARY KEY ("slug")
);
