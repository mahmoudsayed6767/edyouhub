import { isInArray } from "../../helpers/CheckMethods";
import i18n from "i18n";
import moment from 'moment';
export async function transformUser(e,lang,myUser,userId) {
    let index = {
        fullname:e.fullname,
        email:e.email,
        phone:e.phone,
        id:e._id,
        type:e.type,
        accountType:e.accountType,
        age:e.age,
        gender:e.gender,
        img:e.img,
        block:e.block,
        affiliateCode:e.affiliateCode,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
    }
    
    return index;
}
export async function transformUserById(e,lang,myUser,userId) {
    let index = {
        fullname:e.fullname,
        email:e.email,
        phone:e.phone,
        affiliate:e.affiliate,
        id:e._id,
        type:e.type,
        accountType:e.accountType,
        phoneVerify:e.phoneVerify,
        gender:e.gender,
        img:e.img,
        block:e.block,
        balance:e.balance,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        
    }
    if(e.type =="affiliate"){
        index.affiliateCode = e.affiliateCode
    }
    if(e.place){
        index.place = {
            name:lang=="ar"?e.place.name_ar:e.place.name_en,
            id:e.place._id,
            type:e.place.type,
            logo:e.place.logo,
        }
    }
    if(e.country){
        index.country = {
            countryName:lang=="ar"?e.country.name_ar:e.country.name_en,
            img: e.country.img,
            id: e.country._id,
        }
    }
    if(e.city){
        index.city = {
            cityName:lang=="ar"?e.city.cityName_ar:e.city.name_en,
            id: e.city._id,
        }
    }
    if(e.area){
        index.area = {
            areaName:lang=="ar"?e.area.areaName_ar:e.area.name_en,
            id: e.area._id,
        }
    }
    return index;
}
