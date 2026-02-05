import { NotFoundException } from '@nestjs/common';

export async function throwIfNotFoundOrNotUser<T extends { userId: string }>(
  userId: string,
  entityId: string,
  findById: (id: string) => Promise<T | null>,
): Promise<T> {
  const entity = await findById(entityId);
  if (!entity) {
    throw new NotFoundException('Entity not found');
  }
  if (entity.userId !== userId) {
    throw new NotFoundException('Entity not found');
  }

  return entity;
}
