-- This is an empty migration.CREATE UNIQUE INDEX "friendships_unique_pair"
CREATE UNIQUE INDEX "friendships_unique_pair"
ON "friendships" (
  LEAST("requester_id", "addressee_id"),
  GREATEST("requester_id", "addressee_id")
);