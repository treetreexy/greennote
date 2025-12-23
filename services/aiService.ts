
import { GoogleGenAI, Type } from "@google/genai";
import { Solution, ChatMessage, Question, Subject, Grade, TopicSummary, StudentWorkRecord } from "../types";

/**
 * World-class senior frontend engineer's implementation of aiService using Google Gemini API.
 */

export const aiService = {
  async scanPaper(base64Image: string): Promise<any[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: "你是一个理科试卷分析专家。请识别并提取图片中的错题内容。请务必返回 JSON 数组格式，包含字段：text (题干全文), type (题型), difficulty (难度1-5), knowledgePoints (知识点数组)。不要输出任何额外解释。" },
            { 
              inlineData: { 
                mimeType: 'image/jpeg', 
                data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image 
              } 
            },
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
      
      const jsonStr = response.text || "[]";
      return JSON.parse(jsonStr.trim());
    } catch (error) { 
      console.error("Scan Paper Error:", error);
      throw error; 
    }
  },

  async analyzeClassWork(records: StudentWorkRecord[], subject: Subject): Promise<any> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const imageParts: any[] = [];
      // Take up to 3 samples for better context
      records.slice(0, 3).forEach(rec => {
        if (rec.pages[0]) {
          const d = rec.pages[0];
          imageParts.push({ 
            inlineData: { 
              mimeType: 'image/jpeg', 
              data: d.includes(',') ? d.split(',')[1] : d 
            } 
          });
        }
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: `你是一个专业的理科阅卷与学情分析系统。当前正在处理 ${subject} 作业.
            任务要求：
            1. 识别图片中的得分与作答逻辑。
            2. 【重点】识别具体的“错误点”而非笼统考点。例如：“符号错误（把-写成+）”、“抄错题干数字”、“分母通分错误”。
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
                  errorPointStats: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        errorPoint: { type: Type.STRING },
                        count: { type: Type.NUMBER },
                        percentage: { type: Type.NUMBER },
                        evidence: { type: Type.STRING },
                        impact: { type: Type.STRING },
                        relatedQuestionNumbers: { type: Type.ARRAY, items: { type: Type.INTEGER } },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        typicalWrongAnswers: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              text: { type: Type.STRING },
                              count: { type: Type.NUMBER }
                            }
                          }
                        }
                      }
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
                        knowledgePoints: { type: Type.ARRAY, items: { type: Type.STRING } }
                      }
                    }
                  }
                }
              }
            }
          }
        },
      });
      
      const jsonStr = response.text || "{}";
      return JSON.parse(jsonStr.trim());
    } catch (error) {
      console.error("Class Analysis Error:", error);
      throw error; 
    }
  },

  async solveQuestion(questionText: string): Promise<Solution | null> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `你是一个理科金牌导师。请解析题目并以 JSON 格式返回：answer, analysis, steps(数组), methods, pitfalls。
        题目如下：
        ${questionText}`,
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
      const jsonStr = response.text || "null";
      return JSON.parse(jsonStr.trim());
    } catch (error) { 
      console.error("Solve Question Error:", error);
      return null; 
    }
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
        config: { 
          systemInstruction: "你是一个专业的理科助教 Qwen。请引导学生思考题目，不要直接给答案。" 
        },
      });
      return response.text || "Qwen 老师暂时无法回复。";
    } catch (e) { 
      console.error("Chat Error:", e);
      return "Qwen 正在思考中，请稍后再试。"; 
    }
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
        config: { 
          systemInstruction: "你是一个通晓理科知识的学霸学伴 Qwen，语言亲切幽默。" 
        },
      });
      return response.text || "抱歉，刚才开小差了。";
    } catch (e) { 
      console.error("General Chat Error:", e);
      return "抱歉，Qwen 刚才开小差了，请重试。"; 
    }
  },

  async generateTitle(knowledgePoints: string[]): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `根据知识点：${knowledgePoints.join(', ')}，生成一个响亮的错题集标题。直接返回纯文本标题。`
      });
      return response.text?.trim() || "理科错题集";
    } catch (e) { return "理科错题集"; }
  },

  async getTopicSummary(title: string, knowledgePoints: string[]): Promise<TopicSummary | null> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `你是一个深度学习专家。针对专题"${title}"（包含知识点：${knowledgePoints.join(', ')}）提供总结。请返回 JSON 包含字段：concepts, templates, traps, pitfalls。不要输出任何额外解释。`,
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
      const jsonStr = response.text || "null";
      return JSON.parse(jsonStr.trim());
    } catch (error) { 
      console.error("Topic Summary Error:", error);
      return null; 
    }
  },

  async generatePlanQuestions(criteria: { sourceTexts?: string[], kps?: string[], count: number, subject: Subject, grade: Grade }): Promise<Question[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = criteria.sourceTexts 
        ? `基于以下错题，生成 ${criteria.count} 道相似的练习题（不要重复原题）：\n${criteria.sourceTexts.join('\n')}`
        : `基于知识点：${criteria.kps?.join(', ')}，为${criteria.grade}${criteria.subject}生成 ${criteria.count} 道练习题。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "你是一个特级教师。请以 JSON 数组格式返回生成的题目，每个对象包含: text, correctAnswer, analysis, difficulty, questionType, knowledgePoints。",
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

      const jsonStr = response.text || "[]";
      const parsed = JSON.parse(jsonStr.trim());
      return parsed.map((p: any) => ({
        ...p,
        id: Math.random().toString(36).substr(2, 9),
        subject: criteria.subject,
        grade: criteria.grade,
      }));
    } catch (e) {
      console.error("AI Generation Error:", e);
      return [];
    }
  }
};
