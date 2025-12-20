import { nanoid } from 'nanoid';
import { db, ensureSeeded } from '../dexie/db';
import { Status, StatusFormValues, UUID } from '../../shared/types';

export class StatusesRepository {
  async list(): Promise<Status[]> {
    await ensureSeeded();
    return db.statuses.orderBy('order').toArray();
  }

  async getDefault(): Promise<Status | undefined> {
    await ensureSeeded();
    return db.statuses.filter((status) => status.isDefault).first();
  }

  async create(payload: StatusFormValues): Promise<Status> {
    await ensureSeeded();
    const now = new Date().toISOString();
    const status: Status = {
      id: payload.id ?? nanoid(),
      label: payload.label,
      color: payload.color,
      isDefault: payload.isDefault ?? false,
      order: payload.order ?? (await db.statuses.count()),
      createdAt: now,
      updatedAt: now,
    };
    if (status.isDefault) {
      await this.clearDefault(status.id);
    }
    await db.statuses.add(status);
    return status;
  }

  async update(id: UUID, updates: Partial<StatusFormValues>): Promise<Status> {
    const existing = await db.statuses.get(id);
    if (!existing) throw new Error('Statut introuvable');
    const updated: Status = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    if (updates.isDefault) {
      await this.clearDefault(id);
    }
    await db.statuses.put(updated);
    return updated;
  }

  async remove(id: UUID): Promise<void> {
    await db.statuses.delete(id);
  }

  async reorder(ids: UUID[]): Promise<void> {
    await db.transaction('rw', db.statuses, async () => {
      for (const [order, id] of ids.entries()) {
        await db.statuses.update(id, { order });
      }
    });
  }

  private async clearDefault(exceptId?: UUID) {
    const statuses = await db.statuses.filter((status) => status.isDefault).toArray();
    for (const status of statuses) {
      if (status.id === exceptId) continue;
      await db.statuses.update(status.id, { isDefault: false });
    }
  }
}
