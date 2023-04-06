import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const serviceSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    business: {
        type: Number,
        ref:'business',
        required: true
    },
    specialization:{
        type: Number,
        ref:'specialization',
        required: true
    },
    imgs: {
        type: [String],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    details: {
        type: String,
        trim: true,
        required: true,
    },
    priceType: {
        type: String,
        enum:['BY-CONTACT','FIXED'],
        default: 'FIXED'
    },
    price: {
        type: String,
    },
    attachment: {
        type: String,
    },
    deleted:{
        type:Boolean,
        default:false
    }
});
serviceSchema.index({ location: '2dsphere' });

serviceSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});


serviceSchema.plugin(autoIncrement.plugin, { model: 'service', startAt: 1 });

export default mongoose.model('service', serviceSchema);
