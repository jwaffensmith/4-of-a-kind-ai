import prisma from '../config/Database';
import type { GameSession } from '@prisma/client';
import type { GameSessionCreateDto, GameSessionUpdateDto } from '../types/dtos/GameDto';

export class GameRepository {
  async create(data: GameSessionCreateDto): Promise<GameSession> {
    return await prisma.gameSession.create({
      data: {
        puzzle_id: data.puzzle_id,
        username: data.username,
      },
    });
  }

  async findById(id: string) {
    return await prisma.gameSession.findUnique({
      where: { id },
      include: {
        puzzle: true,
      },
    });
  }

  async update(id: string, data: GameSessionUpdateDto): Promise<GameSession> {
    return await prisma.gameSession.update({
      where: { id },
      data,
    });
  }

  async findByUsername(username: string): Promise<GameSession[]> {
    return await prisma.gameSession.findMany({
      where: { username },
      orderBy: { started_at: 'desc' },
    });
  }

  async findCompleted(): Promise<GameSession[]> {
    return await prisma.gameSession.findMany({
      where: { completed: true },
      orderBy: { completed_at: 'desc' },
    });
  }

  async countByPuzzleId(puzzleId: string): Promise<number> {
    return await prisma.gameSession.count({
      where: { puzzle_id: puzzleId },
    });
  }
}
