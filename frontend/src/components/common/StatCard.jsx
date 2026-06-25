const StatCard = ({ title, value, icon: Icon, hint, color = "green" }) => {
  const colorClasses = {
    green: "from-[#75d780] to-[#5ec06a]",
    blue: "from-[#60a5fa] to-[#3b82f6]",
    orange: "from-[#f97316] to-[#ea580c]",
    purple: "from-[#a78bfa] to-[#8b5cf6]",
  };

  return (
    <div className="rounded-xl border border-white/10 bg-dark-3 p-6 transition-all duration-300 hover:border-white/20 hover:shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-white/50">
            {title}
          </p>
          <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
          {hint && <p className="mt-1 text-sm text-white/40">{hint}</p>}
        </div>
        {Icon && (
          <div
            className={`rounded-xl bg-gradient-to-br ${colorClasses[color]} p-3 shadow-lg`}
          >
            <Icon className="h-5 w-5 text-[#071120]" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
