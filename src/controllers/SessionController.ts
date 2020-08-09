import { Request, Response } from 'express';
import db from '../database/connection';
import UserController from './UserController';

interface UserProps {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    whatsapp: string;
    avatar: string;
    bio: string;
}

export default class SessionController {
    async signIn(request: Request, response: Response) {
        const { email, password } = request.body;

        const user = await db<UserProps>('users').where('email', email);

        if (!user) {
            return response.status(401).json({ message: 'User not found.' })
        }

        const userController = new UserController();
        const userEntity = user[0];

        if (!await userController.checkPassword(password, userEntity)) {
            return response.status(401).json({ message: 'Incorrect password.' });
        }

        return response.json({
            userEntity,
            token: userController.generateToken(userEntity),
        });
    }
}