"use client";
import { useActionState } from "react";
import type { Result } from "@/app/admin/actions";
export function AdminForm({
  action,
  csrf,
  children,
  label = "Save",
  className = "",
}: {
  action: (state: Result, form: FormData) => Promise<Result>;
  csrf: string;
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  const [state, submit, pending] = useActionState(action, {});
  return (
    <form action={submit} className={className}>
      <input type="hidden" name="csrf" value={csrf} />
      {children}
      <div className="actions">
        <button disabled={pending} type="submit">
          {pending ? "Saving…" : label}
        </button>
        <div aria-live="polite">
          {state.error && <span className="error">{state.error}</span>}
          {state.success && <span>{state.success}</span>}
        </div>
      </div>
    </form>
  );
}
