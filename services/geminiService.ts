
import { aiService } from "./aiService";
import { Subject, StudentWorkRecord, Solution, ChatMessage, Question, Grade, TopicSummary } from "../types";

/**
 * Compatibility wrapper for legacy code pointing to geminiService.
 * Now internally routes to the Qwen-based aiService.
 */
export const geminiService = {
  scanPaper: aiService.scanPaper,
  analyzeClassWork: aiService.analyzeClassWork,
  solveQuestion: aiService.solveQuestion,
  chatAboutQuestion: aiService.chatAboutQuestion,
  generalAssistantChat: aiService.generalAssistantChat,
  generateTitle: aiService.generateTitle,
  getTopicSummary: aiService.getTopicSummary,
  generatePlanQuestions: aiService.generatePlanQuestions
};
