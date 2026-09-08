import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authenticateByPin } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { STATIONS } from '../types';
import type { StationId } from '../types';

const VALID_STATIONS: StationId[] = [1, 2, 3, 4];

export default function KioskPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginAdmin } = useAuth();

  const rawStation = Number(searchParams.get('station'));
  const currentStationId: StationId = VALID_STATIONS.includes(rawStation as StationId)
    ? (rawStation as StationId)
    : 1;

  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  function selectStation(sid: StationId) {
    setError('');
    setPin('');
    navigate(`/kiosk?station=${sid}`, { replace: true });
  }

  function handleKey(digit: string) {
    if (digit === '⌫') {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      if (next.length === 4) authenticate(next);
    }
  }

  async function authenticate(pinValue: string) {
    setLoading(true);
    setError('');

    const { team, isAdmin, error: err } = await authenticateByPin(pinValue);
    setLoading(false);

    if (err) {
      setError('Invalid PIN. Please try again.');
      setPin('');
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    if (isAdmin) {
      loginAdmin();
      navigate('/admin');
      return;
    }

    if (team) {
      login(team);
      // Route to the configured station on this kiosk laptop
      navigate(`/station/${currentStationId}`);
    }
  }

  const stationInfo = STATIONS[currentStationId];
  const accentColor = stationInfo.color;

  return (
    <main className="page">
      <div style={{ width: '100%', maxWidth: 480 }} className="animate-fade-in">

        {/* Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <span className="cyber-logo">⚡ Cyber Circuit</span>
          <div className="cyber-divider" />
        </div>

        {/* Volunteer Station Selector Bar */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginBottom: '0.4rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            🖥️ Laptop Station Assignment (Click to switch station)
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.4rem',
            background: 'rgba(10,15,30,0.7)',
            padding: '0.35rem',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {VALID_STATIONS.map((sid) => {
              const st = STATIONS[sid];
              const isSelected = sid === currentStationId;
              return (
                <button
                  key={sid}
                  type="button"
                  onClick={() => selectStation(sid)}
                  style={{
                    padding: '0.5rem 0.25rem',
                    borderRadius: 8,
                    border: isSelected ? `1px solid ${st.color}` : '1px solid transparent',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    transition: 'all 0.2s ease',
                    background: isSelected ? `${st.color}25` : 'transparent',
                    color: isSelected ? st.color : 'var(--text-muted)',
                    fontWeight: isSelected ? 700 : 400,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.15rem',
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{st.icon}</span>
                  <span>Stn {sid}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kiosk Card */}
        <div
          className={`glass-card${shake ? ' animate-glitch' : ''}`}
          style={{ borderColor: `${accentColor}45` }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{
              fontSize: '2.5rem', marginBottom: '0.5rem',
              filter: `drop-shadow(0 0 12px ${accentColor})`,
            }}>
              {stationInfo.icon}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              color: accentColor,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '0.2rem',
            }}>
              STATION {currentStationId}: {stationInfo.category}
            </div>
            <h1 style={{ fontSize: '1.25rem', color: 'var(--text-bright)', marginBottom: '0.3rem' }}>
              {stationInfo.title}
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Enter your 4-digit team PIN to unlock this station
            </p>
          </div>

          {/* PIN Slots */}
          <div className="pin-entry">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`pin-slot${pin.length > i ? ' filled' : ''}`}
                style={pin.length > i ? { borderColor: accentColor, color: accentColor } : {}}
              >
                {pin.length > i ? (loading && i === pin.length - 1 ? '⟳' : '●') : ''}
              </div>
            ))}
          </div>

          {error && (
            <p className="error-msg" style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
              ⚠ {error}
            </p>
          )}

          {/* Keypad */}
          <div className="keypad">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
              <button
                key={d}
                id={`key-${d}`}
                className="key-btn"
                onClick={() => handleKey(d)}
                disabled={loading || pin.length >= 4}
              >
                {d}
              </button>
            ))}
            <button id="key-clear" className="key-btn clear" onClick={() => setPin('')} disabled={loading}>
              CLR
            </button>
            <button id="key-0" className="key-btn" onClick={() => handleKey('0')} disabled={loading || pin.length >= 4}>
              0
            </button>
            <button id="key-back" className="key-btn clear" onClick={() => handleKey('⌫')} disabled={loading}>
              ⌫
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
          <Link to="/register" id="go-register" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>
            Central Registration Desk
          </Link>
          {/* <Link to="/admin" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>
            Admin Leaderboard →
          </Link> */}
        </div>
      </div>
    </main>
  );
}
