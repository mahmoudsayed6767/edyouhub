import mongoose, { Schema } from "mongoose";
import { isImgUrl } from "../../helpers/CheckMethods";
import autoIncrement from 'mongoose-auto-increment';
const alternativeSchema=new Schema({
    _id: {
        type: Number,
        required: true
    },
    product: {
        type: Number,
        ref:'product',
        required:true
    },
    size: {
        type: String,
        required:true
    },
    color: {
        type: Number,
        ref:'color',
        required:true
    },
    count: {
        type: Number,
        required:true
    },
    deleted:{
        type:Boolean,
        default:false
    },

},{ timestamps: true });
alternativeSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
alternativeSchema.plugin(autoIncrement.plugin, { model: 'alternative', startAt: 1 });

export default mongoose.model('alternative',alternativeSchema);