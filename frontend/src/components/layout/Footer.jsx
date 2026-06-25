import { Link } from "react-router-dom";
import { ShieldCheck, Sparkles, Headphones, Wallet } from "lucide-react";
import BrandLogo from "../branding/BrandLogo";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Home", to: "/" },
      { label: "Guides", to: "/guides" },
      { label: "Tours", to: "/guides" },
    ],
  },
  {
    title: "Traveler",
    links: [
      { label: "My Bookings", to: "/dashboard" },
      { label: "Reviews", to: "/reviews" },
      { label: "Profile", to: "/profile" },
    ],
  },
  {
    title: "Guide Tools",
    links: [
      { label: "Dashboard", to: "/guide/dashboard" },
      { label: "Manage Tours", to: "/guide/tours" },
      { label: "Guide Profile", to: "/guide/profile" },
    ],
  },
];

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Verified Guides",
    text: "Local experts with verified profiles, background checks, and genuine traveler reviews.",
  },
  {
    icon: Sparkles,
    title: "Clear Pricing",
    text: "Browse and compare itineraries with transparent, all-inclusive pricing — no hidden fees.",
  },
  {
    icon: Headphones,
    title: "Responsive Support",
    text: "Our support team is available to help with booking questions, changes, and on-trip assistance.",
  },
  {
    icon: Wallet,
    title: "Secure Payments",
    text: "Every transaction is encrypted and protected. Booking totals and statuses stay fully transparent.",
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 px-4 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[28px] bg-[#08111f] px-5 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:px-8 lg:px-10">
        <div className="grid gap-8 pb-8 lg:grid-cols-[1.1fr_1.3fr]">
          <div className="max-w-sm">
            <BrandLogo compact />
            <p className="mt-4 text-sm leading-6 text-white/55">
              Connecting travelers with trusted local guides for calmer
              planning, cleaner bookings, and better on-the-ground experiences.
            </p>
            {/* Social Media Links */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.03] text-white/60 transition hover:bg-[#75d780]/20 hover:text-[#75d780] shadow-sm"
                aria-label="Facebook"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.03] text-white/60 transition hover:bg-[#75d780]/20 hover:text-[#75d780] shadow-sm"
                aria-label="Twitter"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.028-12.079c0-.21-.005-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.03] text-white/60 transition hover:bg-[#75d780]/20 hover:text-[#75d780] shadow-sm"
                aria-label="Instagram"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.03] text-white/60 transition hover:bg-[#75d780]/20 hover:text-[#75d780] shadow-sm"
                aria-label="LinkedIn"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <p className="text-sm font-semibold text-white relative inline-block after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-1/2 after:h-[2px] after:bg-[#75d780]">
                  {group.title}
                </p>
                <div className="mt-6 grid gap-3">
                  {group.links.map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      className="text-sm text-white/52 transition hover:text-[#75d780]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Subscription Box */}
        <div className="my-8">
          <div className="flex flex-col gap-4 rounded-2xl bg-white/[0.02] p-4 shadow-sm sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Stay updated</p>
              <p className="text-xs text-white/45">
                Get travel tips and exclusive offers
              </p>
            </div>
            {/* <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full rounded-lg bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#75d780] sm:w-64"
              />
              <Link
                to="/register"
                className="rounded-md bg-[#75d780] px-5 py-2 text-sm font-bold uppercase tracking-[0.16em] text-[#071120] transition hover:bg-[#89e894] hover:shadow-lg hover:shadow-[#75d780]/25"
              >
                Join Now
              </Link> */}
          </div>
        </div>

        {/* Trust Cards - No borders, just shadow */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-[20px] bg-white/[0.03] p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#75d780]/12 text-[#8ceb97]">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold text-white">{title}</p>
              <p className="mt-2 text-sm leading-6 text-white/45">{text}</p>
            </article>
          ))}
        </div>

        {/* Bottom Bar - No border */}
        <div className="mt-8 flex flex-col gap-4 pt-6 text-sm text-white/38 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} TravelMate. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/" className="transition hover:text-[#75d780]">
              Home
            </Link>
            <Link to="/guides" className="transition hover:text-[#75d780]">
              Guides
            </Link>
            <Link to="/profile" className="transition hover:text-[#75d780]">
              Account
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
