const StarRating = ({ value = 0, interactive = false, onChange }) => {
  const rounded = Math.round(value);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`Set rating to ${star}`}
          onClick={() => interactive && onChange?.(star)}
          className={`text-lg ${interactive ? "cursor-pointer" : "cursor-default"} ${
            star <= rounded ? "text-accent-500" : "text-slate-300"
          }`}
        >
          {"\u2605"}
        </button>
      ))}
    </div>
  );
};

export default StarRating;
