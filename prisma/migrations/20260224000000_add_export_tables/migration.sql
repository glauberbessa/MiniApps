-- CreateTable
CREATE TABLE "ExportedVideo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "channelId" TEXT,
    "channelTitle" TEXT,
    "language" TEXT,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceTitle" TEXT,
    "publishedAt" TEXT,
    "thumbnailUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportedVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExportProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "originalId" TEXT,
    "sourceTitle" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "lastPageToken" TEXT,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "importedItems" INTEGER NOT NULL DEFAULT 0,
    "lastImportedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExportProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExportedVideo_userId_videoId_sourceType_sourceId_key" ON "ExportedVideo"("userId", "videoId", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "ExportedVideo_userId_idx" ON "ExportedVideo"("userId");

-- CreateIndex
CREATE INDEX "ExportedVideo_userId_language_idx" ON "ExportedVideo"("userId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "ExportProgress_userId_sourceType_sourceId_key" ON "ExportProgress"("userId", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "ExportProgress_userId_idx" ON "ExportProgress"("userId");

-- CreateIndex
CREATE INDEX "ExportProgress_userId_status_idx" ON "ExportProgress"("userId", "status");

-- AddForeignKey
ALTER TABLE "ExportedVideo" ADD CONSTRAINT "ExportedVideo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExportProgress" ADD CONSTRAINT "ExportProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
