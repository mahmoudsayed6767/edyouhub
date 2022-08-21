import mongoose, { Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import bcrypt from 'bcryptjs';
import isEmail from 'validator/lib/isEmail';
import { isImgUrl } from "../../helpers/CheckMethods";

const userSchema = new Schema({
    _id: {
        type: Number,
        required: true
    },
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,  
        validate: {
            validator: (email) => isEmail(email),
            message: 'Invalid Email Syntax'
        }     
    },
    phone: {
        type:String,
        required: true,
        trim:true
    },
    password: {
        type: String,
        required: true
    },
    country: {
        type: Number,
        ref: 'country',
        required: true,
    },
    city: {
        type: Number,
        ref: 'city',
        required: true,
    },
    area: {
        type: Number,
        ref: 'area',
        required: true,
    },
    affiliateCode: {//for affiliate
        type: String,
    },
    affiliate: {// if user is sign up with affiliate code
        type: String,
        ref:'user',
    },
    type: {
        type: String,
        enum: ['PLACE','SUBERVISOR','ADMIN','USER','AGENCY','AFFILIATE'],
        required:true
    },
    gender: {
        type: String,
        enum: ['MALE','FEMALE','OTHER'],
        default: 'MALE'
    },
    accountType:{
        type: String,
        enum: ['SIGNUP-PROCESS','ACTIVE','BLOCKED'],
        required:true,
        default:'SIGNUP-PROCESS'
    },
    place: {
        type: Number,
        ref:'place',
    },
    block:{
        type: Boolean,
        default: false
    },
    img: {
        type: String,
        default:"https://res.cloudinary.com/boody-car/image/upload/v1586870969/c8jzyavvoexpu25wayfr.png",
    },
    verifycode: {
        type: Number
    },
    tokens: [
        new Schema({
            token: {
                type: String,
            },
            osType: {
                type: String,
                enum:['IOS','ANDROID','WEB'],
                default: 'IOS'
            }
            
        }, { _id: false })
        
    ],
    phoneVerify:{
        type: Boolean,
        default: false
    },
    favourite: {
        type:[Number],
        ref:'offer'
    },
    balance: {
        type: Number,
        default: 0
    },
    usedCoupons: {
        type:[Number],
        ref:'coupons'
    },
    deleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true, discriminatorKey: 'kind' });

userSchema.pre('save', function (next) {
    const account = this;
    if (!account.isModified('password')) return next();

    const salt = bcrypt.genSaltSync();
    bcrypt.hash(account.password, salt).then(hash => {
        account.password = hash;
        next();
    }).catch(err => console.log(err));
});

userSchema.methods.isValidPassword = function (newPassword, callback) {
    let user = this;
    bcrypt.compare(newPassword, user.password, function (err, isMatch) {
        if (err)
            return callback(err);
        callback(null, isMatch);
    });
};

userSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret.password;
        delete ret._id;
        delete ret.__v;
        delete ret.deleted;
        delete ret.verifycode;
        if(ret.type =="USER" || ret.type == "ADMIN"){
            delete ret.place;
        }
        if(ret.type !="affiliate"){
            delete ret.affiliateCode;
        }
    }
});
autoIncrement.initialize(mongoose.connection);
userSchema.plugin(autoIncrement.plugin, { model: 'user', startAt: 1 });
export default mongoose.model('user', userSchema);