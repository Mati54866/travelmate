const EmptyState = ({ title, description }) => (
  <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center">
    <h3 className="font-display text-2xl text-slate-900">{title}</h3>
    <p className="mt-3 text-slate-600">{description}</p>
  </div>
);

export default EmptyState;
