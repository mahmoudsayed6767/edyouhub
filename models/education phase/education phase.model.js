import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const educationPhaseSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    educationPhase_en: {
        type: String,
        required: true,
        trim: true,
    },
    educationPhase_ar: {
        type: String,
        trim: true,
        required: true,
    },
    deleted:{
        type:Boolean,
        default:false
    }
});
educationPhaseSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});


educationPhaseSchema.plugin(autoIncrement.plugin, { model: 'educationPhase', startAt: 1 });

export default mongoose.model('educationPhase', educationPhaseSchema);
