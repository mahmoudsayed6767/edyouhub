import mongoose,{ Schema} from "mongoose";
import { isImgUrl } from "../../helpers/CheckMethods";
import autoIncrement from 'mongoose-auto-increment';
const BrandSchema = new Schema({
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
    img: {
        type: String,
        required: true,
    },
    deleted:{
        type:Boolean,
        default:false
    }
}, { timestamps: true });

BrandSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
BrandSchema.plugin(autoIncrement.plugin, { model: 'brand', startAt: 1 });

export default mongoose.model('brand', BrandSchema);