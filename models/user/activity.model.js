import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const activitySchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    
    action:{
        type: String,
        required: true,
        default: 'POST'
        ['CREATE-POST','UPDATE-POST','REMOVE-POST','ADD-COMMENT','REMOVE-COMMENT','ADD-LIKE','REMOVE-LIKE','ANSWER-POST','UPDATE-USER-ACCOUNT','CREATE-ONLINE-COURSE','CREATE-ON-SIE-COURSE','UPDATE-BUSINESS-ACCOUNT','UPDATE-SUPERVISOR','CREATE-EVENT','CREATE-GALLERY','CREATE-GROUP','UPGRADE-PACKAGE']
    },
    user: {
        type: Number,
        ref:'user',
        required: true,
    },
    post: {
        type: Number,
        ref:'post'
    },
    package: {
        type: Number,
        ref:'package'
    },
    group: {
        type: Number,
        ref:'group'
    },
    gallery: {
        type: Number,
        ref:'gallery'
    },
    event: {
        type: Number,
        ref:'event'
    },
    course: {
        type: Number,
        ref:'course'
    },
    business: {
        type: Number,
        ref:'business'
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