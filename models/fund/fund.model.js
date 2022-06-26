import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const fundSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    status:{
        type: String,
        enum:['PENDING','ACCEPTED','NEED-ACTION','REJECTED','STARTED','COMPLETED'],
        default:'PENDING'
    },
    owner: {
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
        enum:['EMPLOYEE','BUSINESS-OWNER'],
        required: true
    },
    personalId:{
        type: String,
        enum:['EGYPTIAN','NON-EGYPTIAN'],
        default:'EGYPTIAN'
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
    contractImgs: {//if utilityBills is Renter
        type: [String],

    },
    billType:{
        type: String,
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
    educationInstitutions:{
        type: [Number],
        ref: 'educationInstitution',
    },
    totalFees:{
        type: Number,
        required: true
    },
    //if accept
    firstPaid:{
        type: Number,
    },
    startDate:{
        type: Date,
    },
    endDate:{
        type: Date,
    },
    //if reject
    reason:{
        type: String,
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