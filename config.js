const config = {};
//stagging
//config.mongoUrl = 'mongodb+srv://edhub:edhub@cluster0.gzdzusy.mongodb.net/?retryWrites=true&w=majority'

//production
config.mongoUrl = 'mongodb+srv://eduhub:eduhub1@cluster0.cmabrmv.mongodb.net/?retryWrites=true&w=majority'

config.jwtSecret = 'EdHub';
config.jwt_secret_mail = 'EdHub'

config.encryptSecret = "ZWGcON/5fIQb.U/1";
config.initVector = "mcgw2K5uCV5$%x&b";
config.Securitykey =  "$2a$10$h/Vx2RtN0Ew01elQr8GWFeGrV";
config.twilio = {
  accountSid: 'ACfc08f403d0c878ecbb608c545ca7d46a',
  authToken: '4f660c99306b397b2647fdb3b8f2da7b'
}
config.SENDGRID_API_KEY = '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'

config.confirmMessage = 'verify code: ';
config.cloudinary = {
  cloud_name: 'eduhub2022',
  api_key: '779686592997438',
  api_secret: 'MkQUEuSwvhDoAR_kD-afOrnpgr4'
};
config.LIMIT =  20 ;
config.PAGE = 1;
config.App={
  Name:'EdHub'
}
config.baseUrl = 'https://edHub.herokuapp.com/api/v1/'
config.AppSid =""
config.SenderID = ""
// appUrl attr is set in the request
export default config;
