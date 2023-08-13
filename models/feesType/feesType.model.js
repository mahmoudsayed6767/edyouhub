import mongoose,{ Schema} from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const feesTypeSchema = new Schema({
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

feesTypeSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
feesTypeSchema.plugin(autoIncrement.plugin, { model: 'feesType', startAt: 1 });

export default mongoose.model('feesType', feesTypeSchema);