
import { Solution, ChatMessage, Question, Subject, Grade, TopicSummary, StudentWorkRecord } from "../types";

/**
 * AI Service implementation using Alibaba DashScope (Qwen-VL).
 * Using OpenAI-compatible endpoint for model推理.
 */

// 优先从环境变量获取，如果获取失败（可能是 Gemini Key），则使用用户提供的 DashScope 专用 Key
const DASHSCOPE_API_KEY = "sk-f3781bc232b14e718cb32c9f5e4b6ab7";
const BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const MODEL_NAME = "qwen-vl-max-latest";

async function callQwen(messages: any[], jsonMode = false) {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DASHSCOPE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: messages,
        // Qwen-VL 兼容 OpenAI 的 json_object 模式
        response_format: jsonMode ? { type: "json_object" } : undefined
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("DashScope API Error Details:", errData);
      throw new Error(errData.error?.message || `请求失败: ${response.status}`);
    }

    const result = await response.json();
    let content = result.choices[0].message.content;
    
    // 如果是文本模式，有时候 Qwen 会返回 Markdown 代码块包围的 JSON
    if (jsonMode && typeof content === 'string') {
      content = content.replace(/```json\n?/, "").replace(/\n?```/, "").trim();
    }
    
    return content;
  } catch (error) {
    console.error("callQwen Exception:", error);
    throw error;
  }
}

export const aiService = {
  async scanPaper(base64Image: string): Promise<any[]> {
    try {
      const dataUrl = base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`;
      const content = [
        { type: "text", text: "你是一个理科试卷分析专家。请识别并提取图片中的错题内容。请务必返回 JSON 数组格式，包含字段：text (题干全文), type (题型), difficulty (难度1-5), knowledgePoints (知识点数组)。不要输出任何额外解释。" },
        { type: "image_url", image_url: { url: dataUrl } }
      ];
      
      const resText = await callQwen([{ role: "user", content }], true);
      return JSON.parse(resText || "[]");
    } catch (error) { 
      console.error("Qwen Scan Error:", error);
      throw error; 
    }
  },

  async analyzeClassWork(records: StudentWorkRecord[], subject: Subject): Promise<any> {
    try {
      const userContent: any[] = [
        { type: "text", text: `你是一个专业的理科阅卷与学情分析系统。当前正在处理 ${subject} 作业。
        任务要求：
        1. 识别图片中的得分与作答逻辑。
        2. 【重点】识别具体的“错误点”而非笼统考点。例如：“符号错误（把-写成+）”、“抄错题干数字”、“分母通分错误”。
        3. 统计全班数据：平均分、最高分、最低分、得分段分布（0-60, 60-80, 80-100）。
        4. 生成题目排行榜：列出错误人数最多的Top题。
        
        严格返回 JSON 格式：
        {
          "stats": {
            "avgScore": 82, "maxScore": 95, "minScore": 38,
            "distribution": { "0-60": 3, "60-80": 12, "80-100": 15 },
            "errorPointStats": [
              {
                "id": "err1",
                "errorPoint": "错误点：符号错误（把 - 写成 +）",
                "count": 12,
                "percentage": 40,
                "evidence": "证据：在第5题求根公式应用中，多数学生将负b写成了正b",
                "impact": "影响：直接导致计算结果偏大",
                "relatedQuestionNumbers": [5, 8],
                "tags": ["基础计算"],
                "typicalWrongAnswers": [{"text": "x=5", "count": 8}]
              }
            ],
            "questionStats": [
              { "number": 1, "correctRate": 95, "wrongCount": 1, "knowledgePoints": ["集合定义"] }
            ]
          }
        }` }
      ];

      // 添加样本图片
      records.slice(0, 3).forEach(rec => {
        if (rec.pages[0]) {
          const imgUrl = rec.pages[0].startsWith('data:') ? rec.pages[0] : `data:image/jpeg;base64,${rec.pages[0]}`;
          userContent.push({ type: "image_url", image_url: { url: imgUrl } });
        }
      });

      const resText = await callQwen([{ role: "user", content: userContent }], true);
      return JSON.parse(resText || "{}");
    } catch (error) {
      console.error("Qwen Class Analysis Error:", error);
      throw error; 
    }
  },

  async solveQuestion(questionText: string): Promise<Solution | null> {
    try {
      const messages = [
        { role: "system", content: "你是一个理科金牌导师。请解析题目并以 JSON 格式返回：answer, analysis, steps(数组), methods, pitfalls。" },
        { role: "user", content: questionText }
      ];
      const resText = await callQwen(messages, true);
      return JSON.parse(resText || "null");
    } catch (error) { 
      console.error("Qwen Solve Error:", error);
      return null; 
    }
  },

  async chatAboutQuestion(questionText: string, chatHistory: ChatMessage[], newMessage: string): Promise<string> {
    try {
      const messages = [
        { role: "system", content: "你是一个专业的理科助教 Qwen。请引导学生思考题目，不要直接给答案。当前讨论题目：" + questionText },
        ...chatHistory.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })),
        { role: "user", content: newMessage }
      ];
      return await callQwen(messages);
    } catch (e) { 
      return "Qwen 正在思考中，请稍后再试。"; 
    }
  },

  async generalAssistantChat(chatHistory: ChatMessage[], newMessage: string): Promise<string> {
    try {
      const messages = [
        { role: "system", content: "你是一个通晓理科知识的学霸学伴 Qwen，语言亲切幽默。" },
        ...chatHistory.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })),
        { role: "user", content: newMessage }
      ];
      return await callQwen(messages);
    } catch (e) { 
      return "抱歉，Qwen 刚才开小差了，请重试。"; 
    }
  },

  async generateTitle(knowledgePoints: string[]): Promise<string> {
    try {
      const resText = await callQwen([
        { role: "user", content: `根据知识点：${knowledgePoints.join(', ')}，生成一个响亮的错题集标题。直接返回纯文本标题，不要标点。` }
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
      const resText = await callQwen(messages, true);
      return JSON.parse(resText || "null");
    } catch (error) { return null; }
  },

  async generatePlanQuestions(criteria: { sourceTexts?: string[], kps?: string[], count: number, subject: Subject, grade: Grade }): Promise<Question[]> {
    try {
      const prompt = criteria.sourceTexts 
        ? `基于以下错题，生成 ${criteria.count} 道相似的练习题（不要重复原题）：\n${criteria.sourceTexts.join('\n')}`
        : `基于知识点：${criteria.kps?.join(', ')}，为${criteria.grade}${criteria.subject}生成 ${criteria.count} 道练习题。`;

      const resText = await callQwen([
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
      console.error("Qwen Generation Error:", e);
      return [];
    }
  }
};
