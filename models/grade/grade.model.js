import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const gradeSchema = new Schema({

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
        //required: true,
    },
    business: {
        type: Number,
        ref:'business',
        //required: true,
    },
    faculty: {
        type: Number,
        ref:'faculty',
        //required: true,
    },
    cost: {
        type: Number,
        required: true,
        default:0
    },
    deleted:{
        type:Boolean,
        default:false
    }
});

gradeSchema.set('toJSON', {
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


gradeSchema.plugin(autoIncrement.plugin, { model: 'grade', startAt: 1 });

export default mongoose.model('grade', gradeSchema);
