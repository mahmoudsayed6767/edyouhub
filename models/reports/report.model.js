import mongoose,{ Schema} from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const ReportSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    action: {
        type: String,
        trim: true,
        required: true,
    },
    user:{
        type:Number,
        ref:'user'
    },
    type:{
        type:String,
        enum:['ANONCEMENTS','FUND-PROVIDER','MESSAGE','SERVICE','GROUP','GROUP-REQUEST','SUBSCRIBE-REQUEST','COURSE','SUBJECT','POSTS','EVENT','STORY','COURSES','GALLERY','LIKES','COMMENTS','ANSWER','FOLLOW','CONNECTION','HIGHER-EDUCATION','INDIVIDUAL-SUPPLIES','GRADE','COLORS','BRANCH','ADMISSION','VACANCY','ADMISSION-REQUEST','VACANCY-REQUEST','SPECIALIZATION','BRANDS','COUPONS','PRODUCTS','ORDERS','CART','SUPPLIES','PAYMENT','COUNTRIES','AREAS','CITIES','EDUCATION-SYSTEM','FUND','FEES','PREMIUMS','STUDENTS','PACKAGES','EDUCATION-PHASE','EDUCATION-INSTITUTION','BUSINESS','USERS','ABOUT','BILLS','CONTACT-US','DEVICES','FAVOURITES','NOTIFS','OFFERS','SETTINGS','TERMS','CATEGORIES','PLACES'],
        default:'USER'
    },
    deepId:{
        type:Number,
    },
    deleted:{
        type:Boolean,
        default:false
    }
}, { timestamps: true, discriminatorKey: 'kind' });

ReportSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
ReportSchema.plugin(autoIncrement.plugin, { model: 'report', startAt: 1 });

export default mongoose.model('report', ReportSchema);