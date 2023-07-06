import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const activitySchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    type:{
        type: String,
        enum:['POST'],
        default: 'POST'
    },
    action:{
        type: String,
        enum:['CREATE-POST','UPDATE-POST','REMOVE-POST','ADD-COMMENT','REMOVE-COMMENT','ADD-LIKE','REMOVE-LIKE','ANSWER-POST'],
        default: 'POST'
    },
    user: {
        type: Number,
        ref:'user',
        required: true,
    },
    post: {
        type: Number,
        ref:'post',
        required: true,
    },
    
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

activitySchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});
autoIncrement.initialize(mongoose.connection);
activitySchema.plugin(autoIncrement.plugin, { model: 'activity', startAt: 1 });

export default mongoose.model('activity', activitySchema);