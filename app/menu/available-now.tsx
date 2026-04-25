"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase, type MenuItem } from "@/lib/supabase";

const CATEGORY_ORDER = [
  "tajine","couscous","bastilla","soups","entrees",
  "msemen","desserts","breakfast","mkila","rfissa","drinks","tea",
];

const CATEGORY_INFO: Record<string, { badge: string; title: string; description: string }> = {
  tajine:    { badge: "Slow Cooked",  title: "Tajine",         description: "Traditional North African dish, slow-cooked in a distinctive earthenware pot." },
  couscous:  { badge: "Classic",      title: "Couscous",       description: "Steamed semolina wheat served with vegetables and your choice of protein." },
  bastilla:  { badge: "Pastry",       title: "Bastilla",       description: "Savory Moroccan pies wrapped in crisp, flaky pastry." },
  soups:     { badge: "Starters",     title: "Soup",           description: "Classic Moroccan comfort bowls." },
  entrees:   { badge: "Starters",     title: "Entrées",        description: "Cooked salads and shareable small plates." },
  msemen:    { badge: "Flatbread",    title: "Msemen",         description: "Moroccan layered flatbread drizzled in your choice of sauce." },
  desserts:  { badge: "Sweets",       title: "Desserts",       description: "Pastries, sweets, and plated Moroccan desserts." },
  breakfast: { badge: "Morning",      title: "Breakfast",      description: "Simple breads, pancakes, and add-ons." },
  mkila:     { badge: "Breakfast",    title: "M'kila Dishes",  description: "Egg-forward skillet-style plates and savory morning classics." },
  rfissa:    { badge: "Signature",    title: "Rfissa",         description: "One of the house signatures." },
  drinks:    { badge: "Drinks",       title: "Drinks",         description: "House drinks, juices, and specialty beverages." },
  tea:       { badge: "Tea Service",  title: "Moroccan Tea",   description: "Traditional tea service priced by pot size." },
};

export function AvailableNow() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("menu_items")
      .select("*")
      .eq("available", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setItems(data as MenuItem[]);
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  // Group by category in defined order
  const grouped = CATEGORY_ORDER.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  if (categories.length === 0) return (
    <div className="text-center text-text-light py-12 text-sm">Check back soon — menu coming shortly.</div>
  );

  return (
    <>
      {/* Return date banner */}
      <div className="mb-10 flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5">
        <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <div>
          <p className="font-semibold text-amber-900">Limited menu — returning Friday, April 1st</p>
          <p className="mt-1 text-sm leading-6 text-amber-800">
            Our soups, entrees, M&apos;kila dishes, Rfissa, Msemen, and breakfast plates will be back on{" "}
            <strong>Friday, April 1st</strong>. Until then, we&apos;re serving the items below.
          </p>
        </div>
      </div>

      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold-dark">Available Now</p>
        <h2 className="mt-3 text-4xl text-text-dark sm:text-5xl">What&apos;s on today.</h2>
      </div>

      {/* Sub-nav */}
      <div className="mb-8 flex flex-wrap gap-3">
        {categories.map((cat) => {
          const info = CATEGORY_INFO[cat];
          return (
            <a key={cat} href={`#${cat}`}
              className="shrink-0 rounded-full border border-gold/25 bg-white px-4 py-2 text-sm font-medium text-text-body transition-colors hover:border-gold/50 hover:text-gold-dark">
              {info?.title ?? cat}
            </a>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {categories.map((cat) => {
          const info = CATEGORY_INFO[cat] ?? { badge: cat, title: cat, description: "" };
          const catItems = grouped[cat];
          return (
            <article id={cat} key={cat}
              className="scroll-mt-36 rounded-[2rem] border border-gold/20 bg-white p-8 shadow-[0_24px_80px_-54px_rgba(45,24,16,0.4)] ring-1 ring-gold/10">
              <div className="flex flex-col gap-4 border-b border-gold/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-dark">{info.badge}</p>
                  <h3 className="mt-2 text-3xl text-text-dark">{info.title}</h3>
                </div>
                <p className="max-w-md text-sm leading-6 text-text-body">{info.description}</p>
              </div>

              <div className="mt-6 space-y-4">
                {catItems.map((item) => (
                  <div key={item.id} className="rounded-[1.5rem] bg-[#fffaf2] overflow-hidden">
                    {item.image_url && (
                      <div className="relative h-40 w-full">
                        <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="(min-width: 1280px) 24rem, 100vw" />
                      </div>
                    )}
                    <div className="px-5 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="max-w-[70%] text-lg font-semibold text-text-dark">{item.name}</h4>
                        <span className="shrink-0 text-lg font-semibold text-gold-dark">{item.price}</span>
                      </div>
                      {item.description && (
                        <p className="mt-2 text-sm leading-6 text-text-body">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
