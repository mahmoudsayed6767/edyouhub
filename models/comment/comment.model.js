import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const commentSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    ownerType: {
        type: String,
        enum:['USER','BUSINESS'],
        default: 'USER'
    },
    user: {
        type: Number,
        ref: 'user',
        required: true
    },
    business: {
        type: Number,
        ref: 'business',
    },
    type: {
        type: String,
        enum:['MAIN','REPLY'],
        required: true,
        default: 'MAIN'
    },
    
    comment: {
        type: String,
        required: true
    },
    post: {
        type: Number,
        ref: 'post',
        required: true
    },
    replies: {
        type: [Number],
        ref: 'comment'
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

commentSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
commentSchema.plugin(autoIncrement.plugin, { model: 'comment', startAt: 1 });

export default mongoose.model('comment', commentSchema);