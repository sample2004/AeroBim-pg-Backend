import express, { query } from 'express';
import createSubscriber from 'pg-listen';
import multer, { diskStorage } from 'multer';
import mongoose, { connect, get, now } from 'mongoose';
import { registerValidation, loginValidation, postCreateValidation } from './validations.js'
import checkAuth from './utils/checkAuth.js';
import * as UserController from './controllers/UserController.js'; 
import * as PostController from './controllers/PostController.js';
import * as HelpDeskController from './controllers/HelpDeskController.js';
import cors from 'cors';
import { initTables } from './models/CreatePG.js';
import { pool } from './config/db.js';
import { body } from 'express-validator';
import * as fs from 'fs';
import {  WebSocketServer } from 'ws';




const app = express();
const storageTasks = multer.diskStorage({
  destination: (req, file, cb) => {
    const taskId = req.params.id;
    const dir = `upload/tasks/`;
    
    fs.mkdir(dir, { recursive: true }, (error) => {
      if (error) {
        return cb(error);
        console.log(error)
      }
      return cb(null, dir);
      
    });
  },
  filename: (req, file, cb) => {
    cb(null, Date.now()+"_"+file.originalname); // добавляем время в имя файла
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
    cb(null, Date.now()+"_"+file.originalname);
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
//app.patch('/posts/:id/comments/:_id' , checkAuth, PostController.patchComment);   // отрабатывает
app.post('/helpdesk/tasks', checkAuth, HelpDeskController.newTask);
app.get('/helpdesk/tasks', checkAuth, HelpDeskController.getAllTasks);

app.patch('/helpdesk/state/:id', checkAuth, HelpDeskController.stateTask);
app.post('/upload/tasks', checkAuth, uploadTasks.single('zip'), (req, res) => {
  console.log(app);
  res.json({
    url: `/upload/tasks/${req.file.filename}`,
  });
});
app.post('/upload/posts', checkAuth, uploadPosts.single('image'), (req, res) => {
  res.json({
    url: `/upload/posts/${req.file.filename}`,
    
  });
});




// pool.query('LISTEN db_event;', (err, res) => {
  //   if (err) {
//     console.error(err);
//   } else {
//     console.log('Подписка на уведомления успешна');
//   }
// });

const subscriber = createSubscriber({ 
  connectionString: `postgres://postgres:GOS-30081987@localhost:5432/postgres`,
})
const wss = new WebSocketServer({ port: 8080 });

// При подключении клиента
wss.on('connection', (ws) => {
  console.log('Клиент подключен.');
  
  // При получении события из PostgreSQL
  subscriber.notifications.on("db_event", (payload) => {
    console.log("Отправляем уведомление клиенту:", payload);
    ws.send(JSON.stringify(payload)); // Отправляем данные клиенту через WebSocket
  });
  
  // Закрытие соединения с клиентом
  ws.on('close', () => {
    console.log('Клиент отключен.');
  });
});

// Запускаем подписку на уведомления PostgreSQL
(async () => {
  await subscriber.connect();
  await subscriber.listenTo("db_event");
  console.log("Прослушивание события 'db_event' запущено.");
})();



app.listen(3001, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log(`Server listening on 3001`);
});