
import { pool } from '../config/db.js';
export async function createUsersTable() {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            surname VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            patronymic VARCHAR(255),
            email VARCHAR(255) NOT NULL,
            passwordHash VARCHAR(255) NOT NULL,
            avatarurl VARCHAR(255),
            timestamp TIMESTAMP DEFAULT now(),
            accessuser VARCHAR(255) DEFAULT 'User'
        );
            `;
        
        await pool.query(query);
        console.log('users table created');
    } catch (err) {
        console.error(err);
        console.error('users table creation failed');
    }
};


export async function createPostsTable() {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS posts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255),
            text VARCHAR(255),
            tags VARCHAR(255),
            viewscount INT,
            imageurl VARCHAR(255),
            userid UUID,
            timestamp TIMESTAMP DEFAULT now(),
            FOREIGN KEY (userid) REFERENCES users (Id)
        );
            `;
        
        await pool.query(query);
        console.log('posts table created');
    } catch (err) {
        console.error(err);
        console.error('posts table creation failed');
    }
};
export async function createCommentsTable() {
    try {
        const query = `
           CREATE TABLE IF NOT EXISTS comments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            postid UUID REFERENCES posts(id),
            userid UUID REFERENCES users(id),
            content TEXT,
            timestamp TIMESTAMP DEFAULT now()
            );
            `;
        
        await pool.query(query);
        console.log('comments table created');
    } catch (err) {
        console.error(err);
        console.error('comments table creation failed');
    }
};
