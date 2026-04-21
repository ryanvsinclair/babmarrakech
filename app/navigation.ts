export const siteNavLinks = [
  { label: "About", href: "/#about" },
  { label: "Menu", href: "/menu" },
  { label: "Hours", href: "/#hours" },
  { label: "Reviews", href: "/#reviews" },
  { label: "Find Us", href: "/#map" },
] as const;

export const sitePhone = {
  href: "tel:3433220322",
  label: "(343) 322-0322",
} as const;

export const siteReservation = {
  href: "/reservations",
  label: "Book a Table",
} as const;
