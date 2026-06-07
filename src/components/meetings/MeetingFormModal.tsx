"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Video } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { meetingCreateSchema, type MeetingCreateInput } from "@/lib/validations";
import { useCreateMeeting, useUpdateMeeting } from "@/hooks/useMeetings";
import { detectLinkType, LINK_LABELS } from "@/lib/utils";
import { toDate } from "@/lib/dates";
import type { Meeting } from "@/lib/types";

export interface MeetingFormModalProps {
  open: boolean;
  onClose: () => void;
  /** When provided the modal edits this meeting; otherwise it creates a new one. */
  meeting?: Meeting | null;
}

// Form state mirrors the create schema. `dateTime` is held as a full ISO
// string (the schema requires it); the datetime-local input shows/edits the
// local "yyyy-MM-dd'T'HH:mm" representation via a Controller.
type FormValues = MeetingCreateInput;

const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120];

/** datetime-local input value ("yyyy-MM-dd'T'HH:mm") from an ISO string. */
function toLocalInput(iso: string): string {
  if (!iso) return "";
  const d = toDate(iso);
  return Number.isNaN(d.getTime()) ? "" : format(d, "yyyy-MM-dd'T'HH:mm");
}

export function MeetingFormModal({
  open,
  onClose,
  meeting,
}: MeetingFormModalProps) {
  const isEdit = Boolean(meeting);
  const createMeeting = useCreateMeeting();
  const updateMeeting = useUpdateMeeting();
  const pending = createMeeting.isPending || updateMeeting.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    // Validate the create-schema-shaped form values directly.
    resolver: zodResolver(meetingCreateSchema),
    defaultValues: {
      title: "",
      dateTime: "",
      durationMinutes: 30,
      link: "",
      linkType: "none",
      notes: "",
    },
  });

  // Sync form state whenever the modal opens or the target meeting changes.
  useEffect(() => {
    if (!open) return;
    if (meeting) {
      reset({
        title: meeting.title,
        dateTime: meeting.dateTime,
        durationMinutes: meeting.durationMinutes,
        link: meeting.link ?? "",
        linkType: meeting.linkType,
        notes: meeting.notes ?? "",
      });
    } else {
      reset({
        title: "",
        dateTime: "",
        durationMinutes: 30,
        link: "",
        linkType: "none",
        notes: "",
      });
    }
  }, [open, meeting, reset]);

  const linkValue = watch("link") ?? "";
  const detected = detectLinkType(linkValue);

  function onSubmit(values: FormValues) {
    const link = values.link?.trim() ? values.link.trim() : null;
    const payload: MeetingCreateInput = {
      title: values.title,
      dateTime: values.dateTime,
      durationMinutes: Number(values.durationMinutes),
      link,
      // Derive the provider from the URL so the badge + join label stay correct.
      linkType: detectLinkType(link),
      notes: values.notes?.trim() ? values.notes.trim() : null,
    };

    if (meeting) {
      updateMeeting.mutate(
        { id: meeting.id, ...payload },
        { onSuccess: onClose }
      );
    } else {
      createMeeting.mutate(payload, { onSuccess: onClose });
    }
  }

  return (
    <Modal
      open={open}
      onClose={pending ? () => {} : onClose}
      title={isEdit ? "Edit meeting" : "New meeting"}
      description={
        isEdit
          ? "Update the details of this meeting."
          : "Schedule a meeting and add a join link."
      }
      size="md"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex animate-fade-in flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="meeting-title">Title</Label>
          <Input
            id="meeting-title"
            placeholder="Advisor sync, lab seminar…"
            autoFocus
            {...register("title")}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="meeting-when">When</Label>
            <Controller
              control={control}
              name="dateTime"
              render={({ field }) => (
                <Input
                  id="meeting-when"
                  type="datetime-local"
                  // Show the local representation; store a full ISO string.
                  value={toLocalInput(field.value)}
                  onChange={(e) => {
                    const local = e.target.value;
                    const parsed = local ? new Date(local) : null;
                    field.onChange(
                      parsed && !Number.isNaN(parsed.getTime())
                        ? parsed.toISOString()
                        : ""
                    );
                  }}
                  onBlur={field.onBlur}
                />
              )}
            />
            {errors.dateTime && (
              <p className="text-xs text-destructive">
                {errors.dateTime.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="meeting-duration">Duration</Label>
            <Select
              id="meeting-duration"
              {...register("durationMinutes", { valueAsNumber: true })}
            >
              {DURATION_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="meeting-link">Link</Label>
            {linkValue.trim() && (
              <Badge variant={detected === "none" ? "secondary" : "default"}>
                <Video size={12} />
                {LINK_LABELS[detected]}
              </Badge>
            )}
          </div>
          <Input
            id="meeting-link"
            type="url"
            placeholder="https://zoom.us/j/… or https://meet.google.com/…"
            {...register("link")}
          />
          {errors.link && (
            <p className="text-xs text-destructive">{errors.link.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="meeting-notes">Notes</Label>
          <Textarea
            id="meeting-notes"
            placeholder="Agenda, prep, attendees…"
            {...register("notes")}
          />
          {errors.notes && (
            <p className="text-xs text-destructive">{errors.notes.message}</p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-end gap-2 border-t border-border/70 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending && <Spinner size={16} />}
            {isEdit ? "Save changes" : "Create meeting"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
