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
    },
    city: {
        type: Number,
        ref: 'city',
    },
    area: {
        type: Number,
        ref: 'area',
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
    offerCarts:{
        type:[Number],
        ref:'offer'
    },
    following: {
        type:[Number],
        ref:'business'
    },
    pendingConnections: {
        type:[Number],
        ref:'user'
    },
    connections: {
        type:[Number],
        ref:'user'
    },
    likedPosts: {
        type:[Number],
        ref:'post'
    },
    balance: {
        type: Number,
        default: 0
    },
    usedCoupons: {
        type:[Number],
        ref:'coupons'
    },
    cashBack: {
        type: Boolean,
        default: false
    },
    //additional info
    maritalStatus:{
        type: String, 
    },
    kids: [
        new Schema({
            fullname: {
                type: String,
                required: true
            },
            age: {
                type: Number,
                required: true
            },
            educationSystem: {
                type: Number,
                ref:'educationSystem',
                required: true,
            },
            educationInstitutionName:{
                type: String,
            },
            year: {
                type: String,
            },
            
        }, { _id: false })
        
    ],
    //education info
    educationPhase:{
        type: String, 
        enum: ['STUDENT','GRADUATED'],
    },
    schoolInfo:{
        schoolName:{
            type: String, 
        },
        year:{
            type: String, 
        },
        graduated:{
            type: Boolean, 
        },
        graduationDate:{
            type: Date, 
        },
    },
    universityInfo:{
        universityName:{
            type: String, 
        },
        facultyName:{
            type: String, 
        },
        year:{
            type: String, 
        },
        graduated:{
            type: Boolean, 
            default:true
        },
        graduationDate:{
            type: Date, 
        },
    },
    //after graduated education
    higherEducation: [
        new Schema({
            higherEducation :{
                type: Number, 
                ref:'higherEducation',
                required: true,
            },
            faculty:{
                type: String, 
                required: true,
            },
            
        }, { _id: false })
    ],
    courses: [
        new Schema({
            courseName:{
                type: String, 
                required: true,
            },
            organization:{
                type: String,
                required: true, 
            },
            
        }, { _id: false })
    ],
    //work experience
    job:{
        workType:{
            type: String, 
            enum: ['EDUCATION','OTHER'],
        },
        jobTitle:{
            type: String,
        },
        organization:{
            type: String,
        },
    },
    experiencesType:{
        type: String, 
        enum: ['EDUCATION','OTHER'],
    },
    experiencesOrganization:{
        type: String,
    },
    experiencesProfession:{
        type: String,
    },
    workExperiences: [
        new Schema({
            jobTitle:{
                type: String, 
                required: true,
            },
            organization:{
                type: String,
                required: true, 
            },
            startDate:{
                type: Date, 
                required: true,
            },
            endDate:{
                type: Date, 
            },
            
        }, { _id: false })
    ],
    attendedCourses:[{
        type:Number,
        ref:'courses',
    }],
    package: {
        type: Number,
        ref:'package',
    },
    packageStartDateMillSec:{
        type: Number,
    },
    packageEndDateMillSec:{
        type: Number,
    },
    hasPackage: {
        type: Boolean,
        default: false
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