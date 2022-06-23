import mongoose, { Schema } from "mongoose";
import category from "./category.model";
const subCategorySchema = new Schema({
    parent: {
        type: Number,
        ref:'category'
    },
    
    details:{
        type:String,
        default:''
    }
}, { discriminatorKey: 'kind', _id: false });


export default category.discriminator('sub-category', subCategorySchema);