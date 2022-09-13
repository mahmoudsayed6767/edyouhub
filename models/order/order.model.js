import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const OrderSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    client: {
        type: Number,
        ref: 'user',
        required:true
    },
    total: {
        type: Number,
        required: true
    },
    delivaryCost: {
        type: Number,
        required: true
    },
    finalTotal:{
        type: Number,
        required: true,
        default:0
    },
    totalDiscount:{
        type: Number,
        required: true,
        default:0
    },
    
    destination: {
        type: { type: String, enum: 'Point' },
        coordinates: { type: [Number] }
    },
    address: {
        type: Number,
        ref:'address',
        default:1,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACCEPTED','CANCELED','REFUSED','OUT-FOR-DELIVERY', 'DELIVERED'],
        default: 'ACCEPTED'
    },
    paymentSystem:{
        type: String,
        enum: ['cash', 'online'],
        default:'cash'
    },
    gender: {
        type: String,
        enum: ['MALE','FEMALE','OTHER'],
        default: 'MALE'
    },
    accept:{
        type:Boolean,
        default:false
    },
    
    suppliesList: [
        new Schema({
            promoCode: {
                type: Number,
                ref:'coupon',
            },
            discount:{
                type: Number,
                required: true,
                default:0
            },
            supplies: {
                type: Number,
                ref: 'supplies',
                required: true
            },
            items: [
                new Schema({
                    product: {
                        type: Number,
                        ref: 'product',
                        required: true
                    },
                    unitCost: {// price of single product
                        type: Number,
                    },
                    color: {
                        type: Number,
                        ref: 'color',
                        //required: true
                    },
                    size: {
                        type: String,
                        required: true
                    },
                    count: {
                        type: Number,
                        default: 1
                    },
        
                }, { _id: false })
            ],

        }, { _id: false })
    ],
    
    reason:{
        type:String
    },
    
    refusedDateMillSec:{
        type:Number,
    },
    cancelDateMillSec:{
        type:Number,
    },
    outForDeliveryDateMillSec:{
        type:Number,
    },
    deliveredDateMillSec:{
        type:Number,
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

OrderSchema.index({ location: '2dsphere' });
OrderSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        if (ret.destination) {
            ret.destination = ret.destination.coordinates;
        }
    }
});
autoIncrement.initialize(mongoose.connection);
OrderSchema.plugin(autoIncrement.plugin, { model: 'order', startAt: 1 });

export default mongoose.model('order', OrderSchema);