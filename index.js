import express from 'express';
import multer, { diskStorage } from 'multer';
import mongoose, { get, now } from 'mongoose';
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
import * as fs from 'fs';
import { url } from 'inspector';


const app = express();

const storageTasks = multer.diskStorage({
  destination: (req, file, cb) => {
    const taskId = req.params.id;
    const dir = `upload/tasks/${taskId}`;
    console.log(dir)
    fs.mkdir(dir, { recursive: true }, (error) => {
      if (error) {
        return cb(error);
        console.log(error)
      }
      return cb(null, dir);
      console.log(dir)
    });
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const storagePosts = multer.diskStorage({
  destination: (req, file, cb) => {
    const taskId = req.params.id;
    const dir = `upload/posts`;
    console.log(dir)
    fs.mkdir(dir, { recursive: true }, (error) => {
      if (error) {
        return cb(error);
        console.log(error)
      }
      return cb(null, dir);
      console.log(dir)
    });
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const uploadPosts = multer({ storage: storagePosts });
const uploadTasks = multer({ storage: storageTasks });

initTables();

app.use(express.json());
app.use(cors());
app.use('/upload', express.static('upload'));
app.use(express.json());
app.post('/auth/login', UserController.login); // отрабатывает
app.post('/auth/register', UserController.register); // отрабатывает
app.get('/auth/me', checkAuth, UserController.Me); // отрабатывает
app.get('/posts', PostController.getAll); // отрабатывает
app.get('/posts/:id', checkAuth, PostController.getOne); // отрабатывает
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
app.post('/upload/tasks/:id', checkAuth, uploadTasks.single('zip'), (req, res) => {
  console.log(app);
  res.json({
    url: `/upload/tasks/${req.params.id}/${req.file.originalname}`,
  });
});
app.post('/upload/posts', checkAuth, uploadPosts.single('image'), (req, res) => {
  res.json({
    url: `/upload/posts/${req.file.filename}`,
    
  });
});



app.listen(3001, (err) => {
  if(err){
    return console.log(err);
  }
  

  console.log(`Server listening on 3001`);
  });
  
  