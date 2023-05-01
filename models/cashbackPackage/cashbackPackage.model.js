import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const cashbackPackageSchema=new Schema({
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
    cost:{
        type:Number,
        default:0,
        required:true,
    },
    coins:{
        type:Number,
        default:0,
        required:true,
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
cashbackPackageSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
cashbackPackageSchema.plugin(autoIncrement.plugin, { model: 'cashbackPackage', startAt: 1 });

export default mongoose.model('cashbackPackage', cashbackPackageSchema);