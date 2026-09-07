// ============================================================
// Cyber Circuit — TypeScript Interfaces & Types
// Matches the Supabase schema exactly
// ============================================================

export type StationId = 1 | 2 | 3 | 4;

// ── Database Models ─────────────────────────────────────────

export interface Team {
  id: string;
  group_name: string;
  password: string;
  pin: string;          // 4-digit string, UNIQUE
  created_at: string;
}

export interface Station {
  id: number;
  station_number: StationId;
  title: string;
  category: string;
  max_points: number;   // always 1000
}

export interface TeamScore {
  id: string;
  team_id: string;
  station_id: number;   // FK → stations.id
  score: number;
  completed_at: string;
}

// ── Auth State ───────────────────────────────────────────────

export interface AuthState {
  team: Team | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  teamScores: TeamScore[];
}

// ── Station Config (UI only) ─────────────────────────────────

export interface StationConfig {
  id: StationId;
  title: string;
  subtitle: string;
  category: string;
  icon: string;
  color: string;
}

export const STATIONS: Record<StationId, StationConfig> = {
  1: { id: 1, title: 'The Phishing Inbox',         subtitle: 'Email Security',     category: 'Email Security',     icon: '📧', color: '#ff4757' },
  2: { id: 2, title: 'The Coffee Shop Connection',  subtitle: 'Network Security',   category: 'Network Security',   icon: '📡', color: '#ffa502' },
  3: { id: 3, title: "The Hacker's Terminal",       subtitle: 'Authentication',     category: 'Authentication',     icon: '🔓', color: '#2ed573' },
  4: { id: 4, title: 'Ransomware Containment',      subtitle: 'Incident Response',  category: 'Incident Response',  icon: '☣️', color: '#ff6b81' },
};

// Max points per station (from DB)
export const MAX_POINTS = 1000;

// Hardcoded admin PIN (not stored in DB since teams table has no role column)
export const ADMIN_PIN = '0000';

// ── Station-specific types ───────────────────────────────────

export interface PhishingFlag {
  id: string;
  label: string;
  description: string;
  element: 'sender' | 'subject' | 'link' | 'body' | 'attachment';
  found: boolean;
}

export interface PhishingEmail {
  id: string;
  from: string;
  fromDisplay: string;
  subject: string;
  date: string;
  body: string;
  link?: string;
  flags: PhishingFlag[];
}

export type NetworkSecurity = 'WPA3' | 'WPA2' | 'Open' | 'Evil-Twin';

export interface WiFiNetwork {
  id: string;
  ssid: string;
  security: NetworkSecurity;
  signal: number;
  isSafe: boolean;
}

export interface SocialProfile {
  name: string;
  username: string;
  birthday: string;
  school: string;
  pet: string;
  favoriteTeam: string;
  joinYear: string;
  posts: string[];
  avatar: string;
}

export interface PasswordAttempt {
  guess: string;
  timestamp: number;
}

export interface ResponseAction {
  id: string;
  label: string;
  description: string;
  isCorrect: boolean;
  selected: boolean;
}

// ── Database Dynamic Question Models ─────────────────────────

export interface DbPhishingEmail {
  id?: string;
  from_email: string;
  from_display: string;
  subject: string;
  date_str: string;
  body: string;
  link_url?: string;
  flags: PhishingFlag[];
  created_at?: string;
}

export interface DbWiFiNetwork {
  id?: string;
  ssid: string;
  security: NetworkSecurity;
  signal: number;
  is_safe: boolean;
  feedback_title?: string;
  feedback_message?: string;
  score_value?: number;
  created_at?: string;
}

export interface DbPasswordProfile {
  id?: string;
  target_password: string;
  max_attempts: number;
  name: string;
  username: string;
  birthday: string;
  school: string;
  pet: string;
  favorite_team: string;
  join_year: string;
  posts: string[];
  hints: string[];
  security_lesson: string;
  created_at?: string;
}

export interface DbRansomwareAction {
  id?: string;
  label: string;
  description: string;
  is_correct: boolean;
  created_at?: string;
}

