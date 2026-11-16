import React, { useState, useEffect } from "react";
import {
  Calendar,
  Sparkles,
  Flame,
  Sun,
  CloudRain,
  Flower2,
  Snowflake,
  Edit2,
  Check,
  RefreshCw,
  Save,
  AlertCircle,
  Eye,
  Sliders,
  Clock
} from "lucide-react";
import { api } from "../api";
import {
  INDIAN_SEASONS,
  INDIAN_FESTIVALS,
  getCalendarOverview,
  getIndianDate
} from "../services/indian-calendar";

const SEASON_ICONS = {
  Flower2,
  Sun,
  CloudRain,
  Sparkles,
  Flame,
  Snowflake,
};

export function AdminCalendarManagement() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);

  // Settings form state
  const [overrideFestivalId, setOverrideFestivalId] = useState("auto");
  const [enableFestiveBanner, setEnableFestiveBanner] = useState(true);
  const [enableSeasonalAccents, setEnableSeasonalAccents] = useState(true);
  const [customMessage, setCustomMessage] = useState("");

  // Festival search and date edit modal state
  const [filterQuery, setFilterQuery] = useState("");
  const [editingFestival, setEditingFestival] = useState(null);
  const [editYear, setEditYear] = useState("2026");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const fetchCalendarConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api("/admin/calendar/settings");
      setData(res);
      if (res?.settings) {
        setOverrideFestivalId(res.settings.overrideFestivalId || "auto");
        setEnableFestiveBanner(res.settings.enableFestiveBanner !== false);
        setEnableSeasonalAccents(res.settings.enableSeasonalAccents !== false);
        setCustomMessage(res.settings.customMessage || "");
      }
    } catch (_err) {
      // Fallback to local overview
      const overview = getCalendarOverview();
      setData({ overview, settings: overview.settings, allFestivals: INDIAN_FESTIVALS, allSeasons: INDIAN_SEASONS });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarConfig();
  }, []);

  const handleSaveSettings = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setNotice(null);
    setError(null);

    try {
      const res = await api("/admin/calendar/settings", {
        method: "POST",
        body: JSON.stringify({
          overrideFestivalId,
          enableFestiveBanner,
          enableSeasonalAccents,
          customMessage
        })
      });
      setNotice("✓ Indian Calendar & Festive Experience settings saved successfully.");
      if (res?.overview) {
        setData((prev) => ({ ...prev, overview: res.overview, settings: res.settings }));
      }
    } catch (err) {
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDateEdit = (fest) => {
    const dates2026 = fest.dates?.[2026] || {};
    setEditingFestival(fest);
    setEditYear("2026");
    setEditStart(dates2026.start || "");
    setEditEnd(dates2026.end || "");
  };

  const handleYearSwitch = (year) => {
    if (!editingFestival) return;
    setEditYear(year);
    const d = editingFestival.dates?.[year] || {};
    setEditStart(d.start || "");
    setEditEnd(d.end || "");
  };

  const handleSaveDate = async (e) => {
    e?.preventDefault();
    if (!editingFestival || !editStart || !editEnd) return;
    setEditSaving(true);
    setError(null);

    try {
      await api("/admin/calendar/festival-date", {
        method: "POST",
        body: JSON.stringify({
          festivalId: editingFestival.id,
          year: parseInt(editYear, 10),
          startDate: editStart,
          endDate: editEnd
        })
      });
      setNotice(`✓ Festival date for ${editingFestival.name} (${editYear}) updated.`);
      setEditingFestival(null);
      fetchCalendarConfig();
    } catch (err) {
      setError(err.message || "Failed to update festival date.");
    } finally {
      setEditSaving(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="admin-calendar-root" style={{ padding: "30px", textAlign: "center" }}>
        <RefreshCw size={24} className="spin" style={{ margin: "0 auto 12px" }} />
        <p>Loading Indian Calendar Intelligence...</p>
      </div>
    );
  }

  const overview = data?.overview || getCalendarOverview();
  const currentSeason = overview?.currentSeason || INDIAN_SEASONS[0];
  const activeFestival = overview?.activeFestival;
  const upcomingFestivals = overview?.upcomingFestivals || [];
  const allFestivals = data?.allFestivals || INDIAN_FESTIVALS;
  const indianDate = overview?.indianDate || getIndianDate();

  const SeasonIcon = SEASON_ICONS[currentSeason.icon] || Sparkles;

  const filteredFestivals = allFestivals.filter((f) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      (f.regionalTags || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="admin-calendar-root">
      {notice && (
        <div className="app-email-banner email-sent" role="status" style={{ marginBottom: "16px" }}>
          <span>{notice}</span>
          <button type="button" className="text-button" onClick={() => setNotice(null)}>Dismiss</button>
        </div>
      )}

      {error && (
        <div className="app-email-banner email-failed" role="alert" style={{ marginBottom: "16px" }}>
          <AlertCircle size={16} />
          <span>{error}</span>
          <button type="button" className="text-button" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Row 1: Live Status Cards */}
      <div className="admin-cal-grid">
        {/* Card 1: Live Time & Current Season */}
        <div className="admin-cal-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span className="admin-cal-stat-label">Traditional Indian Season</span>
            <SeasonIcon size={20} style={{ color: currentSeason.accentColor }} />
          </div>
          <div className="admin-cal-stat-value" style={{ color: currentSeason.accentColor }}>
            {currentSeason.sanskritName}
          </div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginTop: "4px" }}>
            {currentSeason.teluguName} • {currentSeason.name}
          </div>
          <div className="admin-cal-stat-sub" style={{ marginTop: "8px" }}>
            <strong>Hindu Months:</strong> {currentSeason.monthsHindu} ({currentSeason.approxRange})
          </div>
          <div className="admin-cal-stat-sub" style={{ marginTop: "6px" }}>
            <strong>AGNI Focus:</strong> {currentSeason.ngoFocus}
          </div>
        </div>

        {/* Card 2: Active Festival Status */}
        <div className="admin-cal-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span className="admin-cal-stat-label">Active Festival Overlay</span>
            <Sparkles size={20} style={{ color: activeFestival ? "#f59e0b" : "var(--text-muted)" }} />
          </div>
          <div className="admin-cal-stat-value">
            {activeFestival ? activeFestival.name : "No Festival Active Today"}
          </div>
          <div className="admin-cal-stat-sub" style={{ marginTop: "8px" }}>
            {activeFestival ? (
              <>
                <div><strong>Status:</strong> {activeFestival.isOverridden ? "⚡ Admin Override Active" : "✓ Live Calendar Match"}</div>
                <div style={{ marginTop: "4px" }}><strong>Greeting:</strong> "{activeFestival.greeting}"</div>
              </>
            ) : (
              <div>The site is currently in standard seasonal mode. You can preview or force any festival below.</div>
            )}
          </div>
          <div className="admin-cal-stat-sub" style={{ marginTop: "8px" }}>
            <Clock size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
            IST Time: {indianDate.dateString} ({indianDate.hour.toString().padStart(2, "0")}:{indianDate.minute.toString().padStart(2, "0")})
          </div>
        </div>

        {/* Card 3: Upcoming Festivals Countdown */}
        <div className="admin-cal-card">
          <span className="admin-cal-stat-label" style={{ display: "block", marginBottom: "10px" }}>Upcoming Celebrations</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {upcomingFestivals.slice(0, 3).map((f, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", borderBottom: "1px dashed var(--border)", paddingBottom: "4px" }}>
                <span><strong>{f.name}</strong> ({f.startDate})</span>
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                  {f.daysRemaining === 0 ? "Today" : `in ${f.daysRemaining}d`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Festival & Seasonal Controls */}
      <div className="admin-cal-card">
        <h3 style={{ margin: "0 0 16px", fontSize: "1.05rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <Sliders size={18} />
          <span>Festival &amp; Seasonal Experience Controls</span>
        </h3>

        <form onSubmit={handleSaveSettings} className="admin-cal-controls-form">
          <div className="admin-toggle-row">
            <div className="admin-toggle-info">
              <span className="admin-toggle-title">Active Festival Override</span>
              <span className="admin-toggle-desc">
                Select "Auto" to follow the live Indian Calendar, or force an active festival to preview and celebrate immediately.
              </span>
            </div>
            <div style={{ minWidth: "260px" }}>
              <select
                value={overrideFestivalId}
                onChange={(e) => setOverrideFestivalId(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="auto">Auto (Follow Live Calendar)</option>
                <option value="none">None (Disable Active Festival)</option>
                <optgroup label="Indian Festivals & Celebrations">
                  {allFestivals.map((fest) => (
                    <option key={fest.id} value={fest.id}>
                      {fest.name} ({fest.category})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          <div className="admin-toggle-row">
            <div className="admin-toggle-info">
              <span className="admin-toggle-title">Enable Festive Announcement Banner</span>
              <span className="admin-toggle-desc">
                Display the cultural banner and greeting when a festival is active.
              </span>
            </div>
            <input
              type="checkbox"
              checked={enableFestiveBanner}
              onChange={(e) => setEnableFestiveBanner(e.target.checked)}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
          </div>

          <div className="admin-toggle-row">
            <div className="admin-toggle-info">
              <span className="admin-toggle-title">Enable Seasonal Accents &amp; Navigation Chip</span>
              <span className="admin-toggle-desc">
                Show the 6 Indian Ritus seasonal chip and non-intrusive accent highlights.
              </span>
            </div>
            <input
              type="checkbox"
              checked={enableSeasonalAccents}
              onChange={(e) => setEnableSeasonalAccents(e.target.checked)}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
          </div>

          <div className="admin-form-group" style={{ marginTop: "10px" }}>
            <label htmlFor="custom-festival-msg">
              Custom Festival Announcement Notice (Optional)
            </label>
            <textarea
              id="custom-festival-msg"
              rows={2}
              placeholder="e.g., Join our special Diwali rural clothing distribution drive this Sunday in Sonarpur!"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            />
            <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
              This notice will accompany the active festival banner on the home page.
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
            <button
              type="submit"
              className="button primary"
              disabled={saving}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <Save size={16} />
              <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Row 3: Festival Date Table & Management */}
      <div className="admin-cal-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.05rem" }}>Indian Festivals &amp; Observances Directory</h3>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Verified dates for 2025, 2026, and 2027. Click "Edit Date" to adjust lunar or regional dates.
            </span>
          </div>
          <input
            type="search"
            placeholder="Search festivals or regions..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{ width: "240px", padding: "6px 12px", borderRadius: "6px", border: "1px solid var(--border)", fontSize: "0.82rem" }}
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="admin-festivals-table">
            <thead>
              <tr>
                <th>Festival / Occasion</th>
                <th>Category</th>
                <th>Regions</th>
                <th>2026 Dates</th>
                <th>2027 Dates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFestivals.map((fest) => {
                const d26 = fest.dates?.[2026] || {};
                const d27 = fest.dates?.[2027] || {};
                return (
                  <tr key={fest.id}>
                    <td>
                      <strong>{fest.name}</strong>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{fest.tagline}</div>
                    </td>
                    <td>
                      <span style={{ textTransform: "capitalize", fontSize: "0.75rem", padding: "2px 6px", background: "rgba(0,0,0,0.05)", borderRadius: "4px" }}>
                        {fest.category}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.76rem" }}>
                      {(fest.regionalTags || []).join(", ")}
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.76rem" }}>
                      {d26.start ? `${d26.start} → ${d26.end}` : "TBD"}
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "0.76rem" }}>
                      {d27.start ? `${d27.start} → ${d27.end}` : "TBD"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="button secondary"
                        style={{ padding: "4px 8px", fontSize: "0.74rem", minWidth: "auto", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        onClick={() => handleOpenDateEdit(fest)}
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Date Edit Modal */}
      {editingFestival && (
        <div className="confirmation-modal-backdrop" role="dialog" aria-modal="true">
          <div className="glass modal-content" style={{ maxWidth: "450px" }}>
            <h3 style={{ margin: "0 0 12px" }}>Edit Date for {editingFestival.name}</h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "16px" }}>
              Update confirmed start and end dates for traditional lunar-based or regional observances.
            </p>

            <form onSubmit={handleSaveDate}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                {["2025", "2026", "2027"].map((y) => (
                  <button
                    key={y}
                    type="button"
                    className={`button ${editYear === y ? "primary" : "secondary"}`}
                    style={{ flex: 1, padding: "6px" }}
                    onClick={() => handleYearSwitch(y)}
                  >
                    {y}
                  </button>
                ))}
              </div>

              <div className="admin-form-group" style={{ marginBottom: "12px" }}>
                <label>Start Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={editStart}
                  onChange={(e) => setEditStart(e.target.value)}
                  required
                />
              </div>

              <div className="admin-form-group" style={{ marginBottom: "16px" }}>
                <label>End Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={editEnd}
                  onChange={(e) => setEditEnd(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setEditingFestival(null)}
                  disabled={editSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button primary"
                  disabled={editSaving}
                >
                  {editSaving ? "Saving..." : "Save Date"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

