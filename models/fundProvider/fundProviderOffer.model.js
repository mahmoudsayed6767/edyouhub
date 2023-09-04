import mongoose,{ Schema} from "mongoose";
import { isImgUrl } from "../../helpers/CheckMethods";
import autoIncrement from 'mongoose-auto-increment';
const fundProviderOfferSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    title_en: {
        type: String,
        trim: true,
        required: true,
    },
    title_ar: {
        type: String,
        trim: true,
        required: true,
    },
    offerType: {
        type: String,
        enum:['ALL-PROGRAM','BY-PROGRAM'],
        default: 'ALL-PROGRAM'
    },
    fundProvider: {
        type: Number,
        ref:'fundProvider',
        required: true,
    },
    monthlyPercent: {
        type: Number,
        default:10
    },
    programsPercent: [
        new Schema({
            monthlyPercent: {
                type: Number,
                required: true,
            },
            fundProgram: {
                type: Number,
                ref:'fundProgram',
                required: true,
            },
            
        }, { _id: false })
    ],
    status: {
        type: String,
        enum:['PENDING','ACTIVE','ENDED'],
        default: 'PENDING'
    },
    startDate: {
        type: Date,
        required: true,
    },
    startDateMillSec: {
        type: Number,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    endDateMillSec: {
        type: Number,
        required: true,
    },
    deleted:{
        type:Boolean,
        default:false
    }
}, { timestamps: true });

fundProviderOfferSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
fundProviderOfferSchema.plugin(autoIncrement.plugin, { model: 'fundProviderOffer', startAt: 1 });

export default mongoose.model('fundProviderOffer', fundProviderOfferSchema);