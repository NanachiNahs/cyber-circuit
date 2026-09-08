import { useState, useEffect } from 'react';
import ScoreSummary from '../../components/ScoreSummary';
import { fetchPhishingEmails } from '../../lib/supabase';
import type { PhishingEmail } from '../../types';

const DEFAULT_EMAILS: PhishingEmail[] = [
  {
    id: 'email-1',
    isPhishing: true,
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
      { id: 'f3', label: 'Suspicious Payment Link', description: 'The URL domain is lookalike and unofficial.', element: 'link', found: false },
    ],
  },
  {
    id: 'email-2',
    isPhishing: true,
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
  {
    id: 'email-3',
    isPhishing: false,
    from: 'library-services@university.edu',
    fromDisplay: 'Campus Library Services',
    subject: 'Reminder: Borrowed books due in 3 days',
    date: 'Mon, 8 Sep 2026 09:15:00',
    body: `Hello Student,

This is a friendly automated reminder that your borrowed item "Introduction to Computer Security (5th Ed.)" is due for return in 3 days (11 Sep 2026).

If you have already returned this book or renewed your loan online through the student portal, please disregard this message.

Access your library account anytime:
👉 https://library.university.edu/my-account

Thank you,
University Library Services`,
    link: 'https://library.university.edu/my-account',
    flags: [],
  },
  {
    id: 'email-4',
    isPhishing: true,
    from: 'support@campus-it-renewals.com',
    fromDisplay: 'Campus IT Helpdesk',
    subject: 'ACTION REQUIRED: Software License Expiration',
    date: 'Mon, 8 Sep 2026 10:05:20',
    body: `Dear Campus User,

Your campus Microsoft 365 software license will expire TODAY.

To avoid losing access to your email, cloud documents, and campus Wi-Fi, you must verify your login credentials immediately:

👉 https://renew-license.campus-it-renewals.com/login

Thank you for your prompt cooperation.

Campus IT Helpdesk`,
    link: 'https://renew-license.campus-it-renewals.com/login',
    flags: [
      { id: 'f8', label: 'External IT Domain', description: 'campus-it-renewals.com is an external domain, not campus.edu.', element: 'sender', found: false },
      { id: 'f9', label: 'Credential Harvesting Link', description: 'Link asks you to type password on an external website.', element: 'link', found: false },
    ],
  },
];

type Classification = 'phishing' | 'safe';

export default function Station1Phishing() {
  const [emails, setEmails] = useState<PhishingEmail[]>(DEFAULT_EMAILS);
  const [selectedEmailId, setSelectedEmailId] = useState(DEFAULT_EMAILS[0].id);
  const [decisions, setDecisions] = useState<Record<string, Classification>>({});
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
          isPhishing: d.is_phishing !== undefined ? d.is_phishing : (d.flags && d.flags.length > 0),
          flags: d.flags || [],
        }));
        setEmails(mapped);
        setSelectedEmailId(mapped[0].id);
      }
    }
    loadDynamic();
  }, []);

  const totalEmails = emails.length;
  const auditedCount = Object.keys(decisions).length;
  const currentEmail = emails.find((e) => e.id === selectedEmailId) || emails[0];

  function setDecision(emailId: string, decision: Classification) {
    if (revealed) return;
    setDecisions((prev) => ({
      ...prev,
      [emailId]: decision,
    }));
  }

  function handleSubmit() {
    setRevealed(true);
    setShowScore(true);
  }

  // Score calculation: 1 point for each correctly classified email
  const correctCount = emails.filter((e) => {
    const decision = decisions[e.id];
    if (!decision) return false;
    return e.isPhishing ? decision === 'phishing' : decision === 'safe';
  }).length;

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1100, margin: '0 auto' }}>
      {/* Station Header */}
      <div className="station-header animate-fade-in">
        <div className="station-icon-wrap" style={{ background: 'rgba(255,71,87,0.15)', border: '1px solid rgba(255,71,87,0.4)' }}>
          📧
        </div>
        <div>
          <h2 style={{ color: 'var(--station-1)', marginBottom: '0.2rem' }}>Phishing Inbox Audit</h2>
          <p style={{ fontSize: '0.85rem' }}>
            Review each email in your inbox and classify it as <strong>Phishing (Unsafe)</strong> or <strong>Legitimate (Safe)</strong>.
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span className="badge badge-cyan">{auditedCount}/{totalEmails} Audited</span>
        </div>
      </div>

      {/* Email Client Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1rem', minHeight: 520 }}>

        {/* Sidebar: Inbox List */}
        <div className="glass-card" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0.5rem 0.75rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Inbox ({emails.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, overflowY: 'auto' }}>
            {emails.map((email) => {
              const decision = decisions[email.id];
              return (
                <div
                  key={email.id}
                  id={`email-item-${email.id}`}
                  className={`email-list-item${selectedEmailId === email.id ? ' active' : ''}`}
                  onClick={() => setSelectedEmailId(email.id)}
                  style={{ position: 'relative', cursor: 'pointer' }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {email.fromDisplay}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {email.subject}
                  </div>

                  <div style={{ marginTop: '0.4rem' }}>
                    {decision === 'phishing' ? (
                      <span className="badge badge-red" style={{ fontSize: '0.62rem' }}>
                        🚨 Phishing
                      </span>
                    ) : decision === 'safe' ? (
                      <span className="badge badge-green" style={{ fontSize: '0.62rem' }}>
                        ✅ Legitimate
                      </span>
                    ) : (
                      <span className="badge badge-muted" style={{ fontSize: '0.62rem' }}>
                        ❓ Unmarked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Email Pane */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Email Classification Action Controls */}
          <div style={{
            background: 'rgba(10,15,30,0.6)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 10,
            padding: '0.85rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email Audit Decision:
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {decisions[currentEmail.id] === 'phishing'
                  ? '🚨 Marked as Phishing (Unsafe)'
                  : decisions[currentEmail.id] === 'safe'
                    ? '✅ Marked as Legitimate (Safe)'
                    : 'Select your decision for this email:'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${decisions[currentEmail.id] === 'phishing' ? 'btn-danger' : 'btn-ghost'}`}
                style={decisions[currentEmail.id] === 'phishing' ? { boxShadow: '0 0 12px rgba(255,51,51,0.4)' } : undefined}
                onClick={() => setDecision(currentEmail.id, 'phishing')}
                disabled={revealed}
              >
                🚨 Mark as Phishing
              </button>
              <button
                type="button"
                className={`btn btn-sm ${decisions[currentEmail.id] === 'safe' ? 'btn-success' : 'btn-ghost'}`}
                style={decisions[currentEmail.id] === 'safe' ? { boxShadow: '0 0 12px rgba(57,255,20,0.4)' } : undefined}
                onClick={() => setDecision(currentEmail.id, 'safe')}
                disabled={revealed}
              >
                ✅ Mark as Legitimate
              </button>
            </div>
          </div>

          {/* Email Header */}
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.6rem', fontSize: '1rem' }}>
              {currentEmail.subject}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', minWidth: 50 }}>From:</span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
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
                  return (
                    <div key={i} style={{ minHeight: '1.25em' }}>
                      <span style={{ color: 'var(--neon-cyan)', wordBreak: 'break-all', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                        🔗 {line}
                      </span>
                    </div>
                  );
                }
                return <div key={i} style={{ minHeight: '1.25em' }}>{displayContent}</div>;
              })}
          </div>

        </div>
      </div>

      {/* Answer Key & Results */}
      {revealed && (
        <div className="glass-card animate-fade-in" style={{ marginTop: '1.5rem', borderColor: 'rgba(57,255,20,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: 'var(--station-1)', margin: 0 }}>📋 Inbox Security Audit Results</h3>
            <span className="badge badge-green">✓ Results Submitted</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
            {emails.map((email, idx) => {
              const userChoice = decisions[email.id];
              const expectedChoice = email.isPhishing ? 'phishing' : 'safe';
              const isCorrect = userChoice === expectedChoice;

              return (
                <div
                  key={email.id}
                  style={{
                    padding: '1rem',
                    borderRadius: 10,
                    border: `1px solid ${isCorrect ? 'rgba(57,255,20,0.3)' : 'rgba(255,51,51,0.3)'}`,
                    background: isCorrect ? 'rgba(57,255,20,0.03)' : 'rgba(255,51,51,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Email #{idx + 1}: {email.subject}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className={`badge ${isCorrect ? 'badge-green' : 'badge-red'}`}>
                        {isCorrect ? '✅ Correct' : '❌ Incorrect'}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Your decision: <strong style={{ color: userChoice === 'phishing' ? 'var(--neon-pink)' : userChoice === 'safe' ? 'var(--neon-green)' : 'var(--text-muted)' }}>
                      {userChoice === 'phishing' ? '🚨 Phishing' : userChoice === 'safe' ? '✅ Legitimate' : 'Unmarked'}
                    </strong> | Actual status: <strong style={{ color: email.isPhishing ? 'var(--neon-pink)' : 'var(--neon-green)' }}>
                      {email.isPhishing ? '🚨 Phishing Email' : '✅ Legitimate Email'}
                    </strong>
                  </div>

                  {email.flags && email.flags.length > 0 && (
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.6rem 0.8rem', borderRadius: 6, marginTop: '0.4rem' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>
                        Key Indicators:
                      </div>
                      {email.flags.map((f) => (
                        <div key={f.id} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          • <strong style={{ color: 'var(--text-primary)' }}>{f.label}</strong>: {f.description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
                ✓ Audit complete! Ready for next team?
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

      {/* Submit Button */}
      {!revealed && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
          <button
            id="station1-submit"
            className="btn btn-danger btn-lg"
            onClick={handleSubmit}
            disabled={auditedCount === 0}
          >
            Submit Audit ({auditedCount}/{totalEmails} Audited) →
          </button>
        </div>
      )}

      {showScore && (
        <ScoreSummary
          stationId={1}
          rawScore={correctCount}
          rawMax={totalEmails}
          onClose={() => setShowScore(false)}
        />
      )}
    </div>
  );
}
