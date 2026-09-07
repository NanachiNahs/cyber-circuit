import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveTeamScore } from '../lib/supabase';
import { MAX_POINTS } from '../types';
import type { StationId } from '../types';

interface ScoreSummaryProps {
  stationId: StationId;
  /** Raw score from game logic (any range) */
  rawScore: number;
  /** Max possible raw score from game logic */
  rawMax: number;
  onClose?: () => void;
}

const GRADE: Record<string, { label: string; color: string; icon: string }> = {
  S: { label: 'PERFECT',    color: 'var(--neon-green)',  icon: '🏆' },
  A: { label: 'EXCELLENT',  color: 'var(--neon-cyan)',   icon: '⭐' },
  B: { label: 'GOOD',       color: 'var(--neon-amber)',  icon: '👍' },
  C: { label: 'PASS',       color: 'var(--neon-purple)', icon: '🔰' },
  F: { label: 'TRY AGAIN',  color: 'var(--neon-pink)',   icon: '❌' },
};

function getGradeKey(pct: number): keyof typeof GRADE {
  if (pct >= 100) return 'S';
  if (pct >= 80)  return 'A';
  if (pct >= 60)  return 'B';
  if (pct >= 40)  return 'C';
  return 'F';
}

export default function ScoreSummary({ stationId, rawScore, rawMax, onClose }: ScoreSummaryProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { team, addScore } = useAuth();

  const [savedStatus, setSavedStatus] = useState<'saving' | 'saved' | 'error'>('saving');
  const savedRef = useRef(false);

  // Normalise raw score to 0–1000 (matches max_points in stations table)
  const pct = rawMax > 0 ? Math.round((rawScore / rawMax) * 100) : 0;
  const normalised = Math.round((pct / 100) * MAX_POINTS); // 0–1000
  const gradeKey = getGradeKey(pct);
  const grade = GRADE[gradeKey];

  // Auto-submit score to Supabase immediately when summary modal mounts
  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    async function autoSubmit() {
      if (team) {
        addScore({
          id: crypto.randomUUID(),
          team_id: team.id,
          station_id: stationId,
          score: normalised,
          completed_at: new Date().toISOString(),
        });
        const { error } = await saveTeamScore(team.id, stationId, normalised);
        if (error) {
          console.error('Failed to auto-save score to Supabase:', error);
          setSavedStatus('error');
        } else {
          setSavedStatus('saved');
        }
      } else {
        setSavedStatus('saved');
      }
    }

    autoSubmit();
  }, [team, stationId, normalised, addScore]);

  function handleFinish() {
    const stationParam = searchParams.get('station') ?? String(stationId);
    navigate(`/kiosk?station=${stationParam}`);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(5,8,16,0.92)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: '1rem',
    }}>
      <div className="glass-card animate-fade-in" style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

        {/* Auto-submission status badge */}
        <div style={{ marginBottom: '0.75rem' }}>
          <span
            className={`badge ${savedStatus === 'saved' ? 'badge-green' : savedStatus === 'error' ? 'badge-red' : 'badge-cyan'}`}
            style={{ fontSize: '0.73rem', padding: '0.3rem 0.75rem' }}
          >
            {savedStatus === 'saving' && '⟳ Submitting Results to Leaderboard...'}
            {savedStatus === 'saved' && '✓ Results Automatically Saved & Submitted!'}
            {savedStatus === 'error' && '⚠ Offline / Synced locally'}
          </span>
        </div>

        <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>{grade.icon}</div>
        <div style={{
          fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 900,
          color: grade.color, textShadow: `0 0 20px ${grade.color}`, marginBottom: '0.25rem',
        }}>
          {grade.label}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Station {stationId} Complete
        </div>

        {/* Score */}
        <div style={{
          background: 'rgba(0,245,255,0.04)', border: '1px solid var(--border-subtle)',
          borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Points Earned</span>
            <span style={{ fontFamily: 'var(--font-heading)', color: grade.color }}>
              {normalised} / {MAX_POINTS}
            </span>
          </div>
          <div className="score-bar-track">
            <div
              className="score-bar-fill"
              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${grade.color}, ${grade.color}aa)` }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>0</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', color: grade.color }}>{pct}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{MAX_POINTS}</span>
          </div>
        </div>

        {team && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Team: <span style={{ color: 'var(--neon-cyan)' }}>{team.group_name}</span>
          </p>
        )}

        <button
          id="finish-lock-kiosk"
          className="btn btn-danger btn-lg btn-full"
          onClick={handleFinish}
          style={{ marginBottom: '0.75rem' }}
        >
          🔒 Finish & Lock Kiosk (Next Group)
        </button>

        {onClose && (
          <button id="review-answers" className="btn btn-ghost btn-full btn-sm" onClick={onClose}>
            ↩ Review Answers
          </button>
        )}
      </div>
    </div>
  );
}
