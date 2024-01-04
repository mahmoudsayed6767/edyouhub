import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const eventSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    
    status: {
        type: String,
        enum: ['COMING', 'CURRENT', 'PASS'],
        default: 'COMING'
    },
    privacyType: {
        type: String,
        enum: ['PRIVAET', 'PUBLIC'],
        default: 'PUBLIC'
    },
    accessCode: {
        type: String,
    },
    type: {
        type: String,
        enum: ['ANNONCE', 'TRIP','CAMP','CONCERT','STAGE-EVENT','FAIR','BAZAR'],
        default: 'ANNONCE'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        default: ''
    },
    ownerType: {
        type: String,
        enum: ['BUSINESS', 'APP'],
        default: 'BUSINESS'
    },
    business: {
        type: Number,
        ref: 'business',
    },
    educationInstitution: {
        type: Number,
        ref: 'educationInstitution',
    },
    owners: [
        new Schema({
            name: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            logo: {
                type: String,
                required: true
            },
            website: {
                type: String,
                required: true
            },
            flag: {
                type: String
            },
            appLink: {
                type: String
            },
            
        }, { _id: false })
    ],
    hosts: [
        new Schema({
            name: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            logo: {
                type: String,
                required: true
            },
            website: {
                type: String,
                required: true
            },
            flag: {
                type: String
            },
            appLink: {
                type: String
            },
            
        }, { _id: false })
    ],
    sponsers: [
        new Schema({
            name: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            logo: {
                type: String,
                required: true
            },
            website: {
                type: String,
                required: true
            },
            flag: {
                type: String
            },
            appLink: {
                type: String
            },
            
        }, { _id: false })
    ],
    speakers: [
        new Schema({
            name: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            logo: {
                type: String,
                required: true
            },
            website: {
                type: String,
                required: true
            },
            flag: {
                type: String
            },
            appLink: {
                type: String
            },
            
        }, { _id: false })
    ],
    organizers: [
        new Schema({
            name: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            logo: {
                type: String,
                required: true
            },
            website: {
                type: String,
                required: true
            },
            flag: {
                type: String
            },
            appLink: {
                type: String
            },
            
        }, { _id: false })
    ],
    partners: [
        new Schema({
            name: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            logo: {
                type: String,
                required: true
            },
            website: {
                type: String,
                required: true
            },
            flag: {
                type: String
            },
            appLink: {
                type: String
            },
            
        }, { _id: false })
    ],
    exhibitors: [
        new Schema({
            name: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            logo: {
                type: String,
                required: true
            },
            website: {
                type: String,
                required: true
            },
            flag: {
                type: String
            },
            appLink: {
                type: String
            },
            
        }, { _id: false })
    ],
    daysCount: {
        type: String,
    },
    travelType: {
        type: String,
        enum: ['LOCAL','ABROAD']
    },
    transportation: {
        type: String,
    },
    nationalityType: {
        type: String,
        enum: ['NATIONAL','INTERNAIONAL']
    },

    address: {
        type: String,
        required: true
    },
    location: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number] },
    },
    city: {
        type: Number,
        ref: 'city',
        required: true,
    },
    area: {
        type: Number,
        ref: 'area',
        required: true,
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
    fromDateMillSec: {
        type: Number,
        //required: true
    },
    toDate: {
        type: Date,
        required: true
    },
    toDateMillSec: {
        type: Number,
        //required: true
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
    imgs: [{
        type: String,
    }],
    feesType: {
        type: String,
        enum: ['NO-FEES', 'WITH-FEES'],
        default: 'NO-FEES'
    },
    paymentMethod: {
        type: String,
        enum: ['CASH', 'INSTALLMENT', 'BOTH'],
    },
    tickets: [
        new Schema({
            type: {
                type: String,
                required: true
            },
            cashPrice: {
                type: Number,
            },
            installmentPrice: {
                type: Number,
            },
        }, { _id: false })
    ],
    discountType: {
        type: String,
        enum: ['FIXED', 'RATIO'],
        default: 'RATIO',
    },
    discount: {
        type: Number,
        default: 0
    },
    installments: [
        new Schema({
            price: {
                type: Number,
                required: true
            },
        }, { _id: false })
    ],
    useMap: {
        type: Boolean,
        default: false
    },
    numberOfHalls: {
        type: Number,
        default: 0
    },
    halls: [
        new Schema({
            name: {
                type: String,
                required: true
            },
            numberOfBooths: {
                type: Number,
                required: true
            },
            booths: [
                new Schema({
                    size: {
                        type: String,
                        required: true
                    },
                    number: {
                        type: Number,
                        required: true
                    },
                    exhibitor: {
                        type: Number,
                        required: true
                    },
                }, { _id: false })
            ],
        }, { _id: false })
    ],
    attendance: [{
        type: Number,
        ref: 'user',
    }],
    interesting: [{
        type: Number,
        ref: 'user',
    }],
    waitToPaid: [{
        type: Number,
        ref: 'user',
    }],
    canAccess: [{
        type: Number,
        ref: 'user',
    }],
    
    deleted: {
        type: Boolean,
        default: false
    },

}, { timestamps: true });
eventSchema.set('toJSON', {
    transform: function(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
eventSchema.plugin(autoIncrement.plugin, { model: 'event', startAt: 1 });

export default mongoose.model('event', eventSchema);