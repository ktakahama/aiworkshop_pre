import { useState, useEffect } from 'react';
import Head from 'next/head';

interface Task {
  id: number;
  goal: string;
  task: string;
  priority: string;
  details: string;
  completed: boolean;
  created_at: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      if (response.ok) {
        setTasks(data);
        setError(null);
      } else {
        setError(data.error || 'タスクの取得に失敗しました');
      }
    } catch (error) {
      setError('サーバーとの通信に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const generateTasks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goal }),
      });

      const data = await response.json();
      if (response.ok) {
        setTasks([...data, ...tasks]);
        setGoal('');
        setError(null);
      } else {
        setError(data.error || 'タスクの生成に失敗しました');
      }
    } catch (error) {
      setError('サーバーとの通信に失敗しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTaskStatus = async (id: number, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed }),
      });

      if (response.ok) {
        setTasks(tasks.map(task =>
          task.id === id ? { ...task, completed } : task
        ));
        setError(null);
      } else {
        const data = await response.json();
        setError(data.error || 'タスクの更新に失敗しました');
      }
    } catch (error) {
      setError('サーバーとの通信に失敗しました');
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== id));
        setError(null);
      } else {
        const data = await response.json();
        setError(data.error || 'タスクの削除に失敗しました');
      }
    } catch (error) {
      setError('サーバーとの通信に失敗しました');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '高': return 'text-red-500';
      case '中': return 'text-yellow-500';
      case '低': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <>
      <Head>
        <title>AI Task Generator</title>
        <meta name="description" content="AIを使用したタスク生成アプリ" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            AI Task Generator
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={generateTasks} className="mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="目的を入力してください（例：引越しの準備）"
                className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isGenerating}
              />
              <button
                type="submit"
                className="metallic-button px-6 py-3 rounded-lg text-white font-semibold disabled:opacity-50"
                disabled={isGenerating || !goal.trim()}
              >
                {isGenerating ? '生成中...' : 'タスクを生成'}
              </button>
            </div>
          </form>

          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-gray-400">
              タスクがありません。新しいタスクを生成してください。
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="metallic-card rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => toggleTaskStatus(task.id, e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                        {task.task}
                      </span>
                      <span className={`text-sm ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="metallic-button px-3 py-1 rounded text-sm"
                    >
                      削除
                    </button>
                  </div>
                  <div className="ml-7 text-sm text-gray-400">
                    <div>目的: {task.goal}</div>
                    <div>詳細: {task.details}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
