
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
        paymentMethod:e.paymentMethod,
        billUrl:e.billUrl,
        id: e._id,
    }
    if(e.user){
        index.user = {
            fullname:e.user.fullname,
            img:e.user.img?e.user.img:"",
            type:e.user.type,
            id:e.user._id, 
        }
    }
    if(e.premium) {
        /* students*/
        let premiums=[]
        for (let val of e.premium) {
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
    if(e.package){
        index.package = {
            title:lang=="ar"?e.package.title_ar:e.package.title_en,
            id: e.package._id,
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
    return index
}