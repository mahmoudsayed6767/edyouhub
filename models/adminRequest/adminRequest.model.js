import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const adminRequestSchema = new Schema({

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
    service:{
        type: String,
        enum:['ADMISSION', 'VACANCY', 'EVENT', 'COURSES'],
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

adminRequestSchema.set('toJSON', {
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


adminRequestSchema.plugin(autoIncrement.plugin, { model: 'adminRequest', startAt: 1 });

export default mongoose.model('adminRequest', adminRequestSchema);
