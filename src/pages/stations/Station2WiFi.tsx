import { useState, useEffect } from 'react';
import ScoreSummary from '../../components/ScoreSummary';
import { fetchWiFiNetworks } from '../../lib/supabase';
import type { WiFiNetwork } from '../../types';

type Scene = 'intro' | 'scan';

const DEFAULT_NETWORKS: WiFiNetwork[] = [
  { id: 'net-1', ssid: 'BeanHub_Secure', security: 'WPA3', signal: 5, isSafe: true },
  { id: 'net-2', ssid: 'FREE_BEHUB_WIFI', security: 'Open', signal: 4, isSafe: false },
  { id: 'net-3', ssid: 'BeanHub_Guest', security: 'WPA2', signal: 3, isSafe: true },
  { id: 'net-4', ssid: 'BeanHub_Secure', security: 'Evil-Twin', signal: 5, isSafe: false },
  { id: 'net-5', ssid: 'AndroidHotspot_88', security: 'Open', signal: 2, isSafe: false },
];

interface Outcome {
  title: string;
  message: string;
  score: number;
  color: string;
  icon: string;
}

function getOutcome(network: WiFiNetwork): Outcome {
  if (network.security === 'WPA3' && network.isSafe) {
    return { title: 'Safe Connection!', message: 'Excellent choice! WPA3 is the current gold standard for Wi-Fi security. Your data is protected with the latest encryption protocol. You\'re safe to work from this café.', score: 5, color: 'var(--neon-green)', icon: '🛡️' };
  }
  if (network.security === 'WPA2' && network.isSafe) {
    return { title: 'Acceptable — But Not Ideal', message: 'WPA2 is acceptable but slightly outdated. Prefer WPA3 when available. Still, this is the official café guest network — far better than open Wi-Fi.', score: 3, color: 'var(--neon-amber)', icon: '⚠️' };
  }
  if (network.security === 'Evil-Twin') {
    return { title: 'DANGER: Evil Twin Attack!', message: 'This network is a rogue access point with the same name as the café\'s real network! Attackers use Evil Twin attacks to intercept all your traffic. Never trust identical SSIDs — verify with staff.', score: 0, color: 'var(--neon-red)', icon: '💀' };
  }
  return { title: 'DANGER: Open Network!', message: 'Open/unsecured Wi-Fi sends all data unencrypted. Anyone nearby can use a packet sniffer to capture your passwords, messages, and browsing. Always avoid open public Wi-Fi.', score: 0, color: 'var(--neon-pink)', icon: '🚨' };
}

function SignalBars({ signal }: { signal: number }) {
  return (
    <div className="signal-bars">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`signal-bar${i <= signal ? ' active' : ''}`}
          style={{ height: `${i * 4}px` }}
        />
      ))}
    </div>
  );
}

const SCANNER_BADGE: Record<string, { label: string; cls: string }> = {
  WPA3:        { label: 'WPA3', cls: 'badge-muted' },
  WPA2:        { label: 'WPA2', cls: 'badge-muted' },
  Open:        { label: 'Open', cls: 'badge-muted' },
  'Evil-Twin': { label: 'WPA2', cls: 'badge-muted' },
};

const OUTCOME_BADGE: Record<string, { label: string; cls: string }> = {
  WPA3:        { label: 'WPA3', cls: 'badge-green' },
  WPA2:        { label: 'WPA2', cls: 'badge-amber' },
  Open:        { label: 'Open', cls: 'badge-red' },
  'Evil-Twin': { label: 'Evil-Twin', cls: 'badge-red' },
};

export default function Station2WiFi() {
  const [networks, setNetworks] = useState<WiFiNetwork[]>(DEFAULT_NETWORKS);
  const [scene, setScene] = useState<Scene>('intro');
  const [selectedNetwork, setSelectedNetwork] = useState<WiFiNetwork | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    async function loadDynamic() {
      const dbData = await fetchWiFiNetworks();
      if (dbData && dbData.length > 0) {
        const mapped: WiFiNetwork[] = dbData.map((d) => ({
          id: d.id || crypto.randomUUID(),
          ssid: d.ssid,
          security: d.security,
          signal: d.signal,
          isSafe: d.is_safe,
        }));
        setNetworks(mapped);
      }
    }
    loadDynamic();
  }, []);

  const outcome = selectedNetwork ? getOutcome(selectedNetwork) : null;

  function handleSubmit() {
    if (!selectedNetwork) return;
    setSubmitted(true);
    setShowScore(true);
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 800, margin: '0 auto' }}>
      {/* Station Header */}
      <div className="station-header animate-fade-in">
        <div className="station-icon-wrap" style={{ background: 'rgba(255,165,2,0.15)', border: '1px solid rgba(255,165,2,0.4)' }}>
          📡
        </div>
        <div>
          <h2 style={{ color: 'var(--station-2)', marginBottom: '0.2rem' }}>Coffee Shop Connection</h2>
          <p style={{ fontSize: '0.85rem' }}>Analyze the scanner and choose your connection wisely.</p>
        </div>
      </div>

      {/* Scene: Intro */}
      {scene === 'intro' && (
        <div className="glass-card animate-fade-in">
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,165,2,0.1), rgba(255,165,2,0.03))',
            border: '1px solid rgba(255,165,2,0.2)',
            borderRadius: 12,
            padding: '1.5rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>☕</div>
            <h3 style={{ color: 'var(--neon-amber)', marginBottom: '0.75rem' }}>
              You're at BeanHub Café
            </h3>
            <p style={{ fontSize: '0.9rem', maxWidth: 520, margin: '0 auto' }}>
              You need to submit your assignment deadline tonight.
              You open your laptop and see several Wi-Fi networks nearby.
              Your task: <strong style={{ color: 'var(--text-primary)' }}>analyze the network scanner and pick the safest connection.</strong>
            </p>
          </div>

          {/* Scenario tips */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { icon: '🔒', tip: 'WPA3 is the most secure Wi-Fi protocol' },
              { icon: '📶', tip: 'High signal strength doesn\'t mean safe' },
              { icon: '📡', tip: 'Evil Twin attacks copy legitimate network names' },
              { icon: '🔓', tip: 'Open networks send data with zero encryption' },
            ].map((item) => (
              <div key={item.tip} style={{
                padding: '0.75rem',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                {item.tip}
              </div>
            ))}
          </div>

          <button
            id="wifi-start-scan"
            className="btn btn-primary btn-lg btn-full"
            onClick={() => setScene('scan')}
          >
            Open Network Scanner →
          </button>
        </div>
      )}

      {/* Scene: Network Scanner */}
      {scene === 'scan' && (
        <div className="animate-fade-in">
          {/* Terminal-style scanner */}
          <div className="terminal" style={{ marginBottom: '1rem' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
              NETWORK SCANNER v2.1 — {networks.length} networks detected
            </div>
            {['Scanning 2.4GHz band...', 'Scanning 5GHz band...', 'Analysis complete.'].map((line, i) => (
              <div key={i} style={{ marginBottom: '0.2rem', opacity: 0.6 }}>$ {line}</div>
            ))}
          </div>

          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--neon-amber)', marginBottom: '1rem' }}>
              📡 Available Networks — Select One to Connect
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {networks.map((net) => {
                const isSelected = selectedNetwork?.id === net.id;
                const badge = SCANNER_BADGE[net.security] || { label: net.security, cls: 'badge-muted' };

                return (
                  <div
                    key={net.id}
                    id={`network-${net.id}`}
                    className={`network-row${isSelected ? ' active' : ''}`}
                    onClick={() => !submitted && setSelectedNetwork(net)}
                    style={{
                      cursor: submitted ? 'default' : 'pointer',
                      border: isSelected ? '1px solid var(--neon-amber)' : undefined,
                      background: isSelected ? 'rgba(255,165,2,0.08)' : undefined,
                    }}
                  >
                    <div style={{ fontSize: '1.2rem' }}>
                      {net.security === 'Open' ? '🔓' : '🔒'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                        {net.ssid}
                      </div>
                      <span className={`badge ${badge.cls}`} style={{ fontSize: '0.68rem' }}>
                        {badge.label}
                      </span>
                    </div>
                    <SignalBars signal={net.signal} />
                    <div style={{ fontSize: '1rem', color: isSelected ? 'var(--neon-amber)' : 'var(--text-muted)' }}>
                      {isSelected ? '● Selected' : '○'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Decision Bar */}
          {!submitted && (
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Connection Selection:
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                  {selectedNetwork ? selectedNetwork.ssid : 'None selected'}
                </div>
              </div>
              <button
                id="wifi-submit"
                className="btn btn-warning btn-lg"
                onClick={handleSubmit}
                disabled={!selectedNetwork}
              >
                Submit Connection Decision →
              </button>
            </div>
          )}

          {/* Post-Submit Results Breakdown */}
          {submitted && outcome && selectedNetwork && (
            <div className="glass-card animate-fade-in" style={{ borderColor: `${outcome.color}40`, marginTop: '1.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>{outcome.icon}</div>
                <h2 style={{ color: outcome.color, marginBottom: '0.5rem' }}>{outcome.title}</h2>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  You connected to: <span style={{ color: 'var(--text-primary)' }}>{selectedNetwork.ssid}</span>
                </div>
                <p style={{ maxWidth: 520, margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  {outcome.message}
                </p>
              </div>

              {/* Details card */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 10,
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '1rem',
                textAlign: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>SSID</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{selectedNetwork.ssid}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Security Protocol</div>
                  <span className={`badge ${(OUTCOME_BADGE[selectedNetwork.security] || { cls: 'badge-muted', label: selectedNetwork.security }).cls}`}>
                    {(OUTCOME_BADGE[selectedNetwork.security] || { label: selectedNetwork.security }).label}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Score</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: outcome.color }}>
                    {outcome.score}/5
                  </div>
                </div>
              </div>

              {!showScore && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(57,255,20,0.05)',
                  border: '1px solid rgba(57,255,20,0.2)',
                  borderRadius: 8,
                  padding: '0.75rem 1rem',
                }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--neon-green)', fontFamily: 'var(--font-mono)' }}>
                    ✓ Score saved to leaderboard. Ready for next team?
                  </span>
                  <a
                    href="/kiosk?station=2"
                    className="btn btn-danger btn-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    🔒 Finish & Lock Kiosk
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showScore && outcome && (
        <ScoreSummary
          stationId={2}
          rawScore={outcome.score}
          rawMax={5}
          onClose={() => setShowScore(false)}
        />
      )}
    </div>
  );
}
