import {checkExistThenGet } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import User from "../../models/user/user.model";
import Follow from "../../models/follow/follow.model";
import ApiError from '../../helpers/ApiError';
import i18n from "i18n";
import {convertLang} from "../shared/shared.controller";
import {transformUser} from "../../models/user/transformUser";
import Business from "../../models/business/business.model";
import {transformBusiness} from "../../models/business/transformBusiness";

import Report from "../../models/reports/report.model";
const populateQuery = [ 
    {path: 'owner', model: 'user' },

];
export default {
    async findAll(req, res, next) {
        try {
            convertLang(req)   
            let lang = i18n.getLocale(req) 
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { userId,business,} = req.query;
            //my follow list (userId = my id)
            //who add me to follow list (business =  id)
            let query = { deleted:false };
            if(userId) query.user = userId;
            let item = 'business';
            if(business){
                query.business = business;
                item = 'user'
            }
            let sortd = { createdAt: -1 }
            let ids = await Follow.find(query).distinct(item)
            let query2 = {deleted:false}
            query2._id = { $in: ids}
            let myUser = await checkExistThenGet(req.user._id, User)
            if(item == 'user'){
                await User.find(query2)
                .sort(sortd)
                .limit(limit)
                .skip((page - 1) * limit).then(async (data) => {
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformUser(e,lang,myUser,req.user._id)
                        newdata.push(index);
                    }))
                    const count = await User.countDocuments(query2);
                    const pageCount = Math.ceil(count / limit);

                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
            }else{
                await Business.find(query2).populate(populateQuery)
                .sort(sortd)
                .limit(limit)
                .skip((page - 1) * limit).then(async (data) => {
                    
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        let index = await transformBusiness(e,lang,myUser,req.user._id)
                        newdata.push(index);
                    }))
                    const count = await Business.countDocuments(query2);
                    const pageCount = Math.ceil(count / limit);

                    res.send(new ApiResponse(newdata, page, pageCount, limit, count, req));
                })
            }
            
                
            
        } catch (err) {
            next(err);
        }
    },
    async create(req, res, next) {
        try {
            convertLang(req) 
            let {business} = req.params;
            await checkExistThenGet(business,Business,{ deleted: false})
            let user = await checkExistThenGet(req.user._id, User,{ deleted: false});
            if(!await Follow.findOne({ user: req.user._id, business: business,deleted:false})){
                let arr = user.following;
                var found = arr.find(function(element) {
                    return element == business;
                }); 
                if(!found){
                    user.following.push(business);
                    await checkExistThenGet(business, Business,{ deleted: false});
                    let follow =  await Follow.create({ user: req.user._id, business: business });
                   
                    let reports = {
                        "action":"Add To business List",
                        "type":"FOLLOW",
                        "deepId":follow.id,
                        "user": req.user._id
                    };
                    await Report.create({...reports });
                    await user.save();
                }
            }
            res.status(201).send({
                success:true
            });
        } catch (error) {
            next(error)
        }
    },
    async unfollow(req, res, next) {
        try {
            convertLang(req)   
            let {business} = req.params;
            let follow = await Follow.findOne({ user: req.user._id, business: business,deleted:false})

            if(!await Follow.findOne({ user: req.user._id, business: business,deleted:false})){
                return next(new ApiError(500,  i18n.__('business.notFound')));
            }
            if (follow.user != req.user._id)
                return next(new ApiError(403,  i18n.__('notAllow')));
            follow.deleted = true;
           
            let user = await checkExistThenGet(req.user._id, User,{ deleted: false});

            let arr = user.following;
            for(let i = 0;i<= arr.length;i=i+1){
                if(arr[i] == business){
                    arr.splice(i, 1);
                }
            }
            user.following = arr;
            await user.save();
            await follow.save();
            let reports = {
                "action":"Remove From business List",
                "type":"FOLLOW",
                "deepId":Follow.id,
                "user": req.user._id
            };
            await Report.create({...reports });            
            res.status(200).send({
                success:true
            });
        } catch (error) {
            next(error)
        }
    },

}