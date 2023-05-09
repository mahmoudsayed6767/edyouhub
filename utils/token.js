import jwt from 'jsonwebtoken';
require('dotenv').config()


const { jwtSecret } = process.env;

export const generateToken = id => {
    return jwt.sign({
        sub: id,
        iss: 'EdHub',
        iat: new Date().getTime()
    }, jwtSecret, { expiresIn: '300d' });
};