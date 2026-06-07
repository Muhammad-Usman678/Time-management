"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ListTodo, Plus, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { TaskFilters, type TaskFilterState } from "@/components/tasks/TaskFilters";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { useTasks } from "@/hooks/useTasks";
import type { Task, TaskView } from "@/lib/types";

const VIEW_TABS = [
  { value: "today", label: "Today", icon: Sun },
  { value: "week", label: "This Week", icon: CalendarDays },
  { value: "all", label: "All", icon: ListTodo },
];

// Higher = sorts first, so high-priority tasks float up after the server order.
const PRIORITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

export default function TasksPage() {
  const [view, setView] = useState<TaskView>("today");
  const [filters, setFilters] = useState<TaskFilterState>({
    search: "",
    priority: "all",
    status: "all",
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>(undefined);

  const { data: tasks = [], isLoading } = useTasks(view);

  const visibleTasks = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const matched = tasks.filter((task) => {
      if (filters.priority !== "all" && task.priority !== filters.priority) {
        return false;
      }
      if (filters.status !== "all" && task.status !== filters.status) {
        return false;
      }
      if (search) {
        const haystack = `${task.title} ${task.description ?? ""}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    // Done tasks sink to the bottom; within a group, higher priority first.
    return matched.sort((a, b) => {
      const doneDiff = Number(a.status === "done") - Number(b.status === "done");
      if (doneDiff !== 0) return doneDiff;
      const prioDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (prioDiff !== 0) return prioDiff;
      return a.sortOrder - b.sortOrder;
    });
  }, [tasks, filters]);

  const isFiltered =
    filters.search.trim() !== "" ||
    filters.priority !== "all" ||
    filters.status !== "all";

  function openCreate() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setModalOpen(true);
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl animate-fade-in flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="icon-chip h-11 w-11 bg-primary/10 text-primary shadow-soft">
            <ListTodo size={22} />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              <span className="text-gradient">Tasks</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Capture, prioritize, and track your research to-dos.
            </p>
          </div>
        </div>
        <Button onClick={openCreate} className="self-start">
          <Plus size={18} />
          New Task
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <Tabs
          tabs={VIEW_TABS}
          value={view}
          onValueChange={(v) => setView(v as TaskView)}
        />
        <TaskFilters value={filters} onChange={setFilters} />
      </div>

      <TaskList
        tasks={visibleTasks}
        loading={isLoading}
        filtered={isFiltered}
        onEdit={openEdit}
      />

      <TaskFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        task={editing}
      />
    </div>
  );
}
