-- AlterTable
ALTER TABLE "laporan" ADD COLUMN     "deleted_at" TIMESTAMP,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;
