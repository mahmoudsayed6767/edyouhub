import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const fundSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    status:{
        type: String,
        enum:['NEW','PENDING','PARTIAL-ACCEPTANCE','ACCEPTED','CANCELED','NEED-ACTION','REJECTED','STARTED','COMPLETED'],
        default:'NEW'
    },
    owner: {
        type: Number,
        ref: 'user',
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    secondName: {
        type: String,
        required: true
    },
    thirdName: {
        type: String,
        required: true
    },
    fourthName: {
        type: String,
        required: true
    },
    country: {
        type: Number,
        ref: 'country',
    },
    city: {
        type: Number,
        ref: 'city',
    },
    area: {
        type: Number,
        ref: 'area',
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
    jobAddress : {
        type: String,
    },
    workPosition: {
        type: String,
        enum:['EMPLOYEE','BUSINESS-OWNER'],
        required: true
    },
    workStartDate: {
        type: Date,
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
    billType:{
        type: String,
        enum: ["WATER","GAS","TELEPHONE","ELECTRICITY","RENT-CONTRACT"]
    },
    utilityBillsImgs: {
        type: [String],
        required: true
    },
    proofIncome:{
        type: String,
        enum:['EMPLOYEE','BUSINESS-OWNER'],
        default: 'EMPLOYEE'
    },
    proofIncomeCost:{
        type: String
    },
    proofIncomeImgs: [
        new Schema({
            type: {
                type: String,
                enum:['WORK-ID','HR-LETTER','WORK-CONTRACT','BANK-ACCOUNT','COMMERCIAL-REGISTRATION','TAX-ID'],
            },
            img: {
                type: [String],
                required: true,
            },
        }, { _id: false })
        
    ],
    
    students: {
        type: [Number],
        ref: 'student',
        required: true
    },
    educationInstitutions:{
        type: [Number],
        ref: 'educationInstitution',
    },
    fundProgram:{
        type: Number,
        ref: 'fundProgram',
        required: true
    },
    fundProvider:{
        type: Number,
        ref: 'fundProvider',
        required: true
    },
    totalFees:{
        type: Number,
        required: true
    },
    oldTotalFees:{
        type: Number,
    },
    totalWithMonthlyPercent:{
        type: Number,
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
    partialAcceptReason:{
        type: String,
    },
    //if action need
    actionType: {
        type: [String],
        enum:['WORK-ID','CLUB-ID','HR-LETTER','WORK-CONTRACT','BANK-ACCOUNT','BANK DEPOSIT','COMMERCIAL-REGISTRATION','TAX-ID']
    },
    actionFile: [
        new Schema({
            type: {
                type: String,
                enum:['WORK-ID','CLUB-ID','HR-LETTER','WORK-CONTRACT','BANK-ACCOUNT','BANK DEPOSIT','COMMERCIAL-REGISTRATION','TAX-ID'],
            },
            file: {
                type: [String],
                required: true,
            },
        }, { _id: false })
        
    ],
    actionReply:{
        type: Boolean,
        default: false
    },
    educationFile: [
        new Schema({
            type: {
                type: String,
                enum:['BIRTH-CERTIFICATE','EDUCATION-LETTER'],
            },
            file: {
                type: [String],
                required: true,
            },
        }, { _id: false })
        
    ],
    active:{
        type: Boolean,
        default: false
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