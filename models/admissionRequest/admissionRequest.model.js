import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const admissionRequestSchema = new Schema({

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
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    secondName: {
        type: String,
        required: true,
        trim: true
    },
    familyName: {
        type: String,
        required: true,
        trim: true
    },
    birthday: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: true,
    },
    admission: {
        type: Number,
        ref:'addmission',
        required: true,
    },
    business: {
        type: Number,
        ref:'business',
        required: true,
    },
    grade:{
        type: Number,
        ref: 'grade',
        required: true,
    },
    country:{
        type: Number,
        ref: 'country',
        required: true,
    },
    city:{
        type: Number,
        ref: 'city',
        required: true,
    },
    area:{
        type: Number,
        ref: 'area',
        required: true,
    },
    fatherInfo:{
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        secondName: {
            type: String,
            required: true,
            trim: true
        },
        familyName: {
            type: String,
            required: true,
            trim: true
        },
        age: {
            type: Number,
            required: true,
        },
        profession: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
    },
    motherInfo:{
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        secondName: {
            type: String,
            required: true,
            trim: true
        },
        familyName: {
            type: String,
            required: true,
            trim: true
        },
        age: {
            type: Number,
            required: true,
        },
        profession: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        },
    },
    haveSibling:{
        type:Boolean,
        default:false
    },
    deleted:{
        type:Boolean,
        default:false
    }
});

admissionRequestSchema.set('toJSON', {
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


admissionRequestSchema.plugin(autoIncrement.plugin, { model: 'admissionRequest', startAt: 1 });

export default mongoose.model('admissionRequest', admissionRequestSchema);
