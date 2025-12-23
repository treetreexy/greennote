
export enum Subject {
  MATH = '数学',
  PHYSICS = '物理',
  CHEMISTRY = '化学',
  BIOLOGY = '生物'
}

export enum Grade {
  JUNIOR_1 = '初一',
  JUNIOR_2 = '初二',
  JUNIOR_3 = '初三',
  SENIOR_1 = '高一',
  SENIOR_2 = '高二',
  SENIOR_3 = '高三'
}

export enum ErrorReason {
  MISREAD = '审题不清',
  CONCEPT = '概念混淆',
  METHOD = '方法不会',
  CALCULATION = '计算失误',
  STEPS = '步骤漏写',
  GRAPHIC = '图形想象不足',
  FORMULA = '公式记错',
  CARELESS = '粗心大意',
  TIME = '时间分配不当',
  LOGIC = '逻辑推导错误',
  KNOWLEDGE_GAP = '知识点盲区',
  NERVOUS = '状态不佳',
  UNIT = '单位漏写/写错',
  SIGN = '符号错误(+/-)',
  COPY = '抄错数字/条件'
}

export enum Mastery {
  NONE = '完全不会',
  LITTLE = '略懂',
  BASIC = '基本会',
  MASTERED = '完全掌握'
}

export enum QuestionType {
  CHOICE = '选择题',
  FILL = '填空题',
  ANSWER = '解答题',
  CALC = '计算题',
  EXPERIMENT = '实验题',
  PROOF = '证明题'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Question {
  id: string;
  image?: string;
  text: string;
  subject: Subject;
  grade: Grade;
  difficulty: number; // 1-5
  knowledgePoints: string[];
  questionType: QuestionType;
  correctAnswer?: string;
  analysis?: string;
}

export interface WrongItem extends Question {
  source: string;
  paperId?: string;
  paperPage?: number;
  reason: ErrorReason[];
  mastery: Mastery;
  wrongCount: number;
  collectedAt: number;
  lastPracticedAt?: number;
  practiceCount?: number;
  inPlan: boolean;
  printed: boolean;
  solution?: Solution;
  chatHistory?: ChatMessage[];
}

export interface PlanTask {
  id: string;
  title: string;
  questions: Question[];
  isCompleted: boolean;
  completedAt?: number;
  score?: number; 
}

export interface LearningPlan {
  id: string;
  title: string;
  subject: Subject;
  createdAt: number;
  type: 'manual' | 'ai';
  schedule: string[];
  time: string;
  tasks: PlanTask[];
  currentTaskIndex: number;
  sourceItems: string[];
  status: 'active' | 'completed' | 'paused';
}

export interface GradingResult {
  questionId: string;
  questionNumber: number;
  questionType: QuestionType;
  text: string;
  correctAnswer: string;
  studentAnswer?: string;
  isCorrect: boolean | 'pending';
  feedback?: string;
  knowledgePoints: string[];
}

export interface Paper {
  id: string;
  name: string;
  image: string;
  pages: string[];
  subject: Subject;
  grade: Grade;
  createdAt: number;
  isAnalyzed: boolean;
  isGraded: boolean;
  itemCount: number;
  gradingData?: Record<number, GradingResult[]>;
}

export interface Solution {
  answer: string;
  analysis: string;
  steps: string[];
  methods: string;
  pitfalls: string;
}

export interface Worksheet {
  id: string;
  title: string;
  items: string[];
  createdAt: number;
  subject: Subject;
}

export interface TopicSummary {
  concepts: string[];
  templates: string[];
  traps: string[];
  pitfalls: string[];
}

export interface LearningTopic {
  id: string;
  title: string;
  subject: Subject;
  knowledgePoints: string[];
  recommendReason: string;
  status: 'not_started' | 'studying' | 'completed';
  summary?: TopicSummary;
}

export interface StudentWorkRecord {
  studentId: string;
  studentName: string;
  pages: string[];
  isGraded: boolean;
  score?: number;
}

export interface ErrorPointStat {
  id: string;
  errorPoint: string; // "错误点：符号错误（把 - 写成 +）"
  count: number;
  percentage: number;
  evidence: string; // "证据：第5题学生普遍把减号当加号处理"
  impact: string; // "影响：导致最终结果偏大"
  relatedQuestionNumbers: number[];
  tags: string[]; // ["分式运算", "基础运算"]
  typicalWrongAnswers: { text: string; count: number }[];
}

export interface GradingSession {
  id: string;
  workName: string;
  folderId?: string;
  classId: string;
  subject: Subject;
  createdAt: number;
  records: StudentWorkRecord[];
  status: 'draft' | 'processing' | 'completed';
  stats?: {
    avgScore: number;
    maxScore: number;
    minScore: number;
    distribution: Record<string, number>;
    errorPointStats: ErrorPointStat[];
    questionStats: {
      number: number;
      correctRate: number;
      wrongCount: number;
      errorLabel?: string;
      knowledgePoints: string[];
      imageSnippet?: string;
    }[];
  };
}
