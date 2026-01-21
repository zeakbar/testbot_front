import type { FC, FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Loading } from '@/components/Loading/Loading';
import { getRouletteById } from '@/api/roulette';
import type { Roulette, RouletteTeam } from '@/api/types';
import './RoulettePreGameSetupPage.css';

const defaultTeamColors = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
];

const defaultTeamNames = ['Team 1', 'Team 2', 'Team 3', 'Team 4'];

export const RoulettePreGameSetupPage: FC = () => {
  const { rouletteId } = useParams<{ rouletteId: string }>();
  const navigate = useNavigate();

  const [roulette, setRoulette] = useState<Roulette | null>(null);
  const [teamCount, setTeamCount] = useState(1);
  const [teams, setTeams] = useState<RouletteTeam[]>([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoulette = async () => {
      if (!rouletteId) {
        setError('Ruletka ID topilmadi');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getRouletteById(parseInt(rouletteId, 10));
        setRoulette(data);
        initializeTeams(1);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Ruletka yuklashda xatolik';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoulette();
  }, [rouletteId]);

  const initializeTeams = (count: number) => {
    const newTeams: RouletteTeam[] = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: defaultTeamNames[i],
      color: defaultTeamColors[i],
      score: 0,
    }));
    setTeams(newTeams);
  };

  const handleTeamCountChange = (count: number) => {
    setTeamCount(count);
    initializeTeams(count);
  };

  const handleTeamNameChange = (teamId: number, name: string) => {
    setTeams((prev) =>
      prev.map((team) => (team.id === teamId ? { ...team, name } : team))
    );
  };

  const handleTeamColorChange = (teamId: number, color: string) => {
    setTeams((prev) =>
      prev.map((team) => (team.id === teamId ? { ...team, color } : team))
    );
  };

  const handleStartGame = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const allNamesValid = teams.every((team) => team.name.trim().length > 0);
    if (!allNamesValid) {
      setError('Barcha jamoa nomlarini kiriting');
      return;
    }

    const gameMode = teamCount === 1 ? 'single' : 'multi';
    navigate(`/roulette/${rouletteId}/play`, {
      state: { teams, mode: gameMode, showAnswers },
    });
  };

  if (isLoading) {
    return (
      <Page back>
        <div className="roulette-setup-loading">
          <Loading message="Yuklanmoqda..." />
        </div>
      </Page>
    );
  }

  if (error || !roulette) {
    return (
      <Page back>
        <div className="roulette-setup-error">
          <p>{error || 'Ruletka topilmadi'}</p>
        </div>
      </Page>
    );
  }

  const gameMode = teamCount === 1 ? 'single' : 'multi';

  return (
    <Page back>
      <div className="roulette-setup-page">
        <PageHeader title="O'yin Sozlamalari" />

        <form onSubmit={handleStartGame} className="roulette-setup-form">
          {/* Roulette Info */}
          <div className="roulette-setup-info">
            <h2 className="roulette-setup-info-title">{roulette.topic}</h2>
            <p className="roulette-setup-info-subtitle">
              {roulette.target_num_questions} savol
            </p>
          </div>

          {/* Mode Info */}
          <div className="roulette-setup-mode-info">
            <div className="roulette-setup-mode-badge">
              {gameMode === 'single' ? '🎮 Amaliyot Rejimi' : '🏆 Raqobat Rejimi'}
            </div>
            <p className="roulette-setup-mode-description">
              {gameMode === 'single'
                ? 'Siz yakkаli o\'ynayapsiz. Ballar hisoblanmaydi.'
                : 'Bir nechta jamoa o\'ynaydi. Tog\'ri javoblar uchun ballar beriladi.'}
            </p>
          </div>

          {/* Team Count Selection */}
          <div className="roulette-setup-section">
            <label className="roulette-setup-label">Jamoa Soni</label>
            <div className="roulette-setup-team-buttons">
              {[1, 2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  className={`roulette-setup-team-button ${teamCount === count ? 'active' : ''}`}
                  onClick={() => handleTeamCountChange(count)}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Show Answers Option */}
          <div className="roulette-setup-section">
            <label className="roulette-setup-label">Sozlamalar</label>
            <div className="roulette-setup-checkbox-item">
              <input
                type="checkbox"
                id="showAnswersCheckbox"
                checked={showAnswers}
                onChange={(e) => setShowAnswers(e.target.checked)}
                className="roulette-setup-checkbox-input"
              />
              <label htmlFor="showAnswersCheckbox" className="roulette-setup-checkbox-label">
                ✓ To'g'ri javoblarni ko'rsatish
              </label>
            </div>
          </div>

          {/* Team Configuration */}
          {teamCount > 1 && (
            <div className="roulette-setup-section">
              <label className="roulette-setup-label">Jamoa Sozlamalari</label>

              <div className="roulette-setup-teams">
                {teams.map((team) => (
                  <div key={team.id} className="roulette-setup-team-item">
                    <input
                      type="text"
                      value={team.name}
                      onChange={(e) => handleTeamNameChange(team.id, e.target.value)}
                      placeholder={`Jamoa ${team.id} nomi`}
                      className="roulette-setup-team-name-input"
                      maxLength={30}
                    />

                    <div className="roulette-setup-color-picker">
                      <input
                        type="color"
                        value={team.color}
                        onChange={(e) =>
                          handleTeamColorChange(team.id, e.target.value)
                        }
                        className="roulette-setup-color-input"
                        title="Jamoa rangini tanlang"
                      />
                      <span
                        className="roulette-setup-color-preview"
                        style={{ backgroundColor: team.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Start Button */}
          <button type="submit" className="roulette-setup-start-button">
            O'yinni Boshlash
          </button>
        </form>

        <div className="roulette-setup-bottom-space" />
      </div>
    </Page>
  );
};
