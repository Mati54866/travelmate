import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="mx-auto max-w-2xl rounded-[32px] border border-slate-200 bg-white p-6 text-center shadow-xl sm:p-10">
    <p className="text-sm uppercase tracking-[0.2em] text-brand-700">404</p>
    <h1 className="mt-4 font-display text-3xl text-slate-900 sm:text-5xl">This page wandered off the itinerary.</h1>
    <p className="mt-4 text-slate-600">Head back home and pick a route that still exists.</p>
    <Link to="/" className="mt-8 inline-flex btn-primary">
      Return home
    </Link>
  </div>
);

export default NotFoundPage;
