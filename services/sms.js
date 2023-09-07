const axios = require('axios')

export function sendSms(phone,msg) {
  console.log(phone)
  //bd5b8eca05a4fd6ac2cfaff13dd70fc1631d32dfdcc6bc85655f7180749505c6
  axios.post('https://smsmisr.com/api/SMS?', {
      username : '3755eb7b-86e1-4aa1-b1ac-a1851ef80973',
      password: '7a47d607e9dcf75e8b961422df8f6d92e78a741197a32e6d98f04b3630c856e3',
      language : '2',
      sender: 'bd5b8eca05a4fd6ac2cfaff13dd70fc1631d32dfdcc6bc85655f7180749505c6',
      mobile :phone,
      message :msg,
      environment:1
    })
    .then(res => {
      console.log("done : " + res.data.code)
    })
    .catch(error => {
      console.error(error)
    })
}