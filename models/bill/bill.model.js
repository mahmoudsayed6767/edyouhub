import mongoose,{ Schema} from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const BillSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    client:{
        type:Number,
        ref:'user',
        required: true
    },
    place:{
        type:Number,
        ref:'place',
        required: true
    },
    offer:{
        type:Number,
        ref:'offer',
        required: true
    },
    actionUser:{
        type:Number,
        ref:'user',
        //required: true
    },
    offerCode:{
        type:String,
        required:true
    },
    status: {
        type: String,
        enum: ['PENDING','DONE'],
        default: 'PENDING',
        required:true
    },
    doneDateMillSec: {
        type: Number,
    },
    deleted:{
        type:Boolean,
        default:false
    }
}, { timestamps: true });

BillSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
BillSchema.plugin(autoIncrement.plugin, { model: 'bill', startAt: 1 });

export default mongoose.model('bill', BillSchema);