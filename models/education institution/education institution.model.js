import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const educationInstitutionSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    educationInstitution_en: {
        type: String,
        required: true,
        trim: true,
    },
    educationInstitution_ar: {
        type: String,
        trim: true,
        required: true,
    },
    educationPhase: {
        type: Number,
        ref: 'educationPhase',
        required: true,
        default: 1,
    },
    educationSystem: {
        type: Number,
        ref:'educationSystem',
        required: true,
    },
    img: {
        type: String,
        required: true,
    },
    deleted:{
        type:Boolean,
        default:false
    }
});
educationInstitutionSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});


educationInstitutionSchema.plugin(autoIncrement.plugin, { model: 'educationInstitution', startAt: 1 });

export default mongoose.model('educationInstitution', educationInstitutionSchema);
