// Импорт функции query, которую мы создали выше
import { json } from 'express';
import { body } from 'express-validator';
import { pool } from '../config/db.js'; // Замените на путь к файлу, где вы настроили Pool и функцию query

export const getAll = async (req, res) => {
  try {
    // Пример запроса: SELECT * FROM posts JOIN users ON posts.user_id = users.id;
    const result = await pool.query('SELECT posts.*, users.name, users.surname, users.email, users.avatarurl FROM posts JOIN users ON posts.userid = users.id', []);
    //const posts = result.rows[]
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи'
    });
  }
};

export const getTags = async (req, res) => {
  try {
    // Пример запроса: SELECT tags FROM posts LIMIT 5;
    const posts = await pool.query('SELECT tags FROM posts LIMIT 5', []);
    const tags = posts.rows.map(obj => obj.tags).flat().slice(0, 5);;//map(obj => obj.tags).flat().slice(0, 5);
    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить теги'
    });
  }
};

export const getOne = async (req, res) => {
  //try {
    const {id} = req.params;
    console.log(req.params);
    // Пример запроса: UPDATE posts SET views_count = views_count + 1 WHERE id = $1 RETURNING *;
    const post = await pool.query('UPDATE posts SET viewscount = viewscount + 1  RETURNING *', []);
    res.json(post.rows);
  //   if (!post.length) {
  //     return res.status(404).json({ message: 'Post not found' });
  //   }
  //   res.json(post[0]);
  // } catch (error) {
  //   res.status(501).json({ message: 'Error fetching post', error: error.message });
  //   console.error(error);
  // }
  
};

export const remove = async (req, res) => {
  const postId = req.params.id;
  try {
    // Пример запроса: DELETE FROM posts WHERE id = $1;
    const result = await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Статья не найдена' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не удалось удалить статью', error: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const { title, text, imageUrl, tags } = req.body;
    const userId = req.userId;
    console.log(userId);
    // Пример запроса: INSERT INTO posts (title, text, image_url, tags, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;
    const post = await pool.query('INSERT INTO posts (title, text, imageurl, tags, userid, timestamp, viewscount) VALUES ($1, $2, $3, $4, $5, now(), 0) RETURNING *', [title, text, imageUrl, tags, userId]);
    res.json(post[0]);
  } catch(err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось создать статью'
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, text, imageUrl, tags, userId } = req.body;
    // Пример запроса: UPDATE posts SET title = $1, text = $2, image_url = $3, tags = $4, user_id = $5 WHERE id = $6;
    await pool.query('UPDATE posts SET title = $1, text = $2, image_url = $3, tags = $4, user_id = $5 WHERE id = $6', [title, text, imageUrl, tags, userId, postId]);
    
    res.json({ success: true });
  } catch(err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось обновить статью'
    });
  }
};
export const setComment = async (req, res) => {
  const{ id } = req.params;
  const userId = req.userId;
  const { content } = req.body;
  try {
    const query = 'INSERT INTO comments (postid, userid, content) VALUES ($1, $2, $3) RETURNING *';
    const values = [id, userId, content];
    const result = await pool.query(query, values);
    const comment = result.rows[0];
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
