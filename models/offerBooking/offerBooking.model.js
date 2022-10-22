import mongoose,{ Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const offerBookingSchema=new Schema({
    _id: {
        type: Number,
        required: true
    },
    user: {
        type: Number,
        required: true,
        trim: true,
    },
    offers: [
        new Schema({
            offer: {
                type: Number,
                required: true,
                ref:'offer'
            },
            place: {
                type: Number,
                required: true,
                ref:'place'
            },
            code: {
                type: String,
                required: true,
            },
            count: {
                type: Number,
                default:1
            },

        }, { _id: false })
    ],
    
    status: {
        type: String,
        enum: ['PENDING','DONE'],
        default:'PENDING',
        required:true
    },
    deleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true});
offerBookingSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
offerBookingSchema.plugin(autoIncrement.plugin, { model: 'offerBooking', startAt: 1 });

export default mongoose.model('offerBooking', offerBookingSchema);