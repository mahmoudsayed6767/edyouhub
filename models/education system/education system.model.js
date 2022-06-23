import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const educationSystemSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    name_en: {
        type: String,
        required: true,
        trim: true,
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
});
educationSystemSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});


educationSystemSchema.plugin(autoIncrement.plugin, { model: 'educationSystem', startAt: 1 });

export default mongoose.model('educationSystem', educationSystemSchema);
