import prisma from '../config/Database';
import type { GameStatUpdateDto } from '../types/dtos/StatsDto';

export class StatsRepository {
  async findByUsername(username: string) {
    return await prisma.gameStat.findUnique({
      where: { username },
    });
  }

  async create(username: string) {
    return await prisma.gameStat.create({
      data: { username },
    });
  }

  async update(username: string, data: GameStatUpdateDto) {
    return await prisma.gameStat.update({
      where: { username },
      data,
    });
  }

  async upsert(username: string, data: GameStatUpdateDto) {
    return await prisma.gameStat.upsert({
      where: { username },
      update: data,
      create: {
        username,
        ...data,
      },
    });
  }

  async findTopPlayers(limit: number = 10) {
    return await prisma.gameStat.findMany({
      orderBy: { total_wins: 'desc' },
      take: limit,
    });
  }

  async count(): Promise<number> {
    return await prisma.gameStat.count();
  }

  async delete(username: string): Promise<void> {
    await prisma.gameStat.delete({
      where: { username },
    });
  }
}
