"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useTimerStore } from "@/store/timerStore";
import type { TimerSettings } from "@/store/timerStore";

type NumericKey =
  | "pomodoroMinutes"
  | "shortBreakMinutes"
  | "longBreakMinutes"
  | "longBreakInterval"
  | "customMinutes";

const NUMERIC_FIELDS: { key: NumericKey; label: string }[] = [
  { key: "pomodoroMinutes", label: "Focus (minutes)" },
  { key: "shortBreakMinutes", label: "Short break (minutes)" },
  { key: "longBreakMinutes", label: "Long break (minutes)" },
  { key: "longBreakInterval", label: "Long break after (blocks)" },
  { key: "customMinutes", label: "Custom timer (minutes)" },
];

export function PomodoroSettings() {
  const settings = useTimerStore((s) => s.settings);
  const configure = useTimerStore((s) => s.configure);

  const [open, setOpen] = useState(false);
  // Local draft as strings so the user can clear/type freely before validating.
  const [draft, setDraft] = useState<Record<NumericKey, string>>({
    pomodoroMinutes: String(settings.pomodoroMinutes),
    shortBreakMinutes: String(settings.shortBreakMinutes),
    longBreakMinutes: String(settings.longBreakMinutes),
    longBreakInterval: String(settings.longBreakInterval),
    customMinutes: String(settings.customMinutes),
  });
  const [autoStartBreaks, setAutoStartBreaks] = useState(
    settings.autoStartBreaks
  );
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(
    settings.autoStartPomodoros
  );

  // Re-seed the draft from the store each time the modal opens.
  useEffect(() => {
    if (!open) return;
    setDraft({
      pomodoroMinutes: String(settings.pomodoroMinutes),
      shortBreakMinutes: String(settings.shortBreakMinutes),
      longBreakMinutes: String(settings.longBreakMinutes),
      longBreakInterval: String(settings.longBreakInterval),
      customMinutes: String(settings.customMinutes),
    });
    setAutoStartBreaks(settings.autoStartBreaks);
    setAutoStartPomodoros(settings.autoStartPomodoros);
  }, [open, settings]);

  const invalid = (key: NumericKey) => {
    const n = Number(draft[key]);
    return draft[key].trim() === "" || !Number.isFinite(n) || n <= 0;
  };

  const hasError = NUMERIC_FIELDS.some((f) => invalid(f.key));

  function save() {
    if (hasError) return;
    const patch: Partial<TimerSettings> = {
      pomodoroMinutes: Number(draft.pomodoroMinutes),
      shortBreakMinutes: Number(draft.shortBreakMinutes),
      longBreakMinutes: Number(draft.longBreakMinutes),
      longBreakInterval: Number(draft.longBreakInterval),
      customMinutes: Number(draft.customMinutes),
      autoStartBreaks,
      autoStartPomodoros,
    };
    configure(patch);
    setOpen(false);
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Settings size={16} />
        Settings
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Timer settings"
        description="Tune your Pomodoro cadence and custom timer length."
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={hasError}>
              Save
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {NUMERIC_FIELDS.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <Label htmlFor={`setting-${field.key}`}>{field.label}</Label>
                <Input
                  id={`setting-${field.key}`}
                  type="number"
                  min={1}
                  value={draft[field.key]}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, [field.key]: e.target.value }))
                  }
                  aria-invalid={invalid(field.key)}
                />
                {invalid(field.key) && (
                  <p className="text-xs text-destructive">
                    Must be greater than 0.
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="auto-breaks"
                checked={autoStartBreaks}
                onCheckedChange={setAutoStartBreaks}
              />
              <Label htmlFor="auto-breaks">Auto-start breaks</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="auto-pomodoros"
                checked={autoStartPomodoros}
                onCheckedChange={setAutoStartPomodoros}
              />
              <Label htmlFor="auto-pomodoros">
                Auto-start focus blocks after breaks
              </Label>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
