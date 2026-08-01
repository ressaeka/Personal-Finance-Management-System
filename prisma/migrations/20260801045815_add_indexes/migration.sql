-- CreateIndex
CREATE INDEX "Category_userId_idx" ON "Category"("userId");

-- CreateIndex
CREATE INDEX "Category_userId_isDeleted_idx" ON "Category"("userId", "isDeleted");

-- CreateIndex
CREATE INDEX "Transaksi_userId_isDeleted_idx" ON "Transaksi"("userId", "isDeleted");

-- CreateIndex
CREATE INDEX "Transaksi_userId_tanggal_idx" ON "Transaksi"("userId", "tanggal");

-- CreateIndex
CREATE INDEX "Transaksi_categoryId_isDeleted_idx" ON "Transaksi"("categoryId", "isDeleted");
