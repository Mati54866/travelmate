import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  RefreshCcw,
  Search,
  Shield,
  Trash2,
  Users,
  MapPinned,
  BookOpen,
  MessageSquareText,
} from "lucide-react";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { adminApi } from "../../api/services";
import useAuth from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/api";
import { formatCompactNumber, formatDate } from "../../utils/format";

const cardClass =
  "rounded-[22px] bg-[#0b1528] shadow-[0_12px_30px_rgba(0,0,0,0.24)]";

const StatCard = ({ icon: Icon, label, value, hint }) => (
  <article className={`${cardClass} p-5`}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/38">
          {label}
        </p>
        <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
        <p className="mt-2 text-xs text-white/40">{hint}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#75d780]/12 text-[#8ceb97]">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </article>
);

const EntityList = ({ title, search, onSearch, items, emptyTitle, emptyText, renderItem }) => (
  <section className={`${cardClass} p-5`}>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-white/38">
          {title}
        </p>
        <p className="mt-2 text-sm text-white/48">{items.length} records shown</p>
      </div>
      <label className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3">
        <Search className="h-4 w-4 text-white/35" />
        <input
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search"
          className="w-52 bg-transparent text-sm text-white outline-none placeholder:text-white/28"
        />
      </label>
    </div>

    <div className="mt-5 max-h-[600px] space-y-3 overflow-auto pr-1">
      {items.length ? (
        items.map((item) => renderItem(item))
      ) : (
        <EmptyState title={emptyTitle} description={emptyText} />
      )}
    </div>
  </section>
);

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [guides, setGuides] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [guideSearch, setGuideSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [overviewResponse, usersResponse, guidesResponse] =
        await Promise.all([
          adminApi.getOverview(),
          adminApi.getUsers({ limit: 200 }),
          adminApi.getGuides({ limit: 200 }),
        ]);

      setOverview(overviewResponse.data.counts || null);
      setUsers(usersResponse.data.users || []);
      setGuides(guidesResponse.data.guides || []);
      setError("");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load admin data."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return users;
    return users.filter((item) =>
      [item.name, item.email, item.role]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [users, userSearch]);

  const filteredGuides = useMemo(() => {
    const query = guideSearch.trim().toLowerCase();
    if (!query) return guides;
    return guides.filter((guide) => {
      const haystack = [
        guide.userId?.name,
        guide.userId?.email,
        guide.bio,
        ...(guide.operatingCities || []),
        ...(guide.specialties || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [guides, guideSearch]);

  const deleteUser = async (target) => {
    const label = `${target.name} (${target.role})`;
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) {
      return;
    }

    try {
      await adminApi.deleteUser(target._id);
      toast.success("User deleted");
      await loadData(true);
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to delete user."));
    }
  };

  const deleteGuide = async (guide) => {
    const label = guide.userId?.name || "Guide";
    if (!window.confirm(`Delete guide ${label}? This cannot be undone.`)) {
      return;
    }

    try {
      await adminApi.deleteGuide(guide._id);
      toast.success("Guide deleted");
      await loadData(true);
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to delete guide."));
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading admin console..." />;
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] bg-[#091325] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <div className="grid gap-6 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-6">
          <div>
            <span className="inline-flex rounded-full bg-[#75d780]/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[#75d780]">
              Administration
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight text-white md:text-5xl">
              System Overview
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/52">
              Manage platform users, guides, and content from the central dashboard.
            </p>
          </div>

          <div className="rounded-[24px] bg-[#0b1528] p-5">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-[#75d780]" />
              <div>
                <p className="text-sm font-semibold text-white">
                  Signed in as {user?.name || "Admin"}
                </p>
                <p className="text-xs text-white/42">{user?.email}</p>
              </div>
            </div>
            <Link
              to="/"
              className="btn-primary mt-5 inline-flex text-xs uppercase tracking-[0.18em]"
            >
              Back to site
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon={Users}
          label="Users"
          value={formatCompactNumber(overview?.users || 0)}
          hint="All accounts"
        />
        <StatCard
          icon={Shield}
          label="Guides"
          value={formatCompactNumber(overview?.guides || 0)}
          hint="Public guide profiles"
        />
        <StatCard
          icon={BookOpen}
          label="Tours"
          value={formatCompactNumber(overview?.tours || 0)}
          hint="Published itineraries"
        />
        <StatCard
          icon={MapPinned}
          label="Bookings"
          value={formatCompactNumber(overview?.bookings || 0)}
          hint="All reservations"
        />
        <StatCard
          icon={MessageSquareText}
          label="Reviews"
          value={formatCompactNumber(overview?.reviews || 0)}
          hint="Traveler feedback"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <EntityList
          title="Users"
          search={userSearch}
          onSearch={setUserSearch}
          items={filteredUsers}
          emptyTitle="No users found"
          emptyText="Adjust the search term to find a different account."
          renderItem={(item) => (
            <article
              key={item._id}
              className="flex flex-col gap-4 rounded-[18px] bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {item.name}
                </p>
                <p className="mt-1 text-sm text-white/48">{item.email}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.22em] text-[#75d780]">
                  {item.role}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-white/34">
                  Joined {formatDate(item.createdAt)}
                </span>
                <button
                  type="button"
                  disabled={item._id === user?._id}
                  onClick={() => deleteUser(item)}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-500/25 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {item._id === user?._id ? "You" : "Delete"}
                </button>
              </div>
            </article>
          )}
        />

        <EntityList
          title="Guides"
          search={guideSearch}
          onSearch={setGuideSearch}
          items={filteredGuides}
          emptyTitle="No guides found"
          emptyText="Try a city or name from the guide profile."
          renderItem={(guide) => (
            <article
              key={guide._id}
              className="rounded-[18px] bg-white/[0.03] p-4"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {guide.userId?.name || "Guide"}
                  </p>
                  <p className="mt-1 text-sm text-white/48">
                    {guide.userId?.email}
                  </p>
                  <p className="mt-2 text-xs text-[#75d780]">
                    {guide.operatingCities?.join(" • ")}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={guide.userId?._id === user?._id}
                  onClick={() => deleteGuide(guide)}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-500/25 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {guide.userId?._id === user?._id ? "You" : "Delete"}
                </button>
              </div>

              <div className="mt-4 grid gap-3 text-xs text-white/42 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/[0.04] px-3 py-2">
                  Tours: {guide.stats?.tourCount || 0}
                </div>
                <div className="rounded-2xl bg-white/[0.04] px-3 py-2">
                  Bookings: {guide.stats?.bookingCount || 0}
                </div>
                <div className="rounded-2xl bg-white/[0.04] px-3 py-2">
                  Reviews: {guide.stats?.reviewCount || 0}
                </div>
              </div>

              <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/42">
                {guide.bio}
              </p>
            </article>
          )}
        />
      </div>

      {error ? <EmptyState title="Admin data issue" description={error} /> : null}
      {refreshing ? (
        <p className="text-sm text-white/38">Refreshing admin records...</p>
      ) : null}
    </div>
  );
};

export default AdminDashboardPage;
