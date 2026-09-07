import { useState, useEffect } from 'react';
import ScoreSummary from '../../components/ScoreSummary';
import { fetchRansomwareActions } from '../../lib/supabase';
import type { ResponseAction } from '../../types';

const DEFAULT_ACTIONS: ResponseAction[] = [
  { id: 'a1', label: 'Disconnect the Ethernet cable immediately', description: 'Physically cutting the network connection stops the ransomware from spreading to other devices and communicating with the C2 server.', isCorrect: true, selected: false },
  { id: 'a2', label: 'Pay the ransom immediately via cryptocurrency', description: 'Paying does NOT guarantee file recovery and funds future attacks. This is never recommended.', isCorrect: false, selected: false },
  { id: 'a3', label: 'Open Task Manager and kill malicious PID', description: 'Terminating the ransomware process (malicious PID) stops active encryption of files.', isCorrect: true, selected: false },
  { id: 'a4', label: 'Restart the computer to "clear" the virus', description: 'Rebooting does not remove ransomware and may trigger additional encryption or boot-locker mechanisms.', isCorrect: false, selected: false },
  { id: 'a5', label: 'Photograph the ransom screen for evidence', description: 'Documenting the incident is important for law enforcement and insurance claims.', isCorrect: true, selected: false },
  { id: 'a6', label: 'Disable Wi-Fi adapter in Device Manager', description: 'Removing all network interfaces prevents further spread and C2 communication.', isCorrect: true, selected: false },
  { id: 'a7', label: 'Continue working on other files using cloud backup', description: 'Any device connected may be infected. Stop all activity and isolate.', isCorrect: false, selected: false },
  { id: 'a8', label: 'Notify IT Security / Management immediately', description: 'Incident response requires escalation so the team can begin containment and recovery.', isCorrect: true, selected: false },
  { id: 'a9', label: 'Run a full antivirus scan while ransomware is active', description: 'AV scans during active encryption may interfere with recovery and don\'t stop the attack fast enough.', isCorrect: false, selected: false },
  { id: 'a10', label: 'Restore from clean, verified offline backup', description: 'Offline backups are the primary recovery method. Verify they are clean before restoring.', isCorrect: true, selected: false },
];

export default function Station4Ransomware() {
  const [actions, setActions] = useState<ResponseAction[]>(DEFAULT_ACTIONS);
  const [submitted, setSubmitted] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    async function loadDynamic() {
      const dbActions = await fetchRansomwareActions();
      if (dbActions && dbActions.length > 0) {
        const mapped: ResponseAction[] = dbActions.map((d) => ({
          id: d.id || crypto.randomUUID(),
          label: d.label,
          description: d.description,
          isCorrect: d.is_correct,
          selected: false,
        }));
        setActions(mapped);
      }
    }
    loadDynamic();
  }, []);

  function toggleAction(id: string) {
    if (submitted) return;
    setActions(prev => prev.map(a => a.id === id ? { ...a, selected: !a.selected } : a));
  }

  function handleSubmit() {
    setSubmitted(true);
    setGlitch(true);
    setTimeout(() => setGlitch(false), 600);
    setTimeout(() => setShowScore(true), 800);
  }

  const correctIds = actions.filter(a => a.isCorrect).map(a => a.id);
  const selectedCorrect = actions.filter(a => a.selected && a.isCorrect).length;
  const selectedWrong = actions.filter(a => a.selected && !a.isCorrect).length;
  const score = Math.max(0, selectedCorrect * 15 - selectedWrong * 10);
  const maxScore = Math.max(15, correctIds.length * 15);


  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>

      {/* Station Header */}
      <div className={`station-header animate-fade-in${glitch ? ' animate-glitch' : ''}`}>
        <div className="station-icon-wrap" style={{ background: 'rgba(255,107,129,0.15)', border: '1px solid rgba(255,107,129,0.4)' }}>
          ☣️
        </div>
        <div>
          <h2 style={{ color: 'var(--station-4)', marginBottom: '0.2rem' }}>Ransomware Response</h2>
          <p style={{ fontSize: '0.85rem' }}>Select ALL correct incident response actions. Avoid the wrong ones!</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <span className="badge badge-green">{actions.filter(a => a.selected).length} selected</span>
        </div>
      </div>

      {/* Ransomware "Infection" Banner */}
      <div
        className={glitch ? 'animate-glitch' : ''}
        style={{
          background: 'linear-gradient(135deg, rgba(255,51,51,0.15), rgba(255,107,129,0.08))',
          border: '2px solid rgba(255,51,51,0.5)',
          borderRadius: 12,
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          animation: 'pulse-glow 2s ease infinite',
        }}
      >
        <div style={{ fontSize: '2.5rem' }}>☣️</div>
        <div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1rem',
            color: 'var(--neon-red)',
            letterSpacing: '0.1em',
            marginBottom: '0.3rem',
          }}>
            ⚠ RANSOMWARE DETECTED
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Process: <span style={{ color: 'var(--neon-red)' }}>cryptolock.exe [PID: 4829]</span> is actively encrypting files.
            <br />
            Files affected: <span style={{ color: 'var(--neon-amber)' }}>2,847 files</span> —
            Network: <span style={{ color: 'var(--neon-red)' }}>Actively communicating with C2 server</span>
          </div>
        </div>
      </div>

      {/* Fake Task Manager snippet */}
      <div className="terminal" style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
          TASK MANAGER — Active Processes
        </div>
        {[
          { pid: 4829, name: 'cryptolock.exe', cpu: '87.3%', mem: '245 MB', status: '🔴 MALICIOUS' },
          { pid: 1248, name: 'explorer.exe', cpu: '2.1%', mem: '82 MB', status: '🟢 OK' },
          { pid: 892, name: 'svchost.exe', cpu: '0.8%', mem: '34 MB', status: '🟢 OK' },
          { pid: 3321, name: 'chrome.exe', cpu: '4.2%', mem: '512 MB', status: '🟡 WARN' },
        ].map(p => (
          <div key={p.pid} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 70px 90px 100px', gap: '0.5rem', marginBottom: '0.3rem', fontSize: '0.78rem', alignItems: 'center' }}>
            <span style={{ opacity: 0.5 }}>{p.pid}</span>
            <span style={{ color: p.status.includes('MALICIOUS') ? 'var(--neon-red)' : 'var(--text-primary)' }}>{p.name}</span>
            <span style={{ color: p.status.includes('MALICIOUS') ? 'var(--neon-red)' : 'var(--text-secondary)' }}>{p.cpu}</span>
            <span style={{ color: 'var(--text-muted)' }}>{p.mem}</span>
            <span style={{ fontSize: '0.7rem' }}>{p.status}</span>
          </div>
        ))}
      </div>

      {/* Checklist */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ color: 'var(--station-4)', marginBottom: '0.3rem' }}>Incident Response Checklist</h3>
        <p style={{ fontSize: '0.82rem', marginBottom: '1.25rem' }}>
          Select all the correct actions you should take. Selecting wrong actions will deduct points.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {actions.map((action) => {
            let itemClass = 'checklist-item';
            if (submitted) {
              if (action.selected && action.isCorrect) itemClass += ' selected-correct';
              else if (action.selected && !action.isCorrect) itemClass += ' selected-wrong';
            } else if (action.selected) {
              itemClass += ' selected-correct';
            }

            return (
              <div
                key={action.id}
                id={`action-${action.id}`}
                className={itemClass}
                onClick={() => toggleAction(action.id)}
              >
                <div className="checklist-checkbox" style={
                  submitted
                    ? action.selected && action.isCorrect
                      ? { background: 'var(--neon-green)', borderColor: 'var(--neon-green)', color: '#050810' }
                      : action.selected && !action.isCorrect
                        ? { background: 'var(--neon-red)', borderColor: 'var(--neon-red)', color: '#fff' }
                        : !action.selected && action.isCorrect
                          ? { borderColor: 'var(--neon-amber)' }
                          : {}
                    : action.selected
                      ? { background: 'var(--neon-cyan)', borderColor: 'var(--neon-cyan)', color: '#050810' }
                      : {}
                }>
                  {submitted
                    ? action.selected && action.isCorrect ? '✓'
                      : action.selected && !action.isCorrect ? '✗'
                        : !action.selected && action.isCorrect ? '!' : ''
                    : action.selected ? '✓' : ''}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.2rem' }}>
                    {action.label}
                  </div>
                  {submitted && (
                    <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {action.description}
                    </div>
                  )}
                </div>
                {submitted && (
                  <span className={`badge ${action.isCorrect ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.65rem', flexShrink: 0 }}>
                    {action.isCorrect ? '✓ Correct' : '✗ Wrong'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Score Preview */}
      {!submitted && actions.some(a => a.selected) && (
        <div style={{ textAlign: 'center', marginBottom: '1rem', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {actions.filter(a => a.selected).length} actions selected
        </div>
      )}

      {!submitted && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            id="station4-submit"
            className="btn btn-danger btn-lg"
            onClick={handleSubmit}
            disabled={actions.filter(a => a.selected).length === 0}
          >
            ☣️ Submit Incident Response
          </button>
        </div>
      )}

      {submitted && !showScore && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(57,255,20,0.05)',
          border: '1px solid rgba(57,255,20,0.2)',
          borderRadius: 12,
          padding: '0.85rem 1.25rem',
          marginTop: '1.5rem',
        }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--neon-green)', fontFamily: 'var(--font-mono)' }}>
            ✓ Incident response results saved to leaderboard!
          </span>
          <a
            href="/kiosk?station=4"
            className="btn btn-danger btn-sm"
            style={{ textDecoration: 'none' }}
          >
            🔒 Finish & Lock Kiosk
          </a>
        </div>
      )}

      {showScore && (
        <ScoreSummary
          stationId={4}
          rawScore={score}
          rawMax={maxScore}
          onClose={() => setShowScore(false)}
        />
      )}
    </div>
  );
}

