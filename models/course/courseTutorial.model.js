import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const courseTutorialSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    course: {
        type: Number,
        ref: 'course',
        required: true
    },
    section_en: {
        type: String,
        required: true,
        trim: true,
    },
    section_ar: {
        type: String,
        trim: true,
        required: true,
    },
    videos: {
        type: [String],
        trim: true,
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

courseTutorialSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});
autoIncrement.initialize(mongoose.connection);
courseTutorialSchema.plugin(autoIncrement.plugin, { model: 'courseTutorial', startAt: 1 });

export default mongoose.model('courseTutorial', courseTutorialSchema);