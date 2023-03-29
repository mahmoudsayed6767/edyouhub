import mongoose,{ Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const courseSchema=new Schema({
    _id: {
        type: Number,
        required: true
    },
    name_en: {
        type: String,
        required: true,
        trim: true,
    },
    name_ar: {
        type: String,
        trim: true,
        required: true,
    },
    status: {
        type: String,
        enum: ['CURRENT','COMING','DONE'],
        default:'CURRENT',
    },
    description_en: {
        type: String,
        required: true,
        trim: true,
    },
    description_ar: {
        type: String,
        trim: true,
        required: true,
    },
    sessionsNo: {
        type: Number,
        required: true
    },
    imgs: [{
        type: String,
        required: true
    }],
    specialization: {
        type: Number,
        ref:'specialization',
        required: true
    },
    business: {
        type: Number,
        ref:'business',
        required: true
    },
    branch: {
        type: Number,
        ref:'branch',
        required: true
    },
    instractor: {
        type: Number,
        ref:'business',
        required: true
    },
    days: [
        new Schema({
            day:{
                type: String,
                enum: ['SATURDAY','SUNDAY', 'MONDAY','WEDNESDAY','TUESDAY','FRIDAY']
            },
            fromDate: {
                type: Date,
                required: true
            },
            toDate: {
                type: Date,
                required: true
            },
        }, { _id: false })
    ],
    
    fromDate: {
        type: Date,
        required: true
    },
    toDate: {
        type: Date,
        required: true
    },
    toDateMillSec: {
        type: Number,
        required: true
    },
    maxApplications: {
        type: Number,
        required: true
    },
    deleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true});
courseSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
courseSchema.plugin(autoIncrement.plugin, { model: 'offer', startAt: 1 });

export default mongoose.model('offer', courseSchema);