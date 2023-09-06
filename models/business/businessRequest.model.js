import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const businessRequestSchema = new Schema({

    _id: {
        type: Number,
        required: true
    },
    owner: {
        type: Number,
        ref: 'user',
        required: true,
    },
    business: {
        type: Number,
        ref: 'business',
        required: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        default: 'PENDING'
    },
    
    deleted: {
        type: Boolean,
        default: false
    }
});
businessRequestSchema.set('toJSON', {
    transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});


businessRequestSchema.plugin(autoIncrement.plugin, { model: 'businessRequest', startAt: 1 });

export default mongoose.model('businessRequest', businessRequestSchema);