import { z } from "zod";

// -----------------------------------------------------------------------------
// Zod schemas — the single source of truth for request validation (API routes)
// AND client-side form validation (react-hook-form resolvers).
// -----------------------------------------------------------------------------

export const prioritySchema = z.enum(["low", "medium", "high"]);
export const taskStatusSchema = z.enum(["todo", "in_progress", "done"]);
export const linkTypeSchema = z.enum(["zoom", "meet", "custom", "none"]);
export const focusTypeSchema = z.enum(["pomodoro", "custom", "manual"]);

const isoDate = z
  .string()
  .datetime({ offset: true })
  .or(z.string().datetime());

// ---- Tasks ------------------------------------------------------------------

export const taskCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(5000).optional().nullable(),
  priority: prioritySchema.default("medium"),
  status: taskStatusSchema.default("todo"),
  deadline: isoDate.optional().nullable(),
  isDaily: z.boolean().default(false),
  tagIds: z.array(z.string()).optional().default([]),
});

export const taskUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  priority: prioritySchema.optional(),
  status: taskStatusSchema.optional(),
  deadline: isoDate.optional().nullable(),
  isDaily: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  tagIds: z.array(z.string()).optional(),
});

// ---- Tags -------------------------------------------------------------------

export const tagCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(40),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, "Must be a hex color")
    .default("#64748b"),
});

// ---- Meetings ---------------------------------------------------------------

export const meetingCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  dateTime: isoDate,
  durationMinutes: z.number().int().min(5).max(1440).default(30),
  link: z.string().trim().url("Must be a valid URL").max(2000).optional().nullable().or(z.literal("")),
  linkType: linkTypeSchema.default("none"),
  notes: z.string().trim().max(5000).optional().nullable(),
});

export const meetingUpdateSchema = meetingCreateSchema.partial();

// ---- Focus sessions ---------------------------------------------------------

export const focusSessionCreateSchema = z.object({
  taskId: z.string().optional().nullable(),
  type: focusTypeSchema.default("pomodoro"),
  startedAt: isoDate.optional(),
  endedAt: isoDate.optional().nullable(),
  plannedSeconds: z.number().int().min(1).max(86_400),
  elapsedSeconds: z.number().int().min(0).max(86_400).default(0),
  completed: z.boolean().default(false),
});

export const focusSessionUpdateSchema = z.object({
  endedAt: isoDate.optional().nullable(),
  elapsedSeconds: z.number().int().min(0).max(86_400).optional(),
  completed: z.boolean().optional(),
});

export const analyticsQuerySchema = z.object({
  range: z.enum(["day", "week", "month"]).default("week"),
});

// ---- Inferred input types ---------------------------------------------------

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type TagCreateInput = z.infer<typeof tagCreateSchema>;
export type MeetingCreateInput = z.infer<typeof meetingCreateSchema>;
export type MeetingUpdateInput = z.infer<typeof meetingUpdateSchema>;
export type FocusSessionCreateInput = z.infer<typeof focusSessionCreateSchema>;
export type FocusSessionUpdateInput = z.infer<typeof focusSessionUpdateSchema>;
