"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const LessonController_1 = __importDefault(require("./controllers/LessonController"));
const ConnectionsController_1 = __importDefault(require("./controllers/ConnectionsController"));
const routes = express_1.default.Router();
const lessonController = new LessonController_1.default();
const connectionsController = new ConnectionsController_1.default();
routes.post('/lessons', lessonController.create);
routes.get('/lessons', lessonController.index);
routes.post('/connections', connectionsController.create);
routes.get('/connections', connectionsController.index);
exports.default = routes;
