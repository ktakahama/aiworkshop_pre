import { NextApiRequest, NextApiResponse } from 'next';
import { getTasks, addTask, createTasksTable } from '../../../lib/db';
import { generateTasks } from '../../../lib/openai';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      await createTasksTable();
      const tasks = await getTasks();
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'タスクの取得に失敗しました' });
    }
  } else if (req.method === 'POST') {
    try {
      const { goal } = req.body;
      if (!goal) {
        return res.status(400).json({ error: '目的を入力してください' });
      }

      const generatedTasks = await generateTasks(goal);
      const savedTasks = [];

      for (const task of generatedTasks) {
        const savedTask = await addTask(goal, task.task, task.priority, task.details);
        savedTasks.push(savedTask);
      }

      res.status(201).json(savedTasks);
    } catch (error) {
      console.error('Error in POST /api/tasks:', error);
      res.status(500).json({ error: 'タスクの生成と保存に失敗しました' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 