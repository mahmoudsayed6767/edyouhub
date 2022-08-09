import mongoose, { Schema } from "mongoose";
import { isImgUrl } from "../../helpers/CheckMethods";
import autoIncrement from 'mongoose-auto-increment';
const CartSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true,
        default:0
    },
    user: {
        type: Number,
        ref: 'user',
        required: true
    },
    supplies: {
        type: Number,
        ref: 'supplies',
        required: true
    },
    items: [
        new Schema({
            product: {
                type: Number,
                ref: 'product',
                required: true
            },
            color: {
                type: Number,
                ref: 'color',
                //required: true
            },
            size: {
                type: String,
                required: true
            },
            count: {
                type: Number,
                default: 1
            },

        }, { _id: false })
    ],
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

CartSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});
autoIncrement.initialize(mongoose.connection);
CartSchema.plugin(autoIncrement.plugin, { model: 'cart', startAt: 1 });

export default mongoose.model('cart', CartSchema);