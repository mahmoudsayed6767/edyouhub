import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const facultySchema = new Schema({

    _id: {
        type: Number,
        required: true
    },
    name_en: {
        type: String,
        required: true,
        trim: true
    },
    name_ar: {
        type: String,
        required: true,
        trim: true
    },
    educationSystem: {
        type: Number,
        ref:'educationSystem',
        required: true,
    },
    educationInstitution:{
        type: Number,
        ref: 'educationInstitution',
    },
    grades:{
        type: [Number],
        ref: 'grade',
    },
    business: {
        type: Number,
        ref:'business',
        required: true,
    },
    deleted:{
        type:Boolean,
        default:false
    }
});

facultySchema.set('toJSON', {
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


facultySchema.plugin(autoIncrement.plugin, { model: 'faculty', startAt: 1 });

export default mongoose.model('faculty', facultySchema);
