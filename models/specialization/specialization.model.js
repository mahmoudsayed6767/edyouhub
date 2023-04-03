import mongoose,{ Schema} from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const specializationSchema = new Schema({
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
    type: {
        type: String,
        enum:['FOR-EDUCATION','FOR-SERVICE-PROVIDER','FOR-COURSE'],
        default: 'FOR-EDUCATION'
    },
    deleted:{
        type:Boolean,
        default:false
    }
}, { timestamps: true });

specializationSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
specializationSchema.plugin(autoIncrement.plugin, { model: 'specialization', startAt: 1 });

export default mongoose.model('specialization', specializationSchema);