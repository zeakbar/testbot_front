import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Page } from '@/components/Page';
import { Loading } from '@/components/Loading/Loading';
import { getQuizById, getQuizUserScores } from '@/api/quiz';
import type { Quiz, Test, QuizLeaderboardEntry } from '@/api/types';
import { QuizDetailHeader } from './components/QuizDetailHeader/QuizDetailHeader';
import { LeaderboardSection } from './components/LeaderboardSection/LeaderboardSection';
import './QuizDetailPage.css';

interface QuizDetailData {
  quiz: Quiz;
  test: Test;
  leaderboard: QuizLeaderboardEntry[];
}

export const QuizDetailPage: FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<QuizDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!quizId) {
        setError('Viktorina ID majburiy');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const quizData = await getQuizById(quizId);
        const leaderboardData = await getQuizUserScores(quizId);

        if (typeof quizData.test !== 'object') {
          setError('Viktorina test ma\'lumotlari mavjud emas');
          setIsLoading(false);
          return;
        }

        setData({
          quiz: quizData,
          test: quizData.test,
          leaderboard: leaderboardData,
        });
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Viktorina tafsilotlarini yuklashda xato';
        setError(errorMessage);
        console.error('Error loading quiz:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [quizId]);

  if (isLoading) {
    return (
      <Page back>
        <div className="quiz-detail-page-loading">
          <Loading message="Yuklanmoqda..." />
        </div>
      </Page>
    );
  }

  if (error || !data) {
    return (
      <Page back>
        <div className="quiz-detail-page-error">
          <p>{error || 'Viktorina topilmadi...'}</p>
          <button
            className="quiz-detail-page-error-button"
            onClick={() => window.location.reload()}
            type="button"
          >
            Qayta urinish
          </button>
        </div>
      </Page>
    );
  }

  const { quiz, test, leaderboard } = data;

  return (
    <Page back>
      <div className="quiz-detail-page">
        <QuizDetailHeader quiz={quiz} test={test} onTestDetailsClick={() => navigate(`/test/${test.id}`)} />

        <div className="quiz-detail-page-section-divider" />

        <LeaderboardSection leaderboard={leaderboard} participantCount={quiz.users.length} />

        <div className="quiz-detail-page-bottom-space" />
      </div>
    </Page>
  );
};
