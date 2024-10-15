import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { validationResult } from 'express-validator';
import {pool} from '../config/db.js';
import { now } from 'mongoose';

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    
    const { surname, name, patronymic, email, avatarurl, password } = req.body;
    
    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(password, salt);
    
    const result = await pool.query(
      'INSERT INTO users (surname, name, patronymic, email, avatarurl, passwordhash) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [surname, name, patronymic, email, avatarurl, hash ]
    );
    
    const user = result.rows[0];
    
    const token = jwt.sign({ _id: user.id }, 'SECRET', { expiresIn: '30d' });
    
    const { password_hash, ...userData } = user;
    res.json({ ...userData, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не удалось зарегистрироваться' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    const isValidPassword = await bcryptjs.compare(password, user.passwordhash);
    if (!isValidPassword) {
      return res.status(404).json({ message: 'Неверный пароль' });
    }
    
    const token = jwt.sign({ _id: user.id }, 'SECRET', { expiresIn: '30d' });
    
    const { password_hash, ...userData } = user;
    res.json({ ...userData, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не удалось авторизоваться' });
  }
};

export const Me = async (req, res) => {
  
  try {
    const userId = req.userId;
    console.log(userId);
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ message: 'Не удалось получить данные пользователя!' });
    }
    
    const { password_hash, ...userData } = user;
    res.json(userData);
    console.log(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Не удалось получить данные пользователя' });
  }
};