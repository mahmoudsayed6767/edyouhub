import cookieParser from 'cookie-parser';
import morganLogger from'morgan';
import express from 'express';
import path from 'path';
import bodyParser from 'body-parser'
import expressValidator from 'express-validator';
import mongoose from 'mongoose';
import url from 'url';
import cors from 'cors';
import helmet from 'helmet';
import mongoose_delete from 'mongoose-delete';
import i18n from 'i18n';
import autoIncrement from 'mongoose-auto-increment';
import router from './routes'; 
import ApiError from './helpers/ApiError';
import compression from 'compression'
import Logger from "./services/logger";
import {cronJop} from './services/cronJop'
import rateLimit from 'express-rate-limit'
require('dotenv').config()

const logger = new Logger('log '+ new Date(Date.now()).toDateString())
const errorsLog = new Logger('errorsLog '+ new Date(Date.now()).toDateString())
var app = express();

mongoose.Promise = global.Promise;
autoIncrement.initialize(mongoose.connection);
//connect to mongodb
mongoose.connect(process.env.mongoUrl, { 
  useNewUrlParser: true , 
  useUnifiedTopology: true,
  useCreateIndex:true,
  useFindAndModify:false
});
mongoose.connection.on('connected', () => {
    cronJop();
    console.log('\x1b[32m%s\x1b[0m', '[DB] Connected...');
 
});
mongoose.connection.on('error', err => console.log('\x1b[31m%s\x1b[0m', '[DB] Error : ' + err));
mongoose.connection.on('disconnected', () => console.log('\x1b[31m%s\x1b[0m', '[DB] Disconnected...'));


mongoose.plugin(mongoose_delete, { overrideMethods: true });
app.use(cors());
app.use(helmet());

app.use(compression())
const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minutes
	max: 300, // Limit each IP to 100 requests per `window` (here, per 1 minutes)
  message:'Too many requests created from this IP, please try again after an minutes',
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

// Apply the rate limiting middleware to all requests
app.use(limiter)

i18n.configure({
    locales: ['en', 'ar'],
    defaultLocale: 'en',
    header: 'accept-language',
    directory:path.join(__dirname, 'locales'),
});

app.use(i18n.init);

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true, parameterLimit: 50000 }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'docs')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
//app.use(expressValidator());
app.use(morganLogger('dev'));
app.use((req, res, next) => {
  logger.info(`${req.originalUrl} - ${req.method} - ${req.ip} || `);
  next();
});
// make the file publically accessable 
app.use('/uploads',express.static('uploads'));

//Routes
app.use('/api/v1', router);
app.use(bodyParser.json())

// Ensure Content Type
app.use('/',(req, res, next) => {
  
    // check content type
    let contype = req.headers['content-type'];
    if (contype && !((contype.includes('application/json') || contype.includes('multipart/form-data'))))
        return res.status(415).send({ error: 'Unsupported Media Type (' + contype + ')' });


    // set current host url
    process.env.appUrl = url.format({
        protocol: req.protocol,
        host: req.get('host')+'/'
    });
    

    next();
});

app.use((req, res, next) => {
  next(new ApiError(404, req.__('notFound')));
});



  //ERROR Handler
  app.use((err, req, res, next) => {
    errorsLog.error(`\x1b[31m ${err.status} || ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip} || `,JSON.stringify(err.message));
    if (err instanceof mongoose.CastError)
      err = new ApiError.NotFound(err);
    res.status(err.status || 500).json({
      success:false,
      errors: Array.isArray(err.message)?err.message:[{msg:err.message}]
    });
  
    // console.log(err);
    // console.log(JSON.stringify(err));
  });


module.exports = app;
