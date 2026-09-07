import { useState, useRef, useEffect } from 'react';
import ScoreSummary from '../../components/ScoreSummary';
import { fetchPasswordProfile } from '../../lib/supabase';
import type { SocialProfile, PasswordAttempt } from '../../types';

const DEFAULT_TARGET_PASSWORD = 'Fluffy2003!';
const DEFAULT_MAX_ATTEMPTS = 10;

const DEFAULT_PROFILE: SocialProfile = {
  name: 'Alex Rivera',
  username: '@a_rivera03',
  birthday: 'March 15, 2003',
  school: 'St. Ignatius University',
  pet: 'Fluffy',
  favoriteTeam: 'Manila Eagles',
  joinYear: '2021',
  posts: [
    '🐱 Just adopted the cutest kitten! Her name is Fluffy and I\'m obsessed 😍 #CatMom',
    '🎂 Another year older! 2003 was a good year to be born hehe',
    '📚 First week at St. Ignatius done! So tired but so worth it #university',
    '🐾 Fluffy learned how to open doors today... help 😂',
    '❤️ Happy birthday to my baby Fluffy! Can\'t believe it\'s been 2 years',
  ],
  avatar: '👤',
};

const DEFAULT_HINTS = [
  'Passwords often contain pet names',
  'Birth year is a common password component',
  'Adding symbols like ! makes passwords seem stronger',
  'Check the profile for personal details',
];

export default function Station3Password() {
  const [targetPassword, setTargetPassword] = useState(DEFAULT_TARGET_PASSWORD);
  const [maxAttempts, setMaxAttempts] = useState(DEFAULT_MAX_ATTEMPTS);
  const [profile, setProfile] = useState<SocialProfile>(DEFAULT_PROFILE);
  const [hints, setHints] = useState<string[]>(DEFAULT_HINTS);

  const [attempts, setAttempts] = useState<PasswordAttempt[]>([]);
  const [input, setInput] = useState('');
  const [cracked, setCracked] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [failed, setFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadDynamic() {
      const dbProfile = await fetchPasswordProfile();
      if (dbProfile) {
        setTargetPassword(dbProfile.target_password);
        setMaxAttempts(dbProfile.max_attempts || 10);
        setProfile({
          name: dbProfile.name,
          username: dbProfile.username,
          birthday: dbProfile.birthday,
          school: dbProfile.school,
          pet: dbProfile.pet,
          favoriteTeam: dbProfile.favorite_team,
          joinYear: dbProfile.join_year,
          posts: dbProfile.posts || DEFAULT_PROFILE.posts,
          avatar: '👤',
        });
        if (dbProfile.hints && dbProfile.hints.length > 0) {
          setHints(dbProfile.hints);
        }
      }
    }
    loadDynamic();
  }, []);

  const attemptsLeft = maxAttempts - attempts.length;
  const score = cracked ? Math.max(1, maxAttempts - attempts.length + 1) : 0;

  function handleAttempt() {
    if (!input.trim() || cracked || failed) return;

    const attempt: PasswordAttempt = { guess: input.trim(), timestamp: Date.now() };
    const newAttempts = [...attempts, attempt];
    setAttempts(newAttempts);
    setInput('');

    if (input.trim() === targetPassword) {
      setCracked(true);
      setShowScore(true);
      return;
    }

    if (newAttempts.length >= maxAttempts) {
      setFailed(true);
      setShowScore(true);
    }

    inputRef.current?.focus();
  }

  function useHint() {
    if (hintsUsed < hints.length && !revealedHints.includes(hintsUsed)) {
      setRevealedHints(prev => [...prev, hintsUsed]);
      setHintsUsed(h => h + 1);
    }
  }

  function getSimilarity(guess: string): string {
    const target = targetPassword.toLowerCase();
    const g = guess.toLowerCase();
    if (g === target) return '✅ CRACKED!';

    let matches = 0;
    for (let i = 0; i < Math.min(g.length, target.length); i++) {
      if (g[i] === target[i]) matches++;
    }
    const pct = Math.round((matches / target.length) * 100);
    if (pct >= 70) return '🔥 Very close!';
    if (pct >= 40) return '🌡 Getting warmer';
    return '❄️ Cold';
  }


  return (
    <div style={{ padding: '1.5rem', maxWidth: 1000, margin: '0 auto' }}>

      {/* Station Header */}
      <div className="station-header animate-fade-in">
        <div className="station-icon-wrap" style={{ background: 'rgba(46,213,115,0.15)', border: '1px solid rgba(46,213,115,0.4)' }}>
          🔓
        </div>
        <div>
          <h2 style={{ color: 'var(--station-3)', marginBottom: '0.2rem' }}>Password Cracker</h2>
          <p style={{ fontSize: '0.85rem' }}>
            Study the social media profile and crack the password in {maxAttempts} attempts.
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className={`badge ${attemptsLeft > 5 ? 'badge-green' : attemptsLeft > 2 ? 'badge-amber' : 'badge-red'}`}>
            {attemptsLeft} attempts left
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Social Profile Panel */}
        <div className="glass-card" style={{ borderColor: 'rgba(46,213,115,0.2)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>{profile.avatar}</div>
            <h3 style={{ color: 'var(--neon-green)', marginBottom: '0.2rem' }}>{profile.name}</h3>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {profile.username}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Member since {profile.joinYear}
            </div>
          </div>

          {/* Profile Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
            {[
              { icon: '🎂', label: 'Birthday', value: profile.birthday },
              { icon: '🏫', label: 'School', value: profile.school },
              { icon: '🐱', label: 'Pet', value: profile.pet },
              { icon: '⚽', label: 'Fav Team', value: profile.favoriteTeam },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span>{item.icon}</span>
                <span style={{ color: 'var(--text-muted)', minWidth: 70 }}>{item.label}:</span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Posts Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {profile.posts.map((post, i) => (
              <div key={i} style={{
                padding: '0.65rem 0.85rem',
                background: 'rgba(46,213,115,0.04)',
                border: '1px solid rgba(46,213,115,0.12)',
                borderRadius: 8,
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}>
                {post}
              </div>
            ))}
          </div>
        </div>

        {/* Cracker Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Terminal */}
          <div className="terminal">
            <div style={{ marginBottom: '0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              BRUTE-FORCE TERMINAL v1.0 — Target: {profile.name}'s Account
            </div>
            <div style={{ maxHeight: 240, overflowY: 'auto', marginBottom: '0.75rem' }}>
              {attempts.length === 0 ? (
                <div style={{ opacity: 0.5 }}>No attempts yet. Type a password guess...</div>
              ) : (
                attempts.map((a, i) => (
                  <div key={i} style={{ marginBottom: '0.3rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ opacity: 0.5 }}>[{i + 1}]</span>
                    <span style={{ color: a.guess === targetPassword ? 'var(--neon-green)' : 'var(--neon-red)' }}>
                      {a.guess}
                    </span>
                    <span style={{ fontSize: '0.75rem', marginLeft: 'auto' }}>
                      {getSimilarity(a.guess)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            {!cracked && !failed && (
              <div className="terminal-prompt" style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  ref={inputRef}
                  id="password-guess-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAttempt()}
                  placeholder="Enter password guess..."
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--neon-green)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.88rem',
                  }}
                  autoComplete="off"
                  autoFocus
                />
              </div>
            )}

            {cracked && (
              <div style={{ color: 'var(--neon-green)', textAlign: 'center', padding: '0.5rem', fontWeight: 700 }}>
                ✅ PASSWORD CRACKED: {targetPassword}
              </div>
            )}
            {failed && !cracked && (
              <div style={{ color: 'var(--neon-red)', textAlign: 'center', padding: '0.5rem' }}>
                ❌ Max attempts reached. The password was: <strong>{targetPassword}</strong>
              </div>
            )}
          </div>

          {/* Attempt Button */}
          {!cracked && !failed && (
            <button
              id="password-attempt-btn"
              className="btn btn-success btn-full"
              onClick={handleAttempt}
              disabled={!input.trim()}
            >
              Try Password ({attemptsLeft} left)
            </button>
          )}

          {/* Hints */}
          <div className="glass-card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>💡 Hints Used: {hintsUsed}/{hints.length}</span>
              <button
                id="use-hint-btn"
                className="btn btn-ghost btn-sm"
                onClick={useHint}
                disabled={hintsUsed >= hints.length}
              >
                Use Hints
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {revealedHints.map(idx => (
                <div key={idx} style={{
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(255,190,0,0.06)',
                  border: '1px solid rgba(255,190,0,0.2)',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  color: 'var(--neon-amber)',
                }}>
                  💡 {hints[idx]}
                </div>
              ))}
            </div>
          </div>

          {/* Learning Box */}
          {(cracked || failed) && (
            <div className="glass-card animate-fade-in" style={{ borderColor: 'rgba(46,213,115,0.3)', padding: '1rem' }}>
              <h3 style={{ color: 'var(--neon-green)', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
                🎓 Security Lesson
              </h3>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                "{targetPassword}" combines personal details from social media — a very common pattern.
                Attackers use <strong style={{ color: 'var(--text-primary)' }}>OSINT</strong> (Open Source Intelligence)
                from social media to guess passwords. Use a <strong style={{ color: 'var(--text-primary)' }}>password manager</strong> and
                never base passwords on personal information that's publicly visible.
              </p>
            </div>
          )}

          {(cracked || failed) && !showScore && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(57,255,20,0.05)',
              border: '1px solid rgba(57,255,20,0.2)',
              borderRadius: 8,
              padding: '0.75rem 1rem',
              marginTop: '1rem',
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--neon-green)', fontFamily: 'var(--font-mono)' }}>
                ✓ Score saved to leaderboard. Ready for next team?
              </span>
              <a
                href="/kiosk?station=3"
                className="btn btn-danger btn-sm"
                style={{ textDecoration: 'none' }}
              >
                🔒 Finish & Lock Kiosk
              </a>
            </div>
          )}
        </div>
      </div>

      {showScore && (
        <ScoreSummary
          stationId={3}
          rawScore={score}
          rawMax={maxAttempts}
          onClose={() => setShowScore(false)}
        />
      )}

    </div>
  );
}


