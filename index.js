import express, { json } from 'express';
import multer from 'multer';
import mongoose, { get } from 'mongoose';
import { registerValidation, loginValidation, postCreateValidation } from './validations.js'
import checkAuth from './utils/checkAuth.js';
import * as UserController from './controllers/UserController.js'; 
import * as PostController from './controllers/PostController.js';
import * as HelpDeskController from './controllers/HelpDeskController.js';
import cors from 'cors';
import { initTables } from './models/CreatePG.js';
import { pool } from './config/db.js';
import { body } from 'express-validator';
import log from 'node-gyp/lib/log.js';


const app = express();
initTables();
app.use(express.json());
app.use(cors());
app.use(express.json());
app.post('/auth/login', UserController.login); // отрабатывает
app.post('/auth/register', UserController.register); // отрабатывает
app.get('/auth/me', checkAuth, UserController.Me); // отрабатывает
app.get('/posts', PostController.getAll); // отрабатывает
app.get('/posts/:id',  PostController.getOne); // отрабатывает
app.post('/posts', checkAuth, PostController.create); // отрабатывает для всех на бэкенде не стоит защита Админ Юзер
app.get('/tags', PostController.getTags);  // отрабатывает
app.delete('/posts/:id', PostController.remove); // отрабатывает
app.patch('/posts/:id', checkAuth, PostController.update); // отрабатывает
app.post('/posts/:id/comments', checkAuth, PostController.setComment); // отрабатывает
app.get('/posts/:id/comments',  PostController.getComments);  // отрабатывает
//app.delete('/posts/:id/comments', PostController.removeComment);
app.patch('/posts/:id/comments/:_id' , checkAuth, PostController.patchComment);   // отрабатывает
app.post('/helpdesk/family', checkAuth, HelpDeskController.newTaskFamily);
app.get('/helpdesk/tasks', checkAuth, HelpDeskController.getAllTasks);
app.patch('/helpdesk/family/:id/cancel', checkAuth, HelpDeskController.cancelTaskFamily);


app.listen(3001, (err) => {
  if(err){
    return console.log(err);
  }
  console.log('Server is running on port 3001');
});

