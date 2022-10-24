export async function transformOfferCart(e,lang) {
    let index = {
        user: e.user,
        count:e.count,
        paymentProgress:e.paymentProgress,
        id:e._id
    }
    let offer = {
        title:lang=="ar"?e.title_ar:e.title_en,
        end:e.end,
        id:e._id,
        imgs:e.imgs,
        type:e.type,
        fromDate:e.fromDate,
        toDate:e.toDate,
        oldPrice:e.oldPrice,
        newPrice:e.newPrice,
        coins:e.coins,
    }
    if(e.offer.place){
        offer.place = {
            name:lang=="ar"?e.place.name_ar:e.place.name_en,
            id:e.place._id,
            logo:e.place.logo,
        }
    }
    index.offer = offer
    return index;
}
