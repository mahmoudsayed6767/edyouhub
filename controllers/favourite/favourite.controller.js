import {checkExistThenGet } from "../../helpers/CheckMethods";
import ApiResponse from "../../helpers/ApiResponse";
import User from "../../models/user/user.model";
import Favourite from "../../models/favourite/favourite.model";
import ApiError from '../../helpers/ApiError';
import i18n from "i18n";
import {convertLang} from "../shared/shared.controller";
import {transformUser} from "../../models/user/transformUser";
import Offer from "../../models/offer/offer.model";
import {transformOffer} from "../../models/offer/transformOffer";

import Report from "../../models/reports/report.model";
const populateQuery = [ 

];
const populateQuery2 = [
   
];
export default {
    async findAll(req, res, next) {        
        try {   
            let lang = i18n.getLocale(req) 
            let page = +req.query.page || 1, limit = +req.query.limit || 20;
            let { userId,offer,search,alphabeticalOrder  } = req.query;
            //my favourite list (userId = my id)
            //who add me to favourite list (offer =  id)
            let query = { deleted:false };
            if(userId) query.user = userId;
            let item = 'offer';
            if(offer){
                query.offer = offer;
                item = 'user'
            }
            let sortd = { createdAt: -1 }
            if(alphabeticalOrder == "true"){
                sortd = {fullname: 1}
            }
            let ids = await Favourite.find(query)
                .distinct(item)
            let query2 = {deleted:false}
            console.log(query2)
            query2._id = { $in: ids}
            console.log(query2)
            if(search){
                if(item == 'user'){
                    query2 = {
                        phone: { $regex: '.*' + search + '.*' , '$options' : 'i'  },
                        deleted: false,
                        _id:usersIds
                    }
                }else{
                    Object.assign(query2 ,{
                        $and: [
                            { $or: [
                                {name_ar: { $regex: '.*' + search + '.*' , '$options' : 'i'  }}, 
                                {name_en: { $regex: '.*' + search + '.*', '$options' : 'i'  }}, 
                              ] 
                            },
                            {deleted: false},
                        ]
                    })
                }
                
            }
            let myUser = await checkExistThenGet(req.user._id, User)
            if(item == 'user'){
                await User.find(query2).populate(populateQuery2)
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
                await Offer.find(query2).populate(populateQuery)
                .sort(sortd)
                .limit(limit)
                .skip((page - 1) * limit).then(async (data) => {
                    
                    var newdata = [];
                    await Promise.all(data.map(async(e) =>{
                        console.log(e.place)
                        let index = await transformOffer(e,lang,myUser,req.user._id)
                        newdata.push(index);
                    }))
                    const count = await Offer.countDocuments(query2);
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
            let {offer} = req.params;
            await checkExistThenGet(offer,Offer,{ deleted: false})
            console.log(offer)
            let user = await checkExistThenGet(req.user._id, User,{ deleted: false});
            console.log("user",user)
            if(!await Favourite.findOne({ user: req.user._id, offer: offer,deleted:false})){

                let arr = user.favourite;
                var found = arr.find(function(element) {
                    return element == offer;
                }); 
                if(!found){
                    user.favourite.push(offer);
                    await checkExistThenGet(offer, Offer,{ deleted: false});
                    let favourite =  await Favourite.create({ user: req.user._id, offer: offer });
                   
                    let reports = {
                        "action":"Add To Fav List",
                        "type":"FAVOURITES",
                        "deepId":favourite.id,
                        "user": req.user._id
                    };
                    await Report.create({...reports });
                    await user.save();
                }
            }/*else{
                return next(new ApiError(500,  i18n.__('Offer.foundInList')));
            }*/
            res.status(201).send({
                success:true
            });
        } catch (error) {
            next(error)
        }
    },
    async unFavourite(req, res, next) {        
        try {   
            let {offer} = req.params;
            let favourite = await Favourite.findOne({ user: req.user._id, offer: offer,deleted:false})

            if(!await Favourite.findOne({ user: req.user._id, offer: offer,deleted:false})){
                return next(new ApiError(500,  i18n.__('Offer.notFound')));
            }
           // let favourites = await checkExistThenGet(favourite.id, Favourite, { deleted: false });
            if (favourite.user != req.user._id)
                return next(new ApiError(403,  i18n.__('notAllow')));
                favourite.deleted = true;
           
            let user = await checkExistThenGet(req.user._id, User,{ deleted: false});

            let arr = user.favourite;
            console.log("before",arr);
            for(let i = 0;i<= arr.length;i=i+1){
                if(arr[i] == offer){
                    arr.splice(i, 1);
                }
            }
            user.favourite = arr;
            await user.save();
            console.log("after",arr);
            await favourite.save();
            let reports = {
                "action":"Remove From Fav List",
                "type":"FAVOURITES",
                "deepId":favourite.id,
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