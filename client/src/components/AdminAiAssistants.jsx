import React, { useState, useEffect } from "react";
import { Sparkles, CheckCircle2, AlertTriangle, XCircle, FileText, Copy, Check, RefreshCw, Send, ShieldAlert, FileEdit } from "lucide-react";
import { api } from "../api";

/**
 * AI Application Assistant - Provides advisory completeness analysis and duplicate detection
 * Strictly advisory; administrator maintains 100% authoritative approval/rejection power.
 */
export function ApplicationAiInsightsCard({ item, allRecords = [] }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    if (!item) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api("/admin/ai/insights", {
        method: "POST",
        body: JSON.stringify({
          application: item,
          existingList: allRecords.filter((r) => r._id !== item._id)
        })
      });
      setInsights(res);
    } catch (_err) {
      setError("AI Advisory insights could not be retrieved at this time.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [item?._id]);

  if (!item) return null;

  return (
    <div className="ai-insights-panel">
      <div className="ai-insights-header">
        <div className="ai-insights-title">
          <Sparkles size={16} className="text-emerald-500" />
          <span>Application Intelligence & Verification Checklist</span>
        </div>
        <button
          type="button"
          className="button secondary ai-refresh-btn"
          onClick={fetchInsights}
          disabled={loading}
          title="Re-run verification checks"
        >
          <RefreshCw size={13} className={loading ? "spin" : ""} />
          <span>{loading ? "Checking..." : "Re-check"}</span>
        </button>
      </div>

      {error && <p className="ai-insights-error">{error}</p>}

      {insights && (
        <div className="ai-insights-body">
          {/* Completeness Bar */}
          <div className="ai-completeness-row">
            <div className="ai-completeness-info">
              <span className="ai-metric-label">Profile Completeness:</span>
              <strong className={`ai-metric-score ${insights.completenessPercent >= 80 ? "score-high" : insights.completenessPercent >= 50 ? "score-med" : "score-low"}`}>
                {insights.completenessPercent}%
              </strong>
            </div>
            <div className="ai-progress-track">
              <div
                className="ai-progress-bar"
                style={{
                  width: `${insights.completenessPercent}%`,
                  backgroundColor: insights.completenessPercent >= 80 ? "#10b981" : insights.completenessPercent >= 50 ? "#f59e0b" : "#ef4444"
                }}
              />
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="ai-checklist-grid">
            {insights.checks?.map((chk, idx) => (
              <div key={idx} className={`ai-check-item ${chk.pass ? "check-pass" : "check-missing"}`}>
                {chk.pass ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                <span>{chk.label}</span>
              </div>
            ))}
          </div>

          {/* Potential Duplicates Warning */}
          {insights.hasDuplicates && (
            <div className="ai-duplicate-alert">
              <div className="duplicate-alert-header">
                <AlertTriangle size={15} />
                <strong>Potential Duplicate Applicant Detected:</strong>
              </div>
              <ul className="duplicate-list">
                {insights.potentialDuplicates.map((dup, idx) => (
                  <li key={idx}>
                    <span>{dup.name}</span> • <span>Reg No: {dup.registrationId}</span> • <span className="capitalize">{dup.status}</span>
                  </li>
                ))}
              </ul>
              <small>Please verify whether this applicant already holds an active registration before approving.</small>
            </div>
          )}

          {/* Recommendation & Disclaimer */}
          <div className="ai-recommendation-box">
            <div className="recommendation-badge">
              <strong>Advisory Recommendation:</strong> {insights.recommendation}
            </div>
            <p className="ai-disclaimer-note">
              {insights.advisoryNotice}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * AI Content Assistant - Admin tool to draft announcements, event updates, and campaign appeals
 */
export function AdminContentDrafter() {
  const [type, setType] = useState("announcement");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("inspiring");
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editableContent, setEditableContent] = useState("");

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    setCopied(false);
    try {
      const res = await api("/admin/ai/draft-content", {
        method: "POST",
        body: JSON.stringify({ type, topic, tone })
      });
      setDraft(res);
      setEditableContent(res?.content || "");
    } catch (_err) {
      alert("Could not generate content draft. Please verify server connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!editableContent) return;
    navigator.clipboard.writeText(editableContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="admin-content-drafter-root">
      <div className="drafter-header">
        <div className="drafter-title-row">
          <FileEdit size={22} className="text-emerald-500" />
          <div>
            <h3>Announcements & Content Drafting Assistant</h3>
            <p>Generate professional announcements, event invitations, campaign appeals, and social updates.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="drafter-form">
        <div className="drafter-controls-row">
          <div className="drafter-field">
            <label htmlFor="content-type">Content Type</label>
            <select
              id="content-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="drafter-select"
            >
              <option value="announcement">Official Announcement</option>
              <option value="event">Event Notice / Invitation</option>
              <option value="campaign">Fundraising & Relief Appeal</option>
              <option value="social">Social Media Update</option>
            </select>
          </div>

          <div className="drafter-field">
            <label htmlFor="content-tone">Tone</label>
            <select
              id="content-tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="drafter-select"
            >
              <option value="inspiring">Inspiring & Uplifting</option>
              <option value="formal">Official & Authoritative</option>
              <option value="community">Community & Compassionate</option>
            </select>
          </div>
        </div>

        <div className="drafter-field topic-field">
          <label htmlFor="content-topic">Initiative / Event Topic</label>
          <input
            id="content-topic"
            type="text"
            placeholder="e.g. Free Eye Screening Camp in Village Sector 4, Cadet Annual Parade Drill..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="drafter-input"
            required
          />
        </div>

        <button
          type="submit"
          className="button drafter-submit-btn"
          disabled={!topic.trim() || loading}
        >
          <Sparkles size={16} />
          <span>{loading ? "Generating Draft..." : "Generate Content Draft"}</span>
        </button>
      </form>

      {draft && (
        <div className="drafter-output-card">
          <div className="output-header">
            <h4>{draft.title}</h4>
            <div className="output-actions">
              <button
                type="button"
                className="button secondary copy-btn"
                onClick={handleCopy}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>
            </div>
          </div>

          <div className="output-body">
            <textarea
              className="draft-textarea"
              rows={8}
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              aria-label="Editable draft content"
            />
            <small className="draft-hint">
              You can edit this text directly above. Review all details before sharing or publishing.
            </small>
          </div>
        </div>
      )}
    </div>
  );
}

