import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const individualSuppliesSchema=new Schema({
    _id: {
        type: Number,
        required: true
    },
    user: {
        type: Number,
        ref:'user',
        required: true
    },
    fullname: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    attachment:{
        type: [String],
        required:true
    },
    educationInstitution: {
        type: String,
        required: true,
    },
    grade: {
        type: String,
        required: true
    },
    deleted:{
        type:Boolean,
        default:false
    },

},{ timestamps: true });
individualSuppliesSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
individualSuppliesSchema.plugin(autoIncrement.plugin, { model: 'individualSupplies', startAt: 1 });

export default mongoose.model('individualSupplies', individualSuppliesSchema);