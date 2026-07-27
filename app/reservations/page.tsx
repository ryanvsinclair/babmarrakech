import { SiteHeader } from "../components/site-header";
import Link from "next/link";

export default function ReservationsPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-24">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-px bg-gold" />
            <span className="text-gold text-xs font-semibold tracking-[0.25em] uppercase">Bab Marrakech</span>
            <span className="w-8 h-px bg-gold" />
          </div>

          <h1 className="text-4xl font-serif text-text-dark mb-4">
            We Are <span className="text-gold-gradient">Closed</span>
          </h1>
          <p className="text-text-body leading-relaxed mb-4 text-lg">
            Bab Marrakech is no longer accepting reservations. We have cherished
            every meal shared and every guest we had the pleasure of welcoming
            through our doors.
          </p>
          <p className="text-text-body leading-relaxed mb-10">
            We are exploring the possibility of bringing our Moroccan hospitality
            to a new city in the near future. Thank you, Ottawa, from the bottom
            of our hearts.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gold text-white font-semibold rounded-full hover:bg-gold-light transition-all duration-300 hover:scale-105 shadow-lg shadow-gold/20"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </main>
    </>
  );
}
