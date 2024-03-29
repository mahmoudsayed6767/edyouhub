import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const businessSchema = new Schema({

    _id: {
        type: Number,
        required: true
    },
    owner: {
        type: Number,
        ref: 'user',
    },
    type: {
        type: String,
        enum: ['ASSIGNED', 'NOT-ASSIGNED'],
        default: 'ASSIGNED'
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
        default: 'PENDING'
    },
    name_en: {
        type: String,
        required: true,
        trim: true,
    },
    name_ar: {
        type: String,
        trim: true,
        required: true,
    },
    bio_en: {
        type: String,
        required: true,
        trim: true,
    },
    bio_ar: {
        type: String,
        trim: true,
        required: true,
    },
    phones: {
        type: [String],
        trim: true,
        //required: true,
    },
    email: {
        type: String,
        trim: true,
        //required: true,
    },
    img: {
        type: String,
        required: true,
    },
    sector: {
        type: Number,
        ref: 'category',
        required: true,
    },
    subSector: {
        type: Number,
        ref: 'category',
        required: true,
    },
    educationSystem: {
        type: Number,
        ref: 'educationSystem',
        //required: true,
    },
    educationInstitution: { //if accepted
        type: Number,
        ref: 'educationInstitution',
    },
    facebook: {
        type: String,
    },
    twitter: {
        type: String,
    },
    webSite: {
        type: String,
    },
    youTube: {
        type: String,
    },
    instagram: {
        type: String,
    },
    linkedin: {
        type: String,
    },

    studyType: {
        type: String,
        enum: ['LOCAL', 'ABROAD'],
        default: 'LOCAL'
    },
    gallery: {
        type: [String]
    },
    branches: {
        type: [Number],
        ref: 'branche',
    },
    cities: {
        type: [Number],
        ref: 'city',
    },
    areas: {
        type: [Number],
        ref: 'area',
    },
    faculties: {
        type: [Number],
        ref: 'faculty',
    },
    grades: {
        type: [Number],
        ref: 'grade',
    },
    //for academy
    specializations: {
        type: [Number],
        ref: 'specialization',
    },
    //for tutors
    subjects: {
        type: [Number],
        ref: 'subject',
    },
    sessionsPrices: [
        new Schema({
            studentGroup: {
                type: String,
                required: true,
                enum: ['FOR-ONE', 'FOR-TWO', 'FOR-THREE', 'FOR-FOUR']
            },
            price: {
                type: Number,
                required: true,
            },
        }, { _id: false })
    ],
    package: {
        type: Number,
        ref: 'package',
    },
    packageStartDateMillSec: {
        type: Number,
    },
    packageEndDateMillSec: {
        type: Number,
    },
    hasPackage: {
        type: Boolean,
        default: false
    },
    services: {
        type: [String],
        enum: ['FEES-PAYMENT', 'FEES-INSTALLMENT', 'SUPPLIES', 'COURSES'],
    },
    dues: {
        type: Number,
        default: 0
    },
    deleted: {
        type: Boolean,
        default: false
    }
});
businessSchema.set('toJSON', {
    transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});


businessSchema.plugin(autoIncrement.plugin, { model: 'business', startAt: 1 });

export default mongoose.model('business', businessSchema);