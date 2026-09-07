import { createClient } from '@supabase/supabase-js';
import type { Team, TeamScore, Station, StationId } from '../types';
import { ADMIN_PIN, MAX_POINTS } from '../types';

const SUPABASE_URL = 'https://mnhjuajbgxwrjwanrrqv.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1uaGp1YWpiZ3h3cmp3YW5ycnF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0OTc5MjEsImV4cCI6MjEwNDA3MzkyMX0.1pqhMxJC7WVh-3BITcQXsOn8Da4m5LvYaSAxuELPSVs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── PIN generation ───────────────────────────────────────────

/** Generate a cryptographically-random 4-digit PIN string (1000–9999) */
export function generatePin(): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(1000 + (arr[0] % 9000));
}

// ── Team Registration ────────────────────────────────────────

/**
 * Register a new team with a group name and password.
 * Auto-generates a unique 4-digit PIN.
 * Maps to: teams(group_name, password, pin)
 */
export async function registerTeam(
  groupName: string,
  password: string,
): Promise<{ team: Team | null; error: string | null }> {
  // Keep retrying if PIN collision (very rare)
  for (let attempts = 0; attempts < 5; attempts++) {
    const pin = generatePin();
    const { data, error } = await supabase
      .from('teams')
      .insert({ group_name: groupName.trim(), password: password.trim(), pin })
      .select()
      .single();

    if (!error) return { team: data as Team, error: null };

    // 23505 = unique violation (either group_name or pin already exists)
    if (error.code === '23505' && error.message.includes('pin')) continue;
    if (error.code === '23505' && error.message.includes('group_name')) {
      return { team: null, error: 'That team name is already registered.' };
    }
    return { team: null, error: error.message };
  }
  return { team: null, error: 'Could not generate a unique PIN. Please try again.' };
}

/**
 * Login an existing team with group_name and password to retrieve PIN.
 */
export async function loginTeam(
  groupName: string,
  password: string,
): Promise<{ team: Team | null; error: string | null }> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .ilike('group_name', groupName.trim())
    .eq('password', password.trim())
    .single();

  if (error || !data) {
    return { team: null, error: 'Invalid team name or password.' };
  }
  return { team: data as Team, error: null };
}


// ── Authentication ───────────────────────────────────────────

/**
 * Authenticate a team by 4-digit PIN.
 * Returns { team, isAdmin } where isAdmin is true only when PIN === ADMIN_PIN.
 */
export async function authenticateByPin(
  pin: string,
): Promise<{ team: Team | null; isAdmin: boolean; error: string | null }> {
  // Check for hardcoded admin PIN first (not stored in DB)
  if (pin.trim() === ADMIN_PIN) {
    return { team: null, isAdmin: true, error: null };
  }

  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('pin', pin.trim())
    .single();

  if (error || !data) {
    return { team: null, isAdmin: false, error: 'Invalid PIN. Try again.' };
  }
  return { team: data as Team, isAdmin: false, error: null };
}

// ── Scores ───────────────────────────────────────────────────

/**
 * Save a completed station score to team_scores.
 * Score is stored as a 0–1000 value (normalised by the caller).
 * UNIQUE(team_id, station_id) means only one entry per team per station.
 */
export async function saveTeamScore(
  teamId: string,
  stationId: StationId,
  score: number,
): Promise<{ error: string | null }> {
  // Clamp to 0–MAX_POINTS
  const clamped = Math.max(0, Math.min(MAX_POINTS, Math.round(score)));

  const { error } = await supabase.from('team_scores').upsert(
    { team_id: teamId, station_id: stationId, score: clamped },
    { onConflict: 'team_id,station_id' },
  );
  return { error: error?.message ?? null };
}

// ── Admin Dashboard ──────────────────────────────────────────

/** Fetch all teams (for admin leaderboard) */
export async function fetchAllTeams(): Promise<{
  teams: Team[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return { teams: [], error: error.message };
  return { teams: data as Team[], error: null };
}

/** Fetch all scores joined with team name (for admin leaderboard) */
export async function fetchAllScores(): Promise<{
  scores: (TeamScore & { teams: { group_name: string } })[]; 
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('team_scores')
    .select('*, teams(group_name)')
    .order('completed_at', { ascending: false });

  if (error) return { scores: [], error: error.message };
  return { scores: data as (TeamScore & { teams: { group_name: string } })[], error: null };
}

/** Fetch all stations */
export async function fetchStations(): Promise<{
  stations: Station[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('stations')
    .select('*')
    .order('station_number', { ascending: true });

  if (error) return { stations: [], error: error.message };
  return { stations: data as Station[], error: null };
}

// ── Dynamic Station Content CRUD ─────────────────────────────

import type { DbPhishingEmail, DbWiFiNetwork, DbPasswordProfile, DbRansomwareAction } from '../types';

// Station 1: Phishing Emails
export async function fetchPhishingEmails(): Promise<DbPhishingEmail[]> {
  const { data, error } = await supabase.from('station_phishing_emails').select('*').order('created_at', { ascending: true });
  if (error || !data) return [];
  return data as DbPhishingEmail[];
}

export async function savePhishingEmail(email: DbPhishingEmail): Promise<{ error: string | null }> {
  const { error } = await supabase.from('station_phishing_emails').upsert(email);
  return { error: error?.message ?? null };
}

export async function deletePhishingEmail(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('station_phishing_emails').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// Station 2: Wi-Fi Networks
export async function fetchWiFiNetworks(): Promise<DbWiFiNetwork[]> {
  const { data, error } = await supabase.from('station_wifi_networks').select('*').order('created_at', { ascending: true });
  if (error || !data) return [];
  return data as DbWiFiNetwork[];
}

export async function saveWiFiNetwork(net: DbWiFiNetwork): Promise<{ error: string | null }> {
  const { error } = await supabase.from('station_wifi_networks').upsert(net);
  return { error: error?.message ?? null };
}

export async function deleteWiFiNetwork(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('station_wifi_networks').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// Station 3: Password Profile
export async function fetchPasswordProfile(): Promise<DbPasswordProfile | null> {
  const { data, error } = await supabase.from('station_password_profiles').select('*').limit(1).single();
  if (error || !data) return null;
  return data as DbPasswordProfile;
}

export async function savePasswordProfile(profile: DbPasswordProfile): Promise<{ error: string | null }> {
  const { error } = await supabase.from('station_password_profiles').upsert(profile);
  return { error: error?.message ?? null };
}

// Station 4: Ransomware Actions
export async function fetchRansomwareActions(): Promise<DbRansomwareAction[]> {
  const { data, error } = await supabase.from('station_ransomware_actions').select('*').order('created_at', { ascending: true });
  if (error || !data) return [];
  return data as DbRansomwareAction[];
}

export async function saveRansomwareAction(action: DbRansomwareAction): Promise<{ error: string | null }> {
  const { error } = await supabase.from('station_ransomware_actions').upsert(action);
  return { error: error?.message ?? null };
}

export async function deleteRansomwareAction(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('station_ransomware_actions').delete().eq('id', id);
  return { error: error?.message ?? null };
}

