
import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';

const transactionSchema = new Schema({

    _id: {
        type: Number,
        required: true
    },
    transactionId: {
        type:String,
        required:true
    },
    user:{
        type:Number,
        ref:'user',
        required:true
    },
    fund:{
        type:Number,
        ref:'fund',
    },  
    fees:{
        type:Number,
        ref:'fees',
    }, 
    premiums:{
        type:[Number],
        ref:'premium',
    },
    cashbackPackage:{
        type:Number,
        ref:'cashbackPackage',
    },
    package:{
        type:Number,
        ref:'package',
    },
    oldPackage:{
        type:Number,
        ref:'package',
    },
    business:{
        type:Number,
        ref:'business',
    },
    event:{
        type:Number,
        ref:'event',
    },
    eventAttendance:{
        type:Number,
        ref:'eventAttendance'
    },
    tickets: [//for events
        new Schema({
            name: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            },
            code: {
                type: String,
                default: ""
            }
        }, { _id: false })
    ],
    offer:{//
        type:Number,
        ref:'offer',
    },
    offerBooking:{
        type:Number,
        ref:'offerBooking',
    },
    order:{
        type:Number,
        ref:'order',
    },
    
    course:{
        type:Number,
        ref:'course',
    },
    courseParticipant:{
        type:Number,
        ref:'courseParticipant'
    },
    coursePaymentMethod:{
        type:String,
        enum:['CASH','INSTALLMENT']
    },
    coupon:{
        type:Number,
        ref:'coupon',
    },
    type:{
        type:String,
        required:true,
        enum:["USER-PACKAGE","BUSINESS-PACKAGE","CASHBACK-PACKAGE","ONLINE-COURSE","COURSE-PREMIUM","ON-SITE-COURSE","EVENT","FUND","FEES","FUND-FIRSTPAID","OFFER","ORDER"]
    },

    status:{
        type:String,
        required:true,
        enum:["PENDING","FAILED", "SUCCESS"],
        default:"PENDING"
    },
    dateMillSec:{
        type:Number,
        required:true,
        default:Date.now
    },
    tax:{
        type:Number,
        required:true,
        default:0
    },
    cost:{
        type:Number,
        required:true,
        default:0
    },
    totalCost:{
        type:Number,
        required:true,
        default:0
    },
    coins:{
        type:Number,
        default:50
    },
    paymentObject:{
        type:String,
    },
    paymentMethod:{
        type:String,
    },
    billUrl:{
        type:String,
    },
    edyouhubCommission:{
        type: Number,
        default:0,
    },
    processingFees:{
        type: Number,
        default:10,
    },
    deleted:{
        type:Boolean,
        default:false
    },
});

transactionSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
    }
});



transactionSchema.plugin(autoIncrement.plugin, { model: 'transaction', startAt: 1 });

export default mongoose.model('transaction', transactionSchema);
