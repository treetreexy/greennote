import { Solution, ChatMessage, Question, Subject, Grade, TopicSummary, StudentWorkRecord } from "../types";

const API_KEY = process.env.DASHSCOPE_API_KEY || "sk-f3781bc232b14e718cb32c9f5e4b6ab7";
const BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const MODEL = "qwen-vl-max-latest";

async function callDashScope(messages: any[], jsonMode = false) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages,
      response_format: jsonMode ? { type: "json_object" } : undefined
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "AI 请求失败");
  }

  const result = await response.json();
  return result.choices[0].message.content;
}

export const aiService = {
  async scanPaper(base64Image: string): Promise<any[]> {
    try {
      const content = [
        { type: "text", text: "你是一个理科试卷分析专家。请识别并提取图片中的错题内容。请务必返回 JSON 数组格式，包含字段：text (题干全文), type (题型), difficulty (难度1-5), knowledgePoints (知识点数组)。不要输出任何额外解释。" },
        { type: "image_url", image_url: { url: base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}` } }
      ];
      
      const resText = await callDashScope([{ role: "user", content }], true);
      return JSON.parse(resText || "[]");
    } catch (error) { 
      console.error("Scan Error:", error);
      throw error; 
    }
  },

  async analyzeClassWork(records: StudentWorkRecord[], subject: Subject): Promise<any> {
    try {
      const content: any[] = [
        { type: "text", text: `你是一个专业的阅卷系统。当前正在处理 ${subject} 作业。任务要求：1. 识别图片内容。2. 统计全班数据：平均分、最高分、最低分、得分段分布（0-60, 60-80, 80-100）。3. 生成题目排行榜：列出错误人数最多的题，识别该题的知识点及典型错误答案。请严格按照 JSON 格式返回，包含 stats 对象。` }
      ];

      // 添加样本图片（最多取前2名学生的第一页）
      records.slice(0, 2).forEach(rec => {
        if (rec.pages[0]) {
          content.push({ type: "image_url", image_url: { url: rec.pages[0] } });
        }
      });

      const resText = await callDashScope([{ role: "user", content }], true);
      return JSON.parse(resText || "{}");
    } catch (error) {
      console.error("Class Analysis Error:", error);
      throw error; 
    }
  },

  async solveQuestion(questionText: string): Promise<Solution | null> {
    try {
      const messages = [
        { role: "system", content: "你是一个理科金牌导师。请解析题目并以 JSON 格式返回：answer, analysis, steps(数组), methods, pitfalls。" },
        { role: "user", content: questionText }
      ];
      const resText = await callDashScope(messages, true);
      return JSON.parse(resText || "null");
    } catch (error) { return null; }
  },

  async chatAboutQuestion(questionText: string, chatHistory: ChatMessage[], newMessage: string): Promise<string> {
    try {
      const messages = [
        { role: "system", content: "你是一个专业的理科助教 Qwen。请引导学生思考题目，不要直接给答案。当前讨论题目：" + questionText },
        ...chatHistory.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })),
        { role: "user", content: newMessage }
      ];
      return await callDashScope(messages);
    } catch (e) { return "Qwen 正在思考中，请稍后再试。"; }
  },

  async generalAssistantChat(chatHistory: ChatMessage[], newMessage: string): Promise<string> {
    try {
      const messages = [
        { role: "system", content: "你是一个通晓理科知识的学霸学伴 Qwen，语言亲切幽默。" },
        ...chatHistory.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })),
        { role: "user", content: newMessage }
      ];
      return await callDashScope(messages);
    } catch (e) { return "抱歉，Qwen 刚才开小差了，请重试。"; }
  },

  async generateTitle(knowledgePoints: string[]): Promise<string> {
    try {
      const resText = await callDashScope([
        { role: "user", content: `根据知识点：${knowledgePoints.join(', ')}，生成一个响亮的错题集标题。直接返回纯文本标题。` }
      ]);
      return resText?.trim() || "理科错题集";
    } catch (e) { return "理科错题集"; }
  },

  async getTopicSummary(title: string, knowledgePoints: string[]): Promise<TopicSummary | null> {
    try {
      const messages = [
        { role: "system", content: "你是一个深度学习专家。针对专题提供总结，返回 JSON 包含字段：concepts, templates, traps, pitfalls。" },
        { role: "user", content: `专题名称："${title}"，知识点：${knowledgePoints.join(', ')}` }
      ];
      const resText = await callDashScope(messages, true);
      return JSON.parse(resText || "null");
    } catch (error) { return null; }
  },

  async generatePlanQuestions(criteria: { sourceTexts?: string[], kps?: string[], count: number, subject: Subject, grade: Grade }): Promise<Question[]> {
    try {
      const prompt = criteria.sourceTexts 
        ? `基于以下错题，生成 ${criteria.count} 道相似的练习题（不要重复原题）：\n${criteria.sourceTexts.join('\n')}`
        : `基于知识点：${criteria.kps?.join(', ')}，为${criteria.grade}${criteria.subject}生成 ${criteria.count} 道练习题。`;

      const resText = await callDashScope([
        { role: "system", content: "你是一个特级教师。请以 JSON 数组格式返回生成的题目，每个对象包含：text, correctAnswer, analysis, difficulty, questionType, knowledgePoints。" },
        { role: "user", content: prompt }
      ], true);

      const parsed = JSON.parse(resText || "[]");
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