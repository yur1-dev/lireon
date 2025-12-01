-- AlterTable
ALTER TABLE "books" ADD COLUMN "rating" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "dailyGoal" INTEGER NOT NULL DEFAULT 30,
    "weeklyGoal" INTEGER NOT NULL DEFAULT 210,
    "monthlyGoal" INTEGER NOT NULL DEFAULT 900,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "totalPagesRead" INTEGER NOT NULL DEFAULT 0,
    "hasSeenTutorial" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "dailyGoal", "email", "id", "monthlyGoal", "password", "streak", "totalPagesRead", "updatedAt", "username", "weeklyGoal") SELECT "createdAt", "dailyGoal", "email", "id", "monthlyGoal", "password", "streak", "totalPagesRead", "updatedAt", "username", "weeklyGoal" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
