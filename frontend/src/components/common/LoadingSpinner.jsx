const LoadingSpinner = ({ label = "Loading..." }) => (
  <div className="flex min-h-[200px] items-center justify-center">
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/70 px-5 py-3 text-sm text-slate-200 shadow-glow">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-transparent" />
      {label}
    </div>
  </div>
);

export default LoadingSpinner;
