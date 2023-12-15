
export async function transformTransaction(e,lang) {
    let index = {
        transactionId:e.transactionId,
        type:e.type,
        status:e.status,
        dateMillSec:e.dateMillSec,
        cost:e.cost,
        tax:e.tax,
        coins:e.coins,
        totalCost:e.totalCost,
        courseParticipant:e.courseParticipant,
        eventAttendance:e.eventAttendance,
        paymentMethod:e.paymentMethod,
        billUrl:e.billUrl,
        edyouhubCommission:e.edyouhubCommission,
        id: e._id,
    }
    if(e.user){
        index.user = {
            fullname:e.user.fullname,
            email:e.user.email,
            phone:e.user.phone,
            img:e.user.img?e.user.img:"",
            type:e.user.type,
            id:e.user._id, 
        }
    }
    if(e.business){
        index.business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
        }
    }
    return index
}
export async function transformTransactionById(e,lang) {
    let index = {
        transactionId:e.transactionId,
        type:e.type,
        status:e.status,
        dateMillSec:e.dateMillSec,
        cost:e.cost,
        tax:e.tax,
        coins:e.coins,
        totalCost:e.totalCost,
        courseParticipant:e.courseParticipant,
        eventAttendance:e.eventAttendance,
        paymentMethod:e.paymentMethod,
        billUrl:e.billUrl,
        edyouhubCommission:e.edyouhubCommission,
        id: e._id,
    }
    if(e.user){
        index.user = {
            fullname:e.user.fullname,
            email:e.user.email,
            phone:e.user.phone,
            img:e.user.img?e.user.img:"",
            type:e.user.type,
            packageEndDateMillSec:e.user.packageEndDateMillSec,
            id:e.user._id, 
        }
    }
    if(e.business){
        index.business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            packageEndDateMillSec:e.business.packageEndDateMillSec,
            id: e.business._id,
        }
    }
    if(e.premiums) {
        /* students*/
        let premiums=[]
        for (let val of e.premiums) {
            premiums.push({
                type:val.type,
                cost:val.cost,
                installmentDate:val.installmentDate,
                status:val.status,
                receiptNum:val.receiptNum,
                paidDate:val.paidDate,
                id:val._id,   
            })  
        }
        index.premiums = premiums
                         
    }
    if(e.fund){
        index.fund = {
            fullname:e.fund.fullname,
            address:e.fund.address,
            phone:e.fund.phone,
            job:e.fund.job,
            totalFees:e.fund.totalFees,
            endDate:e.fund.endDate,
            status:e.fund.status,
            id:e.fund._id
        }
    }
    if(e.fees){
        let fees = {
            status:e.fees.status,
            id:e.fees._id
        }
        let feesDetails=[]
        for (let val of e.fees.feesDetails) {
            let feesDetail = {
                feesCost:val.feesCost,
            }
            feesDetails.push(feesDetail)
        }
        fees.feesDetails = feesDetails
        index.fees = fees
    }
    if(e.package){
        index.package = {
            title:lang=="ar"?e.package.title_ar:e.package.title_en,
            type:e.package.type,
            badgeType:e.package.badgeType,
            dataView:e.package.dataView,
            createEvents:e.package.createEvents,
            createReels:e.package.createReels,
            createGroups:e.package.createGroups,
            createBusiness:e.package.createBusiness,
            enableFollow:e.package.enableFollow,
            sendingMessages:e.package.sendingMessages,
            createPosts:e.package.createPosts,
            createCourses:e.package.createCourses,
            createVacancies:e.package.createVacancies,
            createAdmissions:e.package.createAdmissions,
            id: e.package._id,
        }
    }
    if(e.oldPackage){
        index.oldPackage = {
            title:lang=="ar"?e.oldPackage.title_ar:e.oldPackage.title_en,
            id: e.oldPackage._id,
        }
    }
    if(e.order){
        index.order ={
            total:e.order.total,
            finalTotal:e.order.finalTotal,
            delivaryCost:e.order.delivaryCost,
            totalDiscount:e.order.totalDiscount,
            status:e.order.status,
            paymentSystem:e.order.paymentSystem,
            id: e.order._id,
        }
    }
    if(e.offerBooking){
        let offerBooking ={
            user:e.offerBooking.user,
            offers:e.offerBooking.offers,
            id: e.offerBooking._id,
        }
        let offers=[]
        for (let val of e.offerBooking.offers) {
            let obj  = {
                count:val.count,
                code:val.code,
                 
            }
            if(val.offer){
                obj.offer = {
                    title:lang=="ar"?val.offer.title_ar:val.offer.title_en,
                    description:lang=="ar"?val.offer.description_ar:val.offer.description_en,
                    end:val.offer.end,
                    id:val.offer._id,
                    oldPrice:val.offer.oldPrice,
                    newPrice:val.offer.newPrice,
                    coins:val.offer.coins,
                }
            }
            if(val.place){
                obj.place = {
                    name:lang=="ar"?val.place.name_ar:val.place.name_en,
                    id:val.place._id,
                    logo:val.place.logo,
                    cover:val.place.cover
                }
            }
            offers.push(obj)  
        }
        offerBooking.offers = offers
        index.offerBooking = offerBooking
    }
    if(e.event) {
        let event = {
            title:e.event.title,
            fromDate:e.event.fromDate,
            toDate:e.event.toDate,
            time:e.event.time,
            shortDescription:e.event.shortDescription,
            id: e.event._id,
            address:e.event.address,
            location:e.event.location,

        }
        index.event = event;
    }
    if(e.course){
        let course={
            title:lang=="ar"?e.course.title_ar:e.course.title_en,
            feesType: e.course.feesType,
            price:e.course.price,
            id:e.course._id,
        }
        index.course = course
    }
    return index
}