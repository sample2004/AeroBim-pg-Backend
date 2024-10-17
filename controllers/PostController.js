// Импорт функции query, которую мы создали выше
import { json } from 'express';
import { body } from 'express-validator';
import { pool } from '../config/db.js'; // Замените на путь к файлу, где вы настроили Pool и функцию query
import log from 'node-gyp/lib/log.js';
import jwt from 'jsonwebtoken';

export const getAll = async (req, res) => {
  try {
    // Пример запроса: SELECT * FROM posts JOIN users ON posts.user_id = users.id;
    const result = await pool.query('SELECT posts.*, users.name, users.surname, users.patronymic, users.email, users.avatarurl FROM posts JOIN users ON posts.userid = users.id', []);
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
  try {
    const postId = req.params.id;
    var userId =  null;
    console.log(req.headers.authorization);
    const authHeader = (req.headers.authorization || '').split(' ')[1];
    if (authHeader) {
      try {
        const token = authHeader;
        const decoded = jwt.verify(token, 'SECRET');
        userId = decoded._id      
      } catch (e) {
        return res.status(401).send('Access denied. No token provided.');
      }
    }
    await pool.query('UPDATE posts SET viewed_users = array_append(viewed_users, $1) WHERE id = $2 AND array_position(viewed_users, $1) IS NULL', [userId,postId]);
    const count = await pool.query('SELECT id, array_length(viewed_users, 1) AS viewed_count FROM posts WHERE id = $1', [postId]);
    await pool.query('UPDATE posts SET viewscount = $1 WHERE id = $2', [count.rows[0].viewed_count, postId]);
    const post = await pool.query('SELECT posts.*, users.name, users.surname, users.patronymic, users.avatarurl FROM posts JOIN users ON posts.userid = users.id WHERE posts.id = $1', [postId]);
    //const post = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);
    res.json(post.rows);
  } catch (err) {
    console.log(err);
  }
  
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
    const userId = req.userId;
    const { title, text, imageurl, tags } = req.body;
    // Пример запроса: UPDATE posts SET title = $1, text = $2, image_url = $3, tags = $4, user_id = $5 WHERE id = $6;
    await pool.query('UPDATE posts SET title = $1, text = $2, imageurl = $3, tags = $4, userid = $5 WHERE id = $6', [title, text, imageurl, tags, userId, postId]);
    
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
  console.log(id);
  console.log(userId);
  console.log(content);
  try {
    const query = 'INSERT INTO comments (postid, userid, content) VALUES ($1, $2, $3) RETURNING *';
    const values = [id, userId, content];
    const result = await pool.query(query, values);
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getComments = async (req, res) => {
  const{ id } = req.params;
  const userId = req.userId;
  const { content } = req.body;
  try {
    console.log(req.body);
    const result = await pool.query('SELECT comments.id, comments.content,  users.surname, comments.timestamp, users.name FROM comments JOIN users ON comments.userid = users.id WHERE postid = $1', [id]);
    const comment = result.rows;
    console.log(comment);
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const patchComment = async (req, res) => {
  const commentId = req.params._id;
  const postId = req.params.id;
  const userId = req.userId;
  const { content } = req.body;
  //console.log(req.params);
  //console.log(req.userId);
  //console.log(req.body);
  
  try {
    const result = await pool.query('UPDATE comments SET content = $1 WHERE userid = $2 AND id = $3 AND postid = $4 RETURNING *', [content, userId, commentId, postId]);
    const comment = result.rowCount;
    if (comment !== 0) {
      res.status(200).json({ success: true });
    } else {
      res.status(200).json({ success: false });
    }
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};