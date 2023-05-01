import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const sessionReservationSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    user: {
        type: Number,
        ref: 'user',
        required: true
    },
    tutor: {
        type: Number,
        ref: 'business',
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    sessionNo: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING','PAID','DONE'],
        default:'PENDING',
    },
    studentGroup: {
        type: String,
        required: true,
        enum:['FOR-ONE','FOR-TWO','FOR-THREE','FOR-FOUR']
    },
    fawryCode: {
        type: String,
        required: true,
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

sessionReservationSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});
autoIncrement.initialize(mongoose.connection);
sessionReservationSchema.plugin(autoIncrement.plugin, { model: 'sessionReservation', startAt: 1 });

export default mongoose.model('sessionReservation', sessionReservationSchema);