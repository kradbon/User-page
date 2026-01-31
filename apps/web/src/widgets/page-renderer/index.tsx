"use client";

import clsx from "clsx";
import { PageContent, Tenant } from "@/shared/types/landing";
import { env } from "@/shared/config/env";
import { PublicNav } from "@/shared/ui/public-nav";
import { Section } from "@/shared/ui/section";

type NavProps = {
  brand?: string;
  links?: { label: string; href: string }[];
  cta?: { label: string; href: string; variant?: "solid" | "outline" };
  secondaryCta?: { label: string; href: string };
  announcement?: { text: string; cta: string; href: string };
};

export function PageRenderer({
  tenant,
  nav,
  page
}: {
  tenant: Tenant;
  nav?: NavProps;
  page: PageContent;
}) {
  const resolveHref = (href?: string) => {
    if (!href) return "#";
    if (!href.startsWith("/")) return href;
    if (href.startsWith("/#")) {
      return `/${tenant.slug}/home${href}`;
    }
    if (href === "/login" || href.endsWith("/login")) {
      const base = (env.userPageBaseUrl || "").replace(/\/+$/, "");
      return base ? `${base}/login` : "/portal/login";
    }
    if (href === "/") return `/${tenant.slug}`;
    if (href.startsWith(`/${tenant.slug}`) || href.startsWith(`/${tenant._id}`)) {
      return href;
    }
    return `/${tenant.slug}${href}`;
  };
  const navVariant = "light";

  return (
    <div className={clsx("min-h-screen bg-background text-text")}>
      {nav ? (
        <PublicNav
          tenant={tenant}
          brand={nav.brand}
          links={nav.links}
          cta={nav.cta}
          secondaryCta={nav.secondaryCta}
          announcement={nav.announcement}
          variant={navVariant}
        />
      ) : null}
      {page.layout === "blog" ? <BlogLayout page={page} resolveHref={resolveHref} /> : null}
      {page.layout === "team" ? <TeamLayout page={page} resolveHref={resolveHref} /> : null}
      {page.layout === "standard" ? <StandardLayout page={page} resolveHref={resolveHref} /> : null}
      {page.layout === "courses" ? <CoursesLayout page={page} resolveHref={resolveHref} /> : null}
      <PageFooter tenant={tenant} nav={nav} resolveHref={resolveHref} />
    </div>
  );
}

function Hero({ page, resolveHref }: { page: PageContent; resolveHref: (href?: string) => string }) {
  return (
    <section className="relative overflow-hidden pb-12 pt-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-10 top-0 h-[360px] w-[360px] rounded-full bg-primary/12 blur-[140px]" />
        <div className="absolute right-0 top-10 h-[300px] w-[300px] rounded-full bg-secondary/20 blur-[140px]" />
        <div className="absolute bottom-0 left-1/2 h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-primary/10 blur-[160px]" />
      </div>
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          {page.eyebrow ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-secondary">
              {page.eyebrow}
            </div>
          ) : null}
          <h1 className="font-display text-4xl leading-tight md:text-6xl">{page.title}</h1>
          {page.subtitle ? <p className="text-lg text-slate-600">{page.subtitle}</p> : null}
          {page.description ? <p className="text-base text-slate-600">{page.description}</p> : null}
          {page.cta ? (
            <a
              href={resolveHref(page.cta.href)}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5"
            >
              {page.cta.label}
              <span>→</span>
            </a>
          ) : null}
        </div>
        <div className="relative">
          <div className="absolute -inset-6 -z-10 rounded-[36px] bg-white/60 blur-2xl" />
          <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
            {page.heroImage ? (
              <img src={page.heroImage} alt={page.title} className="h-[360px] w-full object-cover" />
            ) : (
              <div className="flex h-[360px] items-center justify-center rounded-[22px] border border-dashed border-slate-200 text-sm text-slate-400">
                Upload a hero image
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StandardLayout({ page, resolveHref }: { page: PageContent; resolveHref: (href?: string) => string }) {
  return (
    <>
      <Hero page={page} resolveHref={resolveHref} />
      {page.sections?.length ? (
        <div className="space-y-0">
          <Section className="bg-[#f7f4ee] border-t border-slate-200/70" pad="2.6rem">
            <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Inside the program</p>
                <h2 className="font-display text-3xl md:text-4xl">How it’s structured</h2>
                <p className="text-sm text-slate-600">
                  Each module builds toward a portfolio‑grade output. You get live critiques, structured practice, and a clear finish line.
                </p>
              </div>
              <div className="grid gap-3">
                {page.sections.slice(0, 3).map((section, index) => (
                  <div key={section.heading} className="flex items-start gap-4 border-l border-slate-200 pl-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{section.heading}</p>
                      <p className="text-xs text-slate-500">{section.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
          {page.sections.map((section, index) => {
            const isReversed = index % 2 === 1;
            return (
              <Section
                key={section.heading}
                className={clsx("border-t border-slate-200/70", isReversed ? "bg-white" : "bg-[#fbfaf7]")}
                pad="2.8rem"
              >
                <div className={`grid items-center gap-12 md:grid-cols-[1.05fr_0.95fr] ${isReversed ? "md:[&>*:first-child]:order-2" : ""}`}>
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <span className="h-px w-10 bg-slate-300" />
                      <span>Focus</span>
                    </div>
                    <h2 className="font-display text-3xl md:text-4xl">{section.heading}</h2>
                    <p className="text-sm text-slate-600">{section.body}</p>
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                      <span>Portfolio output</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-6 -top-6 h-full w-full rounded-[24px] border border-slate-200/60 bg-white/70" />
                    {section.image ? (
                      <div className="relative overflow-hidden rounded-[22px] bg-slate-100">
                        <img src={section.image} alt={section.heading} className="h-80 w-full object-cover" />
                      </div>
                    ) : (
                      <div className="relative h-80 rounded-[22px] bg-slate-100" />
                    )}
                  </div>
                </div>
              </Section>
            );
          })}
        </div>
      ) : null}
    </>
  );
}

function TeamLayout({ page, resolveHref }: { page: PageContent; resolveHref: (href?: string) => string }) {
  const team = page.cards || [];
  return (
    <>
      <section className="relative overflow-hidden bg-[#f7f4ee] py-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-0 top-0 h-[320px] w-[320px] rounded-full bg-primary/10 blur-[140px]" />
          <div className="absolute right-10 top-10 h-[240px] w-[240px] rounded-full bg-secondary/20 blur-[120px]" />
        </div>
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            {page.eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">{page.eyebrow}</p>
            ) : null}
            <h1 className="font-display text-4xl md:text-5xl">{page.title}</h1>
            {page.subtitle ? <p className="text-lg text-slate-600">{page.subtitle}</p> : null}
            {page.description ? <p className="text-sm text-slate-600">{page.description}</p> : null}
            <div className="flex items-center gap-4">
              {page.cta ? (
                <a
                  href={resolveHref(page.cta.href)}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:-translate-y-0.5"
                >
                  {page.cta.label}
                  <span>→</span>
                </a>
              ) : null}
              <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Enterprise ready</span>
            </div>
          </div>
          <div className="rounded-[20px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold">What teams get</p>
            <ul className="mt-4 space-y-4 text-sm text-slate-600">
              {(page.bullets || []).map((item, index) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      {team.length ? (
        <section className="relative overflow-hidden bg-slate-950 py-16 text-white">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(13,110,106,0.28),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(214,153,67,0.22),_transparent_60%)]" />
          <div className="mx-auto w-full max-w-6xl px-6">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Our team</p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl">Meet the Brooklyn LMS team</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">
                A mix of educators, mentors, and working designers who build and show the work every day.
              </p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {team.map((member, index) => (
                <div key={`${member.title}-${index}`} className="group flex flex-col items-center gap-3 text-center">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-white/10 blur-xl opacity-0 transition duration-300 group-hover:opacity-100" />
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.title}
                        className="team-float h-20 w-20 rounded-full object-cover ring-2 ring-white/10 transition duration-300 group-hover:scale-105"
                        style={{
                          animationDelay: `${(index % 8) * 0.15}s`,
                          animationDuration: `${5 + (index % 4)}s`
                        }}
                      />
                    ) : (
                      <div className="team-float flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-xs text-white/60">
                        Team
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{member.title}</p>
                    {member.body ? <p className="text-[11px] text-white/60">{member.body}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : page.heroImage ? (
        <Section>
          <img src={page.heroImage} alt={page.title} className="h-[420px] w-full rounded-[28px] object-cover" />
        </Section>
      ) : null}
    </>
  );
}

function BlogLayout({ page, resolveHref }: { page: PageContent; resolveHref: (href?: string) => string }) {
  return (
    <>
      <section className="bg-[#f7f4ee] py-16 text-text">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
            {page.heroImage ? (
              <img src={page.heroImage} alt={page.title} className="h-64 w-full object-cover" />
            ) : (
              <div className="flex h-64 items-center justify-center rounded-[20px] border border-slate-200 text-sm text-slate-400">
                Add a featured image
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-4">
            {page.eyebrow ? (
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-secondary">{page.eyebrow}</span>
            ) : null}
            <h1 className="font-display text-4xl md:text-5xl text-slate-900">{page.title}</h1>
            {page.subtitle ? <p className="text-sm text-slate-600">{page.subtitle}</p> : null}
            {page.cta ? (
              <a href={resolveHref(page.cta.href)} className="text-sm font-semibold text-primary">
                {page.cta.label}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <Section>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Latest stories</p>
            <span className="text-xs text-slate-400">{page.cards?.length || 0} posts</span>
          </div>
          <div className="divide-y divide-slate-200/70">
            {(page.cards || []).map((card, index) => (
              <article key={card.title} className="grid gap-6 py-8 md:grid-cols-[60px_1fr]">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="grid gap-6 md:grid-cols-[240px_1fr]">
                  {card.image ? (
                    <div className="overflow-hidden rounded-[16px] border border-slate-200/70 bg-white">
                      <img src={card.image} alt={card.title} className="h-36 w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-36 items-center justify-center rounded-[16px] border border-slate-200 bg-white text-xs text-slate-400">
                      Thumbnail
                    </div>
                  )}
                  <div className="space-y-3">
                    {card.tag ? (
                      <span className="inline-flex w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-slate-500">
                        {card.tag}
                      </span>
                    ) : null}
                    <h3 className="text-xl font-semibold text-slate-900">{card.title}</h3>
                    <p className="text-sm text-slate-600">{card.body}</p>
                    <button className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Read more</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}

function CoursesLayout({ page, resolveHref }: { page: PageContent; resolveHref: (href?: string) => string }) {
  const filters = page.bullets?.length ? page.bullets : ["Format", "Tools"];
  return (
    <div className="pb-16">
      <section className="relative overflow-hidden bg-[#f7f4ee] px-6 pb-10 pt-14">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-20 top-10 h-[360px] w-[360px] rounded-full bg-primary/15 blur-[140px]" />
          <div className="absolute right-10 top-0 h-[320px] w-[320px] rounded-full bg-secondary/15 blur-[140px]" />
          <div className="absolute bottom-0 left-1/3 h-[360px] w-[360px] rounded-full bg-primary/10 blur-[160px]" />
        </div>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          {page.eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-secondary">{page.eyebrow}</p>
          ) : null}
          <h1 className="font-display text-4xl leading-tight md:text-6xl">{page.title}</h1>
          {page.subtitle ? <p className="max-w-2xl text-lg text-slate-600">{page.subtitle}</p> : null}
          {page.description ? <p className="max-w-2xl text-sm text-slate-600">{page.description}</p> : null}
        </div>
      </section>

      {page.sections?.length ? (
        <section className="mx-auto w-full max-w-6xl px-6 pb-10">
          <div className="space-y-6">
            {page.sections.map((section, index) => (
              <div
                key={section.heading}
                className="grid gap-6 rounded-[24px] border border-slate-200/70 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] md:grid-cols-[220px_1fr]"
              >
                <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-slate-100">
                  {section.image ? (
                    <img src={section.image} alt={section.heading} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="h-40 w-full" />
                  )}
                </div>
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Featured {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 className="font-display text-2xl">{section.heading}</h3>
                  <p className="text-sm text-slate-600">{section.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-6xl px-6 pb-10">
        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white px-6 py-10 md:px-10">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(13,110,106,0.12),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(214,153,67,0.18),_transparent_60%)]" />
          <div className="grid gap-8 md:grid-cols-[1.15fr_0.85fr] md:items-center">
            <div className="space-y-4">
              <h2 className="font-display text-3xl md:text-4xl">Learn UX Animation</h2>
              <p className="text-sm text-slate-600">
                In UX Animation Essentials, learn to transform static interfaces into engaging experiences using industry-standard motion tools.
              </p>
              {page.cta ? (
                <a
                  href={resolveHref(page.cta.href)}
                  className="inline-flex rounded-full bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-primary/90"
                >
                  {page.cta.label}
                </a>
              ) : null}
            </div>
            <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-slate-100">
              {page.heroImage ? (
                <img src={page.heroImage} alt={page.title} className="h-56 w-full object-cover" />
              ) : (
                <div className="flex h-56 items-center justify-center text-xs text-slate-400">Add a featured image</div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
          {Array.from({ length: 7 }).map((_, index) => (
            <span
              key={`dot-${index}`}
              className={clsx("h-0.5 w-6 rounded-full bg-slate-200", index === 2 && "bg-slate-400")}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Filter by</span>
            {filters.map((filter) => (
              <button
                type="button"
                key={filter}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300"
              >
                {filter}
              </button>
            ))}
            <span className="text-xs text-slate-500">{page.cards?.length || 0} Results</span>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300"
          >
            Sort by
          </button>
        </div>
      </section>

      {page.cards?.length ? (
        <section className="mx-auto w-full max-w-6xl px-6">
          <div className="space-y-8">
            {page.cards.map((card, index) => (
              <div
                key={card.title}
                className="grid gap-6 border-b border-slate-200/70 pb-8 md:grid-cols-[220px_1fr]"
              >
                <div className="space-y-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Course {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="overflow-hidden rounded-[16px] border border-slate-200 bg-slate-100">
                    {card.image ? (
                      <img src={card.image} alt={card.title} className="h-32 w-full object-cover" />
                    ) : (
                      <div className="flex h-32 items-center justify-center text-xs text-slate-400">Thumbnail</div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  {card.tag ? (
                    <span className="inline-flex w-fit rounded-full border border-slate-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {card.tag}
                    </span>
                  ) : null}
                  <h3 className="text-2xl font-semibold text-slate-900">{card.title}</h3>
                  <p className="text-sm text-slate-600">{card.body}</p>
                  {card.meta?.length ? (
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      {card.meta.map((item) => (
                        <span key={item} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function PageFooter({
  tenant,
  nav,
  resolveHref
}: {
  tenant: Tenant;
  nav?: NavProps;
  resolveHref: (href?: string) => string;
}) {
  const navLinks = nav?.links?.length
    ? nav.links
    : [
        { label: "Home", href: "/" },
        { label: "All Access", href: "/all-access" },
        { label: "Community", href: "/community" },
        { label: "About", href: "/about-us" },
        { label: "Blog", href: "/blog" },
        { label: "Contact Us", href: "/#contact" }
      ];
  const socials = ["Facebook", "Twitter", "Instagram", "LinkedIn", "YouTube"];

  return (
    <footer className="border-t border-slate-200 bg-white py-10 text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-6 text-center">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr] lg:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 lg:justify-start">
              {tenant.logo?.url ? <img src={tenant.logo.url} alt={tenant.name} className="h-8 w-auto object-contain" /> : null}
              <span className="font-display text-lg">{tenant.name}</span>
            </div>
            <h3 className="font-display text-2xl">Stay close to the Brooklyn LMS</h3>
            <p className="text-sm text-slate-600">
              Subscribe to our weekly newsletter and start your week with the latest industry news and inspiration.
            </p>
            <div className="mx-auto flex max-w-md gap-3 lg:mx-0">
              <input
                placeholder="Email address"
                className="flex-1 rounded-[12px] border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button className="rounded-[12px] bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-primary/90">
                Subscribe
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Navigation</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={resolveHref(link.href)} className="hover:text-slate-900">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Socials</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {socials.map((link) => (
                <li key={link} className="flex items-center justify-center gap-3 lg:justify-start">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{link.slice(0, 1)}</span>
                  <span>{link}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-4 text-xs text-slate-500 md:flex-row">
          <p>Brooklyn LMS © 2026. All rights reserved.</p>
          <p>Cookie settings · Terms of use · Privacy policy</p>
        </div>
      </div>
    </footer>
  );
}
