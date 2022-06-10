import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const userDevicesSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    user: {
        type: Number,
        ref: 'user',
        required: true

    },
    deviceType: {
        type: String,
        required: true
    },
    deviceModel: {
        type: String,
        required: true
    },
    deviceVersion: {
        type: String,
        required: true
    },
    appVersion: {
        type: String,
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

userDevicesSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
userDevicesSchema.plugin(autoIncrement.plugin, { model: 'userDevices', startAt: 1 });

export default mongoose.model('userDevices', userDevicesSchema);