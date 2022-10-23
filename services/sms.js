const axios = require('axios')
import config from '../config';

export function sendSms(phone,msg) {
  console.log(phone)
  axios.post('https://smsmisr.com/api/v2/?', {
      Username : 'qdLK74qA',
      password: '7i9FJAK5dqA101d',
      language : '2',
      sender: 'Codin Agncy',
      Mobile :phone,
      message :msg
    })
    .then(res => {
      console.log("done : " + res)
    })
    .catch(error => {
      console.error(error)
    })
}