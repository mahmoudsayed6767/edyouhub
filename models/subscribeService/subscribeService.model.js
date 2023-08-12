import mongoose,{ Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const subscribeServiceSchema=new Schema({
    _id: {
        type: Number,
        required: true
    },
    business: {
        type: Number,
        ref:'business',
        required: true
    },
    service: {
        type: [String],
        enum:['FEES-PAYMENT','FEES-INSTALLMENT','SUPPLIES','COURSES'],
        default:"NORMAL",
        required: true
    },
    status: {
        type: String,
        enum:['PENDING','ACCEPTED','REJECTED'],
        default:"PENDING",
    },
    contactPersonName: {
        type: String,
        required: true
    },
    contactPersonTitle: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    deleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true});
subscribeServiceSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.deleted;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
subscribeServiceSchema.plugin(autoIncrement.plugin, { model: 'subscribeService', startAt: 1 });

export default mongoose.model('subscribeService', subscribeServiceSchema);