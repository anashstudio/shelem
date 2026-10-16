/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScoreBoard } from './components/ScoreBoard';
import { RoundHistoryTable } from './components/RoundHistoryTable';
import { AddRoundModal } from './components/AddRoundModal';
import { SettingsModal } from './components/SettingsModal';
import { AboutUsModal } from './components/AboutUsModal';
import { NewGameModal } from './components/NewGameModal';
import { WinnerCelebrationModal } from './components/WinnerCelebrationModal';
import { GameSettings, GameState, Round, TeamId } from './types/shelem';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  loadGame,
  saveGame,
  recalculateAllRounds,
} from './utils/shelemEngine';

export default function App() {
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [game, setGame] = useState<GameState | null>(() => loadGame());

  // Modals state
  const [isAddRoundOpen, setIsAddRoundOpen] = useState(false);
  const [editingRound, setEditingRound] = useState<Round | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const [isNewGameOpen, setIsNewGameOpen] = useState(false);
  const [winnerTeam, setWinnerTeam] = useState<TeamId | null>(null);

  // Apply Theme & Font configuration to DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-font-size', settings.fontSize);

    const fontFamilies: Record<string, string> = {
      vazir: "'Vazirmatn', system-ui, sans-serif",
      shabnam: "'Shabnam', 'Vazirmatn', sans-serif",
      sahel: "'Sahel', 'Vazirmatn', sans-serif",
      estedad: "'Estedad', 'Vazirmatn', sans-serif",
      system: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    };
    document.documentElement.style.setProperty(
      '--font-family',
      fontFamilies[settings.fontFamily] || fontFamilies.vazir
    );
  }, [settings.theme, settings.fontSize, settings.fontFamily]);

  // Persist settings
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Persist game
  useEffect(() => {
    saveGame(game);
  }, [game]);

  // Check for winner on game state changes
  useEffect(() => {
    if (!game || game.rounds.length === 0) {
      setWinnerTeam(null);
      return;
    }
    const lastRound = game.rounds[game.rounds.length - 1];
    const scoreA = lastRound.teamATotalAfter;
    const scoreB = lastRound.teamBTotalAfter;
    const target = settings.targetScore;

    if (scoreA >= target || scoreB >= target) {
      if (scoreA > scoreB) {
        setWinnerTeam('teamA');
      } else if (scoreB > scoreA) {
        setWinnerTeam('teamB');
      }
    } else {
      setWinnerTeam(null);
    }
  }, [game, settings.targetScore]);

  // If no game exists initially, prompt new game setup
  useEffect(() => {
    if (!game) {
      setIsNewGameOpen(true);
    }
  }, [game]);

  // Handlers
  const handleStartNewGame = (
    teamAName: string,
    teamBName: string,
    targetScore: number,
    initialDealer: TeamId
  ) => {
    const newGame: GameState = {
      id: 'game_' + Date.now(),
      teamAName,
      teamBName,
      initialDealer,
      rounds: [],
      createdAt: Date.now(),
    };
    setSettings((prev) => ({ ...prev, targetScore }));
    setGame(newGame);
    setWinnerTeam(null);
  };

  const handleSaveRound = (
    roundData: Omit<Round, 'id' | 'roundNumber' | 'teamATotalAfter' | 'teamBTotalAfter'>
  ) => {
    if (!game) return;

    if (editingRound) {
      // Editing existing round
      const updatedList = game.rounds.map((r) =>
        r.id === editingRound.id
          ? {
              ...r,
              ...roundData,
            }
          : r
      );
      const recalculated = recalculateAllRounds(updatedList, settings);
      setGame({ ...game, rounds: recalculated });
      setEditingRound(null);
    } else {
      // Creating new round
      const newRound: Round = {
        ...roundData,
        id: 'round_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        roundNumber: game.rounds.length + 1,
        teamATotalAfter: 0,
        teamBTotalAfter: 0,
      };
      const updatedList = [...game.rounds, newRound];
      const recalculated = recalculateAllRounds(updatedList, settings);
      setGame({ ...game, rounds: recalculated });
    }
  };

  const handleEditRound = (round: Round) => {
    setEditingRound(round);
    setIsAddRoundOpen(true);
  };

  const handleDeleteRound = (roundId: string) => {
    if (!game) return;
    if (window.confirm('آیا مطمئن هستید که این دست حذف شود؟')) {
      const filtered = game.rounds.filter((r) => r.id !== roundId);
      const recalculated = recalculateAllRounds(filtered, settings);
      setGame({ ...game, rounds: recalculated });
    }
  };

  const handleUndoLastRound = () => {
    if (!game || game.rounds.length === 0) return;
    const remaining = game.rounds.slice(0, -1);
    const recalculated = recalculateAllRounds(remaining, settings);
    setGame({ ...game, rounds: recalculated });
  };

  const handleEditTeamName = (team: TeamId) => {
    if (!game) return;
    const currentName = team === 'teamA' ? game.teamAName : game.teamBName;
    const newName = window.prompt('نام جدید تیم را وارد کنید:', currentName);
    if (newName && newName.trim()) {
      setGame({
        ...game,
        teamAName: team === 'teamA' ? newName.trim() : game.teamAName,
        teamBName: team === 'teamB' ? newName.trim() : game.teamBName,
      });
    }
  };

  const handleUpdateTeamNames = (teamAName: string, teamBName: string) => {
    if (!game) return;
    setGame({ ...game, teamAName, teamBName });
  };

  const handleResetGame = () => {
    if (!game) return;
    setGame({ ...game, rounds: [] });
    setWinnerTeam(null);
  };

  const handleContinuePlaying = () => {
    // Increase target score by 500 so players can keep playing
    setSettings((prev) => ({ ...prev, targetScore: prev.targetScore + 500 }));
    setWinnerTeam(null);
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-main)] flex flex-col transition-colors duration-200 selection:bg-[var(--color-accent)] selection:text-neutral-950"
    >
      {/* Top Header */}
      <Header
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAboutUs={() => setIsAboutUsOpen(true)}
        onNewGamePrompt={() => setIsNewGameOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-3 sm:p-5 space-y-6">
        {game ? (
          <>
            <ScoreBoard
              game={game}
              settings={settings}
              onOpenAddRound={() => {
                setEditingRound(null);
                setIsAddRoundOpen(true);
              }}
              onUndoLastRound={handleUndoLastRound}
              onEditTeamName={handleEditTeamName}
            />

            <RoundHistoryTable
              game={game}
              settings={settings}
              onEditRound={handleEditRound}
              onDeleteRound={handleDeleteRound}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-3xl">
              ♠♥
            </div>
            <h2 className="text-xl font-bold">به شلم پرو خوش آمدید</h2>
            <p className="text-sm text-[var(--color-text-muted)] max-w-md">
              برای شروع ثبت امتیازات، لطفاً اسامی تیم‌ها و سقف امتیاز را مشخص کنید.
            </p>
            <button
              onClick={() => setIsNewGameOpen(true)}
              className="py-3 px-6 rounded-xl bg-[var(--color-accent)] text-neutral-950 font-bold text-sm shadow-md"
            >
              شروع بازی جدید
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)]/50 py-4 px-4 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)]/40 transition-colors">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>شلم پرو | نرم‌افزار هوشمند ثبت امتیازات بازی شلم</span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAboutUsOpen(true)}
              className="hover:text-[var(--color-accent)] transition-colors underline underline-offset-4"
            >
              درباره ما و سازنده نرم‌افزار
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-[var(--color-accent)] transition-colors underline underline-offset-4"
            >
              شخصی‌سازی ظاهر و تم
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {game && (
        <AddRoundModal
          isOpen={isAddRoundOpen}
          onClose={() => {
            setIsAddRoundOpen(false);
            setEditingRound(null);
          }}
          onSaveRound={handleSaveRound}
          game={game}
          settings={settings}
          editingRound={editingRound}
        />
      )}

      {game && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSaveSettings={(newSettings) => {
            setSettings(newSettings);
            // Re-calculate rounds in case penalties or bonuses changed
            if (game) {
              const recalculated = recalculateAllRounds(game.rounds, newSettings);
              setGame({ ...game, rounds: recalculated });
            }
          }}
          game={game}
          onUpdateTeamNames={handleUpdateTeamNames}
          onResetGame={handleResetGame}
        />
      )}

      <AboutUsModal
        isOpen={isAboutUsOpen}
        onClose={() => setIsAboutUsOpen(false)}
        settings={settings}
      />

      <NewGameModal
        isOpen={isNewGameOpen}
        onClose={() => setIsNewGameOpen(false)}
        canCancel={Boolean(game)}
        settings={settings}
        onStartGame={handleStartNewGame}
      />

      {game && winnerTeam && (
        <WinnerCelebrationModal
          isOpen={Boolean(winnerTeam)}
          onClose={() => setWinnerTeam(null)}
          game={game}
          settings={settings}
          winnerTeam={winnerTeam}
          onNewGame={() => {
            setWinnerTeam(null);
            setIsNewGameOpen(true);
          }}
          onContinuePlaying={handleContinuePlaying}
        />
      )}
    </div>
  );
}
