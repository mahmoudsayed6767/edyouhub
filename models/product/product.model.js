import mongoose, { Schema } from "mongoose";
import { isImgUrl } from "../../helpers/CheckMethods";
import autoIncrement from 'mongoose-auto-increment';
const ProductSchema=new Schema({
    _id: {
        type: Number,
        required: true
    },
    name_en: {
        type: String,
        required: true
    },
    name_ar: {
        type: String,
        required: true
    },
    sku: {//barecode
        type: String,
        default:"#"
    },
    quantity:{
        type:Number,
        default:10000
    },
    colors: {
        type: [Number],
        ref: 'color'
    },
    sizes: [
        new Schema({
            index: {
                type: Number,
                required:true
            },
            name_en: {
                type: String,
                required:true
            },
            name_ar: {
                type: String,
                required:true
            },
            retailPrice: {//سعر التجزأه
                type: Number,
                required:true
            },
            costPrice: {//سعر التكلفه
                type: Number,
                required:true
            },
            count: {
                type: Number,
                default:10000
            },

        }, { _id: false })
    ],
    brand: {
        type: Number,
        ref: 'brand',
    },
    category: {
        type: Number,
        ref: 'category',
        required:true
    },
    subCategory: {
        type: Number,
        ref: 'sub-category',
        //required:true
    },
    img: [{
        type: String,
        default:'https://res.cloudinary.com/boody-car/image/upload/v1660681692/er00mcran8jh3zlmbtvf.png'
    }],
    description_ar:{
        type:String,
        required:true
    },
    description_en:{
        type:String,
        required:true
    },
    available:{
        type:Boolean,
        default:true
    },
    sallCount:{
        type: Number,
        default: 0
    },
    deleted:{
        type:Boolean,
        default:false
    },

},{ timestamps: true });
ProductSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
ProductSchema.plugin(autoIncrement.plugin, { model: 'product', startAt: 1 });

export default mongoose.model('product', ProductSchema);