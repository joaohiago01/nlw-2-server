import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export default (request: Request, response: Response, next: NextFunction) => {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
        return response.status(401).send({ message: 'Token not provided.' });
    }

    const [scheme , token] = authHeader.split(' ');

    if (!/^Bearer$/i.test(scheme)) {
        return response.status(401).send({ message: 'Token unformatted.' });
    }

    jwt.verify(token, 'TkxXIzIgUHJvZmZ5IC0gQXBwbGljYXRpb24gd2l0aCBhdXRoZW50aWNhdGUgdXNpbmcgSldU', (err, decoded) => {
        if (err) return response.status(401).send({error: 'Token invalid.'});
        return next();
    });
}