import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { STATIONS } from '../../types';
import type { StationId } from '../../types';

interface StationLayoutProps {
  stationId: StationId;
  children: React.ReactNode;
}

const ALL_STATIONS: StationId[] = [1, 2, 3, 4];

export default function StationLayout({ stationId, children }: StationLayoutProps) {
  const navigate = useNavigate();
  const { isAuthenticated, team, logout } = useAuth();
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  const station = STATIONS[stationId];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/kiosk?station=${stationId}`, { replace: true });
    }
  }, [isAuthenticated, stationId, navigate]);

  if (!isAuthenticated || !station) return null;

  function handleLockStation() {
    logout();
    navigate(`/kiosk?station=${stationId}`);
  }

  function handleSwitchStation(targetId: StationId) {
    navigate(`/station/${targetId}`);
    setShowSwitchMenu(false);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Top Nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backdropFilter: 'blur(16px)',
        background: 'rgba(5,8,16,0.92)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.65rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Left branding & station info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="cyber-logo" style={{ fontSize: '0.85rem' }}>Cyber Circuit</span>
          <div style={{ width: 1, height: 20, background: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.25rem' }}>{station.icon}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', color: station.color, letterSpacing: '0.08em' }}>
                Station {stationId}: {station.title}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{station.subtitle}</div>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
          {team && (
            <span className="badge badge-cyan" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}>
              👥 {team.group_name}
            </span>
          )}

          {/* Station Switcher button for volunteers */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSwitchMenu((v) => !v)}
              className="btn btn-sm btn-ghost"
              style={{ fontSize: '0.75rem' }}
              title="Station Manager Switcher"
            >
              🔄 Change Station ▾
            </button>

            {showSwitchMenu && (
              <div style={{
                position: 'absolute',
                top: '120%',
                right: 0,
                width: 220,
                background: 'rgba(10,15,30,0.98)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                padding: '0.5rem',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', padding: '0.25rem 0.5rem', fontFamily: 'var(--font-mono)' }}>
                  STATION SELECTOR
                </div>
                {ALL_STATIONS.map((sid) => {
                  const st = STATIONS[sid];
                  const isActive = sid === stationId;
                  return (
                    <button
                      key={sid}
                      onClick={() => handleSwitchStation(sid)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.45rem 0.65rem',
                        borderRadius: 6,
                        border: 'none',
                        background: isActive ? `${st.color}25` : 'transparent',
                        color: isActive ? st.color : 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      <span>{st.icon}</span>
                      <span style={{ fontWeight: isActive ? 700 : 400 }}>
                        Station {sid}: {st.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lock Station Button */}
          <button
            onClick={handleLockStation}
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '0.75rem' }}
          >
            🔒 Lock Station
          </button>
        </div>
      </header>

      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        {children}
      </main>
    </div>
  );
}
