import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const NotifSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    resource: {
        type: Number,
        ref: 'user'
    },
    target: {
        type: Number,
        ref: 'user'
    },
    description_en:{
        type:String
    },
    description_ar:{
        type:String
    },
    img:{
        type:String
    },
    type:{
        type:String,
        enum: ['VACANCY-REQUEST','GROUP-REQUEST','GROUP','POST','ADMISSION-REQUEST','MESSAGE','CONNECTION','OFFER','ORDER','BUSINESS','USER','APP','BILL','FAVOURITE','RATE','FUND','PREMIUM','FEES']
    },
   
    title_en:{
        type:String
    },
    title_ar:{
        type:String
    },
    business:{
        type:Number,
        ref:'business'
    },
    fund:{
        type:Number,
        ref:'fund'
    },
    fees:{
        type:Number,
        ref:'fees'
    },
    premium:{
        type:Number,
        ref:'premium'
    },
    offer:{
        type:Number,
        ref:'offer'
    },
    bill:{
        type:Number,
        ref:'bill'
    },
    rate:{
        type:Number,
        ref:'rate'
    },
    favourite: {
        type: Number,
        ref: 'favourite',
    },
    user: {
        type: Number,
        ref: 'user',
    },
    read:{
        type:Boolean,
        default:false
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

NotifSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});
autoIncrement.initialize(mongoose.connection);
NotifSchema.plugin(autoIncrement.plugin, { model: 'notif', startAt: 1 });

export default mongoose.model('notif', NotifSchema);