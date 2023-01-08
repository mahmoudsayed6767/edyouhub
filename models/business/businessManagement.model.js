import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const businessManagementSchema = new Schema({

    _id: {
        type: Number,
        required: true
    },
    business: {
        type: Number,
        ref:'business',
        required: true,
    },
    vacancy: {
        supervisors: {
            type: [Number],
            ref:'user'
        },
        acceptanceLetter:{
            type: String,
            required: true,
            trim: true,
        },
        rejectionLetter:{
            type: String,
            required: true,
            trim: true,
        },
    },
    admission: {
        supervisors: {
            type: [Number],
            ref:'user'
        },
        acceptanceLetter:{
            type: String,
            required: true,
            trim: true,
        },
        rejectionLetter:{
            type: String,
            required: true,
            trim: true,
        },
    },
    
    deleted:{
        type:Boolean,
        default:false
    }
});
businessManagementSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});


businessManagementSchema.plugin(autoIncrement.plugin, { model: 'businessManagement', startAt: 1 });

export default mongoose.model('businessManagement', businessManagementSchema);
