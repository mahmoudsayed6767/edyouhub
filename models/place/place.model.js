import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const placeSchema = new Schema({

    _id: {
        type: Number,
        required: true
    },
    owner: {
        type: Number,
        ref: 'user',
        required: true
    },
    name_ar: {
        type: String,
        trim: true,
        required: true
    },
    name_en: {
        type: String,
        trim: true,
        required: true
    },
    phone: {
        type: String,
        trim: true,
        required: true
    },
    categories: { //shop
        type: [Number],
        ref: 'categories',
    },
    subCategories: { //shop
        type: [Number],
        ref: 'categories',
    },
    cities: {
        type: [Number],
        ref: 'city',
    },
    areas: {
        type: [Number],
        ref: 'area',
    },
    logo: {
        type: String,
        required: true,
    },
    cover: {
        type: String,
        required: true,
    },
    branches: { //shop
        type: [Number],
        ref: 'branch',
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true, discriminatorKey: 'kind' });
placeSchema.index({ location: '2dsphere' });

placeSchema.set('toJSON', {
    transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});


placeSchema.plugin(autoIncrement.plugin, { model: 'place', startAt: 1 });

export default mongoose.model('place', placeSchema);