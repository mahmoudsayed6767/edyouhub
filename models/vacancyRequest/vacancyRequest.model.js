import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const vacancyRequestSchema = new Schema({

    _id: {
        type: Number,
        required: true
    },
    owner: {
        type: Number,
        ref:'user',
        required: true,
    },
    status:{
        type: String,
        enum:['PENDING','ACCEPTED','REJECTED'],
        default:'PENDING'
    },
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
    },
    type:{
        type: String,
        enum:['WAITING-LIST','ON-VACANCY'],
        default:'ON-VACANCY'
    },
    vacancy: {
        type: Number,
        ref:'vacancy',
    },
    business: {
        type: Number,
        ref:'business',
        required: true,
    },
    attachment: {
        type: String,
        required: true,
    },
    
    deleted:{
        type:Boolean,
        default:false
    }
});

vacancyRequestSchema.set('toJSON', {
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


vacancyRequestSchema.plugin(autoIncrement.plugin, { model: 'vacancyRequest', startAt: 1 });

export default mongoose.model('vacancyRequest', vacancyRequestSchema);
