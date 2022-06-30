
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
    offer:{
        type:Number,
        ref:'offer',
    },
    type:{
        type:String,
        required:true,
        enum:["PACKAGE","PREMIUM","FUND-FIRSTPAID","OFFER"]
    },

    status:{
        type:String,
        required:true,
        enum:["FAILED", "SUCCESS"],
        default:"FAILED"
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
    paymentObject:{
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
