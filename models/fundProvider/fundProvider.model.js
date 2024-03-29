import mongoose,{ Schema} from "mongoose";
import { isImgUrl } from "../../helpers/CheckMethods";
import autoIncrement from 'mongoose-auto-increment';
const fundProviderSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    name_en: {
        type: String,
        trim: true,
        required: true,
    },
    name_ar: {
        type: String,
        trim: true,
        required: true,
    },
    logo: {
        type: String,
        required: true,
    },
    expensesRatio: {
        type: Number,
        default: 0
    },
    monthlyPercentType: {
        type: String,
        enum:['FIXED','BY-PROGRAM'],
        default: 'FIXED'
    },
    oldMonthlyPercent: {
        type: Number,
        required: true,
        default:0
    },
    monthlyPercent: {//نسبه الفائده
        type: Number,
        default:0
    },
    programsPercent: [
        new Schema({
            oldMonthlyPercent: {
                type: Number,
                required: true,
                default:0
            },
            monthlyPercent: {
                type: Number,
                required: true,
            },
            fundProgram: {
                type: Number,
                ref:'fundProgram',
                required: true,
            },
            hasOffer:{
                type:Boolean,
                default:false
            }
            
        }, { _id: false })
    ],
    hasOffer:{
        type:Boolean,
        default:false
    },
    fundProviderOffer: {
        type: Number,
        ref:'fundProviderOffer'
    },
    deleted:{
        type:Boolean,
        default:false
    }
}, { timestamps: true });

fundProviderSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
fundProviderSchema.plugin(autoIncrement.plugin, { model: 'fundProvider', startAt: 1 });

export default mongoose.model('fundProvider', fundProviderSchema);