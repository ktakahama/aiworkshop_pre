import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface GeneratedTask {
  task: string;
  priority: '高' | '中' | '低';
  details: string;
}

interface OpenAITaskResponse {
  tasks: {
    task: string;
    priority: string;
    details: string;
  }[];
}

export async function generateTasks(goal: string): Promise<GeneratedTask[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `あなたは効率的なタスク管理の専門家です。
ユーザーの目的に基づいて、具体的で実行可能なタスクリストを生成してください。
以下の形式のJSONで応答してください：

{
  "tasks": [
    {
      "task": "タスク名",
      "priority": "優先順位（高、中、低のいずれか）",
      "details": "タスクの詳細説明"
    }
  ]
}`
        },
        {
          role: "user",
          content: `以下の目的のための具体的なタスクリストを5つ生成してください：${goal}

必ず以下の形式のJSONで返してください：
{
  "tasks": [
    {
      "task": "タスク名",
      "priority": "高、中、低のいずれか",
      "details": "具体的な実行手順や注意点"
    }
  ]
}`
        }
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      return [];
    }

    try {
      const parsed = JSON.parse(content) as OpenAITaskResponse;
      if (!Array.isArray(parsed.tasks)) {
        console.error('Invalid response format:', content);
        return [];
      }
      return parsed.tasks.map((task): GeneratedTask => ({
        task: String(task.task),
        priority: task.priority as '高' | '中' | '低',
        details: String(task.details)
      }));
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.error('Raw response:', content);
      return [];
    }
  } catch (error) {
    console.error('Error generating tasks:', error);
    throw error;
  }
} 