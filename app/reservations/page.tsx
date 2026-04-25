"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { SiteHeader } from "../components/site-header";
import Link from "next/link";

/* ─────────────────────────────────────────
   TABLE DEFINITIONS
   5-top, two 4-tops, two 2-tops.
   Table 5 (2-top) is walk-in / call only.
───────────────────────────────────────── */
const TABLES = [
  { id: "t1", label: "Table 1", seats: 5, online: true  },
  { id: "t2", label: "Table 2", seats: 4, online: true  },
  { id: "t3", label: "Table 3", seats: 4, online: true  },
  { id: "t4", label: "Table 4", seats: 2, online: true  },
  { id: "t5", label: "Table 5", seats: 2, online: false }, // walk-in / call only
] as const;

const TURNOVER_MIN = 90; // minutes a table stays occupied after a booking

const TIME_SLOTS = [
  "14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30",
  "18:00","18:30","19:00",
];

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h > 12 ? h - 12 : h}:${m.toString().padStart(2, "0")} ${suffix}`;
}

function isClosedDay(dateStr: string) {
  if (!dateStr) return false;
  const day = new Date(dateStr + "T12:00:00").getDay();
  return day === 1 || day === 2; // Mon, Tue
}

function todayString() {
  return new Date().toLocaleDateString("en-CA");
}

type SlotRes = { table_assignment: string | null; time: string };

/* Returns the IDs of tables occupied at a given time slot */
function occupiedAt(slotStr: string, reservations: SlotRes[]): Set<string> {
  const slotMin = toMin(slotStr);
  return new Set(
    reservations
      .filter((r) => Math.abs(toMin(r.time) - slotMin) < TURNOVER_MIN)
      .map((r) => r.table_assignment)
      .filter(Boolean) as string[]
  );
}

type SlotStatus = "available" | "last-resort" | "full";

function getSlotStatus(slot: string, partySize: number, reservations: SlotRes[]): SlotStatus {
  const occ = occupiedAt(slot, reservations);

  // Any online table that fits and is free?
  const onlineFree = TABLES.filter((t) => t.online && t.seats >= partySize && !occ.has(t.id));
  if (onlineFree.length > 0) return "available";

  // Last resort (walk-in table) free and fits?
  const lastResort = TABLES.find((t) => !t.online && t.seats >= partySize && !occ.has(t.id));
  if (lastResort) return "last-resort";

  return "full";
}

/* Picks the smallest online table that fits. Returns null if none. */
function assignTable(slot: string, partySize: number, reservations: SlotRes[]) {
  const occ = occupiedAt(slot, reservations);
  return (
    TABLES.filter((t) => t.online && t.seats >= partySize && !occ.has(t.id))
      .sort((a, b) => a.seats - b.seats)[0] ?? null
  );
}

/* ─────────────────────────────────────────
   COMPONENT
───────────────────────────────────────── */
export default function ReservationsPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    party_size: "2", date: "", time: "", allergies: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Slot availability
  const [dateReservations, setDateReservations] = useState<SlotRes[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotStatus, setSlotStatus] = useState<Record<string, SlotStatus>>({});

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  /* Fetch reservations for selected date */
  useEffect(() => {
    if (!form.date || isClosedDay(form.date)) {
      setDateReservations([]);
      setSlotStatus({});
      return;
    }
    setLoadingSlots(true);
    supabase
      .from("reservations")
      .select("table_assignment, time")
      .eq("date", form.date)
      .neq("status", "cancelled")
      .then(({ data }) => {
        setDateReservations((data as SlotRes[]) ?? []);
        setLoadingSlots(false);
      });
  }, [form.date]);

  /* Recompute slot status whenever reservations or party size changes */
  useEffect(() => {
    if (!form.date) return;
    const size = parseInt(form.party_size);
    const statuses: Record<string, SlotStatus> = {};
    for (const slot of TIME_SLOTS) {
      statuses[slot] = getSlotStatus(slot, size, dateReservations);
    }
    setSlotStatus(statuses);
    // Clear selected time if it just became unavailable
    if (form.time && statuses[form.time] === "full") {
      setForm((f) => ({ ...f, time: "" }));
    }
  }, [dateReservations, form.party_size, form.date, form.time]);

  /* Submit */
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);

    if (isClosedDay(form.date)) {
      setError("We are closed on Mondays and Tuesdays. Please choose another date.");
      return;
    }
    if (!form.time) {
      setError("Please select a time slot.");
      return;
    }

    setLoading(true);

    // Re-fetch to get latest state right before insert
    const { data: fresh } = await supabase
      .from("reservations")
      .select("table_assignment, time")
      .eq("date", form.date)
      .neq("status", "cancelled");

    const latest = (fresh as SlotRes[]) ?? [];
    const partySize = parseInt(form.party_size);
    const table = assignTable(form.time, partySize, latest);

    if (!table) {
      setLoading(false);
      // Check if last resort is available
      const status = getSlotStatus(form.time, partySize, latest);
      if (status === "last-resort") {
        setError(
          `This is our last available table and it's reserved for walk-ins. ` +
          `Please call us at (343) 322-0322 to check if it's free — walk-ins are always welcome!`
        );
      } else {
        setError(
          `Sorry, the ${formatTime(form.time)} slot is now fully booked. ` +
          `Please choose a different time or call us at (343) 322-0322.`
        );
      }
      return;
    }

    const { error: dbErr } = await supabase.from("reservations").insert([{
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      party_size: partySize,
      date: form.date,
      time: form.time + ":00",
      allergies: form.allergies.trim() || null,
      table_assignment: table.id,
    }]);

    setLoading(false);

    if (dbErr) {
      setError("Something went wrong. Please try again or call us at (343) 322-0322.");
    } else {
      setSuccess(true);
    }
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-24">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-serif text-text-dark mb-4">
              Reservation <span className="text-gold-gradient">Confirmed!</span>
            </h1>
            <p className="text-text-body leading-relaxed mb-6">
              Thank you, <strong>{form.name}</strong>! We&apos;ve reserved your table for{" "}
              <strong>{parseInt(form.party_size)} {parseInt(form.party_size) === 1 ? "person" : "people"}</strong> on{" "}
              <strong>{new Date(form.date + "T12:00:00").toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong>{" "}
              at <strong>{formatTime(form.time)}</strong>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => { setSuccess(false); setForm({ name: "", email: "", phone: "", party_size: "2", date: "", time: "", allergies: "" }); }}
                className="px-6 py-3 bg-gold text-white font-semibold rounded-full hover:bg-gold-light transition-all"
              >
                Book Another Table
              </button>
              <Link href="/" className="px-6 py-3 border-2 border-gold/40 text-text-dark font-semibold rounded-full hover:border-gold transition-all">
                Back to Home
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  /* ── Booking form ── */
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-cream pt-24 pb-20">
        <section className="relative py-16 bg-brown-deep overflow-hidden">
          <div className="absolute inset-0 moroccan-pattern opacity-10" />
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-10 h-0.5 bg-gold" />
              <span className="text-gold text-xs font-semibold tracking-[0.25em] uppercase">Reserve Your Table</span>
              <span className="w-10 h-0.5 bg-gold" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif text-white leading-tight mb-3">
              Book a <span className="text-gold-gradient">Table</span>
            </h1>
            <p className="text-white/60 text-lg">Wednesday – Sunday &nbsp;·&nbsp; 2:00 PM – 8:00 PM</p>
          </div>
        </section>

        <section className="max-w-2xl mx-auto px-6 mt-[-2rem] relative z-10">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl shadow-black/5 border border-black/5 p-8 sm:p-10 space-y-6">

            {/* ── Date & Time ── */}
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Date" required>
                <input
                  type="date"
                  required
                  min={todayString()}
                  value={form.date}
                  onChange={set("date")}
                  className={`input-base ${form.date && isClosedDay(form.date) ? "border-red-400 bg-red-50" : ""}`}
                />
                {form.date && isClosedDay(form.date) && (
                  <p className="text-red-500 text-xs mt-1">We are closed on Mondays &amp; Tuesdays.</p>
                )}
              </Field>

              <Field label="Time" required>
                <select
                  required
                  value={form.time}
                  onChange={set("time")}
                  disabled={!form.date || isClosedDay(form.date) || loadingSlots}
                  className="input-base disabled:opacity-50"
                >
                  <option value="">
                    {loadingSlots ? "Checking availability…" : !form.date ? "Select a date first" : "Select a time"}
                  </option>
                  {TIME_SLOTS.map((slot) => {
                    const status = slotStatus[slot];
                    const full = status === "full";
                    return (
                      <option key={slot} value={slot} disabled={full}>
                        {formatTime(slot)}{full ? " — Unavailable" : ""}
                      </option>
                    );
                  })}
                </select>

                {/* Last-resort warning shown inline when that slot is selected */}
                {form.time && slotStatus[form.time] === "last-resort" && (
                  <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
                    Only our walk-in table may be available at this time. You can still try to book — if it&apos;s taken, we&apos;ll let you know.
                  </p>
                )}
              </Field>
            </div>

            {/* ── Party size ── */}
            <Field label="Party Size" required>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, party_size: String(Math.max(1, parseInt(f.party_size) - 1)) }))}
                  className="w-10 h-10 rounded-full border-2 border-gold/30 text-gold font-bold text-xl hover:bg-gold/10 transition-colors flex items-center justify-center"
                >−</button>
                <span className="w-10 text-center text-2xl font-serif text-text-dark font-semibold">{form.party_size}</span>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, party_size: String(Math.min(5, parseInt(f.party_size) + 1)) }))}
                  className="w-10 h-10 rounded-full border-2 border-gold/30 text-gold font-bold text-xl hover:bg-gold/10 transition-colors flex items-center justify-center"
                >+</button>
                <span className="text-text-body text-sm">{parseInt(form.party_size) === 1 ? "guest" : "guests"}</span>
              </div>
              <p className="text-xs text-text-light mt-2 leading-relaxed">
                Due to our intimate setting, we accommodate up to <strong>5 guests</strong> per booking.
              </p>
              {parseInt(form.party_size) === 5 && (
                <div className="mt-3 flex items-start gap-2 p-3 bg-gold/8 border border-gold/25 rounded-xl text-sm text-text-dark">
                  <svg className="w-4 h-4 text-gold shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>A <strong>20% service charge</strong> will be added for parties of 5.</span>
                </div>
              )}
            </Field>

            {/* ── Contact info ── */}
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Full Name" required>
                <input type="text" required placeholder="Jane Smith" value={form.name} onChange={set("name")} className="input-base" />
              </Field>
              <Field label="Phone Number" required>
                <input type="tel" required placeholder="(343) 555-0100" value={form.phone} onChange={set("phone")} className="input-base" />
              </Field>
            </div>
            <Field label="Email Address" required>
              <input type="email" required placeholder="jane@example.com" value={form.email} onChange={set("email")} className="input-base" />
            </Field>

            {/* ── Allergies ── */}
            <Field label="Allergies / Dietary Notes" hint="Optional">
              <textarea
                placeholder="e.g. nut allergy, gluten free, vegetarian…"
                value={form.allergies}
                onChange={set("allergies")}
                rows={3}
                className="input-base resize-none"
              />
            </Field>

            {/* ── Error ── */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={loading || !form.date || !form.time || isClosedDay(form.date)}
              className="w-full py-4 bg-gold text-white font-semibold rounded-full text-lg hover:bg-gold-light transition-all duration-300 hover:scale-[1.01] shadow-lg shadow-gold/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? "Reserving…" : "Confirm Reservation"}
            </button>

            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-text-dark leading-relaxed">
              <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                For groups of <strong>8 or more</strong>, a minimum of <strong>7 days advance notice</strong> is required and a <strong>25% service charge</strong> applies. Please call{" "}
                <a href="tel:3433220322" className="text-gold hover:underline">(343) 322-0322</a>.
              </span>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text-dark mb-1.5">
        {label} {required && <span className="text-gold">*</span>}
      </label>
      {hint && <p className="text-xs text-text-light mb-2">{hint}</p>}
      {children}
    </div>
  );
}
