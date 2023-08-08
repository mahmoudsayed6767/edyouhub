import mongoose,{ Schema} from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const fundProgramSchema = new Schema({
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
    monthCount: {
        type: Number,
        required: true,
    },
    deleted:{
        type:Boolean,
        default:false
    }
}, { timestamps: true });

fundProgramSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
fundProgramSchema.plugin(autoIncrement.plugin, { model: 'fundProgram', startAt: 1 });

export default mongoose.model('fundProgram', fundProgramSchema);