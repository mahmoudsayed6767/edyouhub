import mongoose, { Schema } from "mongoose";
import { isImgUrl } from "../../helpers/CheckMethods";
import autoIncrement from 'mongoose-auto-increment';
const suppliesSchema=new Schema({
    _id: {
        type: Number,
        required: true
    },
    name_en: {
        type: String,
        required:true
    },
    name_ar: {
        type: String,
        required:true
    },
    attachment:{
        type: String,
        default:"",
        required:true
    },
    educationInstitution: {
        type: Number,
        ref:'educationInstitution',
        required: true,
    },
    educationSystem: {
        type: Number,
        ref:'educationSystem',
        default:1,
    },
    grade: {
        type: Number,
        ref:'grade',
        required: true
    },
    existItems: [{
        type: Number,
        ref:'suppliesItems',
        required:true
    }],
    missingItems: [
        new Schema({
            name_en: {
                type: String,
                required:true
            },
            name_ar: {
                type: String,
                required:true
            },
            count: {
                type: Number,
                default:1,
                required:true
            },

        }, { _id: false })
    ],
    deleted:{
        type:Boolean,
        default:false
    },

},{ timestamps: true });
suppliesSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
suppliesSchema.plugin(autoIncrement.plugin, { model: 'supplies', startAt: 1 });

export default mongoose.model('supplies', suppliesSchema);