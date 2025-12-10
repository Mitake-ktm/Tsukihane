'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface WritingTask {
    id: number;
    title: string;
    description: string | null;
    deadline: number | null;
    progress: number;
    status: 'pending' | 'in_progress' | 'completed';
}

interface Note {
    id: number;
    title: string;
    content: string | null;
    category: string;
}

export default function OwnerToolsPage() {
    const { data: session } = useSession();
    const [tasks, setTasks] = useState<WritingTask[]>([
        { id: 1, title: 'Chapter 12 Draft', description: 'Write the confrontation scene', deadline: Date.now() + 3 * 24 * 60 * 60 * 1000, progress: 30, status: 'in_progress' },
        { id: 2, title: 'Character Development Notes', description: 'Expand on protagonist backstory', deadline: null, progress: 0, status: 'pending' },
    ]);
    const [notes, setNotes] = useState<Note[]>([
        { id: 1, title: 'World Building Ideas', content: 'Magic system rules...', category: 'worldbuilding' },
        { id: 2, title: 'Plot Outline', content: 'Arc 3 summary...', category: 'plot' },
    ]);
    const [activeTab, setActiveTab] = useState<'tasks' | 'notes'>('tasks');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newNoteTitle, setNewNoteTitle] = useState('');

    const addTask = () => {
        if (!newTaskTitle.trim()) return;
        setTasks([
            {
                id: Date.now(),
                title: newTaskTitle,
                description: null,
                deadline: null,
                progress: 0,
                status: 'pending',
            },
            ...tasks,
        ]);
        setNewTaskTitle('');
    };

    const updateTaskProgress = (id: number, progress: number) => {
        setTasks(tasks.map((t) =>
            t.id === id
                ? { ...t, progress, status: progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'pending' }
                : t
        ));
    };

    const addNote = () => {
        if (!newNoteTitle.trim()) return;
        setNotes([
            {
                id: Date.now(),
                title: newNoteTitle,
                content: null,
                category: 'general',
            },
            ...notes,
        ]);
        setNewNoteTitle('');
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <header style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '2rem' }}>✍️</span>
                        <h1>Owner Tools</h1>
                    </div>
                    <p className="text-muted">
                        Private writing tools for {session?.user?.name}
                    </p>
                </header>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <button
                        className={`btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('tasks')}
                    >
                        📋 Writing Tasks
                    </button>
                    <button
                        className={`btn ${activeTab === 'notes' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setActiveTab('notes')}
                    >
                        📝 Private Notes
                    </button>
                </div>

                {activeTab === 'tasks' && (
                    <div>
                        {/* Add Task */}
                        <div className="card" style={{ marginBottom: '1rem' }}>
                            <div className="card-body" style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Add a new writing task..."
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                                />
                                <button className="btn btn-primary" onClick={addTask}>
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Task List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {tasks.map((task) => (
                                <div key={task.id} className="card">
                                    <div className="card-body">
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                            <div>
                                                <h4 style={{ marginBottom: '0.25rem' }}>{task.title}</h4>
                                                {task.description && (
                                                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`badge ${task.status === 'completed' ? 'badge-success' :
                                                    task.status === 'in_progress' ? 'badge-warning' : 'badge-info'
                                                }`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{
                                                    height: '8px',
                                                    background: 'var(--bg-elevated)',
                                                    borderRadius: 'var(--radius-full)',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: `${task.progress}%`,
                                                        background: task.progress >= 100 ? 'var(--success)' : 'var(--accent-primary)',
                                                        borderRadius: 'var(--radius-full)',
                                                        transition: 'width 0.3s ease'
                                                    }} />
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '0.875rem', width: '45px', textAlign: 'right' }}>
                                                {task.progress}%
                                            </span>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={task.progress}
                                                onChange={(e) => updateTaskProgress(task.id, parseInt(e.target.value))}
                                                style={{ width: '100px', cursor: 'pointer' }}
                                            />
                                        </div>

                                        {task.deadline && (
                                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                📅 Due: {new Date(task.deadline).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div>
                        {/* Add Note */}
                        <div className="card" style={{ marginBottom: '1rem' }}>
                            <div className="card-body" style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Add a new note..."
                                    value={newNoteTitle}
                                    onChange={(e) => setNewNoteTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addNote()}
                                />
                                <button className="btn btn-primary" onClick={addNote}>
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Notes Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '1rem'
                        }}>
                            {notes.map((note) => (
                                <div key={note.id} className="card" style={{ cursor: 'pointer' }}>
                                    <div className="card-body">
                                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                            <h4 style={{ marginBottom: '0.5rem' }}>{note.title}</h4>
                                            <span className="badge badge-info">{note.category}</span>
                                        </div>
                                        <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                            {note.content || 'Click to add content...'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <footer style={{
                    marginTop: '3rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem'
                }}>
                    🔒 These tools are private and only visible to the server owner.
                </footer>
            </div>
        </div>
    );
}
