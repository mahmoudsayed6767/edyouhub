import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const cashBackHistorySchema = new Schema({

    _id: {
        type: Number,
        required: true
    },
    description_en: {
        type: String,
        required: true,
        trim: true
    },
    description_ar: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: Number,
        ref: 'user',
        required: true
    },
    type: {
        type: String,
        enum:['GET','PAY'],
        required: true,
    },
    fund: {
        type: Number,
        ref: 'fund',
    },
    fees: {
        type: Number,
        ref: 'fund',
    },
    fund: {
        type: Number,
        ref: 'fund',
    },
    offer: {
        type: Number,
        ref: 'offer',
    },
    package: {
        type: Number,
        ref: 'package',
    },
    deleted:{
        type:Boolean,
        default:false
    }
});

cashBackHistorySchema.set('toJSON', {
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


cashBackHistorySchema.plugin(autoIncrement.plugin, { model: 'cashBackHistory', startAt: 1 });

export default mongoose.model('cashBackHistory', cashBackHistorySchema);
