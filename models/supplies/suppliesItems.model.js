import mongoose, { Schema } from "mongoose";
import { isImgUrl } from "../../helpers/CheckMethods";
import autoIncrement from 'mongoose-auto-increment';
const suppliesItemsSchema=new Schema({
    _id: {
        type: Number,
        required: true
    },
    section_en: {
        type: String,
        required:true,
        default:'health'
    },
    section_ar: {
        type: String,
        required:true,
        default:'صحى'
    },
    type:{
        type: String,
        enum: ['STATIONERIES','HEALTH'],
        default:'STATIONERIES',
        required:true
    },
    items: [
        new Schema({
            product: {
                type: Number,
                ref:'product',
                required:true
            },
            alternatives:[{
                type: Number,
                ref:'alternative',
            }],
            size: {//index in sizes array
                type: String,
                required:true
            },
            color: {
                type: Number,
                ref:'color',
                //required:true
            },
            count: {
                type: Number,
                required:true
            },
        }, { _id: false })
    ],
    deleted:{
        type:Boolean,
        default:false
    },

},{ timestamps: true });
suppliesItemsSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
suppliesItemsSchema.plugin(autoIncrement.plugin, { model: 'suppliesItems', startAt: 1 });

export default mongoose.model('suppliesItems',suppliesItemsSchema);