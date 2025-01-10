import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function createTasksTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        goal TEXT NOT NULL,
        task TEXT NOT NULL,
        priority TEXT CHECK (priority IN ('高', '中', '低')),
        details TEXT,
        completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tasks table created or already exists');
  } catch (error) {
    console.error('Error creating tasks table:', error);
  }
}

export async function getTasks() {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY priority DESC, created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

export async function addTask(goal: string, task: string, priority: string, details: string) {
  try {
    const result = await pool.query(
      'INSERT INTO tasks (goal, task, priority, details) VALUES ($1, $2, $3, $4) RETURNING *',
      [goal, task, priority, details]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
}

export async function updateTaskStatus(id: number, completed: boolean) {
  try {
    const result = await pool.query(
      'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *',
      [completed, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
}

export async function deleteTask(id: number) {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

export default pool; 