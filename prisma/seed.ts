import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

const DEMO_USER_ID = "demo-user";
const DEMO_USER_EMAIL = "demo@example.com";
const DEMO_USER_PASSWORD = "password123";

// Helpers ---------------------------------------------------------------------
const DAY = 24 * 60 * 60 * 1000;

function at(daysFromNow: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function startOfTodayPlus(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  console.log("🌱 Seeding database…");

  // Reset demo user's data for a clean, repeatable seed.
  const passwordHash = hashPassword(DEMO_USER_PASSWORD);
  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: { name: "Demo User", email: DEMO_USER_EMAIL, passwordHash },
    create: {
      id: DEMO_USER_ID,
      email: DEMO_USER_EMAIL,
      name: "Demo User",
      passwordHash,
    },
  });
  await prisma.focusSession.deleteMany({ where: { userId: DEMO_USER_ID } });
  await prisma.meeting.deleteMany({ where: { userId: DEMO_USER_ID } });
  await prisma.task.deleteMany({ where: { userId: DEMO_USER_ID } });
  await prisma.tag.deleteMany({ where: { userId: DEMO_USER_ID } });

  // Tags ----------------------------------------------------------------------
  const tagData = [
    { name: "research", color: "#ef4444" },
    { name: "writing", color: "#f59e0b" },
    { name: "admin", color: "#10b981" },
    { name: "reading", color: "#3b82f6" },
    { name: "experiments", color: "#8b5cf6" },
    { name: "teaching", color: "#ec4899" },
  ];
  const tags: Record<string, string> = {};
  for (const t of tagData) {
    const tag = await prisma.tag.create({
      data: { userId: DEMO_USER_ID, name: t.name, color: t.color },
    });
    tags[t.name] = tag.id;
  }

  // Tasks ---------------------------------------------------------------------
  const taskSpecs: Array<{
    title: string;
    description?: string;
    priority: string;
    status: string;
    deadline?: Date | null;
    isDaily?: boolean;
    tags: string[];
  }> = [
    {
      title: "Write literature review section 2.3",
      description: "Synthesize the 12 papers on contrastive representation learning.",
      priority: "high",
      status: "in_progress",
      deadline: at(2, 17),
      tags: ["writing", "research"],
    },
    {
      title: "Run ablation experiments for baseline model",
      description: "Vary batch size and learning rate; log to W&B.",
      priority: "high",
      status: "todo",
      deadline: at(1, 12),
      tags: ["experiments", "research"],
    },
    {
      title: "Read 'Attention Is All You Need' (re-read)",
      priority: "medium",
      status: "done",
      deadline: at(-1, 9),
      tags: ["reading"],
    },
    {
      title: "Reply to advisor's email about committee",
      priority: "medium",
      status: "todo",
      deadline: at(0, 18),
      tags: ["admin"],
    },
    {
      title: "Prepare slides for group meeting",
      description: "10-minute update on current progress.",
      priority: "high",
      status: "todo",
      deadline: at(3, 10),
      tags: ["writing", "teaching"],
    },
    {
      title: "Daily: 30 min deep reading",
      priority: "medium",
      status: "todo",
      isDaily: true,
      tags: ["reading"],
    },
    {
      title: "Daily: log research journal entry",
      priority: "low",
      status: "todo",
      isDaily: true,
      tags: ["writing"],
    },
    {
      title: "Submit travel reimbursement form",
      priority: "low",
      status: "todo",
      deadline: at(5, 16),
      tags: ["admin"],
    },
    {
      title: "Refactor data pipeline for reproducibility",
      priority: "medium",
      status: "in_progress",
      tags: ["experiments"],
    },
    {
      title: "Grade student assignments (batch 2)",
      priority: "medium",
      status: "todo",
      deadline: at(4, 23),
      tags: ["teaching", "admin"],
    },
  ];

  const createdTaskIds: string[] = [];
  let order = 0;
  for (const spec of taskSpecs) {
    const task = await prisma.task.create({
      data: {
        userId: DEMO_USER_ID,
        title: spec.title,
        description: spec.description ?? null,
        priority: spec.priority,
        status: spec.status,
        deadline: spec.deadline ?? null,
        isDaily: spec.isDaily ?? false,
        lastResetAt: spec.isDaily ? startOfTodayPlus(0) : null,
        completedAt: spec.status === "done" ? at(-1, 10) : null,
        sortOrder: order++,
        tags: {
          create: spec.tags.map((name) => ({ tag: { connect: { id: tags[name] } } })),
        },
      },
    });
    createdTaskIds.push(task.id);
  }

  // Meetings ------------------------------------------------------------------
  await prisma.meeting.createMany({
    data: [
      {
        userId: DEMO_USER_ID,
        title: "Weekly advisor 1:1",
        dateTime: at(0, 15),
        durationMinutes: 30,
        link: "https://zoom.us/j/1234567890",
        linkType: "zoom",
        notes: "Discuss experiment results and next milestones.",
      },
      {
        userId: DEMO_USER_ID,
        title: "Lab group meeting",
        dateTime: at(2, 11),
        durationMinutes: 60,
        link: "https://meet.google.com/abc-defg-hij",
        linkType: "meet",
        notes: "Present ablation study progress.",
      },
      {
        userId: DEMO_USER_ID,
        title: "Reading group: diffusion models",
        dateTime: at(3, 16),
        durationMinutes: 60,
        link: "https://meet.google.com/xyz-uvwx-yz",
        linkType: "meet",
      },
      {
        userId: DEMO_USER_ID,
        title: "Conference paper sync",
        dateTime: at(-2, 14),
        durationMinutes: 45,
        link: "https://zoom.us/j/9876543210",
        linkType: "zoom",
        notes: "Finalized author order.",
      },
    ],
  });

  // Focus sessions (last 12 days, realistic hours) ----------------------------
  const hoursPlan = [9, 10, 11, 14, 15, 16, 21]; // typical focus hours
  const sessions: {
    userId: string;
    taskId: string | null;
    type: string;
    startedAt: Date;
    endedAt: Date;
    plannedSeconds: number;
    elapsedSeconds: number;
    completed: boolean;
  }[] = [];

  for (let d = 0; d <= 12; d++) {
    // 1–4 sessions per day, more on weekdays.
    const date = startOfTodayPlus(-d);
    const dow = date.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const count = isWeekend ? 1 + (d % 2) : 2 + (d % 3);
    for (let i = 0; i < count; i++) {
      const hour = hoursPlan[(d + i) % hoursPlan.length];
      const start = at(-d, hour, (i * 17) % 60);
      const planned = i % 3 === 0 ? 3000 : 1500; // 50m or 25m
      // occasionally cut a session short
      const elapsed = i % 4 === 0 ? Math.round(planned * 0.8) : planned;
      const end = new Date(start.getTime() + elapsed * 1000);
      sessions.push({
        userId: DEMO_USER_ID,
        taskId: createdTaskIds[(d + i) % createdTaskIds.length] ?? null,
        type: planned === 3000 ? "custom" : "pomodoro",
        startedAt: start,
        endedAt: end,
        plannedSeconds: planned,
        elapsedSeconds: elapsed,
        completed: elapsed >= planned,
      });
    }
  }
  await prisma.focusSession.createMany({ data: sessions });

  console.log(
    `✅ Seeded: ${taskSpecs.length} tasks, ${tagData.length} tags, 4 meetings, ${sessions.length} focus sessions.`
  );
  console.log(`👤 Demo login → ${DEMO_USER_EMAIL} / ${DEMO_USER_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
