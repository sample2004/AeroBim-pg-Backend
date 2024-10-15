import express, { json } from 'express';
import multer from 'multer';
import mongoose, { get } from 'mongoose';
import { registerValidation, loginValidation, postCreateValidation } from './validations.js'
import checkAuth from './utils/checkAuth.js';
import * as UserController from './controllers/UserController.js'; 
import * as PostController from './controllers/PostController.js';
import cors from 'cors';
import { createPostsTable, createUsersTable, createCommentsTable } from './models/CreatePG.js';
import { pool } from './config/db.js';
import { body } from 'express-validator';
import log from 'node-gyp/lib/log.js';


const app = express();
createUsersTable();
createPostsTable();
createCommentsTable()
app.use(express.json());
app.use(cors());
app.use(express.json());
app.post('/auth/login', UserController.login);
app.post('/auth/register', UserController.register);
app.get('/auth/me', checkAuth, UserController.Me);
app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, PostController.create);
app.get('/tags', PostController.getTags);
app.delete('/posts', PostController.remove);
app.patch('/posts', PostController.update);
app.post('/posts/:id/comments', checkAuth, PostController.setComment);



app.listen(3001, (err) => {
  if(err){
    return console.log(err);
  }
  console.log('Server is running on port 3001');
});

