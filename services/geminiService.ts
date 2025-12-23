import { GoogleGenAI, Type } from "@google/genai";
import { Solution, ChatMessage, Question, QuestionType, Subject, Grade, TopicSummary, StudentWorkRecord } from "../types";

export const geminiService = {
  async scanPaper(base64Image: string): Promise<any[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: "你是一个理科试卷分析专家。请识别并提取图片中的错题内容。请务必返回 JSON 数组格式，包含字段：text (题干全文), type (题型), difficulty (难度1-5), knowledgePoints (知识点数组)。不要输出任何额外解释。" },
            { inlineData: { mimeType: 'image/jpeg', data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image } },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                type: { type: Type.STRING },
                difficulty: { type: Type.INTEGER },
                knowledgePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["text", "type", "difficulty", "knowledgePoints"],
            },
          },
        },
      });
      return JSON.parse(response.text || "[]");
    } catch (error) { throw error; }
  },

  /**
   * 教师端核心：全班作业批量批改分析
   */
  async analyzeClassWork(records: StudentWorkRecord[], subject: Subject): Promise<any> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 构建样本图片：取第一个和最后一个学生的第一页
      const imageParts: any[] = [];
      if (records[0]?.pages[0]) {
        const d = records[0].pages[0];
        imageParts.push({ inlineData: { mimeType: 'image/jpeg', data: d.includes(',') ? d.split(',')[1] : d } });
      }
      if (records.length > 1 && records[records.length - 1]?.pages[0]) {
        const d = records[records.length - 1].pages[0];
        imageParts.push({ inlineData: { mimeType: 'image/jpeg', data: d.includes(',') ? d.split(',')[1] : d } });
      }

      const response = await ai.models.generateContent({
        // 使用 gemini-3-flash-preview，处理多图 OCR 时更稳定且响应快
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: `你是一个专业的阅卷系统。当前正在处理 ${subject} 作业。
            
            任务要求：
            1. 识别图片中包含的所有题目。
            2. 对每个学生的作答情况进行对错判定（isCorrect）。
            3. 统计全班数据：平均分、最高分、最低分、得分段分布（0-60, 60-80, 80-100）。
            4. 生成题目排行榜：列出错误人数最多的Top题，并识别该题的知识点及典型错误答案。
            
            请严格按照 JSON 格式返回。` },
            ...imageParts
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              stats: {
                type: Type.OBJECT,
                properties: {
                  avgScore: { type: Type.NUMBER },
                  maxScore: { type: Type.NUMBER },
                  minScore: { type: Type.NUMBER },
                  distribution: { 
                    type: Type.OBJECT,
                    properties: {
                      "0-60": { type: Type.NUMBER },
                      "60-80": { type: Type.NUMBER },
                      "80-100": { type: Type.NUMBER }
                    }
                  },
                  questionStats: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        number: { type: Type.INTEGER },
                        correctRate: { type: Type.NUMBER },
                        wrongCount: { type: Type.INTEGER },
                        knowledgePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                        commonWrongAnswers: { 
                          type: Type.ARRAY, 
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              text: { type: Type.STRING },
                              count: { type: Type.INTEGER }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
      });
      
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("AI 批改失败详情:", error);
      throw error; 
    }
  },

  async solveQuestion(questionText: string): Promise<Solution | null> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `作为理科金牌导师，请解析此题：\n${questionText}\n请返回 JSON 对象，包含：answer, analysis, steps(数组), methods, pitfalls。`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: { type: Type.STRING },
              analysis: { type: Type.STRING },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              methods: { type: Type.STRING },
              pitfalls: { type: Type.STRING },
            },
            required: ["answer", "analysis", "steps", "methods", "pitfalls"],
          },
        },
      });
      return JSON.parse(response.text || "null");
    } catch (error) { return null; }
  },

  async chatAboutQuestion(questionText: string, chatHistory: ChatMessage[], newMessage: string): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...chatHistory.map(m => ({ role: m.role === 'model' ? 'model' : 'user', parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: `针对题目：${questionText}，学生问：${newMessage}` }] }
        ],
        config: { systemInstruction: "你是一个专业的理科助教。请引导学生思考，不要直接给答案。" },
      });
      return response.text || "抱歉，由于 API 响应异常，我现在无法回复。";
    } catch (e) { return "Gemini 正在思考中，请稍后再试。"; }
  },

  async generalAssistantChat(chatHistory: ChatMessage[], newMessage: string): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...chatHistory.map(m => ({ role: m.role === 'model' ? 'model' : 'user', parts: [{ text: m.text }] })),
          { role: 'user', parts: [{ text: newMessage }] }
        ],
        config: { systemInstruction: "你是一个通晓理科知识的学霸学伴，语言亲切幽默。" },
      });
      return response.text || "抱歉，由于 API 响应异常，我现在无法回复。";
    } catch (e) { return "抱歉，由于 API 配置问题，我现在无法正常回复。"; }
  },

  async generateTitle(knowledgePoints: string[]): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `根据知识点：${knowledgePoints.join(', ')}，生成一个响亮的试卷标题。直接返回纯文本标题。`
      });
      return response.text?.trim() || "理科错题集";
    } catch (e) { return "理科错题集"; }
  },

  async getTopicSummary(title: string, knowledgePoints: string[]): Promise<TopicSummary | null> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `针对专题"${title}"（包含知识点：${knowledgePoints.join(', ')}），请提供深度学习总结。请返回 JSON 对象，包含字段：concepts (核心概念数组), templates (解题模板数组), traps (常见陷阱数组), pitfalls (易错点清单数组)。不要输出任何额外解释。`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              concepts: { type: Type.ARRAY, items: { type: Type.STRING } },
              templates: { type: Type.ARRAY, items: { type: Type.STRING } },
              traps: { type: Type.ARRAY, items: { type: Type.STRING } },
              pitfalls: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["concepts", "templates", "traps", "pitfalls"],
          },
        },
      });
      return JSON.parse(response.text || "null");
    } catch (error) { return null; }
  },

  async generatePlanQuestions(criteria: { sourceTexts?: string[], kps?: string[], count: number, subject: Subject, grade: Grade }): Promise<Question[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = criteria.sourceTexts 
        ? `基于以下错题，生成 ${criteria.count} 道相似的练习题（不要重复原题，难度由易到难）：\n${criteria.sourceTexts.join('\n')}`
        : `基于知识点：${criteria.kps?.join(', ')}，为${criteria.grade}${criteria.subject}生成 ${criteria.count} 道练习题（难度由易到难）。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                correctAnswer: { type: Type.STRING },
                analysis: { type: Type.STRING },
                difficulty: { type: Type.INTEGER },
                questionType: { type: Type.STRING },
                knowledgePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["text", "correctAnswer", "analysis", "difficulty", "questionType", "knowledgePoints"],
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || "[]");
      return parsed.map((p: any) => ({
        ...p,
        id: Math.random().toString(36).substr(2, 9),
        subject: criteria.subject,
        grade: criteria.grade,
      }));
    } catch (e) {
      console.error("AI Question Generation Error:", e);
      return [];
    }
  }
};