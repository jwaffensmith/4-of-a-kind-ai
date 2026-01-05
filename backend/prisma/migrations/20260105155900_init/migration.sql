-- CreateTable
CREATE TABLE "puzzle" (
    "id" TEXT NOT NULL,
    "words" JSONB NOT NULL,
    "categories" JSONB NOT NULL,
    "ai_reasoning" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "is_reviewed" BOOLEAN NOT NULL DEFAULT false,
    "times_played" INTEGER NOT NULL DEFAULT 0,
    "avg_completion_time" INTEGER,
    "avg_mistakes" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "puzzle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_session" (
    "id" TEXT NOT NULL,
    "puzzle_id" TEXT NOT NULL,
    "username" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "is_won" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correct_groups" JSONB NOT NULL DEFAULT '[]',
    "mistakes_remaining" INTEGER NOT NULL DEFAULT 4,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "time_taken" INTEGER,

    CONSTRAINT "game_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_stat" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "total_games" INTEGER NOT NULL DEFAULT 0,
    "total_wins" INTEGER NOT NULL DEFAULT 0,
    "perfect_games" INTEGER NOT NULL DEFAULT 0,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "best_streak" INTEGER NOT NULL DEFAULT 0,
    "avg_time_seconds" DOUBLE PRECISION,
    "avg_mistakes" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "game_stat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_puzzle" (
    "puzzle_date" TEXT NOT NULL,
    "puzzle_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_puzzle_pkey" PRIMARY KEY ("puzzle_date")
);

-- CreateTable
CREATE TABLE "admin_log" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "puzzle_id" TEXT,
    "details" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "puzzle_difficulty_idx" ON "puzzle"("difficulty");

-- CreateIndex
CREATE INDEX "puzzle_is_reviewed_idx" ON "puzzle"("is_reviewed");

-- CreateIndex
CREATE INDEX "game_session_puzzle_id_idx" ON "game_session"("puzzle_id");

-- CreateIndex
CREATE INDEX "game_session_username_idx" ON "game_session"("username");

-- CreateIndex
CREATE INDEX "game_session_completed_idx" ON "game_session"("completed");

-- CreateIndex
CREATE UNIQUE INDEX "game_stat_username_key" ON "game_stat"("username");

-- CreateIndex
CREATE INDEX "game_stat_total_wins_idx" ON "game_stat"("total_wins");

-- CreateIndex
CREATE INDEX "daily_puzzle_puzzle_id_idx" ON "daily_puzzle"("puzzle_id");

-- CreateIndex
CREATE INDEX "admin_log_created_at_idx" ON "admin_log"("created_at");

-- AddForeignKey
ALTER TABLE "game_session" ADD CONSTRAINT "game_session_puzzle_id_fkey" FOREIGN KEY ("puzzle_id") REFERENCES "puzzle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_puzzle" ADD CONSTRAINT "daily_puzzle_puzzle_id_fkey" FOREIGN KEY ("puzzle_id") REFERENCES "puzzle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_log" ADD CONSTRAINT "admin_log_puzzle_id_fkey" FOREIGN KEY ("puzzle_id") REFERENCES "puzzle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
