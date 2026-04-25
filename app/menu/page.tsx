import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteHeader } from "../components/site-header";
import { featuredItems, menuSections, type MenuItem } from "./menu-data";
import { AvailableNow } from "./available-now";

export const metadata: Metadata = {
  title: "Menu | Bab Marrakech",
  description:
    "Browse the Bab Marrakech menu — tajines, couscous, bastilla, breakfast plates, tea, and more.",
};

function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .95.68l1.49 4.49a1 1 0 0 1-.5 1.21l-2.26 1.13a11.04 11.04 0 0 0 5.52 5.52l1.13-2.26a1 1 0 0 1 1.21-.5l4.49 1.49a1 1 0 0 1 .68.95V19a2 2 0 0 1-2 2h-1C9.72 21 3 14.28 3 6V5Z"
      />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.66 16.66 13.41 20.9a2 2 0 0 1-2.82 0l-4.24-4.24a8 8 0 1 1 11.31 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    </svg>
  );
}

function renderItemMeta(item: MenuItem) {
  return (
    <>
      {item.description ? (
        <p className="mt-2 text-sm leading-6 text-text-body">
          {item.description}
        </p>
      ) : null}
      {item.options?.length ? (
        <p className="mt-2 text-sm leading-6 text-text-light">
          {item.options.join(" | ")}
        </p>
      ) : null}
      {item.note ? (
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-gold-dark">
          {item.note}
        </p>
      ) : null}
    </>
  );
}

export default function MenuPage() {
  return (
    <main className="min-h-screen bg-cream pt-20 text-text-dark">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-brown-deep">
        <div className="absolute inset-0 moroccan-pattern opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,146,11,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-gold/30 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-gold">
              House Menu
            </div>
            <h1 className="max-w-xl text-5xl leading-tight text-white sm:text-6xl lg:text-7xl">
              Bab Marrakech — the full menu.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
              Tajines, couscous, bastilla, breakfast plates, tea service, and
              drinks. Limited selection available now — full menu returns
              Friday, April 1st.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#available-now"
                className="inline-flex items-center justify-center rounded-full bg-gold px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:bg-gold-light"
              >
                Available Now
              </a>
              <a
                href="#menu-sections"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:border-gold hover:text-gold"
              >
                Full Menu
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-5 text-sm text-white/60">
              <span className="inline-flex items-center gap-2">
                <ClockIcon />
                Wed–Sun: 2:00 PM – 8:00 PM
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPinIcon />
                2182 Lamira St, Ottawa
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative min-h-[260px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 sm:col-span-2">
              <Image
                src="/food1.png"
                alt="Moroccan dish from Bab Marrakech"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 36rem, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            <div className="relative min-h-[220px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
              <Image
                src="/food2.png"
                alt="Signature plate from Bab Marrakech"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 18rem, 50vw"
              />
            </div>
            <div className="relative min-h-[220px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
              <Image
                src="/chefhasna.png"
                alt="Chef portrait for Bab Marrakech"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 18rem, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-y border-gold/10 bg-[#fffaf2] py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark">
                Highlights
              </p>
              <h2 className="mt-3 text-4xl text-text-dark">
                Start with the signatures.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-text-body">
              Three dishes that define what we do — crispy bastilla, slow-cooked
              tajine, and our beloved khlea skillet.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featuredItems.map((item) => (
              <article
                key={item.name}
                className="group overflow-hidden rounded-[2rem] border border-gold/10 bg-white shadow-[0_24px_80px_-48px_rgba(45,24,16,0.45)]"
              >
                <div className="relative h-64">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(min-width: 1024px) 24rem, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brown-deep/85 via-brown-deep/20 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-gold">
                        House Pick
                      </p>
                      <h3 className="mt-2 text-3xl text-white">{item.name}</h3>
                    </div>
                    <span className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-white">
                      {item.price}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-sm leading-7 text-text-body">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Available Now (dynamic) ── */}
      <section id="available-now" className="py-16 lg:py-20 bg-cream">
        <div className="mx-auto max-w-7xl px-6">
          <AvailableNow />
        </div>
      </section>

      {/* ── Full Menu (returning April 1st) ── */}
      <div className="sticky top-[73px] z-40 border-b border-gold/10 bg-cream/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-6 py-4">
          {menuSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="shrink-0 rounded-full border border-gold/15 bg-white px-4 py-2 text-sm font-medium text-text-body transition-colors hover:border-gold/40 hover:text-gold-dark"
            >
              {section.title}
            </a>
          ))}
        </div>
      </div>

      <section id="menu-sections" className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark">
                Full Menu
              </p>
              <h2 className="mt-3 text-4xl text-text-dark sm:text-5xl">
                Returning Friday, April 1st.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-text-body">
              Our complete menu — soups, entrees, M&apos;kila dishes, Rfissa, Msemen,
              breakfast, and more — will be available again from April 1st.
            </p>
          </div>

          {/* Returning soon notice */}
          <div className="mb-10 flex items-center gap-3 rounded-2xl border border-gold/20 bg-gold/5 px-6 py-4">
            <svg className="h-5 w-5 shrink-0 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-text-dark">
              These items are <strong>not currently available</strong>. They return{" "}
              <strong>Friday, April 1st</strong>.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {menuSections.map((section) => (
              <article
                id={section.id}
                key={section.id}
                className="scroll-mt-36 rounded-[2rem] border border-gold/10 bg-white/60 p-8 opacity-70 shadow-[0_24px_80px_-54px_rgba(45,24,16,0.4)]"
              >
                <div className="flex flex-col gap-4 border-b border-gold/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-dark">
                      {section.label}
                    </p>
                    <h3 className="mt-2 text-3xl text-text-dark">
                      {section.title}
                    </h3>
                  </div>
                  <p className="max-w-md text-sm leading-6 text-text-body">
                    {section.description}
                  </p>
                </div>

                <div className="mt-6 space-y-5">
                  {section.items.map((item) => (
                    <div
                      key={`${section.id}-${item.name}`}
                      className="rounded-[1.5rem] bg-[#fffaf2] px-5 py-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="max-w-[70%] text-lg font-semibold text-text-dark">
                          {item.name}
                        </h4>
                        <span className="shrink-0 text-lg font-semibold text-gold-dark">
                          {item.price}
                        </span>
                      </div>
                      {renderItemMeta(item)}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative overflow-hidden bg-brown-deep py-20 text-white">
        <div className="absolute inset-0 moroccan-pattern opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,146,11,0.14),transparent_40%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Reserve a Table
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl leading-tight sm:text-5xl">
              Ready to dine? Book your table online.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/65">
              We&apos;re open Wednesday through Sunday, 2:00 PM to 8:00 PM. Reservations
              are recommended — book your spot in seconds.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <div className="space-y-4 text-sm text-white/70">
              <p className="flex items-center gap-3">
                <PhoneIcon />
                (343) 322-0322
              </p>
              <p className="flex items-center gap-3">
                <MapPinIcon />
                2182 Lamira St, Ottawa, ON K1H 8L4
              </p>
              <p className="flex items-center gap-3">
                <ClockIcon />
                Wednesday to Sunday, 2:00 PM to 8:00 PM
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <Link
                href="/reservations"
                className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold-light"
              >
                Book a Table
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition-colors hover:border-gold hover:text-gold"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
