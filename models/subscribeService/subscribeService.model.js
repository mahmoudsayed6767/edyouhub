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
        enum:['ACCEPTED','PENDING','REJECTED'],
        default:'PENDING'
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