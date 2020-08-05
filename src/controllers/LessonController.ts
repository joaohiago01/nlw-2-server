import { Request, Response } from 'express';

import db from '../database/connection';
import convertHourToMinute from '../utils/convertHourToMinutes';

interface ScheduleItem{
    week_day: string,
    from: string,
    to: string
}

export default class LessonController {
    async index(request: Request, response: Response) {
        const filters = request.query;

        if (!filters.week_day || !filters.subject || !filters.time) {
            return response.status(400).json({
                error: 'Missing filters to search lessons.'
            });
        }

        const timeInMinutes = convertHourToMinute(filters.time as string);

        const lessons = await db('lessons')
            .whereExists(function() {
                this.select('lesson_schedule.*')
                    .from('lesson_schedule')
                    .whereRaw('`lesson_schedule`.`lesson_id` = `lessons`.`id`')
                    .whereRaw('`lesson_schedule`.`week_day` = ??', [Number(filters.week_day as string)])
                    .whereRaw('`lesson_schedule`.`from` <= ??', [timeInMinutes])
                    .whereRaw('`lesson_schedule`.`to` > ??', [timeInMinutes])
            })
            .where('lessons.subject', '=', filters.subject as string)
            .join('users', 'lessons.user_id', '=', 'users.id')
            .select(['lessons.*', 'users.*']);

        return response.json(lessons);
    }

    async create(request: Request, response: Response) {
        const {
            name,
            avatar,
            whatsapp,
            bio,
            subject,
            cost,
            schedule
        } = request.body;
    
        const trx = await db.transaction();
    
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
        
            const lessonSchedule = schedule.map((scheduleItem: ScheduleItem) => {
                return {
                    lesson_id: lesson_id,
                    week_day: scheduleItem.week_day,
                    from: convertHourToMinute(scheduleItem.from),
                    to: convertHourToMinute(scheduleItem.to)
                };
            });
        
            await trx('lesson_schedule').insert(lessonSchedule);
        
            await trx.commit();
            
            return response.status(201).send();
    
        } catch (error) {
            trx.rollback();
    
            return response.status(400).json({
                error: 'Unexpected error while creating new lesson.'
            })
        }
    }
}