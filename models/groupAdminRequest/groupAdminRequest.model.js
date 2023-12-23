import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const groupAdminRequestSchema = new Schema({

    _id: {
        type: Number,
        required: true
    },
    from: {
        type: Number,
        ref:'user',
        required: true,
    },
    to: {
        type: Number,
        ref:'user',
        required: true,
    },
    status:{
        type: String,
        enum:['PENDING','ACCEPTED','REJECTED'],
        default:'PENDING'
    },
    group: {
        type: Number,
        ref:'group',
        required: true,
    },
    deleted:{
        type:Boolean,
        default:false
    }
});

groupAdminRequestSchema.set('toJSON', {
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


groupAdminRequestSchema.plugin(autoIncrement.plugin, { model: 'groupAdminRequest', startAt: 1 });

export default mongoose.model('groupAdminRequest', groupAdminRequestSchema);
