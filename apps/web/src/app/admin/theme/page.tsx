"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { LandingRenderer } from "@/widgets/landing-renderer";
import { fontPresets } from "@/shared/constants/fonts";
import { fileToBase64 } from "@/shared/lib/file";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { getDraftLanding, getTenant, saveLandingDraft, updateTenant } from "@/shared/api/landing-repo";
import { LandingData, ThemeTokens, Tenant } from "@/shared/types/landing";
import { useLandingEditorStore } from "@/features/landing-editor/model/editor-store";

const slug = "home";

const copy = {
  en: {
    label: "Theme & Branding",
    title: "Visual system",
    subtitle: "Update colors, type, and brand assets with instant preview.",
    brand: "Brand assets",
    uploadLogo: "Upload logo",
    uploadFavicon: "Upload favicon",
    colors: "Colors",
    typography: "Typography",
    radius: "Radius",
    spacing: "Spacing density",
    compact: "Compact",
    cozy: "Cozy",
    save: "Save theme",
    updated: "Theme updated",
    failed: "Theme update failed",
    brandUpdated: "Branding updated",
    brandFailed: "Branding update failed",
    loading: "Loading theme..."
  },
  ru: {
    label: "Тема и бренд",
    title: "Визуальная система",
    subtitle: "Обновляйте цвета, шрифты и бренд.",
    brand: "Бренд",
    uploadLogo: "Загрузить логотип",
    uploadFavicon: "Загрузить иконку",
    colors: "Цвета",
    typography: "Шрифты",
    radius: "Скругление",
    spacing: "Плотность",
    compact: "Компактно",
    cozy: "Свободно",
    save: "Сохранить",
    updated: "Тема обновлена",
    failed: "Не удалось обновить тему",
    brandUpdated: "Бренд обновлен",
    brandFailed: "Не удалось обновить бренд",
    loading: "Загрузка..."
  },
  tj: {
    label: "Мавзуъ ва бренд",
    title: "Системаи визуалӣ",
    subtitle: "Рангҳо, шрифтҳо ва брендро нав кунед.",
    brand: "Бренд",
    uploadLogo: "Логотипро бор кунед",
    uploadFavicon: "Иконкаро бор кунед",
    colors: "Рангҳо",
    typography: "Шрифтҳо",
    radius: "Даврашаклӣ",
    spacing: "Зичӣ",
    compact: "Фишурда",
    cozy: "Форам",
    save: "Сабт",
    updated: "Мавзуъ нав шуд",
    failed: "Навсозии мавзуъ ноком шуд",
    brandUpdated: "Бренд нав шуд",
    brandFailed: "Навсозии бренд ноком шуд",
    loading: "Боршавӣ..."
  }
};

export default function AdminThemePage() {
  const queryClient = useQueryClient();
  const { language } = useLandingEditorStore();
  const t = copy[language] || copy.en;
  const { data: tenant } = useQuery({ queryKey: ["tenant"], queryFn: getTenant });
  const { data: draft } = useQuery({ queryKey: ["landing", "draft", slug, language], queryFn: () => getDraftLanding(slug, language) });

  const [landing, setLanding] = useState<LandingData | null>(null);
  const [brandTenant, setBrandTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    if (draft) setLanding(draft);
  }, [draft]);

  useEffect(() => {
    if (tenant) setBrandTenant(tenant);
  }, [tenant]);

  const saveMutation = useMutation({
    mutationFn: async (data: LandingData) => saveLandingDraft(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing", "draft", slug, language] });
      toast.success(t.updated);
    },
    onError: () => toast.error(t.failed)
  });

  const tenantMutation = useMutation({
    mutationFn: async (data: Tenant) => updateTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant"] });
      toast.success(t.brandUpdated);
    },
    onError: () => toast.error(t.brandFailed)
  });

  const theme = landing?.theme;

  const previewData = useMemo(() => {
    if (!landing) return null;
    return { ...landing, theme: theme || landing.theme };
  }, [landing, theme]);

  if (!landing || !brandTenant || !previewData) {
    return <div className="rounded-[16px] border admin-surface p-6">{t.loading}</div>;
  }

  function updateTheme(next: Partial<ThemeTokens>) {
    setLanding((current) => (current ? { ...current, theme: { ...current.theme, ...next } } : current));
  }

  async function handleLogoUpload(file: File, field: "logo" | "favicon") {
    const url = await fileToBase64(file);
    setBrandTenant((current) => {
      if (!current) return current;
      const next = { ...current, [field]: { url } };
      tenantMutation.mutate(next);
      return next;
    });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <aside className="space-y-5 rounded-[16px] border admin-surface p-5 admin-shadow">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] admin-muted">{t.label}</p>
          <h1 className="font-display text-2xl">{t.title}</h1>
          <p className="mt-2 text-sm admin-muted">{t.subtitle}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] admin-muted">{t.brand}</h2>
          <div className="flex items-center gap-4">
            {brandTenant.logo?.url ? (
              <img src={brandTenant.logo.url} alt="Logo" className="h-12 w-auto object-contain" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed admin-border text-xs admin-muted">
                Logo
              </div>
            )}
            <label className="text-xs font-semibold admin-muted">
              {t.uploadLogo}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], "logo")} />
            </label>
          </div>
          <div className="flex items-center gap-4">
            {brandTenant.favicon?.url ? (
              <img src={brandTenant.favicon.url} alt="Favicon" className="h-10 w-10 rounded border admin-border object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded border border-dashed admin-border text-[10px] admin-muted">
                Icon
              </div>
            )}
            <label className="text-xs font-semibold admin-muted">
              {t.uploadFavicon}
              <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], "favicon")} />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] admin-muted">{t.colors}</h2>
          <div className="grid gap-3">
            {[
              { label: "Primary", key: "primary" },
              { label: "Secondary", key: "secondary" },
              { label: "Background", key: "background" },
              { label: "Text", key: "text" }
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between gap-2 text-xs font-semibold admin-muted">
                <span>{item.label}</span>
                <Input
                  value={(theme as Record<string, string>)[item.key]}
                  onChange={(e) => updateTheme({ [item.key]: e.target.value } as Partial<ThemeTokens>)}
                  className="w-32 text-xs"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] admin-muted">{t.typography}</h2>
          <select
            className="admin-control w-full rounded-theme border px-3 py-2 text-sm"
            value={theme?.fontDisplay}
            onChange={(e) => {
              const preset = fontPresets.find((preset) => preset.display === e.target.value);
              if (preset) updateTheme({ fontDisplay: preset.display, fontBody: preset.body });
            }}
          >
            {fontPresets.map((preset) => (
              <option key={preset.display} value={preset.display}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] admin-muted">{t.radius}</h2>
          <Input
            value={theme?.radius}
            onChange={(e) => updateTheme({ radius: e.target.value })}
            className="text-xs"
            placeholder="20px"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] admin-muted">{t.spacing}</h2>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              className={`text-xs ${theme?.spacing === "compact" ? "bg-[rgb(var(--admin-card))]" : ""}`}
              onClick={() => updateTheme({ spacing: "compact" })}
            >
              {t.compact}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className={`text-xs ${theme?.spacing === "cozy" ? "bg-[rgb(var(--admin-card))]" : ""}`}
              onClick={() => updateTheme({ spacing: "cozy" })}
            >
              {t.cozy}
            </Button>
          </div>
        </div>

        <Button type="button" className="w-full text-xs" onClick={() => landing && saveMutation.mutate(landing)}>
          {t.save}
        </Button>
      </aside>

      <div className="rounded-[16px] border admin-surface p-4 admin-shadow">
        <div className="rounded-[12px] border admin-card">
          <ThemeProvider theme={previewData.theme}>
            <LandingRenderer data={previewData} tenant={brandTenant} slug={slug} />
          </ThemeProvider>
        </div>
      </div>
    </div>
  );
}
