import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteHeader } from "../components/site-header";
import { featuredItems, menuSections, type MenuItem } from "./menu-data";

export const metadata: Metadata = {
  title: "Menu | Bab Marrakech",
  description:
    "Browse the Bab Marrakech menu with specials, bastilla, tagines, couscous, breakfast plates, tea, and more.",
};

function ArrowUpRightIcon() {
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
        d="M7 17 17 7M8 7h9v9"
      />
    </svg>
  );
}

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

      <section className="relative overflow-hidden bg-brown-deep">
        <div className="absolute inset-0 moroccan-pattern opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,146,11,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-gold/30 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-gold">
              House Menu
            </div>
            <h1 className="max-w-xl text-5xl leading-tight text-white sm:text-6xl lg:text-7xl">
              The full Bab Marrakech menu, rebuilt for the site.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
              Specials, breakfast plates, bastilla, tagines, couscous, tea
              service, and drinks structured directly from the menu PDF in your
              public folder.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#menu-sections"
                className="inline-flex items-center justify-center rounded-full bg-gold px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:bg-gold-light"
              >
                Browse Sections
              </a>
              <a
                href="/Menu%20(1).pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:border-gold hover:text-gold"
              >
                View Original PDF
                <ArrowUpRightIcon />
              </a>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <p className="text-3xl font-semibold text-white">
                  {menuSections.length}
                </p>
                <p className="mt-1 text-sm uppercase tracking-[0.18em] text-white/50">
                  Sections
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <p className="text-3xl font-semibold text-white">
                  {featuredItems.length}
                </p>
                <p className="mt-1 text-sm uppercase tracking-[0.18em] text-white/50">
                  Highlights
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <p className="text-3xl font-semibold text-white">7</p>
                <p className="mt-1 text-sm uppercase tracking-[0.18em] text-white/50">
                  PDF Pages
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-5 text-sm text-white/60">
              <span className="inline-flex items-center gap-2">
                <ClockIcon />
                Tue-Sun: 10:00 AM - 9:00 PM
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
              The last page of the PDF calls out three dishes. They now anchor
              this page and set the tone before the full section-by-section
              breakdown below.
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
                Every section from the PDF, organized for the web.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-text-body">
              Prices and descriptions are transcribed from the current menu PDF.
              The page is intentionally straightforward so guests can scan it
              quickly on desktop or mobile.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {menuSections.map((section) => (
              <article
                id={section.id}
                key={section.id}
                className="scroll-mt-36 rounded-[2rem] border border-gold/10 bg-white p-8 shadow-[0_24px_80px_-54px_rgba(45,24,16,0.4)]"
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

      <section className="relative overflow-hidden bg-brown-deep py-20 text-white">
        <div className="absolute inset-0 moroccan-pattern opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,146,11,0.14),transparent_40%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">
              Visit or Order
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl leading-tight sm:text-5xl">
              Use the web menu for browsing and keep the PDF as the house source.
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/65">
              This route gives you a clean menu page for the site while keeping
              the original PDF available for download. It is set up to be easy
              to maintain when menu pricing or sections change.
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
                Tuesday to Sunday, 10:00 AM to 9:00 PM
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <a
                href="tel:3433220322"
                className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold-light"
              >
                Call the Restaurant
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition-colors hover:border-gold hover:text-gold"
              >
                Back to Homepage
              </Link>
              <a
                href="/Menu%20(1).pdf"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition-colors hover:border-gold hover:text-gold"
              >
                Download the PDF
                <ArrowUpRightIcon />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
