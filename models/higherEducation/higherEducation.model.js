import mongoose,{ Schema} from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const higherEducationSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    name_en: {
        type: String,
        trim: true,
        required: true,
    },
    name_ar: {
        type: String,
        trim: true,
        required: true,
    },
    deleted:{
        type:Boolean,
        default:false
    }
}, { timestamps: true });

higherEducationSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
higherEducationSchema.plugin(autoIncrement.plugin, { model: 'higherEducation', startAt: 1 });

export default mongoose.model('higherEducation', higherEducationSchema);