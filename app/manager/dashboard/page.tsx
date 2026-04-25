"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Reservation, type SiteNotice, type MenuItem } from "@/lib/supabase";

const TABLE_LABELS: Record<string, string> = {
  t1: "Table 1 (5-top)",
  t2: "Table 2 (4-top)",
  t3: "Table 3 (4-top)",
  t4: "Table 4 (2-top)",
  t5: "Table 5 (2-top)",
};

const TABLE_OPTIONS = [
  { value: "",   label: "No table assigned" },
  { value: "t1", label: "Table 1 — 5 seats" },
  { value: "t2", label: "Table 2 — 4 seats" },
  { value: "t3", label: "Table 3 — 4 seats" },
  { value: "t4", label: "Table 4 — 2 seats" },
  { value: "t5", label: "Table 5 — 2 seats (walk-in)" },
];

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
    weekday: "short", month: "short", day: "numeric",
  });
}

function todayStr() {
  return new Date().toLocaleDateString("en-CA");
}

const EMPTY_FORM = {
  name: "", email: "", phone: "", party_size: "2",
  date: "", time: "", allergies: "", notes: "", table_assignment: "",
};

type EditForm = typeof EMPTY_FORM;

/* ── Edit card ── */
function EditCard({ r, onSave, onCancel }: {
  r: Reservation;
  onSave: (id: string, data: Partial<Reservation>) => Promise<void>;
  onCancel: () => void;
}) {
  const [f, setF] = useState<EditForm>({
    name: r.name,
    email: r.email,
    phone: r.phone,
    party_size: String(r.party_size),
    date: r.date,
    time: r.time.slice(0, 5),
    allergies: r.allergies ?? "",
    notes: r.notes ?? "",
    table_assignment: r.table_assignment ?? "",
  });
  const [saving, setSaving] = useState(false);
  const upd = (k: keyof EditForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    await onSave(r.id, {
      name: f.name.trim(),
      email: f.email.trim(),
      phone: f.phone.trim(),
      party_size: parseInt(f.party_size),
      date: f.date,
      time: f.time + ":00",
      allergies: f.allergies.trim() || null,
      notes: f.notes.trim() || null,
      table_assignment: f.table_assignment || null,
    });
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gold/30 shadow-sm px-4 py-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-gold-dark">Editing booking</p>
      <div className="grid grid-cols-2 gap-3">
        <MField label="Name">
          <input type="text" value={f.name} onChange={upd("name")} className="input-base text-sm" />
        </MField>
        <MField label="Phone">
          <input type="tel" value={f.phone} onChange={upd("phone")} className="input-base text-sm" />
        </MField>
        <MField label="Email">
          <input type="email" value={f.email} onChange={upd("email")} className="input-base text-sm" />
        </MField>
        <MField label="Party Size">
          <select value={f.party_size} onChange={upd("party_size")} className="input-base text-sm">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
            ))}
          </select>
        </MField>
        <MField label="Date">
          <input type="date" value={f.date} onChange={upd("date")} className="input-base text-sm" />
        </MField>
        <MField label="Time">
          <select value={f.time} onChange={upd("time")} className="input-base text-sm">
            {TIME_SLOTS.map((t) => <option key={t} value={t}>{formatTime(t)}</option>)}
          </select>
        </MField>
      </div>
      <MField label="Table">
        <select value={f.table_assignment} onChange={upd("table_assignment")} className="input-base text-sm">
          {TABLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </MField>
      <MField label="Allergies">
        <input type="text" value={f.allergies} onChange={upd("allergies")} placeholder="None" className="input-base text-sm" />
      </MField>
      <MField label="Notes">
        <input type="text" value={f.notes} onChange={upd("notes")} placeholder="None" className="input-base text-sm" />
      </MField>
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-2.5 bg-gold text-white text-sm font-semibold rounded-full hover:bg-gold-light transition-all disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-semibold text-text-body border border-black/10 rounded-full hover:border-black/20 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ── Status badge ── */
function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null;
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Attended
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Cancelled
      </span>
    );
  }
  return null;
}

/* ── Reservation card ── */
function ReservationCard({
  r, showDate,
  onEdit, onDelete,
  confirmingDelete, onConfirmDelete, onCancelDelete,
  onAttend,
  confirmingCancel, onCancelBooking, onConfirmCancel, onCancelCancel,
}: {
  r: Reservation;
  showDate?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  confirmingDelete: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onAttend: () => void;
  confirmingCancel: boolean;
  onCancelBooking: () => void;
  onConfirmCancel: () => void;
  onCancelCancel: () => void;
}) {
  const isActive = !r.status;
  const isCancelled = r.status === "cancelled";
  const isCompleted = r.status === "completed";
  const showingConfirm = confirmingDelete || confirmingCancel;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm px-4 py-3.5 space-y-2 transition-colors ${
      confirmingDelete ? "border-red-200 bg-red-50/30" :
      confirmingCancel ? "border-amber-200 bg-amber-50/20" :
      isCancelled ? "border-black/5 opacity-60" :
      isCompleted ? "border-green-100" :
      "border-black/5"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {showDate && (
            <p className="text-xs font-semibold text-gold-dark uppercase tracking-wider mb-0.5">{formatDate(r.date)}</p>
          )}
          <p className="font-semibold text-text-dark text-base leading-tight truncate">{r.name}</p>
          <p className="text-sm text-text-light mt-0.5">{formatTime(r.time)}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1 bg-gold/10 text-gold-dark font-semibold text-sm px-2.5 py-1 rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
            </svg>
            {r.party_size}
          </span>
          {!showingConfirm && (
            <>
              <button onClick={onEdit} className="p-1.5 rounded-full text-text-light hover:text-gold hover:bg-gold/10 transition-colors" aria-label="Edit">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              {isActive && (
                <>
                  <button onClick={onAttend} className="p-1.5 rounded-full text-text-light hover:text-green-600 hover:bg-green-50 transition-colors" aria-label="Mark attended">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <button onClick={onCancelBooking} className="p-1.5 rounded-full text-text-light hover:text-amber-600 hover:bg-amber-50 transition-colors" aria-label="Cancel booking">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </button>
                </>
              )}
              {!isActive && (
                <button onClick={onDelete} className="p-1.5 rounded-full text-text-light hover:text-red-500 hover:bg-red-50 transition-colors" aria-label="Delete">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {r.table_assignment && !showingConfirm && (
        <div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brown-deep/10 text-brown-deep text-xs font-semibold rounded-full">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 4v16M14 4v16" />
            </svg>
            {TABLE_LABELS[r.table_assignment] ?? r.table_assignment}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 text-sm">
        <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1.5 text-text-body hover:text-gold transition-colors">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.49 4.49a1 1 0 01-.5 1.21l-2.26 1.13a11.04 11.04 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.49 1.49a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z" />
          </svg>
          {r.phone}
        </a>
        {r.email && (
          <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1.5 text-text-light hover:text-gold transition-colors truncate max-w-[180px]">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {r.email}
          </a>
        )}
      </div>

      {(r.allergies || r.notes || r.status) && !showingConfirm && (
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={r.status} />
          {r.allergies && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-medium">
              ⚠ {r.allergies}
            </span>
          )}
          {r.notes && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{r.notes}</span>
          )}
        </div>
      )}

      {confirmingCancel && (
        <div className="flex items-center gap-2 pt-1">
          <p className="text-sm text-amber-700 font-medium flex-1">Cancel this booking?</p>
          <button onClick={onCancelCancel} className="px-3 py-1.5 text-xs font-semibold text-text-body border border-black/10 rounded-full hover:border-black/20 transition-all">
            Keep
          </button>
          <button onClick={onConfirmCancel} className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-full transition-all">
            Yes, Cancel
          </button>
        </div>
      )}

      {confirmingDelete && (
        <div className="flex items-center gap-2 pt-1">
          <p className="text-sm text-red-600 font-medium flex-1">Remove this booking?</p>
          <button onClick={onCancelDelete} className="px-3 py-1.5 text-xs font-semibold text-text-body border border-black/10 rounded-full hover:border-black/20 transition-all">
            Cancel
          </button>
          <button onClick={onConfirmDelete} className="px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-full transition-all">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Accordion ── */
function Accordion({ title, subtitle, children, defaultOpen = false }: {
  title: string; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl border border-black/5 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div>
          <p className="font-semibold text-text-dark">{title}</p>
          {subtitle && <p className="text-xs text-text-light mt-0.5">{subtitle}</p>}
        </div>
        <svg className={`w-5 h-5 text-text-light shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-50">{children}</div>}
    </section>
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

/* ══════════════════════════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════════════════════════ */
export default function ManagerDashboard() {
  const router = useRouter();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  /* ── Menu items ── */
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ category: "tajine", name: "", price: "", description: "" });
  const [newItemPhoto, setNewItemPhoto] = useState<File | null>(null);
  const [addingItem, setAddingItem] = useState(false);

  const fetchMenuItems = useCallback(async () => {
    const { data } = await supabase.from("menu_items").select("*").order("category").order("sort_order");
    if (data) setMenuItems(data as MenuItem[]);
  }, []);

  useEffect(() => { fetchMenuItems(); }, [fetchMenuItems]);

  const toggleItem = async (id: string, available: boolean) => {
    setMenuItems((prev) => prev.map((i) => i.id === id ? { ...i, available } : i));
    await supabase.from("menu_items").update({ available }).eq("id", id);
  };

  const deleteMenuItem = async (id: string) => {
    setMenuItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("menu_items").delete().eq("id", id);
  };

  const addMenuItem = async () => {
    if (!newItem.name.trim() || !newItem.price.trim()) return;
    setAddingItem(true);
    let image_url: string | null = null;
    if (newItemPhoto) {
      const ext = newItemPhoto.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("menu-photos").upload(path, newItemPhoto);
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("menu-photos").getPublicUrl(path);
        image_url = urlData.publicUrl;
      }
    }
    await supabase.from("menu_items").insert([{
      category: newItem.category,
      name: newItem.name.trim(),
      price: newItem.price.trim(),
      description: newItem.description.trim() || null,
      image_url,
      available: true,
    }]);
    setNewItem({ category: "tajine", name: "", price: "", description: "" });
    setNewItemPhoto(null);
    setShowAddItem(false);
    setAddingItem(false);
    fetchMenuItems();
  };

  const CATEGORIES = [
    { value: "tajine",    label: "Tajine" },
    { value: "couscous",  label: "Couscous" },
    { value: "bastilla",  label: "Bastilla" },
    { value: "soups",     label: "Soup" },
    { value: "entrees",   label: "Entrées" },
    { value: "msemen",    label: "Msemen" },
    { value: "desserts",  label: "Desserts" },
    { value: "breakfast", label: "Breakfast" },
    { value: "mkila",     label: "M'kila" },
    { value: "rfissa",    label: "Rfissa" },
    { value: "drinks",    label: "Drinks" },
    { value: "tea",       label: "Tea" },
  ];

  const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

  const groupedMenu = menuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  const [notice, setNotice] = useState<SiteNotice>({ id: 1, message: "", active: false, updated_at: "" });
  const [noticeLoading, setNoticeLoading] = useState(false);
  const [noticeSaved, setNoticeSaved] = useState(false);

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

  /* ── Fetch notice ── */
  useEffect(() => {
    supabase.from("site_notices").select("*").eq("id", 1).single().then(({ data }) => {
      if (data) setNotice(data as SiteNotice);
    });
  }, []);

  const saveNotice = async () => {
    setNoticeLoading(true);
    await supabase.from("site_notices").update({
      message: notice.message, active: notice.active, updated_at: new Date().toISOString(),
    }).eq("id", 1);
    setNoticeLoading(false);
    setNoticeSaved(true);
    setTimeout(() => setNoticeSaved(false), 3000);
  };

  /* ── Fetch reservations ── */
  const fetchReservations = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("reservations").select("*")
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

  /* ── Edit ── */
  const handleUpdate = async (id: string, data: Partial<Reservation>) => {
    await supabase.from("reservations").update(data).eq("id", id);
    setEditingId(null);
    fetchReservations();
  };

  /* ── Delete ── */
  const handleDelete = async (id: string) => {
    await supabase.from("reservations").delete().eq("id", id);
    setDeletingId(null);
    fetchReservations();
  };

  /* ── Status changes ── */
  const handleSetStatus = async (id: string, status: "cancelled" | "completed" | null) => {
    await supabase.from("reservations").update({ status }).eq("id", id);
    setCancellingId(null);
    fetchReservations();
  };

  /* ── Add reservation ── */
  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleManualSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);
    const { error: dbErr } = await supabase.from("reservations").insert([{
      name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
      party_size: parseInt(form.party_size), date: form.date, time: form.time + ":00",
      allergies: form.allergies.trim() || null, notes: form.notes.trim() || null,
      table_assignment: form.table_assignment || null,
    }]);
    setFormLoading(false);
    if (dbErr) {
      setFormError("Failed to add reservation. Check all fields and try again.");
    } else {
      setFormSuccess(true);
      setForm(EMPTY_FORM);
      fetchReservations();
      setTimeout(() => setFormSuccess(false), 4000);
    }
  };

  /* ── Helpers ── */
  const today = todayStr();
  const todayRes = reservations.filter((r) => r.date === today);
  const upcomingRes = reservations.filter((r) => r.date > today);
  const pastRes = reservations.filter((r) => r.date < today);

  function clearActions() {
    setEditingId(null);
    setDeletingId(null);
    setCancellingId(null);
  }

  function renderCard(r: Reservation, showDate?: boolean) {
    if (editingId === r.id) {
      return (
        <EditCard key={r.id} r={r} onSave={handleUpdate} onCancel={() => setEditingId(null)} />
      );
    }
    return (
      <ReservationCard
        key={r.id}
        r={r}
        showDate={showDate}
        onEdit={() => { clearActions(); setEditingId(r.id); }}
        onDelete={() => { clearActions(); setDeletingId(r.id); }}
        confirmingDelete={deletingId === r.id}
        onConfirmDelete={() => handleDelete(r.id)}
        onCancelDelete={() => setDeletingId(null)}
        onAttend={() => handleSetStatus(r.id, "completed")}
        confirmingCancel={cancellingId === r.id}
        onCancelBooking={() => { clearActions(); setCancellingId(r.id); }}
        onConfirmCancel={() => handleSetStatus(r.id, "cancelled")}
        onCancelCancel={() => setCancellingId(null)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-cream pb-10">

      {/* ── Header ── */}
      <header className="bg-brown-deep border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-gold font-serif text-base shrink-0">Bab Marrakech</span>
            <span className="text-white/30 text-sm">·</span>
            <span className="text-white/60 text-sm truncate">Manager</span>
          </div>
          <button onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white/60 hover:text-white border border-white/20 hover:border-white/40 rounded-full transition-all">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Out
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-5 space-y-5">

        {/* ── Today ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-dark">Today</p>
              <h2 className="text-xl font-semibold text-text-dark mt-0.5">
                {new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })}
              </h2>
            </div>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${todayRes.length > 0 ? "bg-gold/10 text-gold-dark" : "bg-gray-100 text-gray-400"}`}>
              {todayRes.length} {todayRes.length === 1 ? "booking" : "bookings"}
            </span>
          </div>
          {loading ? (
            <div className="bg-white rounded-2xl border border-black/5 p-8 text-center text-text-light text-sm">Loading…</div>
          ) : todayRes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/5 p-8 text-center text-text-light text-sm">No reservations today.</div>
          ) : (
            <div className="space-y-2.5">{todayRes.map((r) => renderCard(r))}</div>
          )}
        </section>

        {/* ── Upcoming ── */}
        <section>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-text-light">Upcoming</p>
              <h2 className="text-xl font-semibold text-text-dark mt-0.5">All Reservations</h2>
            </div>
            <div className="flex items-center gap-2">
              <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="input-base text-sm py-2 w-36" />
              {filterDate && <button onClick={() => setFilterDate("")} className="text-xs text-gold underline shrink-0">Clear</button>}
            </div>
          </div>
          {loading ? (
            <div className="bg-white rounded-2xl border border-black/5 p-8 text-center text-text-light text-sm">Loading…</div>
          ) : upcomingRes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/5 p-8 text-center text-text-light text-sm">
              {filterDate ? "No reservations for this date." : "No upcoming reservations."}
            </div>
          ) : (
            <div className="space-y-2.5">{upcomingRes.map((r) => renderCard(r, true))}</div>
          )}
        </section>

        {/* ── Past ── */}
        {!filterDate && (
          <Accordion
            title="Past Reservations"
            subtitle={pastRes.length > 0 ? `${pastRes.length} booking${pastRes.length === 1 ? "" : "s"}` : "None"}
          >
            <div className="pt-3 space-y-2.5">
              {pastRes.length === 0 ? (
                <p className="text-sm text-text-light text-center py-4">No past reservations.</p>
              ) : (
                [...pastRes].reverse().map((r) => renderCard(r, true))
              )}
            </div>
          </Accordion>
        )}

        {/* ── Add Reservation ── */}
        <Accordion title="Add Reservation" subtitle="Walk-ins and phone bookings">
          <form onSubmit={handleManualSubmit} className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <MField label="Full Name">
                <input type="text" required placeholder="Jane Smith" value={form.name} onChange={set("name")} className="input-base" />
              </MField>
              <MField label="Phone">
                <input type="tel" required placeholder="(343) 555-0100" value={form.phone} onChange={set("phone")} className="input-base" />
              </MField>
              <MField label="Email">
                <input type="email" required placeholder="jane@example.com" value={form.email} onChange={set("email")} className="input-base" />
              </MField>
              <MField label="Party Size">
                <select required value={form.party_size} onChange={set("party_size")} className="input-base">
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                  ))}
                </select>
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
            </div>
            <MField label="Table">
              <select value={form.table_assignment} onChange={set("table_assignment")} className="input-base">
                {TABLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </MField>
            <MField label="Allergies (optional)">
              <input type="text" placeholder="e.g. nut allergy" value={form.allergies} onChange={set("allergies")} className="input-base" />
            </MField>
            <MField label="Notes (optional)">
              <input type="text" placeholder="VIP, special request…" value={form.notes} onChange={set("notes")} className="input-base" />
            </MField>
            {formError && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{formError}</p>}
            {formSuccess && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">✓ Reservation added!</p>}
            <button type="submit" disabled={formLoading}
              className="w-full py-3 bg-gold text-white font-semibold rounded-full hover:bg-gold-light transition-all shadow-md shadow-gold/20 disabled:opacity-60">
              {formLoading ? "Adding…" : "Add Reservation"}
            </button>
          </form>
        </Accordion>

        {/* ── Site Notice ── */}
        <Accordion title="Site Notice" subtitle={notice.active ? "⚡ Banner is live on homepage" : "Publish a banner to the homepage"}>
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-text-dark">Show on homepage</p>
                <p className="text-xs text-text-light mt-0.5">Toggles the banner for all visitors</p>
              </div>
              <button
                onClick={() => setNotice((n) => ({ ...n, active: !n.active }))}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${notice.active ? "bg-gold" : "bg-gray-200"}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${notice.active ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
            {notice.active && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 font-medium">
                <svg className="h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                Banner is live — visitors can see this message now.
              </div>
            )}
            <MField label="Message">
              <textarea rows={3}
                placeholder="e.g. Due to unforeseen circumstances, we will be closed today."
                value={notice.message}
                onChange={(e) => setNotice((n) => ({ ...n, message: e.target.value }))}
                className="input-base resize-none"
              />
            </MField>
            <div className="flex items-center gap-3">
              <button onClick={saveNotice} disabled={noticeLoading}
                className="flex-1 py-3 bg-gold text-white font-semibold rounded-full hover:bg-gold-light transition-all shadow-md shadow-gold/20 disabled:opacity-60">
                {noticeLoading ? "Saving…" : "Save Notice"}
              </button>
              {noticeSaved && <p className="text-sm text-green-700 font-medium">✓ Saved</p>}
            </div>
          </div>
        </Accordion>

        {/* ── Menu Items ── */}
        <Accordion title="Menu Items" subtitle={`${menuItems.filter((i) => i.available).length} of ${menuItems.length} items available`}>
          <div className="pt-4 space-y-5">

            {Object.keys(groupedMenu).sort().map((cat) => (
              <div key={cat}>
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-dark mb-2">
                  {CATEGORY_LABEL[cat] ?? cat}
                </p>
                <div className="space-y-1.5">
                  {groupedMenu[cat].map((item) => (
                    <div key={item.id} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${item.available ? "bg-[#fffaf2]" : "bg-gray-50 opacity-60"}`}>
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-dark truncate">{item.name}</p>
                        <p className="text-xs text-text-light">{item.price}</p>
                      </div>
                      <button
                        onClick={() => toggleItem(item.id, !item.available)}
                        className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${item.available ? "bg-gold" : "bg-gray-200"}`}
                      >
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${item.available ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                      <button onClick={() => deleteMenuItem(item.id)} className="p-1 rounded-full text-text-light hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {!showAddItem ? (
              <button
                onClick={() => setShowAddItem(true)}
                className="w-full py-2.5 border-2 border-dashed border-gold/30 text-gold-dark text-sm font-medium rounded-xl hover:border-gold/60 hover:bg-gold/5 transition-all"
              >
                + Add Item
              </button>
            ) : (
              <div className="rounded-xl border border-gold/20 bg-[#fffaf2] p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gold-dark">New Item</p>
                <div className="grid grid-cols-2 gap-3">
                  <MField label="Category">
                    <select value={newItem.category} onChange={(e) => setNewItem((p) => ({ ...p, category: e.target.value }))} className="input-base text-sm">
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </MField>
                  <MField label="Price">
                    <input type="text" placeholder="$25" value={newItem.price} onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))} className="input-base text-sm" />
                  </MField>
                </div>
                <MField label="Name">
                  <input type="text" placeholder="e.g. Lamb Shank" value={newItem.name} onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))} className="input-base text-sm" />
                </MField>
                <MField label="Description (optional)">
                  <input type="text" placeholder="Short description…" value={newItem.description} onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))} className="input-base text-sm" />
                </MField>
                <MField label="Photo (optional)">
                  <input type="file" accept="image/*" onChange={(e) => setNewItemPhoto(e.target.files?.[0] ?? null)} className="block w-full text-sm text-text-light file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gold/10 file:text-gold-dark hover:file:bg-gold/20 cursor-pointer" />
                </MField>
                <div className="flex gap-2 pt-1">
                  <button onClick={addMenuItem} disabled={addingItem || !newItem.name.trim() || !newItem.price.trim()}
                    className="flex-1 py-2.5 bg-gold text-white text-sm font-semibold rounded-full hover:bg-gold-light transition-all disabled:opacity-50">
                    {addingItem ? "Adding…" : "Add to Menu"}
                  </button>
                  <button onClick={() => { setShowAddItem(false); setNewItem({ category: "tajine", name: "", price: "", description: "" }); setNewItemPhoto(null); }}
                    className="px-4 py-2.5 text-sm font-semibold text-text-body border border-black/10 rounded-full hover:border-black/20 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </Accordion>

      </div>
    </main>
  );
}
