import mongoose,{ Schema} from "mongoose";
import autoIncrement from 'mongoose-auto-increment';
const groupSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    owner: {
        type: Number,
        ref: 'user',
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true,
    },
    type: {
        type: String,
        enum: ['PRIVATE', 'PUBLIC'],
        default:'PUBLIC'
    },
    postedType: {
        type: String,
        enum: ['OPENED', 'BY-REQUEST'],
        default:'OPENED'
    },
    about: {
        type: String,
    },
    img: {
        type: String,
        required: true,
    },
    usersCount: {
        type: Number,
        required: true
    },
    admins: {
        type: [Number],
        ref: 'user',
    },
    deleted:{
        type:Boolean,
        default:false
    }
}, { timestamps: true });

groupSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
groupSchema.plugin(autoIncrement.plugin, { model: 'group', startAt: 1 });

export default mongoose.model('group', groupSchema);