"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuditEvents } from "@/shared/api/landing-repo";
import { useLandingEditorStore } from "@/features/landing-editor/model/editor-store";

const slug = "home";

const copy = {
  en: {
    title: "History",
    subtitle: "Track changes across drafts and publishes.",
    empty: "No history yet.",
    system: "system"
  },
  ru: {
    title: "История",
    subtitle: "Отслеживайте изменения в черновиках и публикациях.",
    empty: "Истории пока нет.",
    system: "система"
  },
  tj: {
    title: "Таърих",
    subtitle: "Тағйиротро дар черновикҳо ва нашрҳо пайгирӣ кунед.",
    empty: "Ҳоло таърих нест.",
    system: "система"
  }
};

export default function AdminHistoryPage() {
  const { language } = useLandingEditorStore();
  const t = copy[language] || copy.en;
  const { data: events = [] } = useQuery({ queryKey: ["audit", slug], queryFn: () => getAuditEvents(slug) });

  return (
    <div className="space-y-4">
      <div className="rounded-[16px] border admin-surface px-5 py-4 admin-shadow">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] admin-muted">Audit</p>
        <h1 className="font-display text-2xl">{t.title}</h1>
        <p className="text-xs admin-muted">{t.subtitle}</p>
      </div>
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event._id} className="rounded-[14px] border admin-surface p-5 admin-shadow">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">{event.action}</p>
              <p className="text-xs admin-muted">{new Date(event.createdAt).toLocaleString()}</p>
            </div>
            <p className="text-xs admin-muted">{event.actor?.email || t.system}</p>
            <ul className="mt-4 space-y-2 text-xs admin-muted">
              {event.changes?.slice(0, 6).map((change, idx) => (
                <li key={`${event._id}-${idx}`} className="rounded-[10px] border admin-card px-3 py-2">
                  <span className="font-semibold">{change.label}</span>
                  {change.before !== undefined || change.after !== undefined ? (
                    <span className="block text-[11px] admin-muted">
                      {JSON.stringify(change.before)} {"\u2192"} {JSON.stringify(change.after)}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {events.length === 0 ? <p className="text-sm admin-muted">{t.empty}</p> : null}
      </div>
    </div>
  );
}
