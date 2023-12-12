import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';


const verificationRequestSchema = new Schema({

    _id: {
        type: Number,
        required: true
    },
    owner: {
        type: Number,
        ref:'user',
        required: true,
    },
    package: {
        type: Number,
        ref:'package',
        required: true,
    },
    status:{
        type: String,
        enum:['PENDING','ACCEPTED','REJECTED'],
        default:'PENDING'
    },
    accountName:{
        type: String,
        required: true,
    },
    accountNumber:{
        type: String,
        required: true,
    },
    bankName:{
        type: String,
        required: true,
    },
    bankBranch:{
        type: String,
        required: true,
    },
    iban:{
        type: String,
        required: true,
    },
    swiftCode:{
        type: String,
        required: true,
    },
    taxId:{
        type: String,
        required: true,
    },
    key:{
        type: String,
        required: true,
    },
    business: {
        type: Number,
        ref:'business',
        required: true,
    },
    commercialRegistry:{
        type: [String],
        required: true,
    },
    taxId:{
        type: [String],
        required: true,
    },
    managerId:{
        type: [String],
        required: true,
    },
    deleted:{
        type:Boolean,
        default:false
    }
});

verificationRequestSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
        if (ret.location) {
            ret.location = ret.location.coordinates;
        }
    }
});


verificationRequestSchema.plugin(autoIncrement.plugin, { model: 'verificationRequest', startAt: 1 });

export default mongoose.model('verificationRequest', verificationRequestSchema);
