import type { EditableQuestion } from '@/api/testEdit';

export interface ValidationError {
  isValid: boolean;
  errors: string[];
}

export const validateQuestion = (question: EditableQuestion): ValidationError => {
  const errors: string[] = [];

  // Check minimum options count
  if (question.options.length < 2) {
    errors.push('Savol kamida 2 ta variantga ega bo\'lishi kerak');
  }

  // Count correct options
  const correctOptionsCount = question.options.filter((opt) => opt.is_correct).length;

  // Check if exactly one option is correct (not zero, not multiple)
  if (correctOptionsCount === 0) {
    errors.push('Kamida bitta to\'g\'ri javob kerak');
  } else if (correctOptionsCount > 1) {
    errors.push('Faqat bitta to\'g\'ri javob bo\'lishi kerak');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const canDeleteOption = (question: EditableQuestion, optionId: number): boolean => {
  // Can only delete if there are more than 2 options
  if (question.options.length <= 2) {
    return false;
  }

  // Cannot delete if it would leave the question without a correct answer
  const option = question.options.find((o) => o.id === optionId);
  if (option?.is_correct) {
    const otherCorrectOptions = question.options.filter((o) => o.id !== optionId && o.is_correct);
    if (otherCorrectOptions.length === 0) {
      return false;
    }
  }

  return true;
};

export const getQuestionValidationErrors = (question: EditableQuestion): string[] => {
  return validateQuestion(question).errors;
};

export const isQuestionValid = (question: EditableQuestion): boolean => {
  return validateQuestion(question).isValid;
};
