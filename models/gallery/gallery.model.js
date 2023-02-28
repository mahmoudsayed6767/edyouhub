import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const gallerySchema = new Schema({

    _id: {
        type: Number,
        required: true
    },
    business: {
        type: Number,
        ref:'business',
        required: true
    },
    imgs: {
        type: [String],
        required: true

    },
    title_en: {
        type: String,
        required: true,
        trim: true,
    },
    title_ar: {
        type: String,
        trim: true,
        required: true,
    },
    deleted:{
        type:Boolean,
        default:false
    }
});
gallerySchema.index({ location: '2dsphere' });

gallerySchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});


gallerySchema.plugin(autoIncrement.plugin, { model: 'gallery', startAt: 1 });

export default mongoose.model('gallery', gallerySchema);
