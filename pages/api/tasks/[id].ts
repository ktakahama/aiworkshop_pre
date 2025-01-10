import { NextApiRequest, NextApiResponse } from 'next';
import { updateTaskStatus, deleteTask } from '../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === 'PATCH') {
    try {
      const { completed } = req.body;
      if (completed === undefined) {
        return res.status(400).json({ error: 'completed フラグが必要です' });
      }
      const updatedTask = await updateTaskStatus(Number(id), completed);
      res.status(200).json(updatedTask);
    } catch (error) {
      res.status(500).json({ error: 'タスクの更新に失敗しました' });
    }
  } else if (req.method === 'DELETE') {
    try {
      await deleteTask(Number(id));
      res.status(200).json({ message: 'タスクを削除しました' });
    } catch (error) {
      res.status(500).json({ error: 'タスクの削除に失敗しました' });
    }
  } else {
    res.setHeader('Allow', ['PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 