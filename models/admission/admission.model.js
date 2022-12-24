import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const admissionSchema = new Schema({

    _id: {
        type: Number,
        required: true
    },
    status:{
        type: String,
        enum:['PENDING','STARTED','ENDED'],
        default:'PENDING'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    fromDate: {
        type: Date,
        required: true,
    },
    toDate: {
        type: Date,
        required: true,
    },
    maxApplications: {
        type: Number,
        required: true,
    },
    maxAcceptance: {
        type: Number,
        required: true,
    },
    educationSystem: {
        type: Number,
        ref:'educationSystem',
        required: true,
    },
    educationInstitution:{
        type: Number,
        ref: 'educationInstitution',
        required: true,
    },
    business: {
        type: Number,
        ref:'business',
        required: true,
    },
    grades:{
        type: [Number],
        ref: 'grade',
        required: true,
    },
    applications: {
        type: Number,
        default: 0,
    },
    acceptance: {
        type: Number,
        default: 0,
    },
    deleted:{
        type:Boolean,
        default:false
    }
});

admissionSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
        if (ret.location) {
            ret.location = ret.location.coordinates;
        }
    }
});


admissionSchema.plugin(autoIncrement.plugin, { model: 'admission', startAt: 1 });

export default mongoose.model('admission', admissionSchema);
