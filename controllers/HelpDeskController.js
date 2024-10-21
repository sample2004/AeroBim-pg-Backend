// Импорт функции query, которую мы создали выше
import { json } from 'express';
import { body } from 'express-validator';
import { pool } from '../config/db.js'; // Замените на путь к файлу, где вы настроили Pool и функцию query
import jwt from 'jsonwebtoken';

export const newTaskFamily = async (req, res) => {
    try {
        const { program, title, content, file_url, type} = req.body;
        const userId = req.userId;
        console.log(userId);
        const post = await pool.query('INSERT INTO family_task (program, title, content, file_url, set_userid,type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [program, title, content, file_url, userId, type]);
        res.json(post[0]);
    } catch(err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось создать заявку'
        });
    }
};
export const getAllTasks = async (req, res) => {
    try {
        const resultTasks = await pool.query('SELECT family_task.*, users.name AS s_user_name, users.surname AS s_user_surname, users.patronymic AS s_user_patronymic, users.email AS s_user_email, users.avatarurl AS s_user_avatarurl FROM family_task LEFT JOIN users ON get_userid = users.id WHERE set_userid = $1', [req.userId]);
        res.json(resultTasks.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не удалось получить задания'
        });
    }
};

export const stateTaskFamily = async (req, res) => {
    try {
        
        const taskId = req.params.id;
        const userId = req.userId;
        const { comments, status } = req.body;
        var result = null;
        if ((status === "canceled" || status === "inprogress") && comments || status === "completed") {
            result =  await pool.query('UPDATE family_task SET status = array_append(status, $1), userid_worker = array_append(userid_worker, $2), comments = array_append(comments, $3), patched_at = array_append(patched_at, now()) WHERE id = $4 AND set_userid = $2', [status, userId, comments, taskId]);
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