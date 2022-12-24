import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const followSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    user: {//فاعل
        type: Number,
        ref: 'user',
        required: true

    },
    business: {//مفعول
        type: Number,
        ref: 'business',
        required: true

    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

followSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});
autoIncrement.initialize(mongoose.follow);
followSchema.plugin(autoIncrement.plugin, { model: 'follow', startAt: 1 });

export default mongoose.model('follow', followSchema);