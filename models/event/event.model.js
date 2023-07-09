import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const eventSchema=new Schema({
    _id: {
        type: Number,
        required: true
    },
    business:{
        type:Number,
        ref:'business',
    },
    educationInstitution:{
        type:Number,
        ref:'educationInstitution',
    },
    status: {
        type: String,
        enum:['COMING','CURRENT','PASS'],
        default:'COMING'
    },
    ownerType:{
        type: String,
        enum:['BUSINESS','APP'],
        default:'BUSINESS'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        default: ''
    },
    hostname: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    location: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number] },
    },
    city:{
        type:Number,
        ref:'city',
        required:true,
        default:1
    },
    area:{
        type:Number,
        ref:'area',
        required:true,
        default:1
    },
    contactNumbers: {
        type: [String],
        required: true
    },
    email: {
        type: String,
        required: true
    },
    fromDate: {
        type: Date,
        required: true
    },
    fromDateMillSec: {
        type: Number,
        //required: true
    },
    toDate: {
        type: Date,
        required: true
    },
    toDateMillSec: {
        type: Number,
        //required: true
    },
    dailyTimes: [
        new Schema({
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
    usersParticipants: [{
        type:Number,
        ref:'user',
    }],
    businessParticipants: [{
        type:Number,
        ref:'business',
    }],
    imgs: [{
        type:String,
    }],
    feesType:{
        type: String,
        enum:['NO-FEES','WITH-FEES'],
        default:'NO-FEES'
    },
    paymentMethod:{
        type: String,
        enum:['CASH','INSTALLMENT','BOTH'],
    },
    cashPrice: {
        type:Number,
    },
    installmentPrice :{
        type:Number,
    },
    installments: [
        new Schema({
            price: {
                type: Number,
                required: true
            },
        }, { _id: false })
    ],
    attendance: [{
        type:Number,
        ref:'user',
    }],
    interesting: [{
        type:Number,
        ref:'user',
    }],
    waitToPaid: [{
        type:Number,
        ref:'user',
    }],
    discountType: {
        type: String,
        enum:['FIXED','RATIO'],
        default:'RATIO',
    },
    discount:{
        type:Number,
        default:0
    },
    deleted:{
        type:Boolean,
        default:false
    },

},{ timestamps: true });
eventSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
eventSchema.plugin(autoIncrement.plugin, { model: 'event', startAt: 1 });

export default mongoose.model('event', eventSchema);