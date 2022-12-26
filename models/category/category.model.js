import mongoose, { Schema } from "mongoose";
import { isImgUrl } from "../../helpers/CheckMethods";
import autoIncrement from 'mongoose-auto-increment';
const CategorySchema = new Schema({
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
        required: true,
        enum:['PLACES','EDUCATION','PRODUCTS'],
        default:'PLACES'
    },
    educationType: {
        type: String,
        required: true,
        enum:['SCHOOL','UNIVERSITY','HIGH-ACADEMY','NURSERY','HIGH-CENTER','BASIC-CENTER','INSTITUTE','BASIC-ACADEMY','HIGH','BASIC'],
        default:'SCHOOL'
    },
    priority:{
        type:Number,
        default:0,
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
    details:{
        type:String,
        default:''
    }
}, { discriminatorKey: 'kind', timestamps: true });

CategorySchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.updatedAt;
        delete ret.deleted;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
CategorySchema.plugin(autoIncrement.plugin, { model: 'category', startAt: 1 });

export default mongoose.model('category', CategorySchema);