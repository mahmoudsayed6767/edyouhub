import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const fundSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    user: {
        type: Number,
        ref: 'user',
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    job: {
        type: String,
        required: true
    },
    workPosition: {
        type: String,
        required: true
    },
    personalId:{
        type: String,
        enum:['NATIONAL-ID','PASSPORT'],
        default: 'NATIONAL-ID'
    },
    personalIdImgs: {
        type: [String],
        required: true
    },
    utilityBills:{
        type: String,
        enum:['OWNER','RENTER'],
        default: 'RENTER'
    },
    utilityBillsImgs: {
        type: [String],
        required: true
    },
    proofIncome:{
        type: String,
        enum:['WORK-ID','HR-LETTER','WORK-CONTRACT','BANK-ACCOUNT','COMMERCIAL-REGISTRATION','TAX-ID'],
        default: 'RENTER'
    },
    proofIncomeImgs: {
        type: [String],
        required: true
    },
    students: {
        type: [Number],
        ref: 'student',
        required: true
    },
    totalFees:{
        type: Number,
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

fundSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});
autoIncrement.initialize(mongoose.connection);
fundSchema.plugin(autoIncrement.plugin, { model: 'fund', startAt: 1 });

export default mongoose.model('fund', fundSchema);