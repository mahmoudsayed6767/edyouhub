import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const premiumSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    owner: {
        type: Number,
        ref: 'user',
    },
    fund: {
        type: Number,
        ref: 'fund',
    },
    fees: {
        type: Number,
        ref: 'fees',
    },
    course: {
        type: Number,
        ref: 'course',
    },
    type:{
        type: String,
        enum:['FUND','FEES','COURSE'],
        default: 'FUND'
    },
    academicYear: {
        type: Number,
        ref:'academicYear',
    },
    feesType:{
        type: Number,
        ref:'feesType'
    },
    student: {
        type: [Number],
        ref: 'student',
        //required: true,
    },
    cost: {
        type: Number,
        required: true,
    },
    installmentDate: {
        type: Date,
        required: true,
    },
    status:{
        type: String,
        enum:['PENDING','PAID','LATE'],
        default:'PENDING'
    },
    receiptNum: {
        type: Number,
        required: true,
        default:1
    },
    paidDate: {
        type: Date,
    },
    paymentProof: {
        type: String
    },
    lastPremium:{
        type:Boolean,
        default:false
    },
    deleted:{
        type:Boolean,
        default:false
    }
});
premiumSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});


premiumSchema.plugin(autoIncrement.plugin, { model: 'premium', startAt: 1 });

export default mongoose.model('premium', premiumSchema);
