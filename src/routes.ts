import express from 'express';
import LessonController from './controllers/LessonController';
import ConnectionsController from './controllers/ConnectionsController';

const routes = express.Router();

const lessonController = new LessonController();
const connectionsController = new ConnectionsController();

routes.post('/lessons', lessonController.create);
routes.get('/lessons', lessonController.index);

routes.post('/connections', connectionsController.create);
routes.get('/connections', connectionsController.index);

export default routes;