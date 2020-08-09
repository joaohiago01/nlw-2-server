import { Request, Response } from 'express';

import db from '../database/connection';
import convertHourToMinute from '../utils/convertHourToMinutes';

interface ScheduleItem {
    id?: number;
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

        var lessons = await db('lessons')
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

    async show(request: Request, response: Response) {
        const { user_id } = request.params;

        const lessonSchedule = await db('lessons')
            .where('user_id', user_id)
            .join('lesson_schedule', 'lessons.id', '=', 'lesson_schedule.lesson_id')
            .select([
                'lesson_schedule.from',
                'lesson_schedule.to',
                'lesson_schedule.week_day',
                'lesson_schedule.id'
            ]);
        
        return response.json(lessonSchedule);
    }

    async create(request: Request, response: Response) {
        const {
            subject,
            cost,
            schedule
        } = request.body;

        const { user_id } = request.params;
    
        const trx = await db.transaction();
    
        try {
                    
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
            });
        }
    }

    async update(request: Request, response: Response) {
        const {
            cost,
            schedule,
        } = request.body;

        const { lesson_id } = request.params;

        const trx = await db.transaction();

        try {
            await trx('lessons')
                .where('id', lesson_id)
                .update({
                    cost
                });

            schedule.map(async (scheduleItem: ScheduleItem) => {
                await trx('lesson_schedule')
                    .where('id', scheduleItem.id)
                    .update({
                        week_day: scheduleItem.week_day,
                        from: convertHourToMinute(scheduleItem.from),
                        to: convertHourToMinute(scheduleItem.to)
                    });
            });
            
            await trx.commit();

            return response.status(201).send();
            
        } catch (error) {
            trx.rollback();
    
            return response.status(400).json({
                error: 'Unexpected error while updating lesson.'
            });
        }
    }
}