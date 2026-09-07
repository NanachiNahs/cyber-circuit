import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerTeam, loginTeam } from '../lib/supabase';

type Mode = 'register' | 'login';

export default function RegisterPage() {
  const [mode, setMode] = useState<Mode>('register');
  const [groupName, setGroupName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ pin: string; group: string; isNew: boolean } | null>(null);

  function handleModeSwitch(newMode: Mode) {
    setMode(newMode);
    setError('');
  }

  function resetForm() {
    setResult(null);
    setGroupName('');
    setPassword('');
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!groupName.trim()) { setError('Group name is required.'); return; }
    if (!password.trim()) { setError('Password is required.'); return; }
    if (mode === 'register' && password.trim().length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    setError('');
    setLoading(true);

    if (mode === 'register') {
      const { team, error: err } = await registerTeam(groupName, password);
      setLoading(false);
      if (err || !team) {
        setError(err ?? 'Registration failed. Please try again.');
        return;
      }
      setResult({ pin: team.pin, group: team.group_name, isNew: true });
    } else {
      const { team, error: err } = await loginTeam(groupName, password);
      setLoading(false);
      if (err || !team) {
        setError(err ?? 'Invalid team name or password.');
        return;
      }
      setResult({ pin: team.pin, group: team.group_name, isNew: false });
    }
  }

  // ── PIN-only fullscreen display ─────────────────────────────
  if (result) {
    return (
      <main className="page" style={{ gap: 0 }}>
        <div className="animate-fade-in" style={{ width: '100%', maxWidth: 520, textAlign: 'center' }}>

          {/* Logo */}
          <span className="cyber-logo" style={{ fontSize: '0.9rem', opacity: 0.6 }}>
            Cyber Circuit
          </span>

          {/* Status Badge */}
          <div style={{ marginTop: '1rem' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.1em',
                borderRadius: 20,
                textTransform: 'uppercase',
                background: result.isNew ? 'rgba(57,255,20,0.12)' : 'rgba(0,229,255,0.12)',
                color: result.isNew ? 'var(--neon-green)' : 'var(--neon-cyan)',
                border: `1px solid ${result.isNew ? 'var(--neon-green)' : 'var(--neon-cyan)'}`,
              }}
            >
              {result.isNew ? '✓ Team Registered' : '✓ Access Granted'}
            </span>
          </div>

          {/* Team name */}
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.4rem',
            color: 'var(--text-bright)',
            marginTop: '1rem',
            letterSpacing: '0.05em',
          }}>
            {result.group}
          </h2>

          {/* Label */}
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginTop: '0.25rem',
            marginBottom: '1.5rem',
          }}>
            Your 4-Digit Station PIN
          </p>

          {/* Giant PIN */}
          <div style={{
            display: 'flex',
            gap: '1.25rem',
            justifyContent: 'center',
            marginBottom: '2rem',
          }}>
            {result.pin.split('').map((digit, i) => (
              <div
                key={i}
                style={{
                  width: 100,
                  height: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '3.5rem',
                  fontWeight: 900,
                  color: 'var(--neon-green)',
                  background: 'rgba(10,15,30,0.95)',
                  border: '2px solid var(--neon-green)',
                  borderRadius: 16,
                  boxShadow: 'var(--glow-green), inset 0 0 30px rgba(57,255,20,0.06)',
                  animation: `pin-pop 0.4s cubic-bezier(0.68,-0.55,0.265,1.55) ${i * 0.1 + 0.1}s both`,
                }}
              >
                {digit}
              </div>
            ))}
          </div>

          {/* Single instruction line */}
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: 'var(--neon-amber)',
            letterSpacing: '0.05em',
            marginBottom: '2rem',
          }}>
            Walk to any station and enter this PIN to begin.
          </p>
        </div>
      </main>
    );
  }

  // ── Registration & Login Form ──────────────────────────────
  return (
    <main className="page">
      <div style={{ width: '100%', maxWidth: 460 }} className="animate-fade-in">

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span className="cyber-logo">Cyber Circuit</span>
          <div className="cyber-divider" />
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          marginBottom: '1rem',
          background: 'rgba(10,15,30,0.6)',
          padding: '0.35rem',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <button
            type="button"
            onClick={() => handleModeSwitch('register')}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.82rem',
              letterSpacing: '0.05em',
              transition: 'all 0.2s ease',
              background: mode === 'register' ? 'var(--neon-green)' : 'transparent',
              color: mode === 'register' ? '#000' : 'var(--text-muted)',
              fontWeight: mode === 'register' ? 700 : 400,
              boxShadow: mode === 'register' ? 'var(--glow-green)' : 'none',
            }}
          >
            ＋ Register Team
          </button>

          <button
            type="button"
            onClick={() => handleModeSwitch('login')}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
              fontSize: '0.82rem',
              letterSpacing: '0.05em',
              transition: 'all 0.2s ease',
              background: mode === 'login' ? 'var(--neon-cyan)' : 'transparent',
              color: mode === 'login' ? '#000' : 'var(--text-muted)',
              fontWeight: mode === 'login' ? 700 : 400,
              boxShadow: mode === 'login' ? '0 0 15px rgba(0,229,255,0.4)' : 'none',
            }}
          >
            🔑 Team Login
          </button>
        </div>

        <div className="glass-card">
          <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>
              {mode === 'register' ? 'New Team Registration' : 'Team PIN Retrieval'}
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {mode === 'register'
                ? 'Create a team profile to get your 4-digit station PIN.'
                : 'Already registered? Enter your credentials to view your PIN.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="group-name">Team / Group Name</label>
              <input
                id="group-name"
                className={`input-field${error && !groupName.trim() ? ' input-error' : ''}`}
                type="text"
                placeholder="e.g. Alpha Squad"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={40}
                autoComplete="off"
                autoFocus
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="team-password">Password</label>
              <input
                id="team-password"
                className={`input-field${error && !password.trim() ? ' input-error' : ''}`}
                type="password"
                placeholder={mode === 'register' ? 'Create a team password' : 'Enter your team password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={64}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
              <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                {mode === 'register'
                  ? 'Used to recover your PIN if lost.'
                  : 'The password set during registration.'}
              </span>
            </div>

            {error && <span className="error-msg">⚠ {error}</span>}

            <button
              id="register-submit"
              type="submit"
              className={`btn btn-lg btn-full ${mode === 'register' ? 'btn-primary' : ''}`}
              style={mode === 'login' ? {
                background: 'var(--neon-cyan)',
                color: '#000',
                border: 'none',
                fontWeight: 700,
                boxShadow: '0 0 20px rgba(0,229,255,0.4)',
              } : undefined}
              disabled={loading}
            >
              {loading
                ? '⟳ Processing...'
                : mode === 'register'
                  ? 'Get My PIN →'
                  : 'Retrieve PIN →'}
            </button>
          </form>
        </div>

        {/* <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.5 }}>
          <Link to="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Admin Dashboard
          </Link>
        </p> */}
      </div>
    </main>
  );
}
