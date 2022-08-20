import mongoose,{ Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const ContactSchema=new Schema({
    _id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        trim:true,
        required: true
    },
    phone: {
        type: String,
        trim:true,
        required: true
    },
    email: {
        type: String,
        trim:true,
        required: true
    },
    educationInstitutionName: {
        type: String,
    },
    contactFor: {
        type: String,
        enum:['FEES-PAYMENT','FEES-INSTALLMENT','SUPPLIES'],
        required: true
    },
    attachment: {//for supplies contact
        type: [String],
    },
    feesType: {
        type: String,
        enum:['BUS','TUITION','BOTH']
    },
    numberOfStudent: {
        type: Number,
    },
    totalFees: {
        type: Number,
    },
    reply:{
        type:Boolean,
        default:false
    },
    replyText:{
        type:String,
    },
    deleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true});
ContactSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.deleted;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
ContactSchema.plugin(autoIncrement.plugin, { model: 'contact', startAt: 1 });

export default mongoose.model('contact', ContactSchema);