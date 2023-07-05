import mongoose, { Schema } from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const chatRequestSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    to:{
        type:Number,
        ref:'user',
        required:true
    },
    from:{
        type:Number,
        ref:'user',
        required:true
    },
    status:{
        type:String,
        enum:["PENDING","ACCEPTED","REJECTED"],
        default:"PENDING"
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

chatRequestSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
chatRequestSchema.plugin(autoIncrement.plugin, { model: 'chatRequest', startAt: 1 });

export default mongoose.model('chatRequest', chatRequestSchema);