import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const feesSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    student: {
        type: Number,
        ref: 'student',
        required: true,
    },
    educationInstitution: {
        type: Number,
        ref: 'educationInstitution',
        required: true,
    },
    status:{
        type: String,
        enum:['PENDING','COMPLETED'],
        default:'PENDING'
    },
    deleted:{
        type:Boolean,
        default:false
    }
});
feesSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});


feesSchema.plugin(autoIncrement.plugin, { model: 'fees', startAt: 1 });

export default mongoose.model('fees', feesSchema);
