"use client";

import { Block, Tenant } from "@/shared/types/landing";
import { env } from "@/shared/config/env";
import { LinkButton } from "@/shared/ui/button";
import { Section } from "@/shared/ui/section";
import { Card } from "@/shared/ui/card";
import { ApplyForm } from "@/features/leads/submit-application/apply-form";

const fallbackAnchors: Record<string, string> = {
  hero: "hero",
  "feature-grid": "about",
  paths: "programs",
  logos: "logos",
  gallery: "gallery",
  testimonials: "outcomes",
  faq: "faq",
  "apply-form": "contact",
  footer: "footer",
  custom: "section"
};

export function resolveAnchor(block: Block) {
  const explicit = block.props?.anchor;
  if (explicit) return explicit;
  return fallbackAnchors[block.type] || block.id;
}

function resolveTenantHref(tenant: Tenant | undefined, href?: string) {
  if (!href) return "#";
  if (!tenant || !href.startsWith("/")) return href;
  const isLogin =
    href === "/login" ||
    href === `/${tenant.slug}/login` ||
    href === `/${tenant._id}/login` ||
    href.endsWith("/login");
  if (isLogin) {
    const base = (env.userPageBaseUrl || "").replace(/\/+$/, "");
    return base ? `${base}/login` : "/portal/login";
  }
  if (href.startsWith(`/${tenant.slug}`) || href.startsWith(`/${tenant._id}`)) {
    return href;
  }
  return `/${tenant.slug}${href}`;
}

export function Hero({ block, tenant }: { block: Block; tenant?: Tenant }) {
  const { eyebrow, headline, headlineAccent, subheadline, primaryCta, secondaryCta, image, bullets } = block.props;
  const primaryHref = resolveTenantHref(tenant, primaryCta?.href);
  const secondaryHref = resolveTenantHref(tenant, secondaryCta?.href);
  return (
    <section id={resolveAnchor(block)} className="relative overflow-hidden pb-16 pt-12 lg:pb-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute right-0 top-10 h-[420px] w-[420px] rounded-full bg-secondary/15 blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-[460px] w-[460px] rounded-full bg-emerald-200/25 blur-[160px]" />
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-6 pb-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">{eyebrow}</p>
          ) : null}
          <h1 className="font-display text-5xl leading-[0.95] tracking-tight md:text-7xl">
            {headline}
            <br />
            {headlineAccent ? <span className="text-gradient">{headlineAccent}</span> : null}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-slate-600 md:text-xl">{subheadline}</p>
          <div className="flex flex-wrap gap-4">
            {primaryCta ? (
              <LinkButton
                href={primaryHref}
                className={
                  primaryCta.variant === "outline"
                    ? "rounded-full border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300"
                    : "rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(13,110,106,0.28)] transition hover:-translate-y-0.5"
                }
              >
                {primaryCta.label}
              </LinkButton>
            ) : null}
            {secondaryCta ? (
              <LinkButton
                href={secondaryHref}
                variant="ghost"
                className="rounded-full border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300"
              >
                {secondaryCta.label}
              </LinkButton>
            ) : null}
          </div>
          {bullets?.length ? (
            <div className="grid gap-4 pt-2 text-sm font-medium text-slate-500 sm:grid-cols-2">
              {bullets.map((item: string) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <div className="relative">
          <div className="absolute -inset-10 -z-10 rounded-[40px] bg-white/40 blur-3xl" />
          <div className="overflow-hidden rounded-[28px]">
            <img src={image} alt="Hero" className="h-[420px] w-full object-cover transition duration-700 hover:scale-105" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeatureGrid({ block }: { block: Block }) {
  return (
    <Section id={resolveAnchor(block)}>
      <div className="relative grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-12">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">{block.props.eyebrow}</p>
          <h2 className="font-display text-4xl md:text-5xl">{block.props.title}</h2>
          <p className="text-lg text-slate-600">{block.props.description}</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          {block.props.items?.map((item: any) => (
            <div key={item.title} className="flex gap-4">
              <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-primary">
                <span className="text-lg leading-none">✳</span>
              </div>
              <div>
                <h3 className="font-display text-lg">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function Paths({ block, tenant }: { block: Block; tenant?: Tenant }) {
  const ctaHref = resolveTenantHref(tenant, block.props.cta?.href);
  return (
    <Section id={resolveAnchor(block)}>
      <div className="space-y-8">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">{block.props.eyebrow}</p>
          <h2 className="font-display text-4xl md:text-6xl">{block.props.title}</h2>
          <p className="text-lg text-slate-600">{block.props.description}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {block.props.items?.map((item: any) => {
            const itemHref = resolveTenantHref(tenant, item.href || block.props.cta?.href);
            return (
              <div
                key={item.title}
                className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200/70 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="font-display text-2xl">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.body}</p>
                  <a href={itemHref} className="mt-auto inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    <span>Explore</span>
                    <span>-&gt;</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
        {block.props.cta ? (
          <div className="flex justify-center">
            <a href={ctaHref} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              {block.props.cta.label}
              <span>-&gt;</span>
            </a>
          </div>
        ) : null}
      </div>
    </Section>
  );
}

export function Logos({ block }: { block: Block }) {
  const variant = block.props.variant || "tools";
  if (variant === "brands") {
    return (
      <Section id={resolveAnchor(block)} className="py-2" pad="1.2rem">
        <div className="px-6 py-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{block.props.title}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-lg font-display text-slate-500">
            {block.props.logos?.map((logo: any) => (
              <span key={logo.name}>{logo.name}</span>
            ))}
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section id={resolveAnchor(block)} className="py-4">
      <div className="py-4">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4 lg:max-w-sm">
            <h2 className="font-display text-3xl">{block.props.title}</h2>
            {block.props.badges?.length ? (
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                {block.props.badges.map((badge: string) => (
                  <span key={badge} className="rounded-full bg-slate-100/70 px-4 py-1">
                    {badge}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:w-full lg:max-w-2xl">
            {block.props.logos?.map((logo: any) => (
              <div key={logo.name} className="flex flex-col items-center justify-center rounded-2xl px-4 py-6 text-slate-500">
                <img src={logo.url} alt={logo.name} className="h-10 w-10 object-contain" />
                <span className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{logo.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

export function Gallery({ block }: { block: Block }) {
  return (
    <Section id={resolveAnchor(block)}>
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">{block.props.eyebrow}</p>
            <h2 className="font-display text-4xl md:text-5xl">{block.props.title}</h2>
          </div>
          <p className="max-w-md text-lg text-slate-600">{block.props.description}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {block.props.images?.map((img: any, i: number) => (
            <div key={img.url} className={`group relative overflow-hidden rounded-[24px] ${i === 1 ? "md:-translate-y-6" : ""}`}>
              <img src={img.url} alt={img.caption} className="h-[360px] w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-5">
                <p className="font-display text-base text-white">{img.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function Testimonials({ block }: { block: Block }) {
  return (
    <section id={resolveAnchor(block)} className="relative overflow-hidden bg-background py-16 text-text">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(13,110,106,0.12),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(214,153,67,0.14),_transparent_60%)]" />
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">{block.props.eyebrow}</p>
            <h2 className="font-display text-4xl leading-tight md:text-6xl">{block.props.title}</h2>
            <p className="max-w-2xl text-lg text-slate-600">{block.props.description}</p>
          </div>

          <div className="hide-scrollbar overflow-x-auto pb-6">
            <div className="scroll-marquee flex gap-6">
              {[...(block.props.items || []), ...(block.props.items || [])].map((item: any, index: number) => (
              <div key={`${item.name}-${index}`} className="min-w-[260px] max-w-[300px] snap-start">
                <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                  <div className="relative h-40 bg-slate-100">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/20" />
                    <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow">
                      ▶
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.role}</p>
                  </div>
                  {item.image ? <img src={item.image} alt={item.name} className="h-8 w-8 rounded-full object-cover" /> : null}
                </div>
              </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600">
            <span className="text-slate-400">→</span>
            <span className="font-semibold">Become a student</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Faq({ block }: { block: Block }) {
  if (block.props.variant !== "pricing") return null;
  const icons = [
    (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
        <path d="M12 7.5v9M7.5 12h9" />
      </svg>
    ),
    (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 6l4 2 4-2 4 2 4-2v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6z" />
        <path d="M8 6V4h8v2" />
      </svg>
    ),
    (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3l7 7-7 11-7-11 7-7z" />
      </svg>
    ),
    (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 20h16" />
        <path d="M6 20V8l6-4 6 4v12" />
        <path d="M9 20v-6h6v6" />
      </svg>
    )
  ];
  return (
    <Section id={resolveAnchor(block)}>
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">{block.props.eyebrow}</p>
          <h2 className="font-display text-4xl md:text-5xl">{block.props.title}</h2>
        </div>
        <div className="mx-auto grid max-w-5xl gap-8 text-center sm:grid-cols-2 lg:grid-cols-3">
          {block.props.items?.map((item: any, index: number) => (
            <div key={item.title} className="flex h-full flex-col items-center">
              <div className="text-slate-700">{icons[index % icons.length]}</div>
              <p className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">{item.title}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-3xl text-slate-900">{item.price}</span>
                <span className="text-xs text-slate-500">{item.billing ? `/${item.billing}` : ""}</span>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-slate-600">
                {item.features?.map((feature: string) => (
                  <li key={feature} className="flex items-start gap-3 text-left">
                    <span className="mt-1 text-emerald-500">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-8 w-full max-w-[180px] rounded-[12px] bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-primary/90">
                {item.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function ApplySection({ block, tenant, slug }: { block: Block; tenant?: Tenant; slug: string }) {
  if (!tenant) return null;
  const title = block.props.title || "Not sure where to start?";
  const titleParts = title.split(" ");
  const titleAccent = titleParts.length > 1 ? titleParts.pop() : null;
  const titleBase = titleParts.join(" ");
  return (
    <Section id={resolveAnchor(block)} className="relative">
      <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[10px] border border-slate-200/70 bg-white px-8 py-14 text-slate-900 shadow-[0_22px_50px_rgba(15,23,42,0.08)] md:px-12 lg:px-16">
        <div className="pointer-events-none absolute -inset-1 -z-20 rounded-[12px] bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 blur-[18px]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(13,110,106,0.12),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(214,153,67,0.16),_transparent_60%)]" />
        <div className="grid gap-12 text-center lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:text-left">
          <div className="space-y-5 lg:pr-10">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">{block.props.eyebrow}</p>
            <h2 className="font-display text-4xl leading-[1.05] md:text-5xl">
              {titleBase} {titleAccent ? <span className="text-primary">{titleAccent}</span> : null}
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-slate-600">{block.props.description}</p>
          </div>
          <div className="mx-auto w-full max-w-md self-start text-left lg:max-w-[420px]">
            <ApplyForm
              tenantId={tenant._id}
              slug={slug}
              submitLabel={block.props.submitLabel}
              fields={block.props.fields}
              showMessage
              messageLabel="How can we help you?"
              messagePlaceholder="Briefly tell us what you're looking to learn, your experience level, your goals, etc..."
              emailLabel={block.props.fields?.email || "Email address"}
              showNameFields={false}
              showPhoneField={false}
              formClassName="space-y-6"
              labelClassName="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
              inputClassName="h-11 rounded-[6px] border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
              textAreaClassName="min-h-[150px] rounded-[6px] border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
              submitClassName="w-fit rounded-[6px] bg-primary px-6 py-2.5 text-xs font-semibold text-white hover:bg-primary/90"
            />
          </div>
        </div>
      </div>
    </Section>
  );
}

export function Footer({ block, tenant }: { block: Block; tenant?: Tenant }) {
  function getSocialIcon(name: string) {
    const key = name.toLowerCase();
    if (key.includes("facebook")) {
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M13.5 8.5V7.1c0-.7.2-1.1 1.2-1.1h1.6V3.5h-2.2c-2.4 0-3.3 1.5-3.3 3.5v1.5H9v2.4h1.6V20h2.9v-9.1h2.1l.3-2.4h-2.4z" />
        </svg>
      );
    }
    if (key.includes("twitter") || key === "x") {
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M3 4h3.4l4.7 6.6L17.2 4H21l-7.2 9.6L21 20h-3.4l-5-7.1L6.6 20H3l7.8-9.9L3 4z" />
        </svg>
      );
    }
    if (key.includes("instagram")) {
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7zm5 3.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6zm0 1.8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm5.1-.9a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
        </svg>
      );
    }
    if (key.includes("linkedin")) {
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M4.8 3.5a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2zM3 8.7h3.6V21H3V8.7zm7 0h3.4v1.7h.1c.5-1 1.7-2 3.6-2 3.8 0 4.5 2.5 4.5 5.8V21h-3.6v-5.8c0-1.4 0-3.1-1.9-3.1-1.9 0-2.2 1.5-2.2 3V21H10V8.7z" />
        </svg>
      );
    }
    if (key.includes("youtube")) {
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 2 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.8zM10 15.2V8.8l5.5 3.2-5.5 3.2z" />
        </svg>
      );
    }
    return (
      <span className="text-[10px] font-semibold uppercase text-slate-500">{name.slice(0, 1)}</span>
    );
  }

  return (
    <footer id={resolveAnchor(block)} className="border-t border-slate-200 bg-white py-12 text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr] lg:items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {tenant?.logo?.url ? <img src={tenant.logo.url} alt={tenant.name} className="h-8 w-auto object-contain" /> : null}
              <span className="font-display text-lg">{tenant?.name || "Brooklyn LMS"}</span>
            </div>
            <h3 className="font-display text-3xl">{block.props.newsletterTitle}</h3>
            <p className="max-w-md text-sm text-slate-600">{block.props.newsletterBody}</p>
            <div className="flex w-full max-w-md gap-3">
              <input
                placeholder="Email address"
                className="flex-1 rounded-[10px] border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button className="rounded-[10px] bg-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-primary/90">
                Subscribe
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{block.props.columns?.[0]?.title || "Navigation"}</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {block.props.columns?.[0]?.links?.map((link: string) => (
                <li key={link}>
                  <a href="#" className="hover:text-slate-900">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{block.props.socials?.title || "Socials"}</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {block.props.socials?.links?.map((link: string) => (
                <li key={link} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-500">
                    {getSocialIcon(link)}
                  </span>
                  <span>{link}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500 md:flex-row md:items-center">
          <p>{block.props.note}</p>
          <p>{block.props.legal}</p>
        </div>
      </div>
    </footer>
  );
}

export function CustomSection({ block, tenant }: { block: Block; tenant?: Tenant }) {
  const { eyebrow, title, body, image, ctaLabel, ctaHref, layout } = block.props;
  const isImageLeft = layout === "image-left";
  const isTextOnly = layout === "text-only";
  const resolvedHref = resolveTenantHref(tenant, ctaHref);
  return (
    <Section id={resolveAnchor(block)}>
      <div className={`grid items-center gap-10 ${isTextOnly ? "" : "lg:grid-cols-2"}`}>
        {!isTextOnly ? (
          <div className={`${isImageLeft ? "order-1" : "order-2"} overflow-hidden rounded-[28px] bg-slate-100`}>
            {image ? <img src={image} alt={title || "Section"} className="h-[360px] w-full object-cover" /> : null}
          </div>
        ) : null}
        <div className={`${isTextOnly ? "" : isImageLeft ? "order-2" : "order-1"} space-y-4`}>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">{eyebrow}</p>
          ) : null}
          <h2 className="font-display text-4xl md:text-5xl">{title}</h2>
          <p className="text-lg text-slate-600">{body}</p>
          {ctaLabel && ctaHref ? (
            <a href={resolvedHref} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              {ctaLabel}
              <span>-&gt;</span>
            </a>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
