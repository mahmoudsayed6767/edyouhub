import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const optionSchema=new Schema({
    _id: {
        type: Number,
        required: true
    },
    title:{
        type: String,
    },
    post: {
        type: Number,
        ref:'post',
    },
    chosenUsers: {
        type: [Number],
        ref:'user',
    },
    chosenCount:{
        type:Number,
        default:0
    },
    deleted:{
        type:Boolean,
        default:false
    },

},{ timestamps: true });
optionSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
optionSchema.plugin(autoIncrement.plugin, { model: 'option', startAt: 1 });

export default mongoose.model('option', optionSchema);