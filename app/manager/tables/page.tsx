"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* ═══════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════ */
type TableShape  = "round" | "rect";
type ElementKind = "wall" | "door" | "window" | "bar" | "pillar" | "plant" | "label";
type ToolMode    = "select" | "table" | "seat" | ElementKind;

type RTable = {
  id: string;
  name: string;
  x: number;
  y: number;
  shape: TableShape;
};

type RSeat = {
  id: string;
  table_id: string | null;   // null = free-floating seat
  x: number;
  y: number;
};

type FloorElement = {
  id: string;
  kind: ElementKind;
  x1: number;
  y1: number;
  x2: number | null;
  y2: number | null;
  label: string | null;
};

/* ═══════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════ */
const GRID     = 20;
const CANVAS_H = 600;
const TABLE_R  = 36;   // round table radius
const TABLE_W  = 80;   // rect table width
const TABLE_H  = 52;   // rect table height
const SEAT_R   = 9;    // seat circle radius
const POINT_R  = 18;

/* How close a seat must be to a table centre to auto-associate */
const ASSOC_DIST = TABLE_R + SEAT_R + 18;

const LINE_TOOLS:  ElementKind[] = ["wall", "door", "window"];
const POINT_TOOLS: ElementKind[] = ["bar", "pillar", "plant"];

const TOOL_META: Record<ToolMode, { label: string; icon: string; color: string }> = {
  select:  { label: "Select",  icon: "M15 15l-5.2-5.2M11 7A4 4 0 113 7a4 4 0 018 0z",                                                  color: "text-text-dark"  },
  table:   { label: "Table",   icon: "M3 10h18M3 14h18M10 3v18M14 3v18",                                                                 color: "text-gold"       },
  seat:    { label: "Seat",    icon: "M5 3h14M5 21h14M5 3v18M19 3v18M9 8h6M9 16h6",                                                     color: "text-amber-600"  },
  wall:    { label: "Wall",    icon: "M4 6h16M4 12h16M4 18h16",                                                                          color: "text-gray-700"   },
  door:    { label: "Door",    icon: "M6 2h12v20H6zM12 12v4",                                                                            color: "text-blue-600"   },
  window:  { label: "Window",  icon: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",                                                   color: "text-cyan-600"   },
  bar:     { label: "Bar",     icon: "M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3m10 0h3a2 2 0 002-2v-3",       color: "text-amber-700"  },
  pillar:  { label: "Pillar",  icon: "M12 2a4 4 0 100 8 4 4 0 000-8zM12 14v8",                                                          color: "text-stone-500"  },
  plant:   { label: "Plant",   icon: "M12 22V12M12 12C12 7 7 4 7 4s0 5 5 8zM12 12c0-5 5-8 5-8s0 5-5 8z",                               color: "text-green-600"  },
  label:   { label: "Label",   icon: "M4 6h16M4 12h10M4 18h12",                                                                         color: "text-purple-600" },
};

const ELEMENT_STYLE: Record<ElementKind, { stroke: string; strokeW: number; dash?: string; fill?: string; label: string }> = {
  wall:   { stroke: "#374151", strokeW: 6, label: "Wall"   },
  door:   { stroke: "#2563eb", strokeW: 4, dash: "8 4",  label: "Door"   },
  window: { stroke: "#0891b2", strokeW: 3, dash: "4 4",  label: "Window" },
  bar:    { stroke: "#92400e", strokeW: 1, fill: "#d97706", label: "Bar"    },
  pillar: { stroke: "#78716c", strokeW: 2, fill: "#d6d3d1", label: "Pillar" },
  plant:  { stroke: "#15803d", strokeW: 2, fill: "#bbf7d0", label: "Plant"  },
  label:  { stroke: "none",    strokeW: 0, fill: "none",    label: "Label"  },
};

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function snap(v: number) { return Math.round(v / GRID) * GRID; }
function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);
}
function pointNearLine(px: number, py: number, x1: number, y1: number, x2: number, y2: number, thr: number) {
  const dx = x2 - x1, dy = y2 - y1, lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return dist(px, py, x1, y1) <= thr;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  return dist(px, py, x1 + t * dx, y1 + t * dy) <= thr;
}
function isLineKind(k: ElementKind) { return k === "wall" || k === "door" || k === "window"; }

/* Find closest table to a point, returns it if within ASSOC_DIST */
function nearestTable(x: number, y: number, tables: RTable[]): RTable | null {
  let best: RTable | null = null;
  let bestD = Infinity;
  for (const t of tables) {
    const d = dist(x, y, t.x, t.y);
    if (d < bestD) { bestD = d; best = t; }
  }
  return best && bestD <= ASSOC_DIST ? best : null;
}

/* ═══════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════ */
export default function TablesPage() {
  const router     = useRouter();
  const svgRef     = useRef<SVGSVGElement>(null);
  const canvasWrap = useRef<HTMLDivElement>(null);

  /* ── data ── */
  const [tables,   setTables]   = useState<RTable[]>([]);
  const [seats,    setSeats]    = useState<RSeat[]>([]);
  const [elements, setElements] = useState<FloorElement[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saveMsg,  setSaveMsg]  = useState<string | null>(null);

  /* ── undo stack ── */
  type HistEntry =
    | { kind: "table";   id: string }
    | { kind: "seat";    id: string }
    | { kind: "element"; id: string };
  const [history, setHistory] = useState<HistEntry[]>([]);

  /* ── tool + selection ── */
  const [tool,     setTool]     = useState<ToolMode>("select");
  const [selected, setSelected] = useState<{ kind: "table" | "seat" | "element"; id: string } | null>(null);

  /* ── drawing line elements ── */
  const drawing = useRef<{ x1: number; y1: number } | null>(null);
  const [preview, setPreview] = useState<{ x2: number; y2: number } | null>(null);

  /* ── dragging ── */
  const dragging = useRef<{
    kind: "table" | "seat" | "element";
    id: string;
    ox: number; oy: number;
    isPoint?: boolean;
    endPoint?: boolean;
  } | null>(null);

  /* ── table draft ── */
  const [tableDraft, setTableDraft] = useState<{ name: string; shape: TableShape }>({ name: "", shape: "round" });

  /* ── label input ── */
  const [pendingLabel, setPendingLabel] = useState<{ x: number; y: number } | null>(null);
  const [labelText,    setLabelText]    = useState("");

  /* ── seat hover preview ── */
  const [seatPreview, setSeatPreview] = useState<{ x: number; y: number; nearTable: boolean } | null>(null);

  /* ── Auth guard ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/manager/login");
    });
  }, [router]);

  /* ── Ctrl+Z ── */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  /* ── Fetch ── */
  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: td }, { data: sd }, { data: ed }] = await Promise.all([
      supabase.from("restaurant_tables").select("*").order("created_at"),
      supabase.from("restaurant_seats").select("*").order("created_at"),
      supabase.from("floor_elements").select("*").order("created_at"),
    ]);
    if (td) setTables(td as RTable[]);
    if (sd) setSeats(sd as RSeat[]);
    if (ed) setElements(ed as FloorElement[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── Save layout ── */
  const saveAll = async () => {
    setSaving(true); setSaveMsg(null);
    await Promise.all([
      ...tables.map((t) => supabase.from("restaurant_tables").update({ x: t.x, y: t.y }).eq("id", t.id)),
      ...seats.map((s)  => supabase.from("restaurant_seats").update({ x: s.x, y: s.y, table_id: s.table_id }).eq("id", s.id)),
      ...elements.map((e) => supabase.from("floor_elements").update({ x1: e.x1, y1: e.y1, x2: e.x2, y2: e.y2 }).eq("id", e.id)),
    ]);
    setSaving(false); setSaveMsg("Saved!"); setTimeout(() => setSaveMsg(null), 2500);
  };

  /* ── SVG point helper ── */
  function svgPt(e: React.MouseEvent) {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: snap(e.clientX - r.left), y: snap(e.clientY - r.top) };
  }
  function svgPtRaw(e: React.MouseEvent) {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  /* ═══════════════════════════
     MOUSE DOWN
  ═══════════════════════════ */
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const pt = svgPt(e);

    /* SELECT */
    if (tool === "select") {
      // seats (small — check first so they're on top)
      for (const s of [...seats].reverse()) {
        if (dist(pt.x, pt.y, s.x, s.y) <= SEAT_R + 4) {
          setSelected({ kind: "seat", id: s.id });
          dragging.current = { kind: "seat", id: s.id, ox: pt.x - s.x, oy: pt.y - s.y, isPoint: true };
          return;
        }
      }
      // tables
      for (const t of [...tables].reverse()) {
        const hw = t.shape === "rect" ? TABLE_W / 2 : TABLE_R;
        const hh = t.shape === "rect" ? TABLE_H / 2 : TABLE_R;
        if (Math.abs(pt.x - t.x) <= hw && Math.abs(pt.y - t.y) <= hh) {
          setSelected({ kind: "table", id: t.id });
          dragging.current = { kind: "table", id: t.id, ox: pt.x - t.x, oy: pt.y - t.y };
          return;
        }
      }
      // elements
      for (const el of [...elements].reverse()) {
        if (isLineKind(el.kind) && el.x2 != null && el.y2 != null) {
          if (dist(pt.x, pt.y, el.x2, el.y2) <= 10) {
            setSelected({ kind: "element", id: el.id });
            dragging.current = { kind: "element", id: el.id, ox: 0, oy: 0, endPoint: true };
            return;
          }
          if (dist(pt.x, pt.y, el.x1, el.y1) <= 10) {
            setSelected({ kind: "element", id: el.id });
            dragging.current = { kind: "element", id: el.id, ox: 0, oy: 0, endPoint: false };
            return;
          }
          if (pointNearLine(pt.x, pt.y, el.x1, el.y1, el.x2, el.y2, 8)) {
            setSelected({ kind: "element", id: el.id });
            dragging.current = { kind: "element", id: el.id, ox: pt.x - el.x1, oy: pt.y - el.y1 };
            return;
          }
        } else if (dist(pt.x, pt.y, el.x1, el.y1) <= POINT_R + 4) {
          setSelected({ kind: "element", id: el.id });
          dragging.current = { kind: "element", id: el.id, ox: pt.x - el.x1, oy: pt.y - el.y1, isPoint: true };
          return;
        }
      }
      setSelected(null);
      return;
    }

    /* TABLE */
    if (tool === "table") {
      if (!tableDraft.name.trim()) return;
      placeTable(pt.x, pt.y);
      return;
    }

    /* SEAT */
    if (tool === "seat") {
      placeSeat(pt.x, pt.y);
      return;
    }

    /* LABEL */
    if (tool === "label") {
      setPendingLabel(pt); setLabelText(""); return;
    }

    /* LINE tools */
    if (LINE_TOOLS.includes(tool as ElementKind)) {
      drawing.current = { x1: pt.x, y1: pt.y }; setPreview(null); return;
    }

    /* POINT tools */
    if (POINT_TOOLS.includes(tool as ElementKind)) {
      placeElement({ kind: tool as ElementKind, x1: pt.x, y1: pt.y, x2: null, y2: null, label: null });
    }
  };

  /* ═══════════════════════════
     MOUSE MOVE
  ═══════════════════════════ */
  const onMouseMove = (e: React.MouseEvent) => {
    const pt    = svgPt(e);
    const ptRaw = svgPtRaw(e);

    /* seat hover preview */
    if (tool === "seat") {
      const near = nearestTable(pt.x, pt.y, tables);
      setSeatPreview({ x: pt.x, y: pt.y, nearTable: !!near });
    } else {
      setSeatPreview(null);
    }

    /* line draw preview */
    if (drawing.current && LINE_TOOLS.includes(tool as ElementKind)) {
      setPreview({ x2: ptRaw.x, y2: ptRaw.y }); return;
    }

    if (!dragging.current) return;
    const { kind, id, ox, oy } = dragging.current;
    const cw = canvasWrap.current?.clientWidth ?? 900;

    if (kind === "table") {
      setTables((prev) => prev.map((t) => {
        if (t.id !== id) return t;
        const hw = t.shape === "rect" ? TABLE_W / 2 : TABLE_R;
        const hh = t.shape === "rect" ? TABLE_H / 2 : TABLE_R;
        return { ...t, x: Math.max(hw, Math.min(cw - hw, snap(pt.x - ox))), y: Math.max(hh, Math.min(CANVAS_H - hh, snap(pt.y - oy))) };
      }));
    } else if (kind === "seat") {
      setSeats((prev) => prev.map((s) => {
        if (s.id !== id) return s;
        const nx = Math.max(SEAT_R, Math.min(cw - SEAT_R, snap(pt.x - ox)));
        const ny = Math.max(SEAT_R, Math.min(CANVAS_H - SEAT_R, snap(pt.y - oy)));
        // re-associate on drag
        const near = nearestTable(nx, ny, tables);
        return { ...s, x: nx, y: ny, table_id: near ? near.id : null };
      }));
    } else {
      setElements((prev) => prev.map((el) => {
        if (el.id !== id) return el;
        if (dragging.current?.endPoint === true)  return { ...el, x2: pt.x, y2: pt.y };
        if (dragging.current?.endPoint === false) return { ...el, x1: pt.x, y1: pt.y };
        if (dragging.current?.isPoint) return { ...el, x1: snap(pt.x - ox), y1: snap(pt.y - oy) };
        const dx = el.x2 != null ? el.x2 - el.x1 : 0;
        const dy = el.y2 != null ? el.y2 - el.y1 : 0;
        const nx1 = snap(pt.x - ox), ny1 = snap(pt.y - oy);
        return { ...el, x1: nx1, y1: ny1, x2: el.x2 != null ? nx1 + dx : null, y2: el.y2 != null ? ny1 + dy : null };
      }));
    }
  };

  /* ═══════════════════════════
     MOUSE UP
  ═══════════════════════════ */
  const onMouseUp = (e: React.MouseEvent) => {
    dragging.current = null;
    if (drawing.current && LINE_TOOLS.includes(tool as ElementKind)) {
      const pt = svgPtRaw(e);
      const { x1, y1 } = drawing.current;
      drawing.current = null; setPreview(null);
      if (dist(x1, y1, pt.x, pt.y) > 10)
        placeElement({ kind: tool as ElementKind, x1, y1, x2: pt.x, y2: pt.y, label: null });
    }
  };

  /* ═══════════════════════════
     PLACE HELPERS
  ═══════════════════════════ */
  const placeTable = async (x: number, y: number) => {
    const { data, error } = await supabase
      .from("restaurant_tables")
      .insert([{ name: tableDraft.name.trim(), shape: tableDraft.shape, x, y }])
      .select().single();
    if (!error && data) {
      setTables((p) => [...p, data as RTable]);
      setSelected({ kind: "table", id: data.id });
      setHistory((h) => [...h, { kind: "table", id: data.id }]);
    }
  };

  const placeSeat = async (x: number, y: number) => {
    const near = nearestTable(x, y, tables);
    const { data, error } = await supabase
      .from("restaurant_seats")
      .insert([{ x, y, table_id: near ? near.id : null }])
      .select().single();
    if (!error && data) {
      setSeats((p) => [...p, data as RSeat]);
      setSelected({ kind: "seat", id: data.id });
      setHistory((h) => [...h, { kind: "seat", id: data.id }]);
    }
  };

  const placeElement = async (el: Omit<FloorElement, "id">) => {
    const { data, error } = await supabase.from("floor_elements").insert([el]).select().single();
    if (!error && data) {
      setElements((p) => [...p, data as FloorElement]);
      setSelected({ kind: "element", id: data.id });
      setHistory((h) => [...h, { kind: "element", id: data.id }]);
    }
  };

  /* ── Undo ── */
  const undo = async () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    if (selected?.id === last.id) setSelected(null);
    if (last.kind === "table") {
      setTables((p)   => p.filter((t) => t.id !== last.id));
      setSeats((p)    => p.filter((s) => s.table_id !== last.id)); // orphan seats
      await supabase.from("restaurant_tables").delete().eq("id", last.id);
    } else if (last.kind === "seat") {
      setSeats((p) => p.filter((s) => s.id !== last.id));
      await supabase.from("restaurant_seats").delete().eq("id", last.id);
    } else {
      setElements((p) => p.filter((e) => e.id !== last.id));
      await supabase.from("floor_elements").delete().eq("id", last.id);
    }
  };

  /* ── Delete selected ── */
  const deleteSelected = async () => {
    if (!selected) return;
    if (!confirm("Delete this item?")) return;
    if (selected.kind === "table") {
      setTables((p) => p.filter((t) => t.id !== selected.id));
      setSeats((p)  => p.filter((s) => s.table_id !== selected.id));
      await supabase.from("restaurant_tables").delete().eq("id", selected.id);
    } else if (selected.kind === "seat") {
      setSeats((p) => p.filter((s) => s.id !== selected.id));
      await supabase.from("restaurant_seats").delete().eq("id", selected.id);
    } else {
      setElements((p) => p.filter((e) => e.id !== selected.id));
      await supabase.from("floor_elements").delete().eq("id", selected.id);
    }
    setSelected(null);
  };

  /* ── Update table ── */
  const updateTable = async (patch: Partial<RTable>) => {
    if (!selected || selected.kind !== "table") return;
    setTables((p) => p.map((t) => t.id === selected.id ? { ...t, ...patch } : t));
    await supabase.from("restaurant_tables").update(patch).eq("id", selected.id);
  };

  /* ── Submit label ── */
  const submitLabel = async () => {
    if (!pendingLabel || !labelText.trim()) { setPendingLabel(null); return; }
    await placeElement({ kind: "label", x1: pendingLabel.x, y1: pendingLabel.y, x2: null, y2: null, label: labelText.trim() });
    setPendingLabel(null); setLabelText("");
  };

  /* ── Derived ── */
  const selTable   = selected?.kind === "table"   ? tables.find((t) => t.id === selected.id)   ?? null : null;
  const selSeat    = selected?.kind === "seat"    ? seats.find((s)  => s.id === selected.id)   ?? null : null;
  const selElement = selected?.kind === "element" ? elements.find((e) => e.id === selected.id) ?? null : null;

  /* seats per table */
  function seatsForTable(tableId: string) { return seats.filter((s) => s.table_id === tableId).length; }
  const totalSeats = seats.length;

  const toolGroups: { title: string; tools: ToolMode[] }[] = [
    { title: "Edit",      tools: ["select"] },
    { title: "Furniture", tools: ["table", "seat", "bar"] },
    { title: "Structure", tools: ["wall", "door", "window"] },
    { title: "Details",   tools: ["pillar", "plant", "label"] },
  ];

  /* ═══════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════ */
  return (
    <main className="min-h-screen bg-cream flex flex-col">

      {/* ── Top bar ── */}
      <header className="bg-brown-deep border-b border-white/10 sticky top-0 z-50 shrink-0">
        <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gold font-serif">Bab Marrakech</span>
            <span className="text-white/30">·</span>
            <a href="/manager/dashboard" className="text-white/50 text-sm hover:text-white/80 transition-colors">Dashboard</a>
            <span className="text-white/30">·</span>
            <span className="text-white/80 text-sm">Floor Plan Editor</span>
          </div>
          <div className="flex items-center gap-3">
            {saveMsg && <span className="text-green-400 text-sm">{saveMsg}</span>}
            <button onClick={undo} disabled={history.length === 0} title="Undo (Ctrl+Z)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6M3 10l6-6" />
              </svg>
              Undo{history.length > 0 ? ` (${history.length})` : ""}
            </button>
            <button onClick={saveAll} disabled={saving}
              className="px-4 py-1.5 text-sm bg-gold text-white font-semibold rounded-full hover:bg-gold-light transition-all disabled:opacity-60">
              {saving ? "Saving…" : "Save Layout"}
            </button>
            <button onClick={() => supabase.auth.signOut().then(() => router.push("/manager/login"))}
              className="px-3 py-1.5 text-sm text-white/50 hover:text-white border border-white/20 rounded-full transition-all">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden max-w-[1600px] mx-auto w-full">

        {/* ══════════════════════
            LEFT TOOLBAR
        ══════════════════════ */}
        <aside className="w-44 shrink-0 bg-white border-r border-black/5 p-3 space-y-4 overflow-y-auto">
          {toolGroups.map((group) => (
            <div key={group.title}>
              <p className="text-[10px] font-semibold text-text-light uppercase tracking-widest mb-1.5 px-1">{group.title}</p>
              <div className="space-y-1">
                {group.tools.map((t) => {
                  const meta = TOOL_META[t];
                  return (
                    <button key={t} onClick={() => { setTool(t); setSelected(null); setPendingLabel(null); setSeatPreview(null); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all
                        ${tool === t ? "bg-gold/10 text-gold border border-gold/30" : "text-text-body hover:bg-cream hover:text-text-dark border border-transparent"}`}>
                      <svg className={`w-4 h-4 shrink-0 ${tool === t ? "text-gold" : meta.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={meta.icon} />
                      </svg>
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Table draft */}
          {tool === "table" && (
            <div className="border-t border-black/5 pt-3 space-y-2">
              <p className="text-[10px] font-semibold text-text-light uppercase tracking-widest px-1">New Table</p>
              <input type="text" placeholder="Name…" value={tableDraft.name}
                onChange={(e) => setTableDraft((d) => ({ ...d, name: e.target.value }))}
                className="input-base text-sm py-1.5" />
              <div className="flex gap-1">
                {(["round","rect"] as TableShape[]).map((s) => (
                  <button key={s} onClick={() => setTableDraft((d) => ({ ...d, shape: s }))}
                    className={`flex-1 py-1 text-xs font-semibold rounded-lg border transition-all
                      ${tableDraft.shape === s ? "border-gold bg-gold/10 text-gold" : "border-black/10 text-text-light"}`}>
                    {s === "round" ? "⬤" : "▬"} {s}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-text-light px-1">Click canvas to place</p>
            </div>
          )}

          {/* Seat hint */}
          {tool === "seat" && (
            <div className="border-t border-black/5 pt-3 space-y-1.5">
              <p className="text-[10px] font-semibold text-text-light uppercase tracking-widest px-1">Seat</p>
              <p className="text-[10px] text-text-light px-1 leading-relaxed">
                Click canvas to place a seat. Seats placed near a table are automatically associated with it.
              </p>
              <div className="flex items-center gap-1.5 px-1 mt-1">
                <svg width="14" height="14"><circle cx="7" cy="7" r="6" fill="#fef3c7" stroke="#d4920b" strokeWidth="1.5"/></svg>
                <span className="text-[10px] text-text-light">Near a table</span>
              </div>
              <div className="flex items-center gap-1.5 px-1">
                <svg width="14" height="14"><circle cx="7" cy="7" r="6" fill="#e5e7eb" stroke="#6b7280" strokeWidth="1.5"/></svg>
                <span className="text-[10px] text-text-light">Free seat</span>
              </div>
            </div>
          )}

          {/* Line tool hint */}
          {LINE_TOOLS.includes(tool as ElementKind) && (
            <div className="border-t border-black/5 pt-3">
              <p className="text-[10px] text-text-light px-1 leading-relaxed">Click + drag to draw. Release to place.</p>
            </div>
          )}

          {/* Point tool hint */}
          {POINT_TOOLS.includes(tool as ElementKind) && (
            <div className="border-t border-black/5 pt-3">
              <p className="text-[10px] text-text-light px-1 leading-relaxed">Click canvas to place.</p>
            </div>
          )}
        </aside>

        {/* ══════════════════════
            CANVAS
        ══════════════════════ */}
        <div ref={canvasWrap} className="flex-1 overflow-auto bg-cream p-4">
          {loading ? (
            <div className="bg-white rounded-2xl border border-black/5 flex items-center justify-center text-text-light" style={{ height: CANVAS_H }}>
              Loading floor plan…
            </div>
          ) : (
            <div className="relative bg-white rounded-2xl border border-black/8 shadow-sm overflow-hidden"
              style={{ height: CANVAS_H, cursor: tool === "select" ? "default" : "crosshair" }}>

              <svg ref={svgRef} className="absolute inset-0 w-full h-full select-none"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={() => { dragging.current = null; drawing.current = null; setPreview(null); setSeatPreview(null); }}>

                {/* Grid */}
                <defs>
                  <pattern id="sg" width={GRID} height={GRID} patternUnits="userSpaceOnUse">
                    <path d={`M ${GRID} 0 L 0 0 0 ${GRID}`} fill="none" stroke="#d4920b" strokeWidth="0.3" opacity="0.4"/>
                  </pattern>
                  <pattern id="lg" width={GRID*5} height={GRID*5} patternUnits="userSpaceOnUse">
                    <rect width={GRID*5} height={GRID*5} fill="url(#sg)"/>
                    <path d={`M ${GRID*5} 0 L 0 0 0 ${GRID*5}`} fill="none" stroke="#d4920b" strokeWidth="0.6" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#lg)"/>

                {/* ── Floor elements ── */}
                {elements.map((el) => {
                  const style = ELEMENT_STYLE[el.kind];
                  const isSel = selected?.kind === "element" && selected.id === el.id;

                  if (isLineKind(el.kind) && el.x2 != null && el.y2 != null) {
                    return (
                      <g key={el.id}>
                        <line x1={el.x1} y1={el.y1} x2={el.x2} y2={el.y2}
                          stroke={isSel ? "#d4920b" : style.stroke}
                          strokeWidth={style.strokeW + (isSel ? 2 : 0)}
                          strokeDasharray={style.dash} strokeLinecap="round"/>
                        {el.kind === "door" && (() => {
                          const len = dist(el.x1, el.y1, el.x2!, el.y2!);
                          const angle = Math.atan2(el.y2! - el.y1, el.x2! - el.x1) * 180 / Math.PI;
                          return <path d={`M ${el.x1} ${el.y1} A ${len} ${len} 0 0 1 ${el.x2} ${el.y2}`}
                            fill="none" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.5"
                            transform={`rotate(${angle - 90}, ${el.x1}, ${el.y1})`}/>;
                        })()}
                        {isSel && (<>
                          <circle cx={el.x1} cy={el.y1} r={6} fill="white" stroke="#d4920b" strokeWidth={2} style={{ cursor: "move" }}/>
                          <circle cx={el.x2} cy={el.y2} r={6} fill="white" stroke="#d4920b" strokeWidth={2} style={{ cursor: "move" }}/>
                        </>)}
                      </g>
                    );
                  }
                  if (el.kind === "label") {
                    return <text key={el.id} x={el.x1} y={el.y1} fontSize="13" fontWeight="600"
                      fill={isSel ? "#d4920b" : "#7a7a7a"} fontFamily="sans-serif" style={{ userSelect: "none" }}>
                      {el.label}
                    </text>;
                  }
                  return (
                    <g key={el.id}>
                      <circle cx={el.x1} cy={el.y1} r={POINT_R}
                        fill={style.fill ?? "#eee"} stroke={isSel ? "#d4920b" : style.stroke}
                        strokeWidth={isSel ? 3 : style.strokeW}/>
                      <text x={el.x1} y={el.y1 + 4} textAnchor="middle" fontSize="9" fontWeight="700"
                        fill={isSel ? "#d4920b" : style.stroke} fontFamily="sans-serif" style={{ userSelect: "none" }}>
                        {style.label.slice(0,3).toUpperCase()}
                      </text>
                    </g>
                  );
                })}

                {/* ── Draw preview ── */}
                {drawing.current && preview && (
                  <line x1={drawing.current.x1} y1={drawing.current.y1} x2={preview.x2} y2={preview.y2}
                    stroke={ELEMENT_STYLE[tool as ElementKind]?.stroke ?? "#999"}
                    strokeWidth={ELEMENT_STYLE[tool as ElementKind]?.strokeW ?? 3}
                    strokeDasharray={ELEMENT_STYLE[tool as ElementKind]?.dash ?? "6 3"}
                    strokeLinecap="round" opacity="0.6"/>
                )}

                {/* ── Tables ── */}
                {tables.map((t) => {
                  const isSel  = selected?.kind === "table" && selected.id === t.id;
                  const isRound = t.shape === "round";
                  return (
                    <g key={t.id} style={{ cursor: tool === "select" ? "grab" : "default" }}>
                      {isRound ? (
                        <circle cx={t.x} cy={t.y} r={TABLE_R}
                          fill={isSel ? "rgba(212,146,11,0.18)" : "rgba(254,243,199,0.95)"}
                          stroke={isSel ? "#d4920b" : "rgba(212,146,11,0.55)"}
                          strokeWidth={isSel ? 2.5 : 1.5}/>
                      ) : (
                        <rect x={t.x - TABLE_W/2} y={t.y - TABLE_H/2} width={TABLE_W} height={TABLE_H} rx={8}
                          fill={isSel ? "rgba(212,146,11,0.18)" : "rgba(254,243,199,0.95)"}
                          stroke={isSel ? "#d4920b" : "rgba(212,146,11,0.55)"}
                          strokeWidth={isSel ? 2.5 : 1.5}/>
                      )}
                      <text x={t.x} y={t.y + 5} textAnchor="middle" fontSize="11" fontWeight="700"
                        fill={isSel ? "#d4920b" : "#1a1a1a"} fontFamily="sans-serif" style={{ userSelect: "none" }}>
                        {t.name}
                      </text>
                    </g>
                  );
                })}

                {/* ── Seats ── */}
                {seats.map((s) => {
                  const isSel     = selected?.kind === "seat" && selected.id === s.id;
                  const hasTable  = s.table_id != null;
                  return (
                    <g key={s.id} style={{ cursor: tool === "select" ? "grab" : "default" }}>
                      {/* chair back arc */}
                      <path
                        d={`M ${s.x - SEAT_R + 2} ${s.y - 2} A ${SEAT_R - 1} ${SEAT_R - 1} 0 0 1 ${s.x + SEAT_R - 2} ${s.y - 2}`}
                        fill="none"
                        stroke={isSel ? "#d4920b" : hasTable ? "#92400e" : "#6b7280"}
                        strokeWidth={2.5} strokeLinecap="round"
                      />
                      {/* seat pad */}
                      <circle cx={s.x} cy={s.y + 3} r={SEAT_R - 1}
                        fill={isSel ? "rgba(212,146,11,0.2)" : hasTable ? "#fef3c7" : "#e5e7eb"}
                        stroke={isSel ? "#d4920b" : hasTable ? "#d97706" : "#9ca3af"}
                        strokeWidth={isSel ? 2 : 1.5}/>
                    </g>
                  );
                })}

                {/* ── Seat hover preview ── */}
                {seatPreview && (
                  <g opacity="0.5" style={{ pointerEvents: "none" }}>
                    <path
                      d={`M ${seatPreview.x - SEAT_R + 2} ${seatPreview.y - 2} A ${SEAT_R - 1} ${SEAT_R - 1} 0 0 1 ${seatPreview.x + SEAT_R - 2} ${seatPreview.y - 2}`}
                      fill="none" stroke={seatPreview.nearTable ? "#d4920b" : "#6b7280"}
                      strokeWidth={2.5} strokeLinecap="round"/>
                    <circle cx={seatPreview.x} cy={seatPreview.y + 3} r={SEAT_R - 1}
                      fill={seatPreview.nearTable ? "#fef3c7" : "#e5e7eb"}
                      stroke={seatPreview.nearTable ? "#d97706" : "#9ca3af"} strokeWidth={1.5}/>
                  </g>
                )}

                {/* ── Pending label marker ── */}
                {pendingLabel && <circle cx={pendingLabel.x} cy={pendingLabel.y} r={4} fill="#9333ea" opacity="0.7"/>}
              </svg>

              {/* ── Label input overlay ── */}
              {pendingLabel && (
                <div style={{ position: "absolute", left: pendingLabel.x + 8, top: pendingLabel.y - 16, zIndex: 20 }}
                  className="flex items-center gap-1 bg-white border border-purple-300 rounded-lg shadow-lg px-2 py-1">
                  <input autoFocus type="text" placeholder="Label text…" value={labelText}
                    onChange={(e) => setLabelText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") submitLabel(); if (e.key === "Escape") setPendingLabel(null); }}
                    className="text-sm outline-none w-32"/>
                  <button onClick={submitLabel} className="text-purple-600 text-xs font-bold hover:text-purple-800">✓</button>
                </div>
              )}

              {/* Empty state */}
              {tables.length === 0 && elements.length === 0 && seats.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-text-light">
                  <svg className="w-10 h-10 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M14 3v18"/>
                  </svg>
                  <p className="text-sm">Select a tool on the left to start designing</p>
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-text-light mt-2">
            {tool === "select" ? "Click to select · Drag to move"
              : tool === "seat"  ? "Click to place a seat · Gold = linked to table · Grey = free seat"
              : LINE_TOOLS.includes(tool as ElementKind) ? "Click and drag to draw · Release to place"
              : "Click to place"}
          </p>
        </div>

        {/* ══════════════════════
            RIGHT PANEL
        ══════════════════════ */}
        <aside className="w-56 shrink-0 bg-white border-l border-black/5 p-4 space-y-4 overflow-y-auto">

          {/* Selected table */}
          {selTable && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-text-dark uppercase tracking-wider">Table</h3>
              <div>
                <label className="block text-[10px] font-semibold text-text-light uppercase tracking-wider mb-1">Name</label>
                <input type="text" value={selTable.name} onChange={(e) => updateTable({ name: e.target.value })} className="input-base text-sm py-1.5"/>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-text-light uppercase tracking-wider mb-1">Shape</label>
                <div className="flex gap-1">
                  {(["round","rect"] as TableShape[]).map((s) => (
                    <button key={s} onClick={() => updateTable({ shape: s })}
                      className={`flex-1 py-1 text-xs font-semibold rounded-lg border transition-all
                        ${selTable.shape === s ? "border-gold bg-gold/10 text-gold" : "border-black/10 text-text-light"}`}>
                      {s === "round" ? "⬤" : "▬"}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-text-light">
                {seatsForTable(selTable.id)} seat{seatsForTable(selTable.id) !== 1 ? "s" : ""} linked<br/>
                x: {Math.round(selTable.x)}, y: {Math.round(selTable.y)}
              </p>
              <button onClick={deleteSelected}
                className="w-full py-2 text-xs font-semibold border-2 border-red-200 text-red-500 rounded-full hover:bg-red-50 transition-all">
                Remove Table
              </button>
            </div>
          )}

          {/* Selected seat */}
          {selSeat && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-text-dark uppercase tracking-wider">Seat</h3>
              <p className="text-[10px] text-text-light leading-relaxed">
                {selSeat.table_id
                  ? <>Linked to: <strong>{tables.find((t) => t.id === selSeat.table_id)?.name ?? "unknown"}</strong></>
                  : "Free-floating (not linked to a table)"}
                <br/>x: {Math.round(selSeat.x)}, y: {Math.round(selSeat.y)}
              </p>
              <button onClick={deleteSelected}
                className="w-full py-2 text-xs font-semibold border-2 border-red-200 text-red-500 rounded-full hover:bg-red-50 transition-all">
                Remove Seat
              </button>
            </div>
          )}

          {/* Selected element */}
          {selElement && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-text-dark uppercase tracking-wider">{ELEMENT_STYLE[selElement.kind].label}</h3>
              {selElement.kind === "label" && (
                <div>
                  <label className="block text-[10px] font-semibold text-text-light uppercase tracking-wider mb-1">Text</label>
                  <input type="text" value={selElement.label ?? ""}
                    onChange={async (e) => {
                      const label = e.target.value;
                      setElements((p) => p.map((el) => el.id === selElement.id ? { ...el, label } : el));
                      await supabase.from("floor_elements").update({ label }).eq("id", selElement.id);
                    }}
                    className="input-base text-sm py-1.5"/>
                </div>
              )}
              {isLineKind(selElement.kind) && selElement.x2 != null && (
                <p className="text-[10px] text-text-light leading-relaxed">
                  Length: {Math.round(dist(selElement.x1, selElement.y1, selElement.x2!, selElement.y2!))}px
                </p>
              )}
              <button onClick={deleteSelected}
                className="w-full py-2 text-xs font-semibold border-2 border-red-200 text-red-500 rounded-full hover:bg-red-50 transition-all">
                Remove
              </button>
            </div>
          )}

          {!selTable && !selSeat && !selElement && (
            <p className="text-xs text-text-light">Select an item to edit it.</p>
          )}

          {/* Capacity summary */}
          <div className="border-t border-black/5 pt-4 space-y-1.5">
            <h3 className="text-[10px] font-semibold text-text-dark uppercase tracking-wider mb-2">Capacity</h3>
            {tables.length === 0 ? (
              <p className="text-xs text-text-light">No tables yet.</p>
            ) : tables.map((t) => {
              const sc = seatsForTable(t.id);
              return (
                <div key={t.id} className="flex justify-between text-xs">
                  <button onClick={() => { setSelected({ kind: "table", id: t.id }); setTool("select"); }}
                    className="text-text-body hover:text-gold transition-colors truncate max-w-[110px]">{t.name}</button>
                  <span className="text-text-light">{sc} seat{sc !== 1 ? "s" : ""}</span>
                </div>
              );
            })}
            {seats.filter((s) => !s.table_id).length > 0 && (
              <div className="flex justify-between text-xs text-text-light">
                <span>Unlinked</span>
                <span>{seats.filter((s) => !s.table_id).length}</span>
              </div>
            )}
            <div className={`flex justify-between text-xs font-semibold pt-1.5 border-t border-black/5 ${totalSeats > 16 ? "text-red-500" : "text-gold"}`}>
              <span>Total seats</span>
              <span>{totalSeats}</span>
            </div>
            {totalSeats > 16 && <p className="text-[10px] text-red-500">Exceeds 16-seat limit.</p>}
          </div>

          {/* Legend */}
          <div className="border-t border-black/5 pt-4 space-y-1.5">
            <h3 className="text-[10px] font-semibold text-text-dark uppercase tracking-wider mb-2">Legend</h3>
            <div className="flex items-center gap-2 text-[11px] text-text-body">
              <svg width="20" height="14"><circle cx="10" cy="9" r="7" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5"/></svg>
              Seat (linked)
            </div>
            <div className="flex items-center gap-2 text-[11px] text-text-body">
              <svg width="20" height="14"><circle cx="10" cy="9" r="7" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1.5"/></svg>
              Seat (free)
            </div>
            {(Object.entries(ELEMENT_STYLE) as [ElementKind, typeof ELEMENT_STYLE[ElementKind]][]).map(([kind, s]) => (
              <div key={kind} className="flex items-center gap-2 text-[11px] text-text-body">
                <svg width="20" height="10">
                  {isLineKind(kind)
                    ? <line x1="0" y1="5" x2="20" y2="5" stroke={s.stroke} strokeWidth={Math.min(s.strokeW, 3)} strokeDasharray={s.dash}/>
                    : <circle cx="10" cy="5" r="4" fill={s.fill ?? s.stroke} stroke={s.stroke} strokeWidth="1"/>}
                </svg>
                {s.label}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
