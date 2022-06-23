import mongoose, { Schema } from "mongoose";
import { isImgUrl } from "../../helpers/CheckMethods";
import autoIncrement from 'mongoose-auto-increment';
const categorySchema = new Schema({
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
        validate: {
            validator: imgUrl => isImgUrl(imgUrl),
            message: 'img is invalid url'
        }
    },
    hasChild: {
        type: Boolean,
        default: false
    },
    child:{
        type:[Number]
    },
    main: {
        type: Boolean,
        default: false
    }, 
    deleted: {
        type: Boolean,
        default: false
    },
}, { discriminatorKey: 'kind', timestamps: true });

categorySchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.updatedAt;
        delete ret.deleted;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
categorySchema.plugin(autoIncrement.plugin, { model: 'category', startAt: 1 });

export default mongoose.model('category', categorySchema);