import prisma from '../config/Database';
import type { DailyPuzzle } from '@prisma/client';

export class DailyPuzzleRepository {
  async findByDate(date: string) {
    return await prisma.dailyPuzzle.findUnique({
      where: { puzzle_date: date },
      include: { puzzle: true },
    });
  }

  async create(date: string, puzzleId: string): Promise<DailyPuzzle> {
    return await prisma.dailyPuzzle.create({
      data: {
        puzzle_date: date,
        puzzle_id: puzzleId,
      },
    });
  }

  async upsert(date: string, puzzleId: string): Promise<DailyPuzzle> {
    return await prisma.dailyPuzzle.upsert({
      where: { puzzle_date: date },
      update: { puzzle_id: puzzleId },
      create: {
        puzzle_date: date,
        puzzle_id: puzzleId,
      },
    });
  }

  async delete(date: string): Promise<void> {
    await prisma.dailyPuzzle.delete({
      where: { puzzle_date: date },
    });
  }
}
