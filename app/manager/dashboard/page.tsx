"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Reservation } from "@/lib/supabase";

/* ── Time slots (same as guest page) ── */
const TIME_SLOTS = [
  "14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30",
  "18:00","18:30","19:00",
];
function formatTime(t: string) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h > 12 ? h - 12 : h}:${m.toString().padStart(2, "0")} ${suffix}`;
}
function formatDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-CA", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

const EMPTY_FORM = { name: "", email: "", phone: "", party_size: "2", date: "", time: "", allergies: "", notes: "" };

export default function ManagerDashboard() {
  const router = useRouter();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  /* ── Auth guard ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/manager/login");
    });
  }, [router]);

  /* ── Fetch reservations ── */
  const fetchReservations = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("reservations")
      .select("*")
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (filterDate) query = query.eq("date", filterDate);

    const { data, error } = await query;
    if (!error && data) setReservations(data as Reservation[]);
    setLoading(false);
  }, [filterDate]);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  /* ── Sign out ── */
  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/manager/login");
  };

  /* ── Manual reservation submit ── */
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    const { error: dbErr } = await supabase.from("reservations").insert([{
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      party_size: parseInt(form.party_size),
      date: form.date,
      time: form.time + ":00",
      allergies: form.allergies.trim() || null,
      notes: form.notes.trim() || null,
    }]);

    setFormLoading(false);
    if (dbErr) {
      setFormError("Failed to add reservation. Check all fields and try again.");
    } else {
      setFormSuccess(true);
      setForm(EMPTY_FORM);
      fetchReservations();
      setTimeout(() => setFormSuccess(false), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-cream">
      {/* Top bar */}
      <header className="bg-brown-deep border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gold font-serif text-lg">Bab Marrakech</span>
            <span className="text-white/30 text-sm">·</span>
            <span className="text-white/80 text-sm">Dashboard</span>
            <span className="text-white/30 text-sm">·</span>
            <a href="/manager/tables" className="text-white/50 text-sm hover:text-white/80 transition-colors">Table Setup</a>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white border border-white/20 hover:border-white/40 rounded-full transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* ── Reservations table ── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-serif text-text-dark">Upcoming Reservations</h2>
              <p className="text-text-light text-sm mt-0.5">{reservations.length} reservation{reservations.length !== 1 ? "s" : ""}{filterDate ? ` on ${formatDate(filterDate)}` : ""}</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="input-base w-auto!"
                placeholder="Filter by date"
              />
              {filterDate && (
                <button onClick={() => setFilterDate("")} className="text-sm text-gold hover:text-gold-dark underline">
                  Clear
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl border border-black/5 p-12 text-center text-text-light">
              Loading reservations…
            </div>
          ) : reservations.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/5 p-12 text-center text-text-light">
              No reservations found{filterDate ? " for this date" : ""}.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-cream">
                      <th className="px-5 py-3 text-left font-semibold text-text-dark">Date</th>
                      <th className="px-5 py-3 text-left font-semibold text-text-dark">Time</th>
                      <th className="px-5 py-3 text-left font-semibold text-text-dark">Name</th>
                      <th className="px-5 py-3 text-left font-semibold text-text-dark">Guests</th>
                      <th className="px-5 py-3 text-left font-semibold text-text-dark">Phone</th>
                      <th className="px-5 py-3 text-left font-semibold text-text-dark">Email</th>
                      <th className="px-5 py-3 text-left font-semibold text-text-dark">Allergies</th>
                      <th className="px-5 py-3 text-left font-semibold text-text-dark">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r, i) => (
                      <tr key={r.id} className={`border-b border-gray-50 hover:bg-gold/5 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                        <td className="px-5 py-3.5 font-medium text-text-dark whitespace-nowrap">{formatDate(r.date)}</td>
                        <td className="px-5 py-3.5 text-text-body whitespace-nowrap">{formatTime(r.time)}</td>
                        <td className="px-5 py-3.5 text-text-dark font-medium">{r.name}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gold/10 text-gold font-semibold text-xs">{r.party_size}</span>
                        </td>
                        <td className="px-5 py-3.5 text-text-body">
                          <a href={`tel:${r.phone}`} className="hover:text-gold transition-colors">{r.phone}</a>
                        </td>
                        <td className="px-5 py-3.5 text-text-body">
                          <a href={`mailto:${r.email}`} className="hover:text-gold transition-colors">{r.email}</a>
                        </td>
                        <td className="px-5 py-3.5 text-text-light max-w-[180px]">
                          {r.allergies ? (
                            <span className="inline-block px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded text-xs">{r.allergies}</span>
                          ) : <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-text-light max-w-[180px]">{r.notes || <span className="text-gray-300">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* ── Manual reservation form ── */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-serif text-text-dark">Add Manual Reservation</h2>
            <p className="text-text-light text-sm mt-0.5">For phone bookings or walk-ins</p>
          </div>

          <form onSubmit={handleManualSubmit} className="bg-white rounded-2xl border border-black/5 shadow-sm p-7 space-y-5">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <MField label="Full Name">
                <input type="text" required placeholder="Jane Smith" value={form.name} onChange={set("name")} className="input-base" />
              </MField>
              <MField label="Phone">
                <input type="tel" required placeholder="(343) 555-0100" value={form.phone} onChange={set("phone")} className="input-base" />
              </MField>
              <MField label="Email">
                <input type="email" required placeholder="jane@example.com" value={form.email} onChange={set("email")} className="input-base" />
              </MField>
              <MField label="Date">
                <input type="date" required value={form.date} onChange={set("date")} className="input-base" />
              </MField>
              <MField label="Time">
                <select required value={form.time} onChange={set("time")} className="input-base">
                  <option value="">Select time</option>
                  {TIME_SLOTS.map((t) => <option key={t} value={t}>{formatTime(t)}</option>)}
                </select>
              </MField>
              <MField label="Party Size">
                <select required value={form.party_size} onChange={set("party_size")} className="input-base">
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                  ))}
                </select>
              </MField>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <MField label="Allergies / Dietary Notes (optional)">
                <textarea placeholder="e.g. nut allergy…" value={form.allergies} onChange={set("allergies")} rows={2} className="input-base resize-none" />
              </MField>
              <MField label="Manager Notes (optional)">
                <textarea placeholder="Special requests, VIP note…" value={form.notes} onChange={set("notes")} rows={2} className="input-base resize-none" />
              </MField>
            </div>

            {formError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{formError}</p>
            )}
            {formSuccess && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">✓ Reservation added successfully!</p>
            )}

            <button
              type="submit"
              disabled={formLoading}
              className="px-8 py-3 bg-gold text-white font-semibold rounded-full hover:bg-gold-light transition-all shadow-md shadow-gold/20 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {formLoading ? "Adding…" : "Add Reservation"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function MField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-text-dark mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
