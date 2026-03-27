'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { io, Socket } from 'socket.io-client';
import styles from './page.module.css';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [user, setUser] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

  const fetchTasks = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        router.push('/');
        return;
      }
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  }, [apiUrl, router]);

  useEffect(() => {
    const userCookie = Cookies.get('user');
    if (userCookie) {
      setUser(JSON.parse(userCookie));
    }

    const token = Cookies.get('token');
    if (!token) {
      router.push('/');
      return;
    }

    const newSocket = io(wsUrl, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      if (userCookie) {
        const userData = JSON.parse(userCookie);
        newSocket.emit('task:subscribe', userData.id);
      }
    });

    newSocket.on('task:created', (task: Task) => {
      setTasks((prev) => [task, ...prev]);
    });

    newSocket.on('task:updated', (task: Task) => {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    });

    newSocket.on('task:deleted', (taskId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    });

    setSocket(newSocket);

    fetchTasks();

    return () => {
      newSocket.disconnect();
    };
  }, [wsUrl, fetchTasks, router]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get('token');
    if (!token || !newTask.title.trim()) return;

    try {
      const res = await fetch(`${apiUrl}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTask),
      });
      if (res.ok) {
        setNewTask({ title: '', description: '' });
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get('token');
    if (!token || !editingTask) return;

    try {
      const res = await fetch(`${apiUrl}/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingTask.title,
          description: editingTask.description,
          status: editingTask.status,
        }),
      });
      if (res.ok) {
        setEditingTask(null);
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const token = Cookies.get('token');
    if (!token) return;

    try {
      await fetch(`${apiUrl}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#38a169';
      case 'in_progress': return '#dd6b20';
      default: return '#718096';
    }
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>Task Dashboard</h1>
        <div className={styles.userInfo}>
          <span>{user?.name || user?.email}</span>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.createSection}>
          <h2>Create Task</h2>
          <form onSubmit={handleCreateTask} className={styles.form}>
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className={styles.input}
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className={styles.textarea}
            />
            <button type="submit" className={styles.button}>
              Add Task
            </button>
          </form>
        </div>

        <div className={styles.tasksSection}>
          <h2>Your Tasks</h2>
          <div className={styles.tasksList}>
            {tasks.length === 0 ? (
              <p className={styles.empty}>No tasks yet. Create one above!</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className={styles.taskCard}>
                  <div className={styles.taskHeader}>
                    <h3>{task.title}</h3>
                    <span
                      className={styles.status}
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    >
                      {task.status}
                    </span>
                  </div>
                  {task.description && <p>{task.description}</p>}
                  <div className={styles.taskActions}>
                    <button
                      onClick={() => setEditingTask(task)}
                      className={styles.editBtn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {editingTask && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Edit Task</h2>
            <form onSubmit={handleUpdateTask} className={styles.form}>
              <input
                type="text"
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                className={styles.input}
                required
              />
              <textarea
                value={editingTask.description}
                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                className={styles.textarea}
              />
              <select
                value={editingTask.status}
                onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                className={styles.select}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <div className={styles.modalActions}>
                <button type="submit" className={styles.button}>
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
