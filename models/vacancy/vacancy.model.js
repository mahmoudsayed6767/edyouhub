import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const vacancySchema = new Schema({

    _id: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true,
        default:''
    },
    requirements: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    },
    experiences: {
        type: String,
        required: true,
        default:''
    },
    salary: {
        type: String,
        required: true,
        default:''
    },
    type:{
        type: String, 
        enum: ['TEACHING','NON-TEACHING'],
        default:'NON-TEACHING'
    },
    img:{
        type: String,
        required: true,
        default:''
    },
    educationSystem: {
        type: Number,
        ref: 'educationSystem',
    },
    profession: {
        type: String,
    },
    grades: {
        type: [Number],
        ref: 'grade',
    },
    educationInstitution: {
        type: Number,
        ref: 'educationInstitution',
    },
    business: {
        type: Number,
        ref: 'business',
        required: true,
    },
    sector: {
        type: Number,
        ref: 'category',
        required: true,
    },
    subSector: {
        type: Number,
        ref: 'category',
        required: true,
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

vacancySchema.set('toJSON', {
    transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
        if (ret.location) {
            ret.location = ret.location.coordinates;
        }
    }
});


vacancySchema.plugin(autoIncrement.plugin, { model: 'vacancy', startAt: 1 });

export default mongoose.model('vacancy', vacancySchema);