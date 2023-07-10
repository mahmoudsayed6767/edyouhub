import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';

const storySchema = new Schema({

    _id: {
        type: Number,
        required: true
    },
    business: {
        type: Number,
        ref:'business',
    },
    video: {
        type: String,
        required: true
    },
    preview: {
        type: String,
        required: true
    },
    title:{
        type: String,
    },
    content: {
        type: String,
    },
    type: {
        type: String,
        enum:['BUSINESS','APP'],
        default:'APP'
    },
    expireDateMillSec:{
        type:Number, 
        required:true,
    },
    end:{
        type:Boolean,
        default:false
    },
    deleted:{
        type:Boolean,
        default:false
    }
});
storySchema.index({ location: '2dsphere' });

storySchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});


storySchema.plugin(autoIncrement.plugin, { model: 'story', startAt: 1 });

export default mongoose.model('story', storySchema);
