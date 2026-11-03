-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "popularity" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "voteCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weightedRating" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CatalogSync" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "CatalogSync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Movie_popularity_idx" ON "Movie"("popularity");

-- CreateIndex
CREATE INDEX "Movie_weightedRating_idx" ON "Movie"("weightedRating");

-- CreateIndex
CREATE INDEX "Movie_releaseDate_idx" ON "Movie"("releaseDate");
