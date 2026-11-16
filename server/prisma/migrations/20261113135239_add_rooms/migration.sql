-- CreateEnum
CREATE TYPE "RoomPrivacy" AS ENUM ('everyone', 'friends');

-- CreateEnum
CREATE TYPE "RoomSource" AS ENUM ('youtube', 'drive');

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "privacy" "RoomPrivacy" NOT NULL DEFAULT 'everyone',
    "source" "RoomSource" NOT NULL,
    "source_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_invites" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rooms_owner_id_created_at_idx" ON "rooms"("owner_id", "created_at");

-- CreateIndex
CREATE INDEX "room_invites_user_id_created_at_idx" ON "room_invites"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "room_invites_room_id_user_id_key" ON "room_invites"("room_id", "user_id");

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_invites" ADD CONSTRAINT "room_invites_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_invites" ADD CONSTRAINT "room_invites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
