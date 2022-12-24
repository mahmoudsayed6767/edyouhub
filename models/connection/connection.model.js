import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const connectionSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    status:{
        type: String,
        enum:['PENDING','ACCEPTED','REJECTED']
    },
    from: {
        type: Number,
        ref: 'user',
        required: true

    },
    to: {
        type: Number,
        ref: 'user',
        required: true

    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

connectionSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});
autoIncrement.initialize(mongoose.connection);
connectionSchema.plugin(autoIncrement.plugin, { model: 'connection', startAt: 1 });

export default mongoose.model('connection', connectionSchema);