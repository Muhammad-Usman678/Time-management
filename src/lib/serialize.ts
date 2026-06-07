import type {
  Task as DbTask,
  Tag as DbTag,
  TagsOnTasks,
  Meeting as DbMeeting,
  FocusSession as DbFocusSession,
  Prisma,
} from "@prisma/client";
import type {
  Task,
  Tag,
  Meeting,
  FocusSession,
  Priority,
  TaskStatus,
  LinkType,
  FocusType,
} from "@/lib/types";

// -----------------------------------------------------------------------------
// Serializers — convert Prisma rows (Date objects, join rows) into the wire DTOs
// declared in src/lib/types.ts. Every API route returns data through these so
// the client always receives an identical, ISO-stringified shape.
// -----------------------------------------------------------------------------

/** Canonical `include` for fetching a task with its tags (+ optional focus). */
export const taskInclude = {
  tags: { include: { tag: true } },
} satisfies Prisma.TaskInclude;

type DbTaskWithRelations = DbTask & {
  tags: (TagsOnTasks & { tag: DbTag })[];
  focusSessions?: { elapsedSeconds: number }[];
};

export function serializeTag(t: DbTag): Tag {
  return { id: t.id, name: t.name, color: t.color };
}

export function serializeTask(t: DbTaskWithRelations): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority as Priority,
    status: t.status as TaskStatus,
    deadline: t.deadline ? t.deadline.toISOString() : null,
    isDaily: t.isDaily,
    completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    sortOrder: t.sortOrder,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    tags: t.tags.map((rel) => serializeTag(rel.tag)),
    focusSeconds: t.focusSessions
      ? t.focusSessions.reduce((sum, s) => sum + s.elapsedSeconds, 0)
      : undefined,
  };
}

export function serializeMeeting(m: DbMeeting): Meeting {
  return {
    id: m.id,
    title: m.title,
    dateTime: m.dateTime.toISOString(),
    durationMinutes: m.durationMinutes,
    link: m.link,
    linkType: m.linkType as LinkType,
    notes: m.notes,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}

export function serializeFocusSession(
  f: DbFocusSession & { task?: { id: string; title: string } | null }
): FocusSession {
  return {
    id: f.id,
    taskId: f.taskId,
    type: f.type as FocusType,
    startedAt: f.startedAt.toISOString(),
    endedAt: f.endedAt ? f.endedAt.toISOString() : null,
    plannedSeconds: f.plannedSeconds,
    elapsedSeconds: f.elapsedSeconds,
    completed: f.completed,
    createdAt: f.createdAt.toISOString(),
    task: f.task ?? null,
  };
}
