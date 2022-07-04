import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const premiumSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    fund: {
        type: Number,
        ref: 'fund',
    },
    fees: {
        type: Number,
        ref: 'fees',
    },
    type:{
        type: String,
        enum:['FUND','FEES'],
        default: 'FUND'
    },
    feesType:{
        type: String,
        default: 'TUITION'
    },
    student: {
        type: [Number],
        ref: 'student',
        required: true,
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
