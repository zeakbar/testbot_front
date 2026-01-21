import type {
  RawRouletteClarificationQuestion,
  RouletteClarificationQuestion,
} from '@/api/types';

/**
 * Parse raw clarification questions from backend into usable format
 */
export function parseClarificationQuestions(
  rawQuestions: RawRouletteClarificationQuestion[]
): RouletteClarificationQuestion[] {
  return rawQuestions.map((rawQuestion) => {
    const parsed: RouletteClarificationQuestion = {
      key: '',
      question: '',
      suggested_options: [],
      allows_custom: false,
    };

    // Each question is an array of [key, value] pairs
    rawQuestion.forEach((item) => {
      const [field, value] = item as [string, unknown];

      switch (field) {
        case 'key':
          parsed.key = String(value);
          break;
        case 'question':
          parsed.question = String(value);
          break;
        case 'allows_custom':
          parsed.allows_custom = Boolean(value);
          break;
        case 'suggested_options': {
          // Value is an array of [[key, value], ...] pairs
          const options = Array.isArray(value) ? value : [];
          parsed.suggested_options = options.map((optionPair) => {
            const option: Record<string, string> = {};
            if (Array.isArray(optionPair)) {
              optionPair.forEach(([optKey, optValue]) => {
                option[String(optKey)] = String(optValue);
              });
            }
            return {
              value: option.value || '',
              label: option.label || '',
            };
          });
          break;
        }
      }
    });

    return parsed;
  });
}
