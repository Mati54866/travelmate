import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import BrandLogo from "../branding/BrandLogo";
import UserAvatar from "../common/UserAvatar";

const navLinkClass = ({ isActive }) =>
  `text-sm font-semibold uppercase tracking-[0.18em] transition ${
    isActive ? "text-[#75d780]" : "text-white/60 hover:text-white"
  }`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  const roleHome =
    user?.role === "guide"
      ? "/guide/dashboard"
      : user?.role === "admin"
        ? "/admin/dashboard"
        : "/dashboard";

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#040b16]/95 backdrop-blur-md border-b border-white/10 shadow-lg"
          : "bg-[#040b16]/80 backdrop-blur-sm border-b border-white/5"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <BrandLogo
            onClick={() => {
              setMobileMenuOpen(false);
              setProfileDropdownOpen(false);
            }}
          />

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 xl:gap-8 lg:flex">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/guides" className={navLinkClass}>
              Guides
            </NavLink>
            {user && (
              <NavLink to={roleHome} className={navLinkClass}>
                Dashboard
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink to="/admin/dashboard" className={navLinkClass}>
                Admin
              </NavLink>
            )}
            {user?.role === "guide" && (
              <NavLink to="/guide/tours" className={navLinkClass}>
                Tours
              </NavLink>
            )}
            {user?.role === "traveler" && (
              <NavLink to="/reviews" className={navLinkClass}>
                Reviews
              </NavLink>
            )}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden items-center gap-3 xl:gap-4 lg:flex">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 rounded-full border border-white/10 bg-dark-3/50 px-2.5 py-2 transition hover:border-white/20 hover:bg-dark-3 xl:px-3"
                >
                  <UserAvatar
                    user={user}
                    alt={user?.name}
                    imageClassName="h-8 w-8 rounded-full object-cover"
                    fallbackClassName="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-sm font-semibold text-white/60"
                  />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">
                      {user.name?.split(" ")[0]}
                    </p>
                    <p className="text-xs text-[#75d780]">
                      {user.role === "guide"
                        ? "Guide"
                        : user.role === "admin"
                          ? "Admin"
                          : "Traveler"}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-white/60" />
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-56 origin-top-right rounded-xl border border-white/10 bg-dark-3 py-2 shadow-2xl z-50">
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="text-sm font-semibold text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-white/50">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
                      >
                        Profile Settings
                      </Link>
                      {user?.role === "admin" && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm text-red-400 transition hover:bg-white/5"
                      >
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md border border-white/15 px-5 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:border-white/30 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-md bg-[#75d780] px-5 py-2 text-sm font-bold uppercase tracking-[0.16em] text-[#071120] transition hover:bg-[#89e894] hover:shadow-lg hover:shadow-[#75d780]/25"
                >
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-white transition hover:bg-white/10 lg:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu - FIXED VISIBILITY */}
        {mobileMenuOpen && (
          <div className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-white/10 bg-dark-2 py-4 lg:hidden">
            <div className="flex flex-col gap-2">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition rounded-lg ${
                    isActive
                      ? "bg-[#75d780]/10 text-[#75d780]"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </NavLink>
              <NavLink
                to="/guides"
                className={({ isActive }) =>
                  `px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition rounded-lg ${
                    isActive
                      ? "bg-[#75d780]/10 text-[#75d780]"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Guides
              </NavLink>
              {user && (
                <NavLink
                  to={roleHome}
                  className={({ isActive }) =>
                    `px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition rounded-lg ${
                      isActive
                        ? "bg-[#75d780]/10 text-[#75d780]"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                  >
                  Dashboard
                </NavLink>
              )}
              {user?.role === "admin" && (
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) =>
                    `px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition rounded-lg ${
                      isActive
                        ? "bg-[#75d780]/10 text-[#75d780]"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </NavLink>
              )}
              {user?.role === "guide" && (
                <NavLink
                  to="/guide/tours"
                  className={({ isActive }) =>
                    `px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition rounded-lg ${
                      isActive
                        ? "bg-[#75d780]/10 text-[#75d780]"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Manage Tours
                </NavLink>
              )}
              {user?.role === "traveler" && (
                <NavLink
                  to="/reviews"
                  className={({ isActive }) =>
                    `px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] transition rounded-lg ${
                      isActive
                        ? "bg-[#75d780]/10 text-[#75d780]"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Reviews
                </NavLink>
              )}

              {/* Mobile Auth Section - FIXED VISIBILITY */}
              <div className="mt-4 border-t border-white/10 pt-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3">
                      <UserAvatar
                        user={user}
                        alt={user?.name}
                        imageClassName="h-10 w-10 rounded-full object-cover"
                        fallbackClassName="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-sm font-semibold text-white/60"
                      />
                      <div>
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-sm text-[#75d780]">
                          {user.role === "guide"
                            ? "Guide Account"
                            : user.role === "admin"
                              ? "Admin Account"
                              : "Traveler Account"}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-lg border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
                    >
                      Profile Settings
                    </Link>
                    {user?.role === "admin" && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block rounded-lg border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-lg border border-red-500/30 px-4 py-3 text-center text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-lg border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-lg bg-[#75d780] px-4 py-3 text-center text-sm font-bold text-[#071120] transition hover:bg-[#89e894]"
                    >
                      Join Now
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
