
export async function transformTransaction(e,lang) {
    let index = {
        transactionId:e.transactionId,
        type:e.type,
        status:e.status,
        dateMillSec:e.dateMillSec,
        cost:e.cost,
        tax:e.tax,
        totalCost:e.totalCost,
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
        index.premium = {
            type:e.premium.type,
            cost:e.premium.cost,
            installmentDate:e.premium.installmentDate,
            status:e.premium.status,
            receiptNum:e.premium.receiptNum,
            paidDate:e.premium.paidDate,
            id:e.premium._id,   
        }
                              
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
    if(e.offer){
        index.offer = {
            title:lang=="ar"?e.offer.title_ar:e.offer.title_en,
            id:e.offer._id,
            type:e.offer.type,
            coins:e.offer.coins,
        }
    }
    return index
}