"use client";

import * as React from "react";
import { MessageSquare, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  listTraceAnnotationsAction,
  createAnnotationAction,
  deleteAnnotationAction,
} from "@/actions/annotations";
import type { Annotation, AnnotationType } from "@/lib/types";

const TYPE_COLORS: Record<AnnotationType, string> = {
  manual: "bg-blue-500/10 text-blue-500",
  automated: "bg-violet-500/10 text-violet-500",
  feedback: "bg-amber-500/10 text-amber-500",
};

export function Annotations({
  traceId,
  projectId,
}: {
  traceId: string;
  projectId: string;
}) {
  const [list, setList] = React.useState<Annotation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [comment, setComment] = React.useState("");
  const [label, setLabel] = React.useState("");
  const [score, setScore] = React.useState("");
  const [annotationType, setAnnotationType] =
    React.useState<AnnotationType>("manual");
  const [submitting, setSubmitting] = React.useState(false);

  const fetchAnnotations = React.useCallback(async () => {
    try {
      const items = await listTraceAnnotationsAction(traceId);
      setList(items);
    } catch (e) {
      console.error("Failed to load annotations:", e);
    } finally {
      setLoading(false);
    }
  }, [traceId]);

  React.useEffect(() => {
    fetchAnnotations();
  }, [fetchAnnotations]);

  async function submit() {
    if (!comment.trim() && !label.trim() && !score.trim()) return;
    setSubmitting(true);
    try {
      const data: Parameters<typeof createAnnotationAction>[1] = {
        project_id: projectId,
        annotation_type: annotationType,
      };
      if (label.trim()) data.label = label.trim();
      if (comment.trim()) data.comment = comment.trim();
      if (score.trim()) {
        const n = parseFloat(score);
        if (!isNaN(n)) data.score = n;
      }
      const created = await createAnnotationAction(traceId, data);
      setList([created, ...list]);
      setComment("");
      setLabel("");
      setScore("");
    } catch (e) {
      console.error("Failed to create annotation:", e);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(annotationId: string) {
    try {
      await deleteAnnotationAction(annotationId, traceId);
      setList(list.filter((a) => a.id !== annotationId));
    } catch (e) {
      console.error("Failed to delete annotation:", e);
    }
  }

  return (
    <div className="space-y-5 p-5">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold mb-3">Leave an annotation</p>
        <div className="grid gap-2">
          <Input
            placeholder="Label (e.g. hallucination, wrong-tool, regression)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              step="0.01"
              min="0"
              max="1"
              placeholder="Score (0.0 - 1.0)"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
            <Select
              value={annotationType}
              onChange={(event) =>
                setAnnotationType(event.target.value as AnnotationType)
              }
            >
              <option value="manual">Manual</option>
              <option value="automated">Automated</option>
              <option value="feedback">Feedback</option>
            </Select>
          </div>
          <textarea
            rows={3}
            className="w-full rounded-md border border-input bg-input/20 px-2 py-1.5 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            placeholder="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLabel("");
                setComment("");
                setScore("");
              }}
            >
              Clear
            </Button>
            <Button size="sm" onClick={submit} disabled={submitting}>
              {submitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground px-1">
          Loading annotations...
        </p>
      ) : (
        <ul className="space-y-3">
          {list.length === 0 && (
            <li className="flex items-center gap-2 rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
              <MessageSquare className="size-3" /> No annotations yet.
            </li>
          )}
          {list.map((a) => (
            <li
              key={a.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">
                  {a.user_id || "System"}
                </span>
                {a.label && <Badge>{a.label}</Badge>}
                {a.annotation_type && (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-medium ${TYPE_COLORS[a.annotation_type] ?? ""}`}
                  >
                    {a.annotation_type}
                  </span>
                )}
                {typeof a.score === "number" && (
                  <span className="inline-flex items-center gap-0.5 text-[0.625rem] text-muted-foreground">
                    <Star className="size-3" /> {a.score.toFixed(2)}
                  </span>
                )}
                {a.step_id && (
                  <span className="text-[0.6rem] text-muted-foreground font-mono">
                    step: {a.step_id.slice(0, 12)}...
                  </span>
                )}
                <span className="ml-auto text-[0.625rem] text-muted-foreground">
                  {new Date(a.created_at).toLocaleString()}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={() => handleDelete(a.id)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
              {a.comment && (
                <p className="mt-2 text-xs text-foreground/90">{a.comment}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
