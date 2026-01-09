import prisma from '../config/Database';
import type { Puzzle } from '@prisma/client';
import type { PuzzleCreateDto } from '../types/dtos/PuzzleDto';

export class PuzzleRepository {
  async create(data: PuzzleCreateDto): Promise<Puzzle> {
    return await prisma.puzzle.create({
      data: {
        words: data.words,
        categories: data.categories,
        ai_reasoning: data.ai_reasoning,
        difficulty: data.difficulty,
      },
    });
  }

  async findRecent(limit: number): Promise<Puzzle[]> {
    return await prisma.puzzle.findMany({
      orderBy: { created_at: 'desc' },
      take: Math.max(0, Math.min(limit, 500)),
      select: {
        id: true,
        words: true,
        categories: true,
        created_at: true,
        difficulty: true,
        is_reviewed: true,
        times_played: true,
        avg_completion_time: true,
        avg_mistakes: true,
        ai_reasoning: true,
      },
    });
  }

  async findById(id: string): Promise<Puzzle | null> {
    return await prisma.puzzle.findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<Puzzle[]> {
    return await prisma.puzzle.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findAllReviewed(): Promise<Puzzle[]> {
    return await prisma.puzzle.findMany({
      where: { is_reviewed: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async findRandomReviewed(): Promise<Puzzle | null> {
    const count = await prisma.puzzle.count({
      where: { is_reviewed: true },
    });
    
    if (count === 0) return null;
    
    const skip = Math.floor(Math.random() * count);
    return await prisma.puzzle.findFirst({
      where: { is_reviewed: true },
      skip,
    });
  }

  async updateReviewStatus(id: string, isReviewed: boolean): Promise<Puzzle> {
    return await prisma.puzzle.update({
      where: { id },
      data: { is_reviewed: isReviewed },
    });
  }

  async updateStats(id: string, timesPlayed: number, avgTime?: number, avgMistakes?: number): Promise<Puzzle> {
    return await prisma.puzzle.update({
      where: { id },
      data: {
        times_played: timesPlayed,
        avg_completion_time: avgTime,
        avg_mistakes: avgMistakes,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.puzzle.delete({
      where: { id },
    });
  }
}
