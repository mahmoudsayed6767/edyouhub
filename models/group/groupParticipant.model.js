import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const groupParticipantSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    user: {
        type: Number,
        ref: 'user',
        required: true
    },
    group: {
        type: Number,
        ref: 'group',
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING','ACCEPTED','REJECTED'],
        default:'PENDING',
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

groupParticipantSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});
autoIncrement.initialize(mongoose.connection);
groupParticipantSchema.plugin(autoIncrement.plugin, { model: 'groupParticipant', startAt: 1 });

export default mongoose.model('groupParticipant', groupParticipantSchema);