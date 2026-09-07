import { useState, useEffect } from 'react';
import ScoreSummary from '../../components/ScoreSummary';
import { fetchPhishingEmails } from '../../lib/supabase';
import type { PhishingEmail } from '../../types';

const DEFAULT_EMAILS: PhishingEmail[] = [
  {
    id: 'email-1',
    from: 'tuition-billing@university-portal.finance-dept.net',
    fromDisplay: 'University Billing Department',
    subject: 'URGENT: Tuition Fee Overdue – Account Suspended',
    date: 'Mon, 8 Sep 2026 08:44:01',
    body: `Dear Student,

Your tuition fee payment for this semester is OVERDUE. Your account has been temporarily suspended.

To avoid permanent suspension and late fee penalties, click the secure payment link below immediately:

👉 https://pay-now.university-portal-billing.com/secure?id=8832

You must complete payment within 24 HOURS or your enrollment will be cancelled.

Contact: billing@university-portal.finance-dept.net

Regards,
University Finance Department`,
    link: 'https://pay-now.university-portal-billing.com/secure?id=8832',
    flags: [
      { id: 'f1', label: 'Suspicious Sender Domain', description: 'finance-dept.net is NOT the official university domain.', element: 'sender', found: false },
      { id: 'f2', label: 'Urgency / Threat Language', description: '"URGENT", "24 HOURS", "cancelled" are pressure tactics.', element: 'body', found: false },
      { id: 'f3', label: 'Suspicious Payment Link', description: 'The URL domain is not official — it uses a lookalike domain.', element: 'link', found: false },
      { id: 'f4', label: 'Generic Greeting', description: '"Dear Student" instead of your actual name is a phishing sign.', element: 'body', found: false },
    ],
  },
  {
    id: 'email-2',
    from: 'security-alert@googIe-accounts.com',
    fromDisplay: 'Google Security Team',
    subject: 'Your Google Account was accessed from a new device',
    date: 'Mon, 8 Sep 2026 07:12:55',
    body: `Hi there,

We detected a new sign-in to your Google account from:
Location: Lagos, Nigeria
Device: Unknown Windows PC
Time: 08:12 AM

If this wasn't you, please verify your account immediately:

👉 https://accounts.googIe-verify.com/secure-login

Failure to verify within 1 hour will result in account lock.

– The Google Security Team`,
    link: 'https://accounts.googIe-verify.com/secure-login',
    flags: [
      { id: 'f5', label: 'Lookalike Domain (Capital I)', description: '"googIe" uses capital-I instead of lowercase-l in the sender email.', element: 'sender', found: false },
      { id: 'f6', label: 'Fake Verify Link', description: 'googIe-verify.com is not a Google domain.', element: 'link', found: false },
      { id: 'f7', label: 'Artificial Time Pressure', description: '"1 hour" deadline is a manipulation tactic.', element: 'body', found: false },
    ],
  },
];

type FlagId = string;

export default function Station1Phishing() {
  const [emails, setEmails] = useState<PhishingEmail[]>(DEFAULT_EMAILS);
  const [selectedEmailId, setSelectedEmailId] = useState(DEFAULT_EMAILS[0].id);
  const [flaggedIds, setFlaggedIds] = useState<Set<FlagId>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    async function loadDynamic() {
      const dbData = await fetchPhishingEmails();
      if (dbData && dbData.length > 0) {
        const mapped: PhishingEmail[] = dbData.map((d) => ({
          id: d.id || crypto.randomUUID(),
          from: d.from_email,
          fromDisplay: d.from_display,
          subject: d.subject,
          date: d.date_str,
          body: d.body,
          link: d.link_url,
          flags: d.flags || [],
        }));
        setEmails(mapped);
        setSelectedEmailId(mapped[0].id);
      }
    }
    loadDynamic();
  }, []);

  const allFlags = emails.flatMap((e) => e.flags);
  const totalFlags = allFlags.length;
  const foundCount = flaggedIds.size;

  const currentEmail = emails.find((e) => e.id === selectedEmailId) || emails[0];


  function toggleFlag(flagId: string) {
    if (revealed) return;
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(flagId)) next.delete(flagId);
      else next.add(flagId);
      return next;
    });
  }

  function handleSubmit() {
    setRevealed(true);
    setShowScore(true);
  }

  const score = allFlags.filter((f) => flaggedIds.has(f.id)).length;

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
      {/* Station Header */}
      <div className="station-header animate-fade-in">
        <div className="station-icon-wrap" style={{ background: 'rgba(255,71,87,0.15)', border: '1px solid rgba(255,71,87,0.4)' }}>
          📧
        </div>
        <div>
          <h2 style={{ color: 'var(--station-1)', marginBottom: '0.2rem' }}>Phishing Inbox Inspector</h2>
          <p style={{ fontSize: '0.85rem' }}>
            Click on suspicious elements in each email to flag them. Find all {totalFlags} red flags!
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span className="badge badge-red">{foundCount}/{totalFlags} Flagged</span>
        </div>
      </div>

      {/* Email Client Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1rem', minHeight: 500 }}>

        {/* Sidebar */}
        <div className="glass-card" style={{ padding: '0.5rem' }}>
          <div style={{ padding: '0.5rem 0.75rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Inbox ({emails.length})
            </span>
          </div>
          {emails.map((email) => {
            const emailFlags = email.flags.filter((f) => flaggedIds.has(f.id)).length;
            return (
              <div
                key={email.id}
                id={`email-item-${email.id}`}
                className={`email-list-item${selectedEmailId === email.id ? ' active' : ''}`}
                onClick={() => setSelectedEmailId(email.id)}
              >
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {email.fromDisplay}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {email.subject}
                </div>
                {emailFlags > 0 && (
                  <span className="badge badge-red" style={{ marginTop: '0.3rem', fontSize: '0.65rem' }}>
                    {emailFlags} flagged
                  </span>
                )}
              </div>
            );
          })}

        </div>

        {/* Email Pane */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Email Header */}
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>
              {currentEmail.subject}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', minWidth: 50 }}>From:</span>
                <span
                  id="email-from"
                  className={`email-flag${flaggedIds.has(currentEmail.flags.find(f=>f.element==='sender')?.id ?? '') ? ' flagged' : ''}`}
                  onClick={() => {
                    const senderFlag = currentEmail.flags.find(f => f.element === 'sender');
                    if (senderFlag) toggleFlag(senderFlag.id);
                  }}
                  title="Click to flag this element"
                >
                  {currentEmail.fromDisplay} &lt;{currentEmail.from}&gt;
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', minWidth: 50 }}>Date:</span>
                <span style={{ color: 'var(--text-secondary)' }}>{currentEmail.date}</span>
              </div>
            </div>
          </div>

          {/* Email Body */}
          <div style={{ flex: 1, whiteSpace: 'pre-wrap', fontSize: '0.88rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            {(currentEmail.body || '')
              .replace(/\\n/g, '\n')
              .replace(/\r\n/g, '\n')
              .replace(/\r/g, '\n')
              .split('\n')
              .map((line, i) => {
                const isLinkLine = currentEmail.link && line.includes(currentEmail.link);
                const displayContent = line.trim() ? line : '\u00A0';
                if (isLinkLine) {
                  const linkFlag = currentEmail.flags.find(f => f.element === 'link');
                  return (
                    <div key={i} style={{ minHeight: '1.25em' }}>
                      <span
                        id="email-link"
                        className={`email-flag${linkFlag && flaggedIds.has(linkFlag.id) ? ' flagged' : ''}`}
                        onClick={() => linkFlag && toggleFlag(linkFlag.id)}
                        title="Click to flag this link"
                        style={{ wordBreak: 'break-all' }}
                      >
                        {line}
                      </span>
                    </div>
                  );
                }
                return <div key={i} style={{ minHeight: '1.25em' }}>{displayContent}</div>;
              })}
          </div>


          {/* Flags found for this email */}
          {currentEmail.flags.filter(f => flaggedIds.has(f.id)).length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>🚩 Flagged Red Flags:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {currentEmail.flags.filter(f => flaggedIds.has(f.id)).map(f => (
                  <span key={f.id} className="badge badge-red">
                    {f.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Flag Hint Buttons */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Click on suspicious parts of the email above, or tap below to flag:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {currentEmail.flags.map(f => (
                <button
                  key={f.id}
                  id={`flag-btn-${f.id}`}
                  className={`btn btn-sm${flaggedIds.has(f.id) ? ' btn-danger' : ' btn-ghost'}`}
                  onClick={() => toggleFlag(f.id)}
                  disabled={revealed}
                >
                  {flaggedIds.has(f.id) ? '🚩' : '⚑'} {f.element}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revealed Answers */}
      {revealed && (
        <div className="glass-card animate-fade-in" style={{ marginTop: '1rem', borderColor: 'rgba(255,71,87,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--station-1)', margin: 0 }}>📋 Answer Key & Feedback</h3>
            <span className="badge badge-green">✓ Results Submitted</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            {allFlags.map(f => (
              <div
                key={f.id}
                style={{
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: `1px solid ${flaggedIds.has(f.id) ? 'var(--neon-green)' : 'var(--neon-red)'}`,
                  background: flaggedIds.has(f.id) ? 'rgba(46,213,115,0.06)' : 'rgba(255,51,51,0.06)',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {flaggedIds.has(f.id) ? '✅' : '❌'} {f.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.description}</div>
              </div>
            ))}
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
              marginTop: '1rem',
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--neon-green)', fontFamily: 'var(--font-mono)' }}>
                ✓ Score saved to leaderboard. Ready for next team?
              </span>
              <a
                href="/kiosk?station=1"
                className="btn btn-danger btn-sm"
                style={{ textDecoration: 'none' }}
              >
                🔒 Finish & Lock Kiosk
              </a>
            </div>
          )}
        </div>
      )}

      {/* Submit */}
      {!revealed && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button
            id="station1-submit"
            className="btn btn-danger btn-lg"
            onClick={handleSubmit}
            disabled={foundCount === 0}
          >
            Submit Findings ({foundCount}/{totalFlags} flagged)
          </button>
        </div>
      )}

      {showScore && (
        <ScoreSummary
          stationId={1}
          rawScore={score}
          rawMax={totalFlags}
          onClose={() => setShowScore(false)}
        />
      )}
    </div>
  );
}

