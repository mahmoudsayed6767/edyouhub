import mongoose,{ Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const feesRequestSchema=new Schema({
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
    city: {
        type: Number,
        ref:'city',
        required:true
    },
    area: {
        type: Number,
        ref:'area',
        required:true
    },
    amount: {
        type: Number,
        required:true
    },
    deleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true});
feesRequestSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.deleted;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
feesRequestSchema.plugin(autoIncrement.plugin, { model: 'feesRequest', startAt: 1 });

export default mongoose.model('feesRequest', feesRequestSchema);