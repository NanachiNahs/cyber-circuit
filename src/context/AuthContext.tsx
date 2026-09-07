import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Team, TeamScore } from '../types';

interface AuthContextValue {
  team: Team | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  teamScores: TeamScore[];
  login: (team: Team) => void;
  loginAdmin: () => void;
  logout: () => void;
  addScore: (score: TeamScore) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [team, setTeam] = useState<Team | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [teamScores, setTeamScores] = useState<TeamScore[]>([]);

  const login = useCallback((t: Team) => {
    setTeam(t);
    setIsAdmin(false);
    setTeamScores([]);
  }, []);

  const loginAdmin = useCallback(() => {
    setTeam(null);
    setIsAdmin(true);
    setTeamScores([]);
  }, []);

  const logout = useCallback(() => {
    setTeam(null);
    setIsAdmin(false);
    setTeamScores([]);
  }, []);

  const addScore = useCallback((score: TeamScore) => {
    setTeamScores((prev) => {
      const filtered = prev.filter((s) => s.station_id !== score.station_id);
      return [...filtered, score];
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        team,
        isAuthenticated: team !== null,
        isAdmin,
        teamScores,
        login,
        loginAdmin,
        logout,
        addScore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
