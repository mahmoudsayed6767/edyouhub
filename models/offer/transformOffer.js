import { isInArray } from "../../helpers/CheckMethods";
import i18n from "i18n";
import moment from 'moment';
export async function transformOffer(e,lang,myUser,userId) {
    let index = {
        title:lang=="ar"?e.title_ar:e.title_en,
        description:lang=="ar"?e.description_ar:e.description_en,
        end:e.end,
        id:e._id,
        imgs:e.imgs,
        type:e.type,
        fromDate:e.fromDate,
        toDate:e.toDate,
        oldPrice:e.oldPrice,
        newPrice:e.newPrice,
        coins:e.coins,
        createdAt:e.createdAt,
        isFavourite:userId?isInArray(myUser.favourite,e._id):false,
    }
    if(e.place){
        index.place = {
            name:lang=="ar"?e.place.name_ar:e.place.name_en,
            id:e.place._id,
            type:e.place.type,
            logo:e.place.logo,
            cover:e.place.cover
        }
    }
    return index;
}
export async function transformOfferById(e,lang,myUser,userId) {
    let index = {
        title:lang=="ar"?e.title_ar:e.title_en,
        description:lang=="ar"?e.description_ar:e.description_en,
        title_ar:e.title_ar,
        title_en:e.title_en,
        description_ar:e.description_ar,
        description_en:e.description_en,
        id:e._id,
        imgs:e.imgs,
        type:e.type,
        oldPrice:e.oldPrice,
        newPrice:e.newPrice,
        coins:e.coins,
        fromDate:e.fromDate,
        toDate:e.toDate,
        end:e.end,
        withNotif:e.withNotif,
        bookedUsers:e.bookedUsers,
        bookedUsersCount:e.bookedUsersCount,
        gotUsers:e.gotUsers,
        gotUsersCount:e.gotUsersCount,
        createdAt:e.createdAt,
        isFavourite:userId?isInArray(myUser.favourite,e._id):false,
    }
    if(e.place){
        index.place = {
            name:lang=="ar"?e.place.name_ar:e.place.name_en,
            id:e.place._id,
            type:e.place.type,
            logo:e.place.logo,
            cover:e.place.cover
        }
    }
    if(e.category){
        index.category ={
            name:lang=="ar"?e.category.name_ar:e.category.name_en,
            id:e.category._id,                         
            
        }
    }
    
    return index;
}
