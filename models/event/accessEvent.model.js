import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const accessEventSchema = new Schema({
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

accessEventSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});
autoIncrement.initialize(mongoose.connection);
accessEventSchema.plugin(autoIncrement.plugin, { model: 'accessEvent', startAt: 1 });

export default mongoose.model('accessEvent', accessEventSchema);