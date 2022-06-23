import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const businessSchema = new Schema({

    _id: {
        type: Number,
        required: true
    },
    owner: {
        type: Number,
        ref:'user',
        required: true,
    },
    status:{
        type: String,
        enum:['PENDING','ACCEPTED','REJECTED'],
        default:'PENDING'
    },
    businessName_en: {
        type: String,
        required: true,
        trim: true,
    },
    businessName_ar: {
        type: String,
        trim: true,
        required: true,
    },
    webSite: {
        type: String,
        trim: true,
        required: true,
    },
    img: {
        type: String,
        required: true,
    },
    educationSystem: {
        type: Number,
        ref:'educationSystem',
        required: true,
    },
    category: {
        type: Number,
        ref:'category',
        required: true,
    },
    subCategory: {
        type: Number,
        ref:'category',
        required: true,
    },
    country: {
        type: Number,
        ref: 'country',
        required: true,
    },
    city: {
        type: Number,
        ref: 'city',
        required: true,
    },
    area: {
        type: Number,
        ref: 'area',
        required: true,
    },
    deleted:{
        type:Boolean,
        default:false
    }
});
businessSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});


businessSchema.plugin(autoIncrement.plugin, { model: 'business', startAt: 1 });

export default mongoose.model('business', businessSchema);
