import { create } from "zustand";
import type { TodoInput, TodoItem } from "@/types";
import { createId } from "@/lib/id";
import { STORAGE_KEYS, readJSON, writeJSON } from "@/lib/storage";
import { shiftDays, todayString } from "@/utils/date";

interface TodosState {
  todos: TodoItem[];
  hydrated: boolean;
  /** 当前查看的日期 */
  anchor: string;
  today: string;
  hydrate: () => void;
  setAnchor: (date: string) => void;
  shift: (dir: number) => void;
  goToday: () => void;
  create: (input: TodoInput) => TodoItem;
  toggle: (id: string) => void;
  update: (id: string, patch: Partial<TodoInput>) => void;
  remove: (id: string) => void;
  clear: () => void;
  replaceAll: (todos: TodoItem[]) => void;
}

const persist = (todos: TodoItem[]): void => {
  writeJSON(STORAGE_KEYS.todos, todos);
};

const sortTodos = (todos: TodoItem[]): TodoItem[] =>
  [...todos].sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));

export const useTodosStore = create<TodosState>((set, get) => ({
  todos: [],
  hydrated: false,
  anchor: todayString(),
  today: todayString(),

  hydrate: () => {
    if (get().hydrated) return;
    const stored = readJSON<TodoItem[]>(STORAGE_KEYS.todos, []);
    set({
      todos: sortTodos(stored),
      hydrated: true,
      today: todayString(),
      anchor: todayString(),
    });
  },

  setAnchor: (date) => set({ anchor: date }),
  shift: (dir) => set({ anchor: shiftDays(get().anchor, dir) }),
  goToday: () => set({ anchor: todayString(), today: todayString() }),

  create: (input) => {
    const todo: TodoItem = {
      ...input,
      id: createId(),
      createdAt: new Date().toISOString(),
      text: input.text.trim(),
    };
    const todos = sortTodos([todo, ...get().todos]);
    persist(todos);
    set({ todos });
    return todo;
  },

  toggle: (id) => {
    const todos = get().todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    persist(todos);
    set({ todos });
  },

  update: (id, patch) => {
    const todos = get().todos.map((t) =>
      t.id === id ? { ...t, ...patch, text: patch.text === undefined ? t.text : patch.text.trim() } : t,
    );
    persist(todos);
    set({ todos });
  },

  remove: (id) => {
    const todos = get().todos.filter((t) => t.id !== id);
    persist(todos);
    set({ todos });
  },

  clear: () => {
    persist([]);
    set({ todos: [] });
  },

  replaceAll: (todos) => {
    const sorted = sortTodos(todos);
    persist(sorted);
    set({ todos: sorted, hydrated: true });
  },
}));
