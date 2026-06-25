const SectionHeading = ({ eyebrow, title, description }) => (
  <div className="max-w-2xl">
    {eyebrow ? (
      <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
        {eyebrow}
      </span>
    ) : null}
    <h2 className="mt-4 font-display text-3xl text-slate-900 md:text-4xl">{title}</h2>
    {description ? <p className="mt-3 text-base text-slate-600">{description}</p> : null}
  </div>
);

export default SectionHeading;
