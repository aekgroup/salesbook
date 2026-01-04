import { StatusService } from '../supabase/services';
import { Status, StatusFormValues, UUID } from '../../shared/types';

export class StatusesRepository {
  async list(): Promise<Status[]> {
    return await StatusService.getAll();
  }

  async getDefault(): Promise<Status | undefined> {
    const statuses = await this.list();
    return statuses.find((status) => status.isDefault);
  }

  async create(payload: StatusFormValues): Promise<Status> {
    const status = {
      label: payload.label,
      color: payload.color,
      isDefault: payload.isDefault ?? false,
      order: payload.order ?? (await this.list()).length,
    };
    if (status.isDefault) {
      await this.clearDefault();
    }
    return await StatusService.create(status);
  }

  async update(id: UUID, updates: Partial<StatusFormValues>): Promise<Status> {
    const existing = await this.get(id);
    if (!existing) throw new Error('Statut introuvable');
    
    const updateData = {
      label: updates.label ?? existing.label,
      color: updates.color ?? existing.color,
      isDefault: updates.isDefault ?? existing.isDefault,
      order: updates.order ?? existing.order,
    };
    
    if (updates.isDefault) {
      await this.clearDefault();
    }
    
    return await StatusService.update(id, updateData);
  }

  async remove(id: UUID): Promise<void> {
    await StatusService.delete(id);
  }

  async reorder(ids: UUID[]): Promise<void> {
    for (const [order, id] of ids.entries()) {
      await StatusService.update(id, { order });
    }
  }

  private async clearDefault(): Promise<void> {
    const statuses = await this.list();
    for (const status of statuses) {
      if (status.isDefault) {
        await StatusService.update(status.id, { isDefault: false });
      }
    }
  }
  
  private async get(id: UUID): Promise<Status | undefined> {
    const statuses = await this.list();
    return statuses.find((status) => status.id === id);
  }
}
