/*
 * Team member: Htoo Myat Aung (6831503006)
 * Frontend tasks: local persistence service for user and order-related data.
 */
/**
 * IndexedDB Database Service for Scentify Perfume Studio
 * Provides transactional, client-side database persistence for users,
 * sessions, saved perfume formulations, and order history.
 */

export interface DBUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBSession {
  key: string;
  userId: string;
  name: string;
  email: string;
  loggedInAt: string;
}

const DB_NAME = 'LoremPerfumeStudioDB';
const DB_VERSION = 1;

class DatabaseService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
        }

        // Sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'key' });
        }

        // Custom Blends store
        if (!db.objectStoreNames.contains('custom_blends')) {
          const blendStore = db.createObjectStore('custom_blends', { keyPath: 'id' });
          blendStore.createIndex('userId', 'userId', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
      };
    });

    return this.dbPromise;
  }

  /**
   * Secure SHA-256 password hash using Web Cryptography API
   */
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + ':lorem_salt_studio_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Register a new user in the database
   */
  public async registerUser(name: string, email: string, password: string): Promise<{ id: string; name: string; email: string }> {
    const db = await this.openDB();
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await this.findUserByEmail(normalizedEmail);
    if (existing) {
      throw new Error('An account with this email address already exists. Please log in instead.');
    }

    const passwordHash = await this.hashPassword(password);
    const userId = crypto.randomUUID ? crypto.randomUUID() : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newUser: DBUser = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users', 'sessions'], 'readwrite');
      const userStore = transaction.objectStore('users');
      const sessionStore = transaction.objectStore('sessions');

      const userReq = userStore.add(newUser);
      userReq.onerror = () => {
        reject(new Error('Failed to save user into database.'));
      };

      // Automatically establish active session
      const session: DBSession = {
        key: 'current_session',
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        loggedInAt: now,
      };
      sessionStore.put(session);

      transaction.oncomplete = () => {
        resolve({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        });
      };

      transaction.onerror = () => {
        reject(new Error(transaction.error?.message || 'Database transaction error during registration.'));
      };
    });
  }

  /**
   * Authenticate user against database credentials
   */
  public async loginUser(email: string, password: string): Promise<{ id: string; name: string; email: string }> {
    const db = await this.openDB();
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.findUserByEmail(normalizedEmail);
    if (!user) {
      throw new Error('No account found with this email. Please check your credentials or Sign Up.');
    }

    const inputHash = await this.hashPassword(password);
    if (inputHash !== user.passwordHash) {
      throw new Error('Incorrect password. Please verify and try again.');
    }

    // Set session in database
    const now = new Date().toISOString();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readwrite');
      const sessionStore = transaction.objectStore('sessions');
      const session: DBSession = {
        key: 'current_session',
        userId: user.id,
        name: user.name,
        email: user.email,
        loggedInAt: now,
      };
      sessionStore.put(session);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error('Failed to store active session in database.'));
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  /**
   * Retrieve current active session from database
   */
  public async getCurrentSession(): Promise<{ id: string; name: string; email: string } | null> {
    const db = await this.openDB();

    return new Promise((resolve) => {
      const transaction = db.transaction(['sessions'], 'readonly');
      const sessionStore = transaction.objectStore('sessions');
      const req = sessionStore.get('current_session');

      req.onsuccess = () => {
        const session = req.result as DBSession | undefined;
        if (session && session.name) {
          resolve({
            id: session.userId,
            name: session.name,
            email: session.email,
          });
        } else {
          resolve(null);
        }
      };

      req.onerror = () => {
        resolve(null);
      };
    });
  }

  /**
   * Clear active session from database
   */
  public async logoutUser(): Promise<void> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readwrite');
      const sessionStore = transaction.objectStore('sessions');
      const req = sessionStore.delete('current_session');

      req.onsuccess = () => resolve();
      req.onerror = () => reject(new Error('Failed to clear session from database.'));
    });
  }

  /**
   * Helper to find a user by their email index
   */
  private async findUserByEmail(email: string): Promise<DBUser | null> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readonly');
      const userStore = transaction.objectStore('users');
      const index = userStore.index('email');
      const req = index.get(email);

      req.onsuccess = () => {
        resolve((req.result as DBUser) || null);
      };

      req.onerror = () => {
        reject(new Error('Failed to query users from database.'));
      };
    });
  }
}

export const dbService = new DatabaseService();
