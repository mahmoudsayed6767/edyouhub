import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const vacancySchema = new Schema({

    _id: {
        type: Number,
        required: true
    },
    profession: {
        type: String,
        required: true,
        trim: true
    },
    requirements: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    },
    educationInstitution:{
        type: Number,
        ref: 'educationInstitution',
        required: true,
    },
    business: {
        type: Number,
        ref:'business',
        required: true,
    },
    deleted:{
        type:Boolean,
        default:false
    }
});

vacancySchema.set('toJSON', {
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


vacancySchema.plugin(autoIncrement.plugin, { model: 'vacancy', startAt: 1 });

export default mongoose.model('vacancy', vacancySchema);