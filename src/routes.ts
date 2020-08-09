import express from 'express';

import LessonController from './controllers/LessonController';
import ConnectionsController from './controllers/ConnectionsController';
import UserController from './controllers/UserController';
import SessionController from './controllers/SessionController';

import authMiddleware from './middleware/auth';
import FavoritesController from './controllers/FavoritesController';

const routes = express.Router();

const lessonController = new LessonController();
const connectionsController = new ConnectionsController();
const favoritesController = new FavoritesController();
const userController = new UserController();
const sessionController = new SessionController();

routes.post('/signIn', sessionController.signIn);
routes.post('/users', userController.create);

routes.use(authMiddleware);

routes.get('/users/:id', userController.show);
routes.put('/users/:user_id', userController.update);

routes.post('/lessons/:user_id', lessonController.create);
routes.get('/lessons', lessonController.index);
routes.get('/lessons/:user_id', lessonController.show);
routes.put('/lessons/:lesson_id', lessonController.update);

routes.post('/connections', connectionsController.create);
routes.get('/connections', connectionsController.index);

routes.post('/favorites', favoritesController.create);
routes.get('/favorites/:user_id', favoritesController.index);

export default routes;