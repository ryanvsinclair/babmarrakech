"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { siteNavLinks, sitePhone, siteReservation } from "../navigation";

type SiteHeaderProps = {
  transparentOnTop?: boolean;
};

function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
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

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function SiteHeader({
  transparentOnTop = false,
}: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!transparentOnTop) {
      return;
    }

    const handleScroll = () => setScrolled(window.scrollY > 60);

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [transparentOnTop]);

  const isScrolled = !transparentOnTop || scrolled;

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-brown-deep/95 py-3 shadow-lg backdrop-blur-md"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl tracking-wide text-white">
            Bab <span className="font-bold text-gold">Marrakech</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {siteNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium uppercase tracking-wide text-white/80 transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-5 lg:flex">
          <a
            href={sitePhone.href}
            className="flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-gold"
          >
            <PhoneIcon />
            {sitePhone.label}
          </a>
          <Link
            href={siteReservation.href}
            className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-gold/30 transition-all duration-300 hover:scale-105 hover:bg-gold-light"
          >
            {siteReservation.label}
          </Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="p-2 text-white lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="animate-fade-in border-t border-white/10 bg-brown-deep/98 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6">
            {siteNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="border-b border-white/5 py-2 text-lg text-white/90 transition-colors hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={sitePhone.href}
              className="flex items-center gap-2 py-2 text-white/80 transition-colors hover:text-gold"
            >
              <PhoneIcon />
              {sitePhone.label}
            </a>
            <Link
              href={siteReservation.href}
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 rounded-full bg-gold px-6 py-3 text-center font-semibold text-white transition-all hover:bg-gold-light"
            >
              {siteReservation.label}
            </Link>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
