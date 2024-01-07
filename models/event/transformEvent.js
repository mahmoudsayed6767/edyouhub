
import {isInArray} from "../../helpers/CheckMethods";

export async function transformEvent(e,lang,userId) {
    let index = {
        title:e.title,
        privacyType:e.privacyType,
        type:e.type,
        ownerType:e.ownerType,
        description:e.description,
        shortDescription:e.shortDescription,
        fromDate:e.fromDate,
        toDate:e.toDate,
        dailyTimes:e.dailyTimes,
        imgs:e.imgs,
        feesType:e.feesType,
        paymentMethod:e.paymentMethod,
        tickets:e.tickets,
        owners:e.owners,
        address:e.address,
        canAccess:userId?isInArray(e.canAccess,userId):false,
        isInterest:userId?isInArray(e.interesting,userId):false,
        isAttendance:userId?isInArray(e.attendance,userId):false,
        waitToPaid:userId?isInArray(e.waitToPaid,userId):false,
        id: e._id,                    
    }
    if(e.privacyType == "PUBLIC") index.canAccess = true
    if(e.business){
        let business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
        }
        if (e.business.package) {
            business.package = {
                title:lang=="ar"?e.business.package.title_ar:e.business.package.title_en,
                type:e.business.package.type,
                badgeType:e.business.package.badgeType,
                dataView:e.business.package.dataView,
                id: e.business.package._id,
            }
        }
        index.business = business
    }
    return index
}
export async function transformEventById(e,lang,userId) {
    let index = {
        title:e.title,
        ownerType:e.ownerType,
        description:e.description,
        shortDescription:e.shortDescription,
        privacyType:e.privacyType,
        type:e.type,
        accessCode:e.accessCode,
        hosts:e.hosts,
        owners:e.owners,
        sponsers:e.sponsers,
        speakers:e.speakers,
        organizers:e.organizers,
        partners:e.partners,
        exhibitors:e.exhibitors,
        daysCount:e.daysCount,
        travelType:e.travelType,
        transportation:e.transportation,
        nationalityType:e.nationalityType,
        tickets:e.tickets,
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
        canAccess:userId?isInArray(e.canAccess,userId):false,
        isInterest:userId?isInArray(e.interesting,userId):false,
        isAttendance:userId?isInArray(e.attendance,userId):false,
        waitToPaid:userId?isInArray(e.waitToPaid,userId):false,
        discount:e.discount,
        discountType:e.discountType,
        accessCode:e.accessCode,
        useMap:e.useMap,
        numberOfHalls:e.numberOfHalls,
        id: e._id,
        createdAt: e.createdAt,                       
    }
    if(e.privacyType == "PUBLIC") index.canAccess = true
    if(e.business){
        let business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
        }
        if (e.business.package) {
            business.package = {
                title:lang=="ar"?e.business.package.title_ar:e.business.package.title_en,
                type:e.business.package.type,
                badgeType:e.business.package.badgeType,
                dataView:e.business.package.dataView,
                id: e.business.package._id,
            }
        }
        index.business = business
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
    let halls = []
    for (let val of e.halls) {
        let hall = {
            name:val.name,
            numberOfBooths: val.numberOfBooths,
        }
        let booths = []
        for (let val2 of val.booths) {
            let booth = {
                size:val2.size,
                number: val2.number,
                exhibitor:e.exhibitors[val2.exhibitor]
            }
            booths.push(booth)
        }
        hall.booths = booths
        halls.push(hall)
    }
    index.halls = halls
    return index
}

export async function transformEventAttendance(e,lang) {
    let index = {
        paymentMethod:e.paymentMethod,
        installments:e.installments,
        tickets:e.tickets,
        id: e._id,                    
    }
    if (e.user) {
        let user = {
            phone: e.user.phone,
            fullname: e.user.fullname,
            type: e.user.type,
            img:e.user.img,
            hasPackage:e.user.hasPackage,
            id: e.user._id
        }
        if (e.user.package) {
            user.package = {
                title:lang=="ar"?e.user.package.title_ar:e.user.package.title_en,
                type:e.user.package.type,
                badgeType:e.user.package.badgeType,
                dataView:e.user.package.dataView,
                id: e.user.package._id,
            }
        }
        index.user = user

    }
    return index
}
