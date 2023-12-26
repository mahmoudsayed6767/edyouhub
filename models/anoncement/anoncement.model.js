import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const AnoncementSchema=new Schema({
    _id: {
        type: Number,
        required: true
    },
    imgs: {
        type: [String],
        required: true,
    },
    link:{
        type: String,
        required: true,
    },
    viewOn:{
        type: String,
        enum:['CATEGORIES','HOME','BOARD','COURSES','POSTS','DIRECTORIES','GROUPS'],
        default: 'HOME',
    },
    type:{
        type: String,
        enum:['NORMAL','STATIC', 'DISPLAY'],
        default: 'NORMAL',
    },
    startDateMillSec:{
        type: Number,
        //required: true,
    },
    endDateMillSec:{
        type: Number,
        //required: true,
    },
    end:{
        type:Boolean,
        default:false
    },
    openPeriod:{
        type:Boolean,
        default:true
    },
    priority:{
        type:Number,
        default:0
    },
    group:{
        type:Number,
        ref:'group'
    },
    deleted:{
        type:Boolean,
        default:false
    },

},{ timestamps: true });
AnoncementSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
AnoncementSchema.plugin(autoIncrement.plugin, { model: 'anoncement', startAt: 1 });

export default mongoose.model('anoncement', AnoncementSchema);