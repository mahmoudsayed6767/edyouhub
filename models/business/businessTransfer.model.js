import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const businessTransferSchema = new Schema({

    _id: {
        type: Number,
        required: true
    },
    actionUser: {
        type: Number,
        ref: 'user',
        required: true,
    },
    business: {
        type: Number,
        ref: 'business',
        required: true,
    },
    cost: {
        type: Number,
        required: true
    },
    duesBefore: {
        type: Number,
        required: true
    },
    duesAfter: {
        type: Number,
        required: true
    },
    transferImg:{
        type: String,
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    }
});
businessTransferSchema.set('toJSON', {
    transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});


businessTransferSchema.plugin(autoIncrement.plugin, { model: 'businessTransfer', startAt: 1 });

export default mongoose.model('businessTransfer', businessTransferSchema);