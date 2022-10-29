
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
        ref:'booking',
    },   
    premiums:{
        type:[Number],
        ref:'premium',
    },
    package:{
        type:Number,
        ref:'package',
    },
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
    type:{
        type:String,
        required:true,
        enum:["PACKAGE","PREMIUM","FUND-FIRSTPAID","OFFER","ORDER"]
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
