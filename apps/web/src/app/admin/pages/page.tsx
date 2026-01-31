"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input, TextArea } from "@/shared/ui/input";
import { fileToBase64 } from "@/shared/lib/file";
import { getDraftLanding, getPageContent, getTenant, savePageContent } from "@/shared/api/landing-repo";
import { PageCard, PageContent, PageSection } from "@/shared/types/landing";
import { defaultPages } from "@/entities/landing/model/page-defaults";
import { useLandingEditorStore } from "@/features/landing-editor/model/editor-store";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { PageRenderer } from "@/widgets/page-renderer";
import { getNavBlock } from "@/shared/lib/nav";
import { PageLoader } from "@/shared/ui/page-loader";

const pageOptions = ["all-access", "community", "about-us", "programs", "blog", "team-training", "login", "loader"].filter(
  (page) => page in defaultPages
);

const pageLabels: Record<string, string> = {
  "about-us": "About us",
  "all-access": "All access",
  community: "Community",
  programs: "Programs",
  "team-training": "Teams",
  blog: "Blog",
  login: "Login",
  loader: "Loader"
};

const copy = {
  en: {
    title: "Static page editor",
    subtitle: "Update text and images for each page.",
    preview: "Preview",
    editor: "Editor",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    language: "Language",
    saved: "Saved",
    saving: "Saving...",
    saveFailed: "Save failed",
    save: "Save page",
    page: "Page",
    layout: "Layout",
    eyebrow: "Eyebrow",
    titleLabel: "Title",
    subtitleLabel: "Subtitle",
    description: "Description",
    heroImage: "Hero image",
    bullets: "Bullets",
    addBullet: "Add bullet",
    sections: "Sections",
    addSection: "Add section",
    cards: "Cards",
    addCard: "Add card",
    ctaLabel: "CTA label",
    ctaLink: "CTA link",
    remove: "Remove"
  },
  ru: {
    title: "Редактор страниц",
    subtitle: "Обновляйте текст и изображения для каждой страницы.",
    save: "Сохранить страницу",
    page: "Страница",
    layout: "Макет",
    eyebrow: "Надзаголовок",
    titleLabel: "Заголовок",
    subtitleLabel: "Подзаголовок",
    description: "Описание",
    heroImage: "Главное изображение",
    bullets: "Пункты",
    addBullet: "Добавить пункт",
    sections: "Разделы",
    addSection: "Добавить раздел",
    cards: "Карточки",
    addCard: "Добавить карточку",
    ctaLabel: "Текст CTA",
    ctaLink: "Ссылка CTA",
    remove: "Удалить"
  },
  tj: {
    title: "Муҳаррири саҳифаҳо",
    subtitle: "Барои ҳар саҳифа матн ва тасвирро нав кунед.",
    save: "Сабти саҳифа",
    page: "Саҳифа",
    layout: "Тарҳ",
    eyebrow: "Надсарлавҳа",
    titleLabel: "Сарлавҳа",
    subtitleLabel: "Зерсарлавҳа",
    description: "Тавсиф",
    heroImage: "Тасвири асосӣ",
    bullets: "Бандҳо",
    addBullet: "Иловаи банд",
    sections: "Бахшҳо",
    addSection: "Иловаи бахш",
    cards: "Кортҳо",
    addCard: "Иловаи корт",
    ctaLabel: "Матни CTA",
    ctaLink: "Пайванди CTA",
    remove: "Ҳазф"
  }

};

const languageLabels = {
  en: "English",
  ru: "Русский",
  tj: "Тоҷикӣ"
};

export default function AdminPagesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, setLanguage, mode, setMode, adminTheme, setAdminTheme } = useLandingEditorStore();
  const t = { ...copy.en, ...(copy[language] || {}) };
  const initialSlug = searchParams?.get("slug") || pageOptions[0] || "about-us";
  const [slug, setSlug] = useState(initialSlug);
  const [draft, setDraft] = useState<PageContent | null>(null);
  const isLoader = slug === "loader";
  const isLockedPage = slug === "all-access";
  const [statusKey, setStatusKey] = useState<"idle" | "saving" | "saved" | "saveFailed">("idle");

  const { data } = useQuery({
    queryKey: ["page", slug],
    queryFn: () => getPageContent(slug)
  });
  const { data: tenant } = useQuery({ queryKey: ["tenant"], queryFn: getTenant });
  const { data: landing } = useQuery({
    queryKey: ["landing", "draft", "home", language],
    queryFn: () => getDraftLanding("home", language)
  });

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  useEffect(() => {
    const nextSlug = searchParams?.get("slug");
    if (!nextSlug || nextSlug === slug) return;
    setSlug(nextSlug);
  }, [searchParams, slug]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("admin:lang");
    if (stored === "en" || stored === "ru" || stored === "tj") {
      setLanguage(stored);
    }
  }, [setLanguage]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("admin:lang", language);
  }, [language]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("admin:theme");
    if (stored === "light" || stored === "dark") {
      setAdminTheme(stored);
    }
  }, [setAdminTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("admin:theme", adminTheme);
  }, [adminTheme]);

  const saveMutation = useMutation({
    mutationFn: async (next: PageContent) => savePageContent(slug, next),
    onMutate: () => setStatusKey("saving"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", slug] });
      setStatusKey("saved");
      toast.success(t.saved);
    },
    onError: () => {
      setStatusKey("saveFailed");
      toast.error(t.saveFailed);
    }
  });

  const layoutOptions = useMemo(() => ["standard", "team", "blog", "courses"] as const, []);

  function update(next: Partial<PageContent>) {
    setDraft((current) => (current ? { ...current, ...next } : current));
  }

  async function onImageUpload(file: File, key: "heroImage", index?: number, target?: "sections" | "cards") {
    const url = await fileToBase64(file);
    if (key === "heroImage") {
      update({ heroImage: url });
      return;
    }
    if (!draft || !target || index === undefined) return;
    if (target === "sections") {
      const next = [...(draft.sections || [])];
      next[index] = { ...next[index], image: url };
      update({ sections: next });
    }
    if (target === "cards") {
      const next = [...(draft.cards || [])];
      next[index] = { ...next[index], image: url };
      update({ cards: next });
    }
  }

  if (!draft) {
    return <div className="text-sm admin-muted">Loading page editor...</div>;
  }

  const isPreview = mode === "preview";
  const statusText =
    statusKey === "saving" ? t.saving : statusKey === "saved" ? t.saved : statusKey === "saveFailed" ? t.saveFailed : "";
  const navBlock = landing ? getNavBlock(landing) : null;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-[16px] border admin-surface px-5 py-4 admin-shadow">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] admin-muted">Pages</p>
          <h1 className="font-display text-3xl">{isLockedPage ? "All access page" : t.title}</h1>
          <p className="text-sm admin-muted">{statusText || t.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-[12px] border admin-card p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode("editor")}
              className={`rounded-[10px] px-4 py-1 ${!isPreview ? "bg-[rgb(var(--admin-accent))] text-white" : "admin-muted"}`}
              aria-pressed={!isPreview}
            >
              {t.editor}
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={`rounded-[10px] px-4 py-1 ${isPreview ? "bg-[rgb(var(--admin-accent))] text-white" : "admin-muted"}`}
              aria-pressed={isPreview}
            >
              {t.preview}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setAdminTheme(adminTheme === "dark" ? "light" : "dark")}
            className={`flex items-center gap-2 rounded-[12px] border admin-card px-4 py-2 text-xs font-semibold ${
              adminTheme === "dark" ? "bg-[rgb(var(--admin-card))] text-[rgb(var(--admin-text))]" : "admin-muted"
            }`}
            aria-pressed={adminTheme === "dark"}
          >
            <span className={`h-2 w-2 rounded-full ${adminTheme === "dark" ? "bg-[rgb(var(--admin-accent))]" : "bg-[rgb(var(--admin-border))]"}`} />
            {adminTheme === "dark" ? t.lightMode : t.darkMode}
          </button>
          <div className="flex items-center gap-2 rounded-[12px] border admin-card px-4 py-2 text-xs font-semibold">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] admin-muted">{t.language}</span>
            <select
              className="admin-select rounded-theme border px-2 py-1 text-xs font-semibold"
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "ru" | "tj")}
            >
              <option value="en">{languageLabels.en}</option>
              <option value="ru">{languageLabels.ru}</option>
              <option value="tj">{languageLabels.tj}</option>
            </select>
          </div>
        </div>
      </header>

      {!isPreview ? (
        <section className="rounded-[16px] border admin-surface px-5 py-4 admin-shadow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Edit page</h2>
              <p className="text-sm admin-muted">Edit the text, buttons, and images.</p>
            </div>
            <Button type="button" className="rounded-[10px] bg-[rgb(var(--admin-accent))] px-4 py-2 text-xs font-semibold text-white admin-shadow hover:opacity-90" onClick={() => saveMutation.mutate(draft)} disabled={saveMutation.isPending}>
              {t.save}
            </Button>
          </div>
        </section>
      ) : null}

      <section className="rounded-[16px] border admin-surface px-5 py-5 admin-shadow">
        <div className="grid gap-2 md:grid-cols-3">
          {!isLockedPage ? (
            <label className="text-xs font-semibold admin-muted">
              {t.page}
              <select
                className="admin-control mt-2 w-full rounded-theme border px-3 py-2 text-sm"
                value={slug}
                onChange={(e) => {
                  const nextSlug = e.target.value;
                  setSlug(nextSlug);
                  router.replace(`/admin/pages?slug=${nextSlug}`);
                }}
              >
                {pageOptions.map((pageSlug) => (
                  <option key={pageSlug} value={pageSlug}>
                    {pageLabels[pageSlug] || pageSlug.replace("-", " ")}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="text-xs font-semibold admin-muted">
              {t.page}
              <div className="mt-2 rounded-theme border px-3 py-2 text-sm admin-card">All access</div>
            </div>
          )}
          {!isLoader ? (
            <label className="text-xs font-semibold admin-muted">
              {t.layout}
              <select
                className="admin-control mt-2 w-full rounded-theme border px-3 py-2 text-sm"
                value={draft.layout}
                onChange={(e) => update({ layout: e.target.value as PageContent["layout"] })}
              >
                {layoutOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div />
          )}
          <label className="text-xs font-semibold admin-muted">
            {t.eyebrow}
            <Input value={draft.eyebrow || ""} onChange={(e) => update({ eyebrow: e.target.value })} className="mt-2" />
          </label>
        </div>
        {isPreview ? (
          <div className="rounded-[14px] border admin-card p-4">
            {tenant && landing ? (
              <ThemeProvider theme={landing.theme}>
                {isLoader ? (
                  <PageLoader page={draft} tenant={tenant} theme={landing.theme} />
                ) : (
                  <PageRenderer tenant={tenant} nav={navBlock?.props} page={draft} />
                )}
              </ThemeProvider>
            ) : (
              <div className="text-sm admin-muted">Loading preview...</div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
          <section className="space-y-2">
            <label className="text-xs font-semibold admin-muted">
              {t.titleLabel}
              <Input value={draft.title} onChange={(e) => update({ title: e.target.value })} className="mt-2" />
            </label>
            <label className="text-xs font-semibold admin-muted">
              {t.subtitleLabel}
              <Input value={draft.subtitle || ""} onChange={(e) => update({ subtitle: e.target.value })} className="mt-2" />
            </label>
            <label className="text-xs font-semibold admin-muted">
              {t.description}
              <TextArea value={draft.description || ""} onChange={(e) => update({ description: e.target.value })} className="mt-2" />
            </label>
          </section>

          <section className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] admin-muted">Media</p>
            <label className="text-xs font-semibold admin-muted">
              {t.heroImage}
              <Input value={draft.heroImage || ""} onChange={(e) => update({ heroImage: e.target.value })} className="mt-2" />
              <input
                type="file"
                accept="image/*"
                className="mt-2"
                onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0], "heroImage")}
              />
            </label>
          </section>

          {!isLoader ? (
            <>
              <section className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] admin-muted">{t.bullets}</p>
                {(draft.bullets || []).map((item, index) => (
                  <div key={`${item}-${index}`} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const next = [...(draft.bullets || [])];
                        next[index] = e.target.value;
                        update({ bullets: next });
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => update({ bullets: (draft.bullets || []).filter((_, i) => i !== index) })}
                    >
                      {t.remove}
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="ghost" className="text-xs" onClick={() => update({ bullets: [...(draft.bullets || []), ""] })}>
                  {t.addBullet}
                </Button>
              </section>

              <PageSectionEditor
                sections={draft.sections || []}
                onChange={(sections) => update({ sections })}
                onUpload={onImageUpload}
                labels={{ title: t.sections, add: t.addSection, remove: t.remove }}
              />
              <PageCardEditor
                cards={draft.cards || []}
                onChange={(cards) => update({ cards })}
                onUpload={onImageUpload}
                labels={{ title: t.cards, add: t.addCard, remove: t.remove }}
              />

              <section className="grid gap-2 md:grid-cols-2">
                <label className="text-xs font-semibold admin-muted">
                  {t.ctaLabel}
                  <Input
                    value={draft.cta?.label || ""}
                    onChange={(e) =>
                      update({
                        cta: {
                          label: e.target.value,
                          href: draft.cta?.href || ""
                        }
                      })
                    }
                    className="mt-2"
                  />
                </label>
                <label className="text-xs font-semibold admin-muted">
                  {t.ctaLink}
                  <Input
                    value={draft.cta?.href || ""}
                    onChange={(e) =>
                      update({
                        cta: {
                          label: draft.cta?.label || "",
                          href: e.target.value
                        }
                      })
                    }
                    className="mt-2"
                  />
                </label>
              </section>
            </>
          ) : null}
        </div>
        )}
      </section>
    </div>
  );
}

function PageSectionEditor({
  sections,
  onChange,
  onUpload,
  labels
}: {
  sections: PageSection[];
  onChange: (sections: PageSection[]) => void;
  onUpload: (file: File, key: "heroImage", index?: number, target?: "sections" | "cards") => Promise<void>;
  labels: { title: string; add: string; remove: string };
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] admin-muted">{labels.title}</p>
      {sections.map((section, index) => (
        <div key={`${section.heading}-${index}`} className="space-y-2">
          <Input
            value={section.heading}
            onChange={(e) => {
              const next = [...sections];
              next[index] = { ...next[index], heading: e.target.value };
              onChange(next);
            }}
            placeholder="Heading"
          />
          <TextArea
            value={section.body}
            onChange={(e) => {
              const next = [...sections];
              next[index] = { ...next[index], body: e.target.value };
              onChange(next);
            }}
            placeholder="Body"
          />
          <Input
            value={section.image || ""}
            onChange={(e) => {
              const next = [...sections];
              next[index] = { ...next[index], image: e.target.value };
              onChange(next);
            }}
            placeholder="Image URL"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], "heroImage", index, "sections")}
          />
          <Button type="button" variant="ghost" className="text-xs" onClick={() => onChange(sections.filter((_, i) => i !== index))}>
            {labels.remove}
          </Button>
        </div>
      ))}
      <Button type="button" variant="ghost" className="text-xs" onClick={() => onChange([...sections, { heading: "", body: "", image: "" }])}>
        {labels.add}
      </Button>
    </div>
  );
}

function PageCardEditor({
  cards,
  onChange,
  onUpload,
  labels
}: {
  cards: PageCard[];
  onChange: (cards: PageCard[]) => void;
  onUpload: (file: File, key: "heroImage", index?: number, target?: "sections" | "cards") => Promise<void>;
  labels: { title: string; add: string; remove: string };
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] admin-muted">{labels.title}</p>
      {cards.map((card, index) => (
        <div key={`${card.title}-${index}`} className="space-y-2">
          <Input
            value={card.tag || ""}
            onChange={(e) => {
              const next = [...cards];
              next[index] = { ...next[index], tag: e.target.value };
              onChange(next);
            }}
            placeholder="Tag"
          />
          <Input
            value={card.title}
            onChange={(e) => {
              const next = [...cards];
              next[index] = { ...next[index], title: e.target.value };
              onChange(next);
            }}
            placeholder="Title"
          />
          <TextArea
            value={card.body}
            onChange={(e) => {
              const next = [...cards];
              next[index] = { ...next[index], body: e.target.value };
              onChange(next);
            }}
            placeholder="Body"
          />
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] admin-muted">Meta</p>
            {(card.meta || []).map((item, metaIndex) => (
              <div key={`${item}-${metaIndex}`} className="flex items-center gap-2">
                <Input
                  value={item}
                  onChange={(e) => {
                    const next = [...cards];
                    const meta = [...(next[index].meta || [])];
                    meta[metaIndex] = e.target.value;
                    next[index] = { ...next[index], meta };
                    onChange(next);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => {
                    const next = [...cards];
                    next[index] = { ...next[index], meta: (next[index].meta || []).filter((_, i) => i !== metaIndex) };
                    onChange(next);
                  }}
                >
                  {labels.remove}
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              className="text-xs"
              onClick={() => {
                const next = [...cards];
                const meta = [...(next[index].meta || []), ""];
                next[index] = { ...next[index], meta };
                onChange(next);
              }}
            >
              Add meta
            </Button>
          </div>
          <Input
            value={card.image || ""}
            onChange={(e) => {
              const next = [...cards];
              next[index] = { ...next[index], image: e.target.value };
              onChange(next);
            }}
            placeholder="Image URL"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0], "heroImage", index, "cards")}
          />
          <Button type="button" variant="ghost" className="text-xs" onClick={() => onChange(cards.filter((_, i) => i !== index))}>
            {labels.remove}
          </Button>
        </div>
      ))}
      <Button type="button" variant="ghost" className="text-xs" onClick={() => onChange([...cards, { title: "", body: "", image: "", tag: "" }])}>
        {labels.add}
      </Button>
    </div>
  );
}
