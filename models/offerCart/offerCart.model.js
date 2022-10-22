import mongoose,{ Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const offerCartSchema=new Schema({
    _id: {
        type: Number,
        required: true
    },
    user: {
        type: Number,
        required: true,
        trim: true,
    },
    offer: {
        type: Number,
        required: true,
        ref:'offer'
    },
    count: {
        type: Number,
        default:1
    },
    deleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true});
offerCartSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
offerCartSchema.plugin(autoIncrement.plugin, { model: 'offerCart', startAt: 1 });

export default mongoose.model('offerCart', offerCartSchema);