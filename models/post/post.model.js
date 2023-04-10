import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const postSchema=new Schema({
    _id: {
        type: Number,
        required: true
    },
    
    owner: {
        type: Number,
        ref:'user',
        required: true
    },
    business: {
        type: Number,
        ref:'business',
    },
    ownerType:{
        type: String,
        enum:['USER', 'BUSINESS','APP'],
        default:'USER'
    },
    content:{
        type: String,
    },
    files:{
        type: [String],
    },
    dataType:{
        type: String,
        enum:['IMAGE', 'VIDEO','FILE'],
    },
    options: {
        type: [Number],
        ref:'option',
    },
    type:{
        type: String,
        enum:['VACANCY','ADMISSION','EVENT', 'ANONCEMENT','GENERAL','VOTE','REQUEST-RECOMMENDATION','GIVE-RECOMMENDATION','HELP','DISCUSSION'],
        default:'GENERAL',
    },
    event: {
        type: Number,
        ref:'event',
    },
    admission: {
        type: Number,
        ref:'admission',
    },
    vacancy: {
        type: Number,
        ref:'vacancy',
    },
    likesCount:{
        type:Number,
        default:0
    },
    commentsCount:{
        type:Number,
        default:0
    },
    deleted:{
        type:Boolean,
        default:false
    },

},{ timestamps: true });
postSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
postSchema.plugin(autoIncrement.plugin, { model: 'post', startAt: 1 });

export default mongoose.model('post', postSchema);