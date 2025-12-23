
import React from 'react';
import { Subject, Grade, ErrorReason, Mastery, WrongItem, QuestionType } from './types';
import { IconMath, IconPhysics, IconAnalyze, IconLearning } from './components/Icons';

export const PRIMARY_COLOR = '#93CA76';

export const MOCK_WRONG_ITEMS: WrongItem[] = [
  {
    id: '1',
    text: '已知函数 f(x) = x^2 - 2ax + 1 在区间 [1, 2] 上单调递减，求 a 的取值范围。',
    subject: Subject.MATH,
    grade: Grade.SENIOR_1,
    difficulty: 3,
    knowledgePoints: ['二次函数', '单调性'],
    questionType: QuestionType.ANSWER,
    correctAnswer: 'a ≥ 2',
    analysis: '由于二次函数开口向上，对称轴为 x = a。若在 [1, 2] 上单调递减，则对称轴必须在区间右侧或重合，即 a ≥ 2。',
    source: '2024-12 月考',
    reason: [ErrorReason.CONCEPT],
    mastery: Mastery.LITTLE,
    wrongCount: 2,
    collectedAt: Date.now() - 86400000 * 2,
    inPlan: true,
    printed: false,
    solution: {
      answer: 'a ≥ 2',
      analysis: '利用二次函数的性质，对称轴 x = -b/(2a) = a。单调递减区间在对称轴左侧。',
      steps: ['确定对称轴 x = a', '列出不等式 a ≥ 2', '得出最终范围'],
      methods: '数形结合法',
      pitfalls: '容易漏掉端点值'
    }
  },
  {
    id: '2',
    text: '一个物体以 5m/s 的初速度做匀加速直线运动，加速度为 2m/s^2，求 3s 后的位移。',
    subject: Subject.PHYSICS,
    grade: Grade.JUNIOR_3,
    difficulty: 2,
    knowledgePoints: ['匀变速直线运动', '位移公式'],
    questionType: QuestionType.CALC,
    correctAnswer: '24m',
    analysis: '使用位移公式 s = v0t + 1/2at^2 计算。s = 5*3 + 0.5*2*3^2 = 15 + 9 = 24m。',
    source: '课后作业',
    reason: [ErrorReason.FORMULA],
    mastery: Mastery.BASIC,
    wrongCount: 1,
    collectedAt: Date.now() - 86400000 * 5,
    inPlan: false,
    printed: true,
    solution: {
      answer: '24m',
      analysis: '直接带入匀变速直线运动位移公式。',
      steps: ['列出已知量 v0=5, a=2, t=3', '代入公式 s = v0t + 1/2at^2', '计算得出 24m'],
      methods: '公式法',
      pitfalls: '忘记平方或者计算错误'
    }
  }
];

export const SUBJECT_ICONS: Record<Subject, React.ReactNode> = {
  [Subject.MATH]: <IconMath />,
  [Subject.PHYSICS]: <IconPhysics />,
  [Subject.CHEMISTRY]: <IconAnalyze size={24} color="#4DB6AC" />,
  [Subject.BIOLOGY]: <IconLearning active={true} size={24} />
};
