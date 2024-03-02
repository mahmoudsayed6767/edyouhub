import mongoose,{ Schema} from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const SettingSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    monthCount: {
        type: Number,
        default:12,
        required: true
    },
    cashBackRatio: {
        type: Number,
        default:15,
        required: true
    },
    feesCashBackRatio:{
        type: Number,
        default:5,
        required: true
    },
    courseCashBackRatio:{
        type: Number,
        default:10,
        required: true
    },
    eventCashBackRatio:{
        type: Number,
        default:10,
        required: true
    },
    affiliateRatio:{
        type: Number,
        default:5,
        required: true
    },
    expensesRatio: {
        type: Number,
        default:10,
        required: true
    },
    iosAppVersion:{
        type: String,
        required: true,
        default:"1V"
    },
    androidAppVersion:{
        type: String,
        required: true,
        default:"1V"
    },
    onlineCoursesRatio:{
        type: Number,
        default:10,
        required: true
    },
    onsiteCoursesRatio:{
        type: Number,
        default:10,
        required: true
    },
    eventsRatio:{
        type: Number,
        default:10,
        required: true
    },
    feesPaymentRatio:{
        type: Number,
        default:10,
        required: true
    },
    fundRatio:{
        type: Number,
        default:10,
        required: true
    },
    processingFees:{
        type: Number,
        default:5,
        required: true
    },
    deleted:{
        type:Boolean,
        default:false
    }
}, { timestamps: true });

SettingSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
SettingSchema.plugin(autoIncrement.plugin, { model: 'setting', startAt: 1 });

export default mongoose.model('setting', SettingSchema);