"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = __importDefault(require("../database/connection"));
const convertHourToMinutes_1 = __importDefault(require("../utils/convertHourToMinutes"));
class LessonController {
    async index(request, response) {
        const filters = request.query;
        if (!filters.week_day || !filters.subject || !filters.time) {
            return response.status(400).json({
                error: 'Missing filters to search lessons.'
            });
        }
        const timeInMinutes = convertHourToMinutes_1.default(filters.time);
        const lessons = await connection_1.default('lessons')
            .whereExists(function () {
            this.select('lesson_schedule.*')
                .from('lesson_schedule')
                .whereRaw('`lesson_schedule`.`lesson_id` = `lessons`.`id`')
                .whereRaw('`lesson_schedule`.`week_day` = ??', [Number(filters.week_day)])
                .whereRaw('`lesson_schedule`.`from` <= ??', [timeInMinutes])
                .whereRaw('`lesson_schedule`.`to` > ??', [timeInMinutes]);
        })
            .where('lessons.subject', '=', filters.subject)
            .join('users', 'lessons.user_id', '=', 'users.id')
            .select(['lessons.*', 'users.*']);
        return response.json(lessons);
    }
    async create(request, response) {
        const { name, avatar, whatsapp, bio, subject, cost, schedule } = request.body;
        const trx = await connection_1.default.transaction();
        try {
            const insertedUsersId = await trx('users').insert({
                name,
                avatar,
                whatsapp,
                bio
            });
            const user_id = insertedUsersId[0];
            const insertedLessonsId = await trx('lessons').insert({
                subject,
                cost,
                user_id,
            });
            const lesson_id = insertedLessonsId[0];
            const lessonSchedule = schedule.map((scheduleItem) => {
                return {
                    lesson_id: lesson_id,
                    week_day: scheduleItem.week_day,
                    from: convertHourToMinutes_1.default(scheduleItem.from),
                    to: convertHourToMinutes_1.default(scheduleItem.to)
                };
            });
            await trx('lesson_schedule').insert(lessonSchedule);
            await trx.commit();
            return response.status(201).send();
        }
        catch (error) {
            trx.rollback();
            return response.status(400).json({
                error: 'Unexpected error while creating new lesson.'
            });
        }
    }
}
exports.default = LessonController;
