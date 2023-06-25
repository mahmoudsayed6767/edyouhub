import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const postSchema=new Schema({
    _id: {
        type: Number,
        required: true
    },
    viewPlaceType:{
        type: String,
        enum:['WALL', 'BOARD'],
        default:'WALL'
    },
    status:{
        type: String,
        enum:['PENDING', 'ACCEPTED','REJECTED'],
        default:'ACCEPTED'
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
    dataType:{
        type: String,
        enum:['IMAGE', 'VIDEO','FILE','TEXT','LINK'],
        default:'TEXT',
    },
    content:{
        type: String,
    },
    files: [
        new Schema({
            dataType:{
                type: String,
                enum:['IMAGE', 'VIDEO','FILE'],
                required:true,
            },
            link: {
                type: String,
                required:true,
            },
            preview: {
                type: String,
            },
            title: {
                type: String,
            },
            duration: {
                type: String,
            },
        }, { _id: false })
        
    ],
    options: {
        type: [Number],
        ref:'option',
    },
    type:{
        type: String,
        enum:['VACANCY','ADMISSION','EVENT', 'ANONCEMENT','GENERAL','EXPERICENCE','VOTE','REQUEST-RECOMMENDATION','GIVE-RECOMMENDATION','HELP','DISCUSSION'],
        default:'GENERAL',
    },
    group: {
        type: Number,
        ref:'group',
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
    likedList: {
        type: [Number],
        ref:'user',
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