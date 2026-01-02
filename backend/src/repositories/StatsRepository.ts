import prisma from '../config/Database';
import type { GameStat } from '@prisma/client';
import type { GameStatUpdateDto } from '../types/dtos/StatsDto';

export class StatsRepository {
  async findByUsername(username: string): Promise<GameStat | null> {
    return await prisma.gameStat.findUnique({
      where: { username },
    });
  }

  async create(username: string): Promise<GameStat> {
    return await prisma.gameStat.create({
      data: { username },
    });
  }

  async update(username: string, data: GameStatUpdateDto): Promise<GameStat> {
    return await prisma.gameStat.update({
      where: { username },
      data,
    });
  }

  async upsert(username: string, data: GameStatUpdateDto): Promise<GameStat> {
    return await prisma.gameStat.upsert({
      where: { username },
      update: data,
      create: {
        username,
        ...data,
      },
    });
  }

  async findTopPlayers(limit: number = 10): Promise<GameStat[]> {
    return await prisma.gameStat.findMany({
      orderBy: { total_wins: 'desc' },
      take: limit,
    });
  }

  async count(): Promise<number> {
    return await prisma.gameStat.count();
  }
}
