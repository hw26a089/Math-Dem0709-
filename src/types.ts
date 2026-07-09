export interface Question {
  questionText: string;
  expectedAnswer: string;
  hint: string;
}

export interface Stage {
  number: number;
  name: string;
  category: string;
  enemyName: string;
  enemyMaxHp: number;
  enemyIcon: 'slime' | 'golem' | 'demon' | 'dragon';
}

export interface StudyLog {
  timestamp: number;
  difficulty: 'easy' | 'normal' | 'hard';
  enemyIcon: 'slime' | 'golem' | 'demon' | 'dragon';
  enemyName: string;
  isCorrect: boolean;
  durationSeconds: number;
}
