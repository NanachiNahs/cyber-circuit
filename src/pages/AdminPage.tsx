import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchAllTeams,
  fetchAllScores,
  fetchStations,
  fetchPhishingEmails,
  savePhishingEmail,
  deletePhishingEmail,
  fetchWiFiNetworks,
  saveWiFiNetwork,
  deleteWiFiNetwork,
  fetchPasswordProfile,
  savePasswordProfile,
  fetchRansomwareActions,
  saveRansomwareAction,
  deleteRansomwareAction,
} from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type {
  Team,
  TeamScore,
  Station,
  DbPhishingEmail,
  DbWiFiNetwork,
  DbPasswordProfile,
  DbRansomwareAction,
  NetworkSecurity,
} from '../types';
import { MAX_POINTS } from '../types';

type AdminTab = 'leaderboard' | 'content';
type StationTab = 1 | 2 | 3 | 4;

interface TeamRow {
  team: Team;
  scores: Record<number, TeamScore | undefined>;
  total: number;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('leaderboard');
  const [stationTab, setStationTab] = useState<StationTab>(1);

  // Leaderboard data
  const [teams, setTeams] = useState<Team[]>([]);
  const [scores, setScores] = useState<TeamScore[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Station Content Data
  const [phishingEmails, setPhishingEmails] = useState<DbPhishingEmail[]>([]);
  const [wifiNetworks, setWifiNetworks] = useState<DbWiFiNetwork[]>([]);
  const [passwordProfile, setPasswordProfile] = useState<DbPasswordProfile | null>(null);
  const [ransomwareActions, setRansomwareActions] = useState<DbRansomwareAction[]>([]);
  const [contentLoading, setContentLoading] = useState(false);

  // Station 1 Edit state
  const [editingEmail, setEditingEmail] = useState<Partial<DbPhishingEmail> | null>(null);
  // Station 2 Edit state
  const [editingWifi, setEditingWifi] = useState<Partial<DbWiFiNetwork> | null>(null);
  // Station 3 Edit state
  const [editingProfile, setEditingProfile] = useState<Partial<DbPasswordProfile> | null>(null);
  // Station 4 Edit state
  const [editingAction, setEditingAction] = useState<Partial<DbRansomwareAction> | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/kiosk');
      return;
    }
    loadLeaderboard();
    loadContent();
  }, []);

  async function loadLeaderboard() {
    setLoading(true);
    const [teamsRes, scoresRes, stationsRes] = await Promise.all([
      fetchAllTeams(),
      fetchAllScores(),
      fetchStations(),
    ]);
    if (teamsRes.error) setError(teamsRes.error);
    else setTeams(teamsRes.teams);
    if (!scoresRes.error) setScores(scoresRes.scores);
    if (!stationsRes.error) setStations(stationsRes.stations);
    setLoading(false);
  }

  async function loadContent() {
    setContentLoading(true);
    const [pRes, wRes, pwdRes, rRes] = await Promise.all([
      fetchPhishingEmails(),
      fetchWiFiNetworks(),
      fetchPasswordProfile(),
      fetchRansomwareActions(),
    ]);
    setPhishingEmails(pRes);
    setWifiNetworks(wRes);
    setPasswordProfile(pwdRes);
    setRansomwareActions(rRes);
    setContentLoading(false);
  }

  // ── Station 1 Actions ─────────────────────────────────────
  async function handleSaveEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!editingEmail) return;
    const emailToSave: DbPhishingEmail = {
      id: editingEmail.id,
      from_email: editingEmail.from_email || '',
      from_display: editingEmail.from_display || '',
      subject: editingEmail.subject || '',
      date_str: editingEmail.date_str || 'Mon, 8 Sep 2026 08:00:00',
      body: editingEmail.body || '',
      link_url: editingEmail.link_url || '',
      flags: editingEmail.flags || [],
    };
    const { error: err } = await savePhishingEmail(emailToSave);
    if (err) alert('Failed to save phishing email: ' + err);
    else {
      setEditingEmail(null);
      loadContent();
    }
  }

  async function handleDeleteEmail(id: string) {
    if (!confirm('Are you sure you want to delete this phishing email?')) return;
    const { error: err } = await deletePhishingEmail(id);
    if (err) alert('Failed to delete email: ' + err);
    else loadContent();
  }

  // ── Station 2 Actions ─────────────────────────────────────
  async function handleSaveWifi(e: React.FormEvent) {
    e.preventDefault();
    if (!editingWifi) return;
    const netToSave: DbWiFiNetwork = {
      id: editingWifi.id,
      ssid: editingWifi.ssid || '',
      security: (editingWifi.security as NetworkSecurity) || 'WPA3',
      signal: Number(editingWifi.signal) || 3,
      is_safe: Boolean(editingWifi.is_safe),
      feedback_title: editingWifi.feedback_title || '',
      feedback_message: editingWifi.feedback_message || '',
      score_value: Number(editingWifi.score_value) || 0,
    };
    const { error: err } = await saveWiFiNetwork(netToSave);
    if (err) alert('Failed to save Wi-Fi network: ' + err);
    else {
      setEditingWifi(null);
      loadContent();
    }
  }

  async function handleDeleteWifi(id: string) {
    if (!confirm('Are you sure you want to delete this Wi-Fi network?')) return;
    const { error: err } = await deleteWiFiNetwork(id);
    if (err) alert('Failed to delete network: ' + err);
    else loadContent();
  }

  // ── Station 3 Actions ─────────────────────────────────────
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProfile) return;
    const profileToSave: DbPasswordProfile = {
      id: editingProfile.id || passwordProfile?.id,
      target_password: editingProfile.target_password || 'Fluffy2003!',
      max_attempts: Number(editingProfile.max_attempts) || 10,
      name: editingProfile.name || '',
      username: editingProfile.username || '',
      birthday: editingProfile.birthday || '',
      school: editingProfile.school || '',
      pet: editingProfile.pet || '',
      favorite_team: editingProfile.favorite_team || '',
      join_year: editingProfile.join_year || '',
      posts: editingProfile.posts || [],
      hints: editingProfile.hints || [],
      security_lesson: editingProfile.security_lesson || '',
    };
    const { error: err } = await savePasswordProfile(profileToSave);
    if (err) alert('Failed to save password profile: ' + err);
    else {
      setEditingProfile(null);
      loadContent();
    }
  }

  // ── Station 4 Actions ─────────────────────────────────────
  async function handleSaveAction(e: React.FormEvent) {
    e.preventDefault();
    if (!editingAction) return;
    const actionToSave: DbRansomwareAction = {
      id: editingAction.id,
      label: editingAction.label || '',
      description: editingAction.description || '',
      is_correct: Boolean(editingAction.is_correct),
    };
    const { error: err } = await saveRansomwareAction(actionToSave);
    if (err) alert('Failed to save action: ' + err);
    else {
      setEditingAction(null);
      loadContent();
    }
  }

  async function handleDeleteAction(id: string) {
    if (!confirm('Are you sure you want to delete this action?')) return;
    const { error: err } = await deleteRansomwareAction(id);
    if (err) alert('Failed to delete action: ' + err);
    else loadContent();
  }

  // Leaderboard rows calculation
  const rows: TeamRow[] = teams.map((t) => {
    const teamScores = scores.filter((s) => s.team_id === t.id);
    const record: Record<number, TeamScore | undefined> = {};
    for (const s of teamScores) record[s.station_id] = s;
    const total = teamScores.reduce((acc, s) => acc + s.score, 0);
    return { team: t, scores: record, total };
  }).sort((a, b) => b.total - a.total);

  const maxTotal = stations.length * MAX_POINTS;
  const stationIcons: Record<number, string> = { 1: '📧', 2: '📡', 3: '🔓', 4: '☣️' };

  return (
    <main className="page-top" style={{ padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 1050 }}>

        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="cyber-logo">⚡ Cyber Circuit</span>
            <h2 style={{ marginTop: '0.25rem', fontSize: '1.1rem', color: 'var(--neon-cyan)' }}>
              Admin Control Center
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button id="admin-refresh" className="btn btn-ghost btn-sm" onClick={() => { loadLeaderboard(); loadContent(); }}>
              ↻ Refresh
            </button>
            <button id="admin-back" className="btn btn-ghost btn-sm" onClick={() => navigate('/kiosk')}>
              ← Station Kiosk
            </button>
          </div>
        </div>

        {/* Main Tab Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          background: 'rgba(10,15,30,0.7)',
          padding: '0.35rem',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <button
            onClick={() => setActiveTab('leaderboard')}
            style={{
              padding: '0.75rem',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.85rem',
              background: activeTab === 'leaderboard' ? 'var(--neon-cyan)' : 'transparent',
              color: activeTab === 'leaderboard' ? '#000' : 'var(--text-muted)',
              fontWeight: activeTab === 'leaderboard' ? 700 : 400,
              boxShadow: activeTab === 'leaderboard' ? '0 0 15px rgba(0,229,255,0.4)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            🏆 Live Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('content')}
            style={{
              padding: '0.75rem',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.85rem',
              background: activeTab === 'content' ? 'var(--neon-green)' : 'transparent',
              color: activeTab === 'content' ? '#000' : 'var(--text-muted)',
              fontWeight: activeTab === 'content' ? 700 : 400,
              boxShadow: activeTab === 'content' ? 'var(--glow-green)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            ⚙️ Manage Station Content (CRUD)
          </button>
        </div>

        {/* ── TAB 1: LEADERBOARD ──────────────────────────────────── */}
        {activeTab === 'leaderboard' && (
          <>
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⟳</div>
                Loading scores...
              </div>
            ) : error ? (
              <div className="glass-card" style={{ borderColor: 'var(--neon-red)' }}>
                <p className="error-msg">⚠ {error}</p>
              </div>
            ) : (
              <>
                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Registered Teams', value: teams.length, icon: '👥', color: 'var(--neon-cyan)' },
                    { label: 'Station Completions', value: scores.length, icon: '✅', color: 'var(--neon-green)' },
                    { label: 'Top Score', value: `${rows[0]?.total ?? 0}`, icon: '🏆', color: 'var(--neon-amber)' },
                    { label: 'Max Circuit Score', value: `${maxTotal}`, icon: '⭐', color: 'var(--neon-purple)' },
                  ].map((s) => (
                    <div key={s.label} className="glass-card" style={{ textAlign: 'center', padding: '1.25rem' }}>
                      <div style={{ fontSize: '1.6rem' }}>{s.icon}</div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: s.color, margin: '0.2rem 0' }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Leaderboard Table */}
                <div className="glass-card">
                  <h3 style={{ marginBottom: '1.25rem', color: 'var(--neon-cyan)' }}>🏆 Tournament Leaderboard</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 400 }}>#</th>
                          <th style={{ padding: '0.75rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 400 }}>Team</th>
                          {stations.map((st) => (
                            <th key={st.id} style={{ padding: '0.75rem 0.5rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>
                              {stationIcons[st.station_number]} S{st.station_number}
                            </th>
                          ))}
                          <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--neon-cyan)', fontWeight: 700 }}>
                            Total / {maxTotal}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.length === 0 ? (
                          <tr>
                            <td colSpan={stations.length + 3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                              No scores yet. Teams are still playing!
                            </td>
                          </tr>
                        ) : rows.map((row, idx) => (
                          <tr
                            key={row.team.id}
                            style={{
                              borderBottom: '1px solid var(--border-subtle)',
                              background: idx === 0 ? 'rgba(255,190,0,0.04)' : 'transparent',
                            }}
                          >
                            <td style={{ padding: '0.85rem 0.5rem', color: idx === 0 ? 'var(--neon-amber)' : 'var(--text-muted)' }}>
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                            </td>
                            <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                              {row.team.group_name}
                            </td>
                            {stations.map((st) => {
                              const s = row.scores[st.id];
                              return (
                                <td key={st.id} style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                                  {s ? (
                                    <span style={{ color: s.score >= st.max_points * 0.7 ? 'var(--neon-green)' : 'var(--neon-amber)' }}>
                                      {s.score}
                                    </span>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                                  )}
                                </td>
                              );
                            })}
                            <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                <span style={{ color: 'var(--neon-cyan)', fontWeight: 700 }}>{row.total}</span>
                                <div className="score-bar-track" style={{ width: 80 }}>
                                  <div
                                    className="score-bar-fill"
                                    style={{
                                      width: `${maxTotal > 0 ? (row.total / maxTotal) * 100 : 0}%`,
                                      background: 'linear-gradient(90deg, var(--neon-cyan), var(--neon-green))',
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── TAB 2: STATION CONTENT MANAGER (CRUD) ──────────────── */}
        {activeTab === 'content' && (
          <div>
            {/* Station Selector Sub-Tabs */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}>
              {[
                { id: 1, label: '📧 Station 1: Phishing' },
                { id: 2, label: '📡 Station 2: Wi-Fi' },
                { id: 3, label: '🔓 Station 3: Passwords' },
                { id: 4, label: '☣️ Station 4: Ransomware' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStationTab(st.id as StationTab)}
                  style={{
                    padding: '0.65rem 0.5rem',
                    borderRadius: 8,
                    border: stationTab === st.id ? '1px solid var(--neon-green)' : '1px solid var(--border-subtle)',
                    background: stationTab === st.id ? 'rgba(57,255,20,0.12)' : 'rgba(10,15,30,0.6)',
                    color: stationTab === st.id ? 'var(--neon-green)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontWeight: stationTab === st.id ? 700 : 400,
                  }}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {contentLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                ⟳ Fetching station content from database...
              </div>
            ) : (
              <>
                {/* ── STATION 1: PHISHING EMAILS MANAGER ────────────── */}
                {stationTab === 1 && (
                  <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div>
                        <h3 style={{ color: 'var(--station-1)' }}>📧 Station 1: Phishing Emails ({phishingEmails.length})</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Add, edit, or remove phishing scenarios presented to players.
                        </p>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setEditingEmail({ flags: [] })}
                      >
                        ＋ Add Phishing Email
                      </button>
                    </div>

                    {/* Email List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {phishingEmails.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No dynamic emails in database yet. (Default fallback will be used).</p>
                      ) : phishingEmails.map((email) => (
                        <div key={email.id} style={{
                          padding: '1rem',
                          borderRadius: 8,
                          border: '1px solid var(--border-subtle)',
                          background: 'rgba(255,255,255,0.02)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem',
                        }}>
                          <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                              {email.subject}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              From: {email.from_display} &lt;{email.from_email}&gt;
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--neon-amber)', marginTop: '0.2rem' }}>
                              Red Flags: {email.flags?.length || 0} configured
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditingEmail(email)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => email.id && handleDeleteEmail(email.id)}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Modal / Form for Station 1 */}
                    {editingEmail && (
                      <div className="glass-card animate-fade-in" style={{ marginTop: '1.5rem', borderColor: 'var(--station-1)' }}>
                        <h4 style={{ color: 'var(--station-1)', marginBottom: '1rem' }}>
                          {editingEmail.id ? 'Edit Phishing Email' : 'Add New Phishing Email'}
                        </h4>
                        <form onSubmit={handleSaveEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                              <label className="input-label">Sender Display Name</label>
                              <input
                                className="input-field"
                                value={editingEmail.from_display || ''}
                                onChange={(e) => setEditingEmail({ ...editingEmail, from_display: e.target.value })}
                                placeholder="e.g. University Billing"
                                required
                              />
                            </div>
                            <div className="input-group">
                              <label className="input-label">Sender Email Address</label>
                              <input
                                className="input-field"
                                value={editingEmail.from_email || ''}
                                onChange={(e) => setEditingEmail({ ...editingEmail, from_email: e.target.value })}
                                placeholder="e.g. billing@fake-domain.net"
                                required
                              />
                            </div>
                          </div>

                          <div className="input-group">
                            <label className="input-label">Subject Line</label>
                            <input
                              className="input-field"
                              value={editingEmail.subject || ''}
                              onChange={(e) => setEditingEmail({ ...editingEmail, subject: e.target.value })}
                              placeholder="e.g. URGENT: Account Action Required"
                              required
                            />
                          </div>

                          <div className="input-group">
                            <label className="input-label">Email Body</label>
                            <textarea
                              className="input-field"
                              rows={8}
                              value={editingEmail.body || ''}
                              onChange={(e) => setEditingEmail({ ...editingEmail, body: e.target.value })}
                              placeholder="Write the full email content..."
                              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.6 }}
                              required
                            />
                            <span style={{ fontSize: '0.72rem', color: 'var(--neon-cyan)', marginTop: '0.25rem' }}>
                              💡 Type or paste multiline text using Enter for line breaks. Spacing and paragraphs render exactly as typed.
                            </span>
                          </div>


                          <div className="input-group">
                            <label className="input-label">Phishing Link URL (optional)</label>
                            <input
                              className="input-field"
                              value={editingEmail.link_url || ''}
                              onChange={(e) => setEditingEmail({ ...editingEmail, link_url: e.target.value })}
                              placeholder="e.g. https://fake-portal.com/login"
                            />
                          </div>

                          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <button type="submit" className="btn btn-primary">Save Email</button>
                            <button type="button" className="btn btn-ghost" onClick={() => setEditingEmail(null)}>Cancel</button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STATION 2: WI-FI NETWORKS MANAGER ───────────── */}
                {stationTab === 2 && (
                  <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div>
                        <h3 style={{ color: 'var(--station-2)' }}>📡 Station 2: Wi-Fi Networks ({wifiNetworks.length})</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Manage the Wi-Fi scan results presented to players.
                        </p>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setEditingWifi({ security: 'WPA3', signal: 4, is_safe: false })}
                      >
                        ＋ Add Wi-Fi Network
                      </button>
                    </div>

                    {/* Network List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {wifiNetworks.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No dynamic networks in database yet. (Default fallback will be used).</p>
                      ) : wifiNetworks.map((net) => (
                        <div key={net.id} style={{
                          padding: '1rem',
                          borderRadius: 8,
                          border: '1px solid var(--border-subtle)',
                          background: 'rgba(255,255,255,0.02)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700 }}>
                              {net.ssid}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                              Protocol: <span style={{ color: 'var(--neon-cyan)' }}>{net.security}</span> | Signal: {net.signal}/5 | Safe: {net.is_safe ? '✅ Yes' : '❌ No'}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditingWifi(net)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => net.id && handleDeleteWifi(net.id)}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Edit Form for Station 2 */}
                    {editingWifi && (
                      <div className="glass-card animate-fade-in" style={{ marginTop: '1.5rem', borderColor: 'var(--station-2)' }}>
                        <h4 style={{ color: 'var(--station-2)', marginBottom: '1rem' }}>
                          {editingWifi.id ? 'Edit Wi-Fi Network' : 'Add New Wi-Fi Network'}
                        </h4>
                        <form onSubmit={handleSaveWifi} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                              <label className="input-label">SSID (Network Name)</label>
                              <input
                                className="input-field"
                                value={editingWifi.ssid || ''}
                                onChange={(e) => setEditingWifi({ ...editingWifi, ssid: e.target.value })}
                                placeholder="e.g. CafeBean_WPA3"
                                required
                              />
                            </div>
                            <div className="input-group">
                              <label className="input-label">Security Protocol</label>
                              <select
                                className="input-field"
                                value={editingWifi.security || 'WPA3'}
                                onChange={(e) => setEditingWifi({ ...editingWifi, security: e.target.value as NetworkSecurity })}
                              >
                                <option value="WPA3">WPA3 (Most Secure)</option>
                                <option value="WPA2">WPA2 (Acceptable)</option>
                                <option value="Open">Open (Unsecured)</option>
                                <option value="Evil-Twin">Evil-Twin (Rogue AP)</option>
                              </select>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                              <label className="input-label">Signal Strength (1–5)</label>
                              <input
                                type="number"
                                min={1}
                                max={5}
                                className="input-field"
                                value={editingWifi.signal ?? 4}
                                onChange={(e) => setEditingWifi({ ...editingWifi, signal: Number(e.target.value) })}
                              />
                            </div>
                            <div className="input-group" style={{ justifyContent: 'center' }}>
                              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '1.5rem' }}>
                                <input
                                  type="checkbox"
                                  checked={Boolean(editingWifi.is_safe)}
                                  onChange={(e) => setEditingWifi({ ...editingWifi, is_safe: e.target.checked })}
                                />
                                Is Safe Connection?
                              </label>
                            </div>
                          </div>

                          <div className="input-group">
                            <label className="input-label">Feedback Message (Explanation)</label>
                            <textarea
                              className="input-field"
                              rows={3}
                              value={editingWifi.feedback_message || ''}
                              onChange={(e) => setEditingWifi({ ...editingWifi, feedback_message: e.target.value })}
                              placeholder="Why is this connection safe or dangerous?"
                            />
                          </div>

                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button type="submit" className="btn btn-primary">Save Network</button>
                            <button type="button" className="btn btn-ghost" onClick={() => setEditingWifi(null)}>Cancel</button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STATION 3: PASSWORD PROFILE MANAGER ─────────── */}
                {stationTab === 3 && (
                  <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div>
                        <h3 style={{ color: 'var(--station-3)' }}>🔓 Station 3: Target Profile & Password</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Configure the social media profile details, hints, and target password.
                        </p>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setEditingProfile(passwordProfile || {
                          target_password: 'Fluffy2003!',
                          max_attempts: 10,
                          name: 'Alex Rivera',
                          username: '@a_rivera03',
                          birthday: 'March 15, 2003',
                          school: 'St. Ignatius University',
                          pet: 'Fluffy',
                          favorite_team: 'Manila Eagles',
                          join_year: '2021',
                        })}
                      >
                        ⚙ Edit Profile Config
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                        <div style={{ color: 'var(--neon-green)', fontWeight: 700, marginBottom: '0.5rem' }}>🔑 Target Credentials</div>
                        <div>Password: <span style={{ color: 'var(--neon-green)' }}>{passwordProfile?.target_password || 'Fluffy2003! (Default)'}</span></div>
                        <div>Max Attempts: {passwordProfile?.max_attempts || 10}</div>
                      </div>
                      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                        <div style={{ color: 'var(--neon-cyan)', fontWeight: 700, marginBottom: '0.5rem' }}>👤 Profile Metadata</div>
                        <div>Name: {passwordProfile?.name || 'Alex Rivera'}</div>
                        <div>Pet: {passwordProfile?.pet || 'Fluffy'}</div>
                        <div>Birth Year: {passwordProfile?.birthday || '2003'}</div>
                      </div>
                    </div>

                    {/* Edit Form for Station 3 */}
                    {editingProfile && (
                      <div className="glass-card animate-fade-in" style={{ marginTop: '1.5rem', borderColor: 'var(--station-3)' }}>
                        <h4 style={{ color: 'var(--station-3)', marginBottom: '1rem' }}>Edit Target Profile & Password</h4>
                        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                              <label className="input-label">Target Password to Crack</label>
                              <input
                                className="input-field"
                                value={editingProfile.target_password || ''}
                                onChange={(e) => setEditingProfile({ ...editingProfile, target_password: e.target.value })}
                                required
                              />
                            </div>
                            <div className="input-group">
                              <label className="input-label">Target Full Name</label>
                              <input
                                className="input-field"
                                value={editingProfile.name || ''}
                                onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                                required
                              />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                              <label className="input-label">Pet Name</label>
                              <input
                                className="input-field"
                                value={editingProfile.pet || ''}
                                onChange={(e) => setEditingProfile({ ...editingProfile, pet: e.target.value })}
                              />
                            </div>
                            <div className="input-group">
                              <label className="input-label">Birthday / Year</label>
                              <input
                                className="input-field"
                                value={editingProfile.birthday || ''}
                                onChange={(e) => setEditingProfile({ ...editingProfile, birthday: e.target.value })}
                              />
                            </div>
                            <div className="input-group">
                              <label className="input-label">School / University</label>
                              <input
                                className="input-field"
                                value={editingProfile.school || ''}
                                onChange={(e) => setEditingProfile({ ...editingProfile, school: e.target.value })}
                              />
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button type="submit" className="btn btn-primary">Save Profile Config</button>
                            <button type="button" className="btn btn-ghost" onClick={() => setEditingProfile(null)}>Cancel</button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STATION 4: RANSOMWARE ACTIONS MANAGER ──────── */}
                {stationTab === 4 && (
                  <div className="glass-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div>
                        <h3 style={{ color: 'var(--station-4)' }}>☣️ Station 4: Ransomware Actions ({ransomwareActions.length})</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Manage the incident response checklist items for ransomware containment.
                        </p>
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setEditingAction({ is_correct: true })}
                      >
                        ＋ Add Response Action
                      </button>
                    </div>

                    {/* Action List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {ransomwareActions.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No dynamic actions in database yet. (Default fallback will be used).</p>
                      ) : ransomwareActions.map((act) => (
                        <div key={act.id} style={{
                          padding: '1rem',
                          borderRadius: 8,
                          border: `1px solid ${act.is_correct ? 'rgba(57,255,20,0.3)' : 'rgba(255,51,51,0.3)'}`,
                          background: 'rgba(255,255,255,0.02)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem',
                        }}>
                          <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 700 }}>
                              {act.is_correct ? '✅' : '❌'} {act.label}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              {act.description}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditingAction(act)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => act.id && handleDeleteAction(act.id)}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Edit Form for Station 4 */}
                    {editingAction && (
                      <div className="glass-card animate-fade-in" style={{ marginTop: '1.5rem', borderColor: 'var(--station-4)' }}>
                        <h4 style={{ color: 'var(--station-4)', marginBottom: '1rem' }}>
                          {editingAction.id ? 'Edit Response Action' : 'Add Response Action'}
                        </h4>
                        <form onSubmit={handleSaveAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div className="input-group">
                            <label className="input-label">Action Label (Checklist Item)</label>
                            <input
                              className="input-field"
                              value={editingAction.label || ''}
                              onChange={(e) => setEditingAction({ ...editingAction, label: e.target.value })}
                              placeholder="e.g. Disconnect the Ethernet cable immediately"
                              required
                            />
                          </div>

                          <div className="input-group">
                            <label className="input-label">Description / Explanation</label>
                            <textarea
                              className="input-field"
                              rows={3}
                              value={editingAction.description || ''}
                              onChange={(e) => setEditingAction({ ...editingAction, description: e.target.value })}
                              placeholder="Explain why this action is correct or dangerous..."
                              required
                            />
                          </div>

                          <div className="input-group">
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={Boolean(editingAction.is_correct)}
                                onChange={(e) => setEditingAction({ ...editingAction, is_correct: e.target.checked })}
                              />
                              Is this a CORRECT Incident Response Action?
                            </label>
                          </div>

                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button type="submit" className="btn btn-primary">Save Action</button>
                            <button type="button" className="btn btn-ghost" onClick={() => setEditingAction(null)}>Cancel</button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
