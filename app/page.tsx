"use client";

import { useState, useEffect, useCallback } from "react";

/* ══════════════════════════════════════════
   DATA
   ══════════════════════════════════════════ */

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Hours", href: "#hours" },
  { label: "Reviews", href: "#reviews" },
  { label: "Find Us", href: "#map" },
];

const HOURS = [
  { day: "Monday", time: "Closed", closed: true },
  { day: "Tuesday", time: "10:00 AM – 9:00 PM" },
  { day: "Wednesday", time: "10:00 AM – 9:00 PM" },
  { day: "Thursday", time: "10:00 AM – 9:00 PM" },
  { day: "Friday", time: "10:00 AM – 9:00 PM" },
  { day: "Saturday", time: "10:00 AM – 9:00 PM" },
  { day: "Sunday", time: "10:00 AM – 9:00 PM" },
];

const MENU_ITEMS = [
  {
    name: "Lamb Tagine",
    desc: "Slow-cooked lamb with prunes, almonds & saffron in a traditional clay pot",
    price: "$24",
    category: "Tagines",
    img: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&q=80",
  },
  {
    name: "Royal Couscous",
    desc: "Fluffy semolina with seven vegetables, tender meat & aromatic broth",
    price: "$22",
    category: "Couscous",
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80",
  },
  {
    name: "Chicken Bastilla",
    desc: "Flaky pastry filled with spiced chicken, almonds, dusted with cinnamon",
    price: "$18",
    category: "Starters",
    img: "https://images.unsplash.com/photo-1511690743698-d9d18f7e20f1?w=600&q=80",
  },
  {
    name: "Kefta Tagine",
    desc: "Spiced meatballs in rich tomato-cumin sauce with a poached egg",
    price: "$20",
    category: "Tagines",
    img: "https://images.unsplash.com/photo-1547424850-28ac9a1da4d2?w=600&q=80",
  },
  {
    name: "Moroccan Mint Tea",
    desc: "Traditional gunpowder green tea with fresh spearmint & sugar",
    price: "$5",
    category: "Drinks",
    img: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&q=80",
  },
  {
    name: "Moroccan Sandwich",
    desc: "House-made khobz bread with spiced proteins, harissa & preserved lemons",
    price: "$14",
    category: "Sandwiches",
    img: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80",
  },
];

const FALLBACK_REVIEWS = [
  {
    name: "Kaoutar Bendraoui",
    date: "1 week ago",
    rating: 5,
    text: "Absolutely loved my experience at this Moroccan restaurant! The food was fresh, flavorful, and truly authentic. The service was excellent, attentive, polite, and very professional. The atmosphere was warm and welcoming, just like home. Highly recommended!",
    source: "google",
  },
  {
    name: "Sophie Laurent",
    date: "2 weeks ago",
    rating: 5,
    text: "Best Moroccan food in Ottawa, hands down! The lamb tagine was incredibly tender and the couscous was perfectly fluffy. Chef Hasna's attention to detail is remarkable. Can't wait to come back!",
    source: "google",
  },
  {
    name: "Ahmed El-Fassi",
    date: "3 weeks ago",
    rating: 5,
    text: "As a Moroccan expat, finding authentic food is always a challenge. Bab Marrakech exceeded my expectations — the flavors reminded me of home. The mint tea ceremony is a must-try!",
    source: "google",
  },
  {
    name: "Emily Thompson",
    date: "1 month ago",
    rating: 5,
    text: "We booked through OpenTable for a birthday dinner and the experience was magical. The staff went above and beyond to make it special. The bastilla was the best I've ever had outside of Morocco!",
    source: "opentable",
  },
  {
    name: "Rachid Amrani",
    date: "1 month ago",
    rating: 5,
    text: "The warmth of this place hits you as soon as you walk in. Every dish tells a story of tradition and love. The kefta tagine is perfection. This is what Moroccan hospitality is all about.",
    source: "google",
  },
  {
    name: "Charlotte Dubois",
    date: "2 months ago",
    rating: 5,
    text: "Found this gem through OpenTable and so glad we did! The food was extraordinary — every bite was an explosion of authentic Moroccan spices. The service was attentive without being overbearing. Already made our next reservation!",
    source: "google",
  },
];

/* ══════════════════════════════════════════
   ICONS (inline SVGs)
   ══════════════════════════════════════════ */

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const StarIcon = ({ filled = true }: { filled?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={filled ? 0 : 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ══════════════════════════════════════════
   HELPER: get today's day name
   ══════════════════════════════════════════ */
function getTodayName() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

/* ══════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════ */
export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS);
  const [overallRating, setOverallRating] = useState<number | null>(5.0);
  const [totalReviews, setTotalReviews] = useState<number | null>(84);
  const today = getTodayName();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch live Google reviews
  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews && data.reviews.length > 0) {
          setReviews(data.reviews);
        }
        if (data.overallRating) setOverallRating(data.overallRating);
        if (data.totalReviews) setTotalReviews(data.totalReviews);
      })
      .catch(() => {
        // keep fallback reviews on error
      });
  }, []);

  // Auto-rotate reviews
  useEffect(() => {
    const timer = setInterval(() => {
      setReviewIndex((i) => (i + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  const prevReview = useCallback(() => {
    setReviewIndex((i) => (i - 1 + reviews.length) % reviews.length);
  }, [reviews.length]);

  const nextReview = useCallback(() => {
    setReviewIndex((i) => (i + 1) % reviews.length);
  }, [reviews.length]);

  return (
    <>
      {/* ────────── NAVBAR ────────── */}
      <nav
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-brown-deep/95 backdrop-blur-md shadow-lg py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <span className="font-serif text-2xl text-white tracking-wide">
              Bab <span className="text-gold font-bold">Marrakech</span>
            </span>
          </a>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/80 hover:text-gold transition-colors tracking-wide uppercase"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-5">
            <a
              href="tel:3433220322"
              className="flex items-center gap-2 text-sm text-white/80 hover:text-gold transition-colors"
            >
              <PhoneIcon />
              (343) 322-0322
            </a>
            <a
              href="#reserve"
              className="px-6 py-2.5 bg-gold text-white text-sm font-semibold rounded-full hover:bg-gold-light transition-all duration-300 hover:scale-105 shadow-lg shadow-gold/30"
            >
              Book a Table
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-brown-deep/98 backdrop-blur-xl border-t border-white/10 animate-fade-in">
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg text-white/90 hover:text-gold transition-colors py-2 border-b border-white/5"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="tel:3433220322"
                className="flex items-center gap-2 text-white/80 hover:text-gold transition-colors py-2"
              >
                <PhoneIcon />
                (343) 322-0322
              </a>
              <a
                href="#reserve"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 px-6 py-3 bg-gold text-white text-center font-semibold rounded-full hover:bg-gold-light transition-all"
              >
                Book a Table
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ────────── HERO ────────── */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=1920&q=85')",
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 moroccan-pattern opacity-30" />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          {/* Decorative label */}
          <div className="animate-fade-in-up opacity-0 delay-100">
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-gold" />
              <span className="text-gold text-xs font-semibold tracking-[0.3em] uppercase">
                Authentic Moroccan Cuisine
              </span>
              <span className="w-8 h-px bg-gold" />
            </div>
          </div>

          <h1 className="animate-fade-in-up opacity-0 delay-200 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-white leading-tight mb-6">
            Bab <span className="text-gold-gradient">Marrakech</span>
          </h1>

          <p className="animate-fade-in-up opacity-0 delay-300 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-10">
            Where the warmth of Morocco meets the heart of Ottawa.
            <br className="hidden sm:block" />
            Experience authentic tagines, couscous, and the rich flavors of
            North Africa.
          </p>

          {/* Quick info chips */}
          <div className="animate-fade-in-up opacity-0 delay-400 flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-10 text-sm text-white/70">
            <span className="flex items-center gap-2">
              <ClockIcon />
              Tue–Sun: 10 AM – 9 PM
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gold" />
            <span className="flex items-center gap-2">
              <MapPinIcon />
              2182 Lamira St, Ottawa
            </span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-gold" />
            <span className="flex items-center gap-2">
              <PhoneIcon />
              (343) 322-0322
            </span>
          </div>

          {/* CTAs */}
          <div className="animate-fade-in-up opacity-0 delay-500 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#reserve"
              className="px-8 py-3.5 bg-gold text-white font-semibold rounded-full hover:bg-gold-light transition-all duration-300 hover:scale-105 shadow-xl shadow-gold/30 text-base"
            >
              Reserve a Table
            </a>
            <a
              href="#menu"
              className="px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-full hover:border-gold hover:text-gold transition-all duration-300 text-base"
            >
              View Menu
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 rounded-full bg-gold animate-pulse" />
          </div>
        </div>
      </section>

      {/* ────────── ABOUT / OUR STORY ────────── */}
      <section id="about" className="py-24 lg:py-32 bg-cream relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden shadow-xl aspect-[4/5]">
                  <img
                    src="/food1.png"
                    alt="Moroccan tagine dish"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-xl aspect-square">
                  <img
                    src="/food2.png"
                    alt="Moroccan meatballs"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-2xl overflow-hidden shadow-xl aspect-square">
                  <img
                    src="/food3.png"
                    alt="Couscous dish"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-xl aspect-[4/5]">
                  <img
                    src="/food4.png"
                    alt="Moroccan pastry"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>

            {/* Text */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-0.5 bg-gold" />
                <span className="text-gold text-xs font-semibold tracking-[0.25em] uppercase">
                  Our Story
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-serif text-text-dark leading-tight mb-8">
                A Taste of Morocco in the{" "}
                <span className="text-gold-gradient">Heart of Ottawa</span>
              </h2>
              <div className="space-y-5 text-text-body leading-relaxed text-base">
                <p>
                  At Bab Marrakech, we bring the vibrant flavors and warm
                  hospitality of Morocco to Ottawa&apos;s dining scene. Our name,
                  meaning &ldquo;Gate of Marrakech,&rdquo; represents our promise to
                  transport you through a gateway of authentic North African
                  culinary traditions.
                </p>
                <p>
                  Every dish is crafted with time-honored recipes passed down
                  through generations, using the finest spices — cumin, saffron,
                  cinnamon, and preserved lemons — that define Moroccan cuisine.
                  From our slow-cooked tagines to our fluffy couscous, each plate
                  tells a story of tradition and passion.
                </p>
                <p>
                  Whether you&apos;re craving a hearty lamb tagine, a classic chicken
                  bastilla, or our signature Moroccan sandwiches, we invite you to
                  experience the warmth of Moroccan hospitality right here in
                  Ottawa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── MEET THE CHEF ────────── */}
      <section
        id="chef"
        className="py-24 lg:py-32 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #FDF8F0 0%, #F5EDE0 50%, #FDF8F0 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute top-20 -left-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 -right-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-0.5 bg-gold" />
                <span className="text-gold text-xs font-semibold tracking-[0.25em] uppercase">
                  Meet the Chef
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-serif text-text-dark leading-tight mb-8">
                Cooking with <span className="text-gold-gradient">Love</span>
              </h2>
              <div className="space-y-5 text-text-body leading-relaxed text-base">
                <p>
                  Chef Hasna&apos;s journey began as a mother&apos;s love for
                  feeding her children, which has blossomed into a passion for
                  sharing authentic Moroccan flavors with the world. Every
                  tagine, every couscous dish, every pastry carries the warmth
                  of home-cooked meals and the joy of gathering around the
                  table.
                </p>
                <p>
                  Today, that same care and devotion goes into every dish we
                  serve. Because when you cook with love, everyone becomes
                  family.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-gold font-medium">
                <HeartIcon />
                <span className="italic">From our family to yours</span>
              </div>
            </div>

            {/* Chef portrait */}
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-gold/20 via-transparent to-gold/20 rounded-3xl blur-xl" />
                <div className="relative rounded-3xl overflow-hidden shadow-2xl max-w-md">
                  <img
                    src="/chefhasna.png"
                    alt="Chef Hasna"
                    className="w-full aspect-[3/4] object-cover"
                  />
                  {/* Gradient overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── MENU HIGHLIGHTS ────────── */}
      {/* 
      <section id="menu" className="py-24 lg:py-32 bg-brown-deep relative">
        <div className="absolute inset-0 moroccan-pattern opacity-20" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-10 h-0.5 bg-gold" />
              <span className="text-gold text-xs font-semibold tracking-[0.25em] uppercase">
                Our Menu
              </span>
              <span className="w-10 h-0.5 bg-gold" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-serif text-white leading-tight mb-4">
              Signature <span className="text-gold-gradient">Dishes</span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Each dish is a celebration of authentic Moroccan flavors, crafted
              with love and tradition
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {MENU_ITEMS.map((item) => (
              <div
                key={item.name}
                className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-gold/40 transition-all duration-500 hover:-translate-y-1"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 px-3 py-1 text-xs font-semibold bg-gold/90 text-white rounded-full">
                    {item.category}
                  </span>
                  <span className="absolute bottom-4 right-4 text-xl font-serif text-gold font-bold">
                    {item.price}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-serif text-white mb-2">
                    {item.name}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-gold text-gold font-semibold rounded-full hover:bg-gold hover:text-white transition-all duration-300"
            >
              View Full Menu
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>
      */}

      {/* ────────── OPENING HOURS ────────── */}
      <section id="hours" className="py-24 lg:py-32 bg-cream">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Hours table */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <ClockIcon />
                <span className="text-gold text-xs font-semibold tracking-[0.25em] uppercase">
                  Opening Hours
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-serif text-text-dark leading-tight mb-10">
                Visit Us <span className="text-gold-gradient">Today</span>
              </h2>

              <div className="space-y-1">
                {HOURS.map((h) => {
                  const isToday = h.day === today;
                  return (
                    <div
                      key={h.day}
                      className={`flex items-center justify-between py-4 px-5 rounded-xl transition-all ${
                        isToday
                          ? "bg-gold/10 border-l-4 border-gold"
                          : "border-b border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-medium ${
                            isToday ? "text-gold font-semibold" : "text-text-dark"
                          }`}
                        >
                          {h.day}
                        </span>
                        {isToday && (
                          <span className="text-[10px] font-bold bg-gold text-white px-2 py-0.5 rounded-full uppercase">
                            Today
                          </span>
                        )}
                      </div>
                      <span
                        className={`${
                          h.closed
                            ? "text-gold font-semibold"
                            : isToday
                            ? "text-gold font-semibold"
                            : "text-text-body"
                        }`}
                      >
                        {h.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact card */}
            <div className="flex items-end">
              <div className="w-full bg-brown-deep rounded-3xl p-10 text-white relative overflow-hidden">
                {/* Pattern */}
                <div className="absolute inset-0 moroccan-pattern opacity-10" />
                <div className="relative">
                  <h3 className="text-3xl font-serif mb-8">Get in Touch</h3>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPinIcon />
                      </div>
                      <div>
                        <p className="text-gold text-xs font-semibold tracking-wider uppercase mb-1">
                          Address
                        </p>
                        <p className="text-white/80">2182 Lamira St</p>
                        <p className="text-white/80">Ottawa, ON K1H 8L4</p>
                        <p className="text-white/80">Canada</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <PhoneIcon />
                      </div>
                      <div>
                        <p className="text-gold text-xs font-semibold tracking-wider uppercase mb-1">
                          Phone
                        </p>
                        <a
                          href="tel:3433220322"
                          className="text-white/80 hover:text-gold transition-colors"
                        >
                          (343) 322-0322
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MailIcon />
                      </div>
                      <div>
                        <p className="text-gold text-xs font-semibold tracking-wider uppercase mb-1">
                          Email
                        </p>
                        <a
                          href="mailto:hello@babmarakech.ca"
                          className="text-white/80 hover:text-gold transition-colors"
                        >
                          hello@babmarakech.ca
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10">
                    <p className="text-white/40 italic text-sm font-serif">
                      &ldquo;The aroma of spices will guide you to our
                      door&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────── REVIEWS ────────── */}
      <section
        id="reviews"
        className="py-24 lg:py-32 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #FDF8F0 0%, #FFF8EB 50%, #FDF8F0 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-4xl mx-auto px-6">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="w-10 h-0.5 bg-gold" />
              <span className="text-gold text-xs font-semibold tracking-[0.25em] uppercase">
                Guest Reviews
              </span>
              <span className="w-10 h-0.5 bg-gold" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-serif text-text-dark leading-tight mb-4">
              What Our{" "}
              <span className="text-gold-gradient">Guests Say</span>
            </h2>
            <p className="text-text-body max-w-xl mx-auto">
              Reviews from OpenTable diners and Google — {totalReviews}+ verified reviews
            </p>

            {/* Overall rating */}
            <div className="mt-8 flex flex-col items-center gap-2">
              <div className="flex gap-1 text-gold">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} />
                ))}
              </div>
              <p className="text-2xl font-bold text-text-dark">
                {overallRating?.toFixed(1) ?? "5.0"} <span className="text-base font-normal text-text-body">out of 5</span>
              </p>
              <p className="text-sm text-text-light flex items-center gap-1">
                <MapPinIcon /> Based on {totalReviews} Google &amp; OpenTable Reviews
              </p>
            </div>
          </div>

          {/* Review carousel */}
          <div className="relative">
            {/* Navigation arrows */}
            <button
              onClick={prevReview}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-6 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-text-body hover:text-gold hover:shadow-xl transition-all"
              aria-label="Previous review"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={nextReview}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-6 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-text-body hover:text-gold hover:shadow-xl transition-all"
              aria-label="Next review"
            >
              <ChevronRight />
            </button>

            {/* Review card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 mx-8 sm:mx-10 min-h-[280px] flex flex-col justify-between transition-all duration-500">
              <div>
                {/* Reviewer info */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-lg">
                      {reviews[reviewIndex].name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-text-dark">
                        {reviews[reviewIndex].name}
                      </p>
                      <p className="text-sm text-text-light">
                        {reviews[reviewIndex].date}
                      </p>
                    </div>
                  </div>
                  {/* Source badge */}
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      reviews[reviewIndex].source === "google"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {reviews[reviewIndex].source === "google" ? "Google" : "OpenTable"}
                  </div>
                </div>

                {/* Stars */}
                <div className="flex gap-1 text-gold mb-4">
                  {[...Array(reviews[reviewIndex].rating)].map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>

                {/* Text */}
                <p className="text-text-body leading-relaxed text-base italic">
                  &ldquo;{reviews[reviewIndex].text}&rdquo;
                </p>
              </div>

              {/* Source link */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <a
                  href={
                    reviews[reviewIndex].source === "google"
                      ? "https://www.google.com/maps/place/Bab+Marrakech/"
                      : "https://www.opentable.com"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gold hover:text-gold-dark transition-colors flex items-center gap-1"
                >
                  View on{" "}
                  {reviews[reviewIndex].source === "google"
                    ? "Google"
                    : "OpenTable"}{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Dots indicator */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setReviewIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === reviewIndex
                      ? "bg-gold w-6"
                      : "bg-gold/30 hover:bg-gold/50"
                  }`}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Trust note */}
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/70 backdrop-blur-sm rounded-full border border-gold/10 text-sm text-text-body">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-gold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              All reviews are from verified Google &amp; OpenTable users
            </div>
          </div>

          {/* CTA links */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm">
            <a
              href="https://www.google.com/maps/place/Bab+Marrakech/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gold hover:text-gold-dark transition-colors font-medium"
            >
              <MapPinIcon /> View all reviews on Google Maps
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ────────── RESERVATION CTA ────────── */}
      <section
        id="reserve"
        className="py-24 lg:py-32 bg-brown-deep relative overflow-hidden"
      >
        <div className="absolute inset-0 moroccan-pattern opacity-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/5 rounded-full blur-3xl -translate-y-1/2" />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-10 h-0.5 bg-gold" />
            <span className="text-gold text-xs font-semibold tracking-[0.25em] uppercase">
              Reserve Your Table
            </span>
            <span className="w-10 h-0.5 bg-gold" />
          </div>
          <h2 className="text-4xl lg:text-5xl font-serif text-white leading-tight mb-6">
            Experience the Magic of{" "}
            <span className="text-gold-gradient">Morocco</span>
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto mb-10">
            Book your table and let us take you on a culinary journey through
            the vibrant streets of Marrakech
          </p>

          {/* OpenTable widget placeholder */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-8">
            <p className="text-white/50 text-sm mb-4 uppercase tracking-wider">
              Reserve via OpenTable
            </p>
            {/* This is where you'd embed the actual OpenTable widget */}
            <div className="bg-white/10 rounded-xl p-8 mb-4 flex items-center justify-center">
              <p className="text-white/80 text-xl font-medium">
                OpenTable Coming Soon
              </p>
            </div>
            <p className="text-white/40 text-xs">
              Or call us directly at{" "}
              <a
                href="tel:3433220322"
                className="text-gold hover:text-gold-light transition-colors"
              >
                (343) 322-0322
              </a>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:3433220322"
              className="px-8 py-3.5 bg-gold text-white font-semibold rounded-full hover:bg-gold-light transition-all duration-300 hover:scale-105 shadow-xl shadow-gold/30 flex items-center gap-2"
            >
              <PhoneIcon />
              Call to Reserve
            </a>
            <a
              href="mailto:hello@babmarakech.ca"
              className="px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-full hover:border-gold hover:text-gold transition-all duration-300 flex items-center gap-2"
            >
              <MailIcon />
              Email Us
            </a>
          </div>
        </div>
      </section>

      {/* ────────── GOOGLE MAP ────────── */}
      <section id="map" className="relative">
        <div className="bg-cream py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="w-10 h-0.5 bg-gold" />
                <span className="text-gold text-xs font-semibold tracking-[0.25em] uppercase">
                  Find Us
                </span>
                <span className="w-10 h-0.5 bg-gold" />
              </div>
              <h2 className="text-4xl lg:text-5xl font-serif text-text-dark leading-tight mb-4">
                Visit <span className="text-gold-gradient">Bab Marrakech</span>
              </h2>
              <p className="text-text-body">
                2182 Lamira St, Ottawa, ON K1H 8L4, Canada
              </p>
            </div>

            {/* Map embed */}
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2801.5!2d-75.6656!3d45.3976!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cce052b0b6d6a35%3A0x4a9b1e7f07a5f1b6!2s2182%20Lamira%20St%2C%20Ottawa%2C%20ON%20K1H%208L4%2C%20Canada!5e0!3m2!1sen!2sca!4v1700000000000!5m2!1sen!2sca"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bab Marrakech location on Google Maps"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ────────── FOOTER ────────── */}
      <footer className="bg-brown-deep text-white relative">
        <div className="absolute inset-0 moroccan-pattern opacity-5" />
        <div className="relative max-w-7xl mx-auto px-6">
          {/* Main footer */}
          <div className="py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <a href="#" className="inline-block mb-4">
                <span className="font-serif text-2xl text-white">
                  Bab <span className="text-gold font-bold">Marrakech</span>
                </span>
              </a>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Authentic Moroccan cuisine in the heart of Ottawa. Every dish
                tells a story of tradition, love, and the vibrant flavors of
                North Africa.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-gold text-xs font-semibold tracking-wider uppercase mb-6">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-white/60 hover:text-gold transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-gold text-xs font-semibold tracking-wider uppercase mb-6">
                Contact
              </h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li className="flex items-center gap-2">
                  <MapPinIcon />
                  2182 Lamira St, Ottawa
                </li>
                <li>
                  <a
                    href="tel:3433220322"
                    className="flex items-center gap-2 hover:text-gold transition-colors"
                  >
                    <PhoneIcon />
                    (343) 322-0322
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:hello@babmarakech.ca"
                    className="flex items-center gap-2 hover:text-gold transition-colors"
                  >
                    <MailIcon />
                    hello@babmarakech.ca
                  </a>
                </li>
              </ul>
            </div>

            {/* Hours summary */}
            <div>
              <h4 className="text-gold text-xs font-semibold tracking-wider uppercase mb-6">
                Hours
              </h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li>Monday: Closed</li>
                <li>Tue – Sun: 10 AM – 9 PM</li>
              </ul>
              <a
                href="#reserve"
                className="mt-6 inline-flex px-6 py-2.5 bg-gold text-white text-sm font-semibold rounded-full hover:bg-gold-light transition-all duration-300"
              >
                Book a Table
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <p>&copy; {new Date().getFullYear()} Bab Marrakech. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-gold transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-gold transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
