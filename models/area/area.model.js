import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const areaSchema = new Schema({

    _id: {
        type: Number,
        required: true
    },
    name_en: {
        type: String,
        required: true,
        trim: true
    },
    name_ar: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: Number,
        ref: 'city',
        required: true
    },
    deleted:{
        type:Boolean,
        default:false
    }
});

areaSchema.set('toJSON', {
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


areaSchema.plugin(autoIncrement.plugin, { model: 'area', startAt: 1 });

export default mongoose.model('area', areaSchema);
