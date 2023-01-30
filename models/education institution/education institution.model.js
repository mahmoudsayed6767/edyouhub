import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const educationInstitutionSchema = new Schema({
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
    services:{
        type: [String],
        enum: ['FUND','FEES','SUPPLIES'],
        required: true,
    },
    sector: {
        type: Number,
        ref:'category',
        required: true,
    },
    subSector: {
        type: Number,
        ref:'category',
        required: true,
    },
    educationSystem: {
        type: Number,
        ref:'educationSystem',
        //required: true,
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
