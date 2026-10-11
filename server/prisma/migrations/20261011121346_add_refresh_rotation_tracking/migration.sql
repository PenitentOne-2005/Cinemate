/*
  Warnings:

  - A unique constraint covering the columns `[token_id]` on the table `refresh_sessions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `family_id` to the `refresh_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `token_id` to the `refresh_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "refresh_sessions" ADD COLUMN     "family_id" TEXT NOT NULL,
ADD COLUMN     "revoked_at" TIMESTAMP(3),
ADD COLUMN     "token_id" TEXT NOT NULL,
ADD COLUMN     "used_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_sessions_token_id_key" ON "refresh_sessions"("token_id");

-- CreateIndex
CREATE INDEX "refresh_sessions_family_id_idx" ON "refresh_sessions"("family_id");

-- CreateIndex
CREATE INDEX "refresh_sessions_user_id_idx" ON "refresh_sessions"("user_id");
