import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const PackageSchema=new Schema({
    _id: {
        type: Number,
        required: true
    },
    
    title_en:{
        type:String,
        required:true
    },
    title_ar:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        enum:['FOR-USER','FOR-BUSINESS'],
        default:'FOR-USER'
    },
    cost:{
        type:Number,
        default:0,
        required:true,
    },
    badgeType:{
        type:String,
        enum:['GOLD','NORMAL'],
        default:'NORMAL'
    },
    dataView:{
        type:String,
        enum:['FIRST','TOP','NORMAL'],
        default:'NORMAL'
    },
    createEvents:{
        type:Boolean,
        default:false
    },
    createReels:{
        type:Boolean,
        default:false
    },
    createGroups:{
        type:Boolean,
        default:false
    },
    createBusiness:{
        type:Boolean,
        default:false
    },
    enableFollow:{
        type:Boolean,
        default:false
    },
    sendingMessages:{
        type:Boolean,
        default:false
    },
    usersCount:{
        type:Number,
        default:0
    },
    deleted:{
        type:Boolean,
        default:false
    },

},{ timestamps: true });
PackageSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
PackageSchema.plugin(autoIncrement.plugin, { model: 'package', startAt: 1 });

export default mongoose.model('package', PackageSchema);