import type { FC } from 'react';
import type { RouletteQuestion, RouletteTeam } from '@/api/types';
import './RouletteWheel.css';

interface RouletteWheelProps {
  questions: RouletteQuestion[];
  rotation: number;
  usedSegments: number[];
  emptySegments: number[];
  teams: RouletteTeam[];
  gameMode: 'single' | 'multi';
  onSpin?: () => void;
  isSpinning?: boolean;
  selectedSegment?: number | null;
}

export const RouletteWheel: FC<RouletteWheelProps> = ({
  questions,
  rotation,
  usedSegments,
  emptySegments,
  teams,
  gameMode,
  onSpin,
  isSpinning = false,
  // selectedSegment = null,
}) => {
  const segmentCount = questions.length;
  const segmentAngle = 360 / segmentCount;
  const radius = 280;
  const centerX = 300;
  const centerY = 300;

  const getSegmentColor = (index: number): string => {
    if (gameMode === 'multi' && teams.length > 0) {
      return teams[index % teams.length].color;
    }

    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#96CEB4', 
      '#FF9E64', '#C8B6E2', '#73A1D4', '#FF8C61', '#67D5B5', 
      '#EE5A6F', '#A0E995', '#6BCB77', '#FF69B4',  '#87CEEB',
      '#FF6347', '#50C878', '#9370DB', '#FF4500', '#7FFFD4', 
    ];
    return colors[index % colors.length];
  };

  const formatTextLines = (text: string, maxCharsPerLine: number = 18, maxLines: number = 3): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      if ((currentLine + word).length <= maxCharsPerLine) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
        if (lines.length >= maxLines) {
          break;
        }
      }
    }

    if (currentLine && lines.length < maxLines) {
      lines.push(currentLine);
    }

    // Add ellipsis if text was truncated
    if (lines.length === maxLines && words.length > words.slice(0, words.indexOf(lines[lines.length - 1].split(' ').pop() || '')).length) {
      const lastLine = lines[lines.length - 1];
      if (lastLine.length > maxCharsPerLine - 3) {
        lines[lines.length - 1] = lastLine.slice(0, maxCharsPerLine - 3) + '...';
      } else {
        lines[lines.length - 1] = lastLine + '...';
      }
    }

    return lines.slice(0, maxLines);
  };

  const isSegmentUsed = (index: number): boolean => usedSegments.includes(index);

  const getSegmentPath = (index: number) => {
    const startAngle = (segmentAngle * index - 90) * (Math.PI / 180);
    const endAngle = (segmentAngle * (index + 1) - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArc = segmentAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const getTextPosition = (index: number) => {
    const angle = (segmentAngle * (index + 0.5) - 90) * (Math.PI / 180);
    const textRadius = radius * 0.65;
    const x = centerX + textRadius * Math.cos(angle);
    const y = centerY + textRadius * Math.sin(angle);
    const rotationAngle = (segmentAngle * (index + 0.5)) % 360;

    return { x, y, angle: rotationAngle };
  };

  // const getLabelPosition = (index: number) => {
  //   const angle = (segmentAngle * (index + 0.5) - 90) * (Math.PI / 180);
  //   const labelRadius = radius * 0.85;
  //   const x = centerX + labelRadius * Math.cos(angle);
  //   const y = centerY + labelRadius * Math.sin(angle);

  //   return { x, y };
  // };

  return (
    <div className="roulette-wheel-container">
      <svg
        viewBox="-50 -50 700 700"
        className="roulette-wheel-svg"
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {/* Segments */}
        {Array.from({ length: segmentCount }).map((_, index) => {
          const question = questions[index];
          const path = getSegmentPath(index);
          const textPos = getTextPosition(index);
          const isEmpty = emptySegments.includes(index);
          const used = isSegmentUsed(index) && !isEmpty; // Don't blur empty segments

          return (
            <g key={index} opacity={used ? 0.4 : 0.92}>
              {/* Segment Path */}
              <path
                d={path}
                fill={getSegmentColor(index)}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth={2}
                filter={used ? 'url(#grayscale)' : 'none'}
              />

              {/* Question Text or Empty Arrow */}
              {question && (
                <g transform={`translate(${textPos.x}, ${textPos.y}) rotate(${textPos.angle})`}>
                  {emptySegments.includes(index) ? (
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="roulette-segment-question-text"
                      fontSize="48"
                    >
                      ➡️
                    </text>
                  ) : question.question ? (
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="roulette-segment-question-text"
                    >
                      {formatTextLines(question.question).map((line, lineIndex) => (
                        <tspan key={lineIndex} x="0" dy={lineIndex === 0 ? 0 : '1.2em'}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  ) : (
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="roulette-segment-question-text"
                      fontSize="24"
                    >
                      ?
                    </text>
                  )}
                </g>
              )}

              {/* Segment Number - Hidden for cleaner design */}
            </g>
          );
        })}

        {/* Center Circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r="55"
          fill="url(#centerGradient)"
          stroke="var(--color-primary)"
          strokeWidth="6"
        />

        {/* Gradients and Filters */}
        <defs>
          <linearGradient id="centerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-bg-primary)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.95)" />
          </linearGradient>

          <filter id="grayscale">
            <feColorMatrix type="saturate" values="0" />
          </filter>

          <filter id="selectedGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Pointer */}
      <div className="roulette-pointer" />

      {/* Center Spin Button */}
      {onSpin && (
        <button
          className="roulette-center-button"
          onClick={onSpin}
          disabled={isSpinning}
          type="button"
          title="Aylantir"
        >
          🎡
        </button>
      )}
    </div>
  );
};
