import generator from 'password-generator';

export const generateVerifyCode = () => generator(4, false, /\d/);

export const generateCode = (num) => generator(num, false, /\d/);

export const generateMaxCode = (num) => generator(num, false);
