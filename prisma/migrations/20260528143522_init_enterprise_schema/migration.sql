-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SALES');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SALES',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarModel" (
    "id" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CarModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncentiveSlab" (
    "id" TEXT NOT NULL,
    "minUnits" INTEGER NOT NULL,
    "maxUnits" INTEGER,
    "incentivePerCar" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncentiveSlab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "carModelId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlabHistoryLog" (
    "id" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "changedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlabHistoryLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CarModel_modelName_variant_key" ON "CarModel"("modelName", "variant");

-- CreateIndex
CREATE UNIQUE INDEX "SalesLog_userId_carModelId_month_year_key" ON "SalesLog"("userId", "carModelId", "month", "year");

-- AddForeignKey
ALTER TABLE "SalesLog" ADD CONSTRAINT "SalesLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesLog" ADD CONSTRAINT "SalesLog_carModelId_fkey" FOREIGN KEY ("carModelId") REFERENCES "CarModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
