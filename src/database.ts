import sqlite3 from "sqlite3";

const usersTableInit = `
	CREATE TABLE IF NOT EXISTS messages (
		id TEXT PRIMARY KEY,
		sender_id TEXT,
		receiver_id TEXT,
		content TEXT,
		timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
	)
`

const messagesTableInit = `
	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		name TEXT
	)
`

export const db = new sqlite3.Database('./chat.db');

export function initDatabase() {
	db.serialize(() => {
		db.run(usersTableInit);	
		db.run(messagesTableInit);
	});
}

export function saveUser(userId: string, name: string) {
	return new Promise<void>((resolve, reject) => {
		db.run(
			'INSERT OR REPLACE INTO users (id, name) VALUES (?, ?)', 
			[userId, name], (err) => {
				if (err) reject(err);
				else resolve();
			}
		);
	});
}

export function saveMessage(messageId: string, senderId: string, receiverId: string, content: string) {
	return new Promise<void>((resolve, reject) => {
		db.run(
			'INSERT INTO messages (id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)',
			[messageId, senderId, receiverId, content],
			(err) => {
				if (err) reject(err);
				else resolve();
			}
		);
	});
}

export function getMessages(userId: string, otherId: string): Promise<any[]> {
	return new Promise((resolve, reject) => {
		db.all(
			'SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY timestamp ASC',
			[userId, otherId, otherId, userId],
			(err, rows) => {
				if (err) reject(err);
				else resolve(rows);
			}
		);
	});
}
