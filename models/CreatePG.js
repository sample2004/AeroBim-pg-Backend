

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
            viewed_users VARCHAR[],
            imageurl VARCHAR(255),
            userid UUID,
            commentscount INT DEFAULT 0,
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
export async function createFamityTaskTable() {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            program varchar(255) NOT NULL,
            category varchar(255) DEFAULT '-',
            type varchar(255) NOT NULL,
            title varchar(255) NOT NULL,
            content varchar(255) NOT NULL,
            file_url varchar(255),
            status_array VARCHAR[] DEFAULT ARRAY['new'],
            status varchar(255) DEFAULT 'new',
            comments varchar[],
            get_userid UUID REFERENCES users(id),
            set_userid UUID REFERENCES users(id) NOT NULL,
            userid_worker UUID[],
            created_at TIMESTAMP DEFAULT now(),
            patched_at TIMESTAMP[]
            );
            `;
        
        await pool.query(query);
        console.log('tasks table created');
    } catch (err) {
        console.error(err);
        console.error('tasks table creation failed');
    }
};
export async function createNotifyFunction() {
    try {
        const query = `
CREATE OR REPLACE FUNCTION public.notify_db_event()
RETURNS trigger
LANGUAGE plpgsql
COST 100
VOLATILE NOT LEAKPROOF
AS $$
DECLARE
  payload JSON;
  row_id TEXT; -- Используем TEXT для хранения обоих типов
BEGIN
  -- Определяем тип данных id и преобразуем его в текст
  CASE 
    WHEN pg_typeof(NEW.id) = 'bigint'::regtype THEN
      row_id := NEW.id::TEXT;
    WHEN pg_typeof(NEW.id) = 'uuid'::regtype THEN
      row_id := NEW.id::TEXT;
    ELSE
      -- Обработка случая, если id имеет другой тип данных
      RAISE EXCEPTION 'Unsupported id type: %', pg_typeof(NEW.id);
  END CASE;

  -- Если операция DELETE, используем OLD.id
  IF TG_OP = 'DELETE' THEN
    CASE 
      WHEN pg_typeof(OLD.id) = 'bigint'::regtype THEN
        row_id := OLD.id::TEXT;
      WHEN pg_typeof(OLD.id) = 'uuid'::regtype THEN
        row_id := OLD.id::TEXT;
      ELSE
        RAISE EXCEPTION 'Unsupported id type: %', pg_typeof(OLD.id);
    END CASE;
  END IF;

  payload := json_build_object('table', TG_TABLE_NAME, 'action', TG_OP, 'id', row_id);

  PERFORM pg_notify('db_event', payload::text);

  RETURN NEW; -- Или OLD/NULL в зависимости от типа триггера
END;
$$;

ALTER FUNCTION public.notify_db_event() OWNER TO postgres;
            `;
        
        await pool.query(query);
        console.log('Nottify function created');
    } catch (err) {
        console.error(err);
        console.error('tasks table creation failed');
    }
};
export async function initTables() {
    try {
        await createUsersTable();
        await createPostsTable();
        await createCommentsTable();
        await createFamityTaskTable();
        await createNotifyFunction();
        console.log('All tables created successfully');
    } catch (err) {
        console.error(err);
        console.error('Table creation process failed');
    }
}

