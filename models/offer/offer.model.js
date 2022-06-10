import mongoose,{ Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const OfferSchema=new Schema({
    _id: {
        type: Number,
        required: true
    },
    title_en: {
        type: String,
        required: true,
        trim: true,
    },
    title_ar: {
        type: String,
        trim: true,
        required: true,
    },
    description_en: {
        type: String,
        required: true,
        trim: true,
    },
    description_ar: {
        type: String,
        trim: true,
        required: true,
    },
    imgs: [{
        type: String,
        //required: true
    }],
    place: {
        type: Number,
        required: true,
        ref:'place'
    },
    type: {
        type: String,
        enum: ['NEW-PRICE','VOUCHER'],
        default:'NEW-PRICE',
        required:true
    },
    oldPrice: {
        type: Number,
        required:true
    },
    newPrice: {
        type: Number,
        required:true
    },
    coins: {
        type: Number,
        required:true
    },
    fromDate: {
        type: Date,
        required: true
    },
    toDate: {
        type: Date,
        required: true
    },
    toDateMillSec: {
        type: Number,
        required: true
    },
    end: {
        type:Boolean,
        default:false
    },
    withNotif: {
        type:Boolean,
        default:false
    },
    bookedUsers: {
        type: [Number],
        ref:'user',
    },
    bookedUsersCount:{
        type: Number,
        default:0
    },
    gotUsers: {//users take the offer
        type: [Number],
        ref:'user',
    },
    gotUsersCount:{
        type: Number,
        default:0
    },
    deleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true});
OfferSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
OfferSchema.plugin(autoIncrement.plugin, { model: 'offer', startAt: 1 });

export default mongoose.model('offer', OfferSchema);