import { NextApiRequest, NextApiResponse } from 'next';
import { getTodos, addTodo, createTodosTable } from '../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      await createTodosTable();
      const todos = await getTodos();
      res.status(200).json(todos);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch todos' });
    }
  } else if (req.method === 'POST') {
    try {
      const { task } = req.body;
      if (!task) {
        return res.status(400).json({ error: 'Task is required' });
      }
      const newTodo = await addTodo(task);
      res.status(201).json(newTodo);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create todo' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 