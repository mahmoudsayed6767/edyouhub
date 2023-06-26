import mongoose,{ Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const courseSchema=new Schema({
    _id: {
        type: Number,
        required: true
    },
    title_en: {
        type: String,
        required: true,
        trim: true,
    },
    title_ar: {
        type: String,
        trim: true,
        required: true,
    },
    type: {
        type: String,
        enum: ['ONLINE','ON-SITE'],
        default:'ON-SITE',
    },
    status: {
        type: String,
        enum: ['CURRENT','COMING','DONE'],
        default:'CURRENT',
    },
    description_en: {
        type: String,
        required: true,
        trim: true,
    },
    description_ar: {
        type: String,
        trim: true,
        required: true,
    },
    sessionsNo: {
        type: Number,
        default:0
    },
    acceptanceNo:{
        type: Number,
        default:0
    },
    imgs: [{
        type: String,
        required: true
    }],
    introVideo:{
        type: String,
    },
    specializations: {
        type: [Number],
        ref:'specialization',
        required: true
    },
    business: {
        type: Number,
        ref:'business',
        //required: true
    },
    branches: {
        type: [Number],
        ref:'branch',
        //required: true
    },
    ownerType:{
        type: String,
        enum:['BUSINESS','APP'],
        default:'BUSINESS'
    },
    instractors: {
        type: [Number],
        ref:'user',
        required: true
    },
    dailyTimes: [
        new Schema({
            day:{
                type: String,
                enum: ['SATURDAY','SUNDAY', 'MONDAY','WEDNESDAY','TUESDAY','THURSDAY','FRIDAY'],
                required: true,
            },
            fromDate: {
                type: Date,
                required: true
            },
            toDate: {
                type: Date,
                required: true
            },
        }, { _id: false })
    ],
    
    fromDate: {
        type: Date,
        //required: true
    },
    toDate: {
        type: Date,
        //required: true
    },
    toDateMillSec: {
        type: Number,
        //required: true
    },
    maxApplications: {
        type: Number,
        default:0
    },
    maxAcceptance: {
        type: Number,
        default:0
    },
    feesType:{
        type: String,
        enum:['NO-FEES','WITH-FEES'],
        default:'WITH-FEES'
    },
    paymentMethod:{
        type: String,
        enum:['CASH','INSTALLMENT'],
    },
    price: {
        type:Number,
    },
    discount:{
        type:Number,
        default:0
    },
    totalDuration :{
        type:Number,
        required: true,
        default:0,
    },
    installments: [
        new Schema({
            price: {
                type: Number,
                required: true
            },
        }, { _id: false })
    ],
    rateCount: {
        type: Number,
        default:0
    },
    rateNumbers: {
        type: Number,
        default:0
    },
    rate: {
        type: Number,
        default:0
    },
    tutorials: {
        type: [Number],
        ref:'courseTutorial'
    },
    hasCertificate:{
        type:Boolean,
        default:false
    },
    certificateName:{
        type: String,
    },
    secretKey: {
        type: String,
    },
    discount:{
        type:Boolean,
        default:false
    },
    deleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true});
courseSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
courseSchema.plugin(autoIncrement.plugin, { model: 'course', startAt: 1 });

export default mongoose.model('course', courseSchema);