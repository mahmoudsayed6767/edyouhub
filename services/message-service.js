import twilio from 'twilio';
require('dotenv').config()
let twillo = JSON.parse(process.env.twillo)
export function sendConfirmCode(phone,verifyCode) {
    let client = new twilio(twillo.accountSid, twillo.authToken);

    client.messages.create({
        body: process.env.confirmMessage + verifyCode,
        to: phone,
        from: '+19379752310'
    }).then((message) => {
        console.log(message);
    }).catch(err => console.log('Twilio Error: ', err))
} 
export function sendSms(phone,message) {
    let client = new twilio(twillo.accountSid, twillo.authToken);

    client.messages.create({
        body: message,
        to: phone,
        from: '+19379752310'
    }).then((message) => {
        console.log(message);
    }).catch(err => console.log('Twilio Error: ', err))
} 

export function sendForgetPassword(password, phone) {
    let client = new twilio(twillo.accountSid, twillo.authToken);
    client.messages.create({
        body: ' verify Code :'+ password,
        to: phone /*phone*/,
        from: '+19379752310'
    }).then((message) => {
        console.log(message);
    }).catch(err => console.log('Twilio Error: ', err))
}