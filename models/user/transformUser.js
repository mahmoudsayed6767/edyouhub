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
        salesmanCode:e.salesmanCode,
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
        salesman:e.salesman,
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
    if(e.type =="SALESMAN"){
        index.salesmanCode = e.salesmanCode
    }
    if(e.place){
        index.place = {
            name:lang=="ar"?e.place.name_ar:e.place.name_en,
            id:e.place._id,
            type:e.place.type,
            logo:e.place.logo,
        }
    }
    return index;
}
