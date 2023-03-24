import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const followEventSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    user: {
        type: Number,
        ref: 'user',
        required: true
    },
    event: {
        type: Number,
        ref: 'event',
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

followEventSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});
autoIncrement.initialize(mongoose.connection);
followEventSchema.plugin(autoIncrement.plugin, { model: 'followEvent', startAt: 1 });

export default mongoose.model('followEvent', followEventSchema);