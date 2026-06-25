import { Link } from "react-router-dom";

export const BrandMark = ({ className = "h-10 w-10 sm:h-12 sm:w-12" }) => (
  <span
    className={`inline-flex items-center justify-center rounded-2xl bg-[#75d780] text-[#071120] shadow-[0_10px_30px_rgba(117,215,128,0.24)] ${className}`}
  >
    <svg
      viewBox="0 0 48 48"
      className="h-[62%] w-[62%]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M24 6C15.716 6 9 12.716 9 21C9 31.2 19.65 39.874 22.363 41.94C23.321 42.669 24.679 42.669 25.637 41.94C28.35 39.874 39 31.2 39 21C39 12.716 32.284 6 24 6Z"
        fill="#071120"
      />
      <path
        d="M24 15.25C20.272 15.25 17.25 18.272 17.25 22C17.25 25.728 20.272 28.75 24 28.75C27.728 28.75 30.75 25.728 30.75 22C30.75 18.272 27.728 15.25 24 15.25Z"
        fill="#75d780"
      />
      <path
        d="M24 11.5L26.86 19.14L34.5 22L26.86 24.86L24 32.5L21.14 24.86L13.5 22L21.14 19.14L24 11.5Z"
        fill="#071120"
      />
    </svg>
  </span>
);

const BrandLogo = ({
  to = "/",
  compact = false,
  subtitle = "Trip Guide Platform",
  onClick,
}) => (
  <Link to={to} className="flex items-center gap-3" onClick={onClick}>
    <BrandMark />
    <div>
      <p className="font-display text-xl text-white sm:text-2xl">TravelMate</p>
      {!compact ? (
        <p className="hidden text-[10px] uppercase tracking-[0.28em] text-white/40 sm:block sm:text-[11px]">
          {subtitle}
        </p>
      ) : null}
    </div>
  </Link>
);

export default BrandLogo;
