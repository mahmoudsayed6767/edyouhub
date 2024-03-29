import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const studentSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    studentId: {
        type: String,
    },
    type:{
        type: String,//مؤسسه دراسيه مسجله- مؤسسه خارجيه غير مسجله
        enum:['INSIDE-INSTITUTION','OUTSIDE-INSTITUTION'],
        default: 'INSIDE-INSTITUTION'
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
        ref: 'educationSystem',
        //required: true
    },
    educationInstitution: {
        type: Number,
        ref: 'educationInstitution',
    },
    educationInstitutionName:{
        type: String,
    },
    grade: {
        type: Number,
        ref:'grade',
        //required: true
    },
    feesLetter: {//مستند مالى
        type: [String],
        //required: true
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

studentSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});
autoIncrement.initialize(mongoose.connection);
studentSchema.plugin(autoIncrement.plugin, { model: 'student', startAt: 1 });

export default mongoose.model('student', studentSchema);