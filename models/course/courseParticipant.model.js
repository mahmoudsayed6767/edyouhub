import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const courseParticipantSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    user: {
        type: Number,
        ref: 'user',
        required: true
    },
    course: {
        type: Number,
        ref: 'course',
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING','PAID','DONE'],
        default:'PENDING',
    },
    paymentMethod:{
        type: String,
        enum:['CASH','INSTALLMENT'],
        default:'CASH',
    },
    receipt: [{
        type: String,
    }],
    fawryCode: {
        type: String,
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

courseParticipantSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});
autoIncrement.initialize(mongoose.connection);
courseParticipantSchema.plugin(autoIncrement.plugin, { model: 'courseParticipant', startAt: 1 });

export default mongoose.model('courseParticipant', courseParticipantSchema);