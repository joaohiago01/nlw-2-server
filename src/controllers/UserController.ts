import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import db from '../database/connection';

interface UserProps {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    whatsapp: string;
    avatar: string;
    bio: string;
}

export default class UserController {
    async create(request: Request, response: Response) {
        const { 
            name,
            email,
            password,
            avatar,
            whatsapp,
            bio,
        } = request.body;

        var user = await db('users').where({
            'email': email,
            'whatsapp': whatsapp,
        });

        if (user.length > 0) {
            return response.status(400).json({messageError: 'E-mail or Whatsapp already exists.'});
        }

        const password_hash = await bcrypt.hash(password, 8);

        await db('users').insert({
            name,
            email,
            password_hash,
            avatar,
            bio,
            whatsapp,
        });

        return response.status(201).send();
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;

        const user = await db('users').where('id', id);

        if (user.length < 1) {
            return response.status(204).send('User not found.');
        }

        return response.status(200).json(user[0]);
    }

    async update(request: Request, response: Response) {
        const { user_id } = request.params;
        const {
            bio,
            whatsapp
        } = request.body;

        await db('users').update({
            bio,
            whatsapp
        }).where('id', user_id);

        return response.status(200).send();
    }

    checkPassword(password: string, user: UserProps) {
        return bcrypt.compare(password, user.password_hash);
    }

    generateToken(user: UserProps): string {
        return jwt.sign({ id: user.id }, 'TkxXIzIgUHJvZmZ5IC0gQXBwbGljYXRpb24gd2l0aCBhdXRoZW50aWNhdGUgdXNpbmcgSldU');
    }
}