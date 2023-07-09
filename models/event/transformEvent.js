
import {isInArray} from "../../helpers/CheckMethods";

export async function transformEvent(e,lang,userId) {
    let index = {
        title:e.title,
        ownerType:e.ownerType,
        description:e.description,
        shortDescription:e.shortDescription,
        fromDate:e.fromDate,
        toDate:e.toDate,
        dailyTimes:e.dailyTimes,
        imgs:e.imgs,
        feesType:e.feesType,
        paymentMethod:e.paymentMethod,
        cashPrice:e.cashPrice,
        installmentPrice:e.installmentPrice,
        address:e.address,
        isInterest:userId?isInArray(e.interesting,userId):false,
        isAttendance:userId?isInArray(e.attendance,userId):false,
        waitToPaid:userId?isInArray(e.waitToPaid,userId):false,
        id: e._id,                    
    }
    if(e.business){
        index.business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
        }
    }
    /*usersParticipants*/
    let usersParticipants=[]
    for (let val of e.usersParticipants) {
        usersParticipants.push({
            fullname:val.fullname,
            img:val.img,
            id:val._id,                         
        })
    }
    index.usersParticipants = usersParticipants;
    /*businessParticipants*/
    let businessParticipants=[]
    for (let val of e.businessParticipants) {
        businessParticipants.push({
            name:lang=="ar"?val.name_ar:val.name_en,
            img:val.img,
            id: val._id,                      
        })
    }
    index.businessParticipants = businessParticipants;
    return index
}
export async function transformEventById(e,lang,userId) {
    let index = {
        title:e.title,
        ownerType:e.ownerType,
        description:e.description,
        shortDescription:e.shortDescription,
        hostname:e.hostname,
        address:e.address,
        location:e.location,
        contactNumbers:e.contactNumbers,
        email:e.email,
        fromDate:e.fromDate,
        toDate:e.toDate,
        dailyTimes:e.dailyTimes,
        imgs:e.imgs,
        feesType:e.feesType,
        paymentMethod:e.paymentMethod,
        cashPrice:e.cashPrice,
        installments:e.installments,
        installmentPrice:e.installmentPrice,
        isInterest:userId?isInArray(e.interesting,userId):false,
        isAttendance:userId?isInArray(e.attendance,userId):false,
        waitToPaid:userId?isInArray(e.waitToPaid,userId):false,
        discount:e.discount,
        discountType:e.discountType,
        id: e._id,
        createdAt: e.createdAt,                       
    }
    if(e.business){
        index.business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
        }
    }
    if(e.city){
        index.city = {
            name:lang=="ar"?e.city.name_ar:e.city.name_en,
            id: e.city._id,
        }
    }
    if(e.area){
        index.area = {
            name:lang=="ar"?e.area.name_ar:e.area.name_en,
            id: e.area._id,
        }
    }
    /*usersParticipants*/
    let usersParticipants=[]
    for (let val of e.usersParticipants) {
        usersParticipants.push({
            fullname:val.fullname,
            img:val.img,
            id:val._id,                         
        })
    }
    index.usersParticipants = usersParticipants;
    /*businessParticipants*/
    let businessParticipants=[]
    for (let val of e.businessParticipants) {
        businessParticipants.push({
            name:lang=="ar"?val.name_ar:val.name_en,
            img:val.img,
            id: val._id,                      
        })
    }
    index.businessParticipants = businessParticipants;
    return index
}
