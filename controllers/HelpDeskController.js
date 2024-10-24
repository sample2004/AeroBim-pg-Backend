// Импорт функции query, которую мы создали выше
import { json, query } from 'express';
import { body } from 'express-validator';
import { pool } from '../config/db.js'; // Замените на путь к файлу, где вы настроили Pool и функцию query
import jwt from 'jsonwebtoken';
import log from 'node-gyp/lib/log.js';

export const newTask = async (req, res) => {
    try {
        const { program, title, content, file_url, type, category} = req.body;
        const userId = req.userId;
        
        const post = await pool.query('INSERT INTO tasks (program, title, content, file_url, set_userid, type, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [program, title, content, file_url, userId, type, category]);
        res.json(post.rows);
        console.log(post.rows);
    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось создать заявку'
        });
    }
};
export const getAllTasks = async (req, res) => {
    try {
        
        const resultTasks = await pool.query('SELECT tasks.*, users.name AS g_user_name, users.surname AS g_user_surname, users.patronymic AS g_user_patronymic, users.email AS g_user_email, users.avatarurl AS g_user_avatarurl FROM tasks LEFT JOIN users ON get_userid = users.id WHERE set_userid = $1', [req.userId]);
        res.json(resultTasks.rows);
        console.log(resultTasks.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить задания'
        });
    }
};

export const stateTask = async (req, res) => {
    try {
        
        const taskId = req.params.id;
        const userId = req.userId;
        const { comments, status } = req.body;
        var result = null;
        if ((status === "canceled" || status === "inprogress") && comments || status === "completed") {
            result =  await pool.query('UPDATE tasks SET status = $1, status_array = array_append(status_array, $1), userid_worker = array_append(userid_worker, $2), comments = array_append(comments, $3), patched_at = array_append(patched_at, now()) WHERE id = $4 AND set_userid = $2', [status, userId, comments, taskId]);
        } else {
            return res.status(401).send('Комментарий не оставлен');
        }
        console.log(result);
        if (result.rowCount === 0) {res.status(401).send('Комментарий не оставлен');} else {  res.json({ success: true });}
        
    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: 'Проблема смены статуса'
        });
    }
};
export const getCountTaskUser = async (req, res) => {
    console.log(`Ответ`);
    try {
        const userId = req.userId;
        console.log(userId);
        const resultTasks = await pool.query(`
            SELECT 
                SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new,
                SUM(CASE WHEN status = 'inprogress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'canceled' THEN 1 ELSE 0 END) as canceled,
                SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) as review,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
            FROM tasks 
            WHERE set_userid = $1
        `, [userId]);
            
        const result = {
            new: parseInt(resultTasks.rows[0].new) || 0,
            in_progress: parseInt(resultTasks.rows[0].in_progress) || 0,
            canceled: parseInt(resultTasks.rows[0].canceled) || 0,
            review: parseInt(resultTasks.rows[0].review) || 0,
            completed: parseInt(resultTasks.rows[0].completed) || 0
        };

        res.json(result);
        console.log(`Ответ: ${JSON.stringify(result)}`);
    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: 'Проблема при получении количества задач'
        });
    }
};