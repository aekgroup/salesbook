import { ExpenseService } from '../supabase/services';
import { Expense, ExpenseFilters, ExpenseFormValues, UUID } from '../../shared/types';

export class ExpensesRepository {
  async list(filters: ExpenseFilters = {}): Promise<Expense[]> {
    const expenses = await ExpenseService.getAll();
    const search = filters.search?.toLowerCase();

    let filtered = expenses.filter((expense) => {
      if (search) {
        const text = `${expense.label} ${expense.note ?? ''} ${expense.category}`.toLowerCase();
        if (!text.includes(search)) return false;
      }
      if (filters.category && expense.category !== filters.category) {
        return false;
      }
      if (filters.range) {
        const { start, end } = filters.range;
        const date = expense.date;
        if ((start && date < start) || (end && date > end)) {
          return false;
        }
      }
      return true;
    });

    return filtered;
  }

  async summary(filters: ExpenseFilters = {}) {
    const expenses = await this.list(filters);
    const total = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    const categories = expenses.reduce<Record<string, number>>((acc, expense) => {
      acc[expense.category] = (acc[expense.category] ?? 0) + expense.amount;
      return acc;
    }, {});
    return { total, categories };
  }

  async get(id: UUID): Promise<Expense | undefined> {
    try {
      return await ExpenseService.getById(id) || undefined;
    } catch {
      return undefined;
    }
  }

  async create(input: ExpenseFormValues): Promise<Expense> {
    const expense = {
      label: input.label,
      category: input.category,
      amount: input.amount,
      date: input.date,
      note: input.note,
    };
    return await ExpenseService.create(expense);
  }

  async update(id: UUID, updates: Partial<ExpenseFormValues>): Promise<Expense> {
    const existing = await this.get(id);
    if (!existing) {
      throw new Error('Dépense introuvable');
    }
    const updateData = {
      label: updates.label ?? existing.label,
      category: updates.category ?? existing.category,
      amount: updates.amount ?? existing.amount,
      date: updates.date ?? existing.date,
      note: updates.note ?? existing.note,
    };
    return await ExpenseService.update(id, updateData);
  }

  async remove(id: UUID): Promise<void> {
    await ExpenseService.delete(id);
  }
}
