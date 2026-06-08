import type Database from 'better-sqlite3';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: string;
}

export class UserModel {
  constructor(private db: Database) {}

  async findByEmail(email: string): Promise<User | null> {
    const row = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    return row ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return row ?? null;
  }

  async create(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const crypto = await import('crypto');
    const user: User = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...data
    };

    this.db.prepare(
      'INSERT INTO users (id, email, passwordHash, role, createdAt) VALUES (?, ?, ?, ?, ?)'
    ).run(user.id, user.email, user.passwordHash, user.role, user.createdAt);

    return user;
  }
}
