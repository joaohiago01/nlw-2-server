import { Request, Response } from 'express';
import db from '../database/connection';

export default class FavoritesController {
    async index(request: Request, response: Response) {
        const { user_id } = request.params;
        
        const favorites = await db('favorites')
            .where('user_id', user_id)
            .join('users', 'favorites.user_id', '=', 'users.id')
            .select('users.*');

        return response.json(favorites);
    }
    
    async create(request: Request, response: Response) {
        const { user_id, proffy_id } = request.body;

        await db('favorites').insert({
            user_id,
            proffy_id
        });

        return response.status(201).send();
    }
}