import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const eventSchema=new Schema({
    _id: {
        type: Number,
        required: true
    },
    business:{
        type:Number,
        ref:'business',
        required:true
    },
    educationInstitution:{
        type:Number,
        ref:'educationInstitution',
        required:true
    },
    status: {
        type: String,
        enum:['CURRENT','COMING','PASS'],
        default:'COMING'
    },
    
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    hostname: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    location: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number] },
    },
    contactNumbers: {
        type: [String],
        required: true
    },
    email: {
        type: String,
        required: true
    },
    fromDate: {
        type: Date,
        required: true
    },
    toDate: {
        type: Date,
        required: true
    },
    dailyTimes: [
        new Schema({
            fromDate: {
                type: Date,
                required: true
            },
            toDate: {
                type: Date,
                required: true
            },
        }, { _id: false })
    ],
    time: {
        type: String,
        required: true
    },
    usersParticipants: [{
        type:Number,
        ref:'user',
    }],
    businessParticipants: [{
        type:Number,
        ref:'business',
    }],
    attendance: [{
        type:Number,
        ref:'user',
    }],
    followers: [{
        type:Number,
        ref:'user',
    }],
    deleted:{
        type:Boolean,
        default:false
    },

},{ timestamps: true });
eventSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
eventSchema.plugin(autoIncrement.plugin, { model: 'event', startAt: 1 });

export default mongoose.model('event', eventSchema);