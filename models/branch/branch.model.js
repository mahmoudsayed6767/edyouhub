import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const branchSchema = new Schema({

    _id: {
        type: Number,
        required: true
    },
    place: {
        type: Number,
        ref:'user',
        required: true
    },
    img: {
        type: String,
        //required: true,
    },
    country: {
        type: Number,
        ref:'country',
        required: true,
        default:1
    },
    city: {
        type: Number,
        ref:'city',
        required: true
    },
    area: {
        type: Number,
        ref:'area',
        required: true
    },
    address_en: {
        type: String,
        required: true,
        trim: true,
    },
    address_ar: {
        type: String,
        trim: true,
        required: true,
    },
    phone: {
        type: String,
        trim: true,
        required: true,
    },
    location: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number] },
    },
    deleted:{
        type:Boolean,
        default:false
    }
});
branchSchema.index({ location: '2dsphere' });

branchSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
        if (ret.location) {
            ret.location = ret.location.coordinates;
        }
    }
});


branchSchema.plugin(autoIncrement.plugin, { model: 'branch', startAt: 1 });

export default mongoose.model('branch', branchSchema);
