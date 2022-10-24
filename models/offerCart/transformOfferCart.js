export async function transformOfferCart(e,lang) {
    let index = {
        user: e.user,
        count:e.count,
        paymentProgress:e.paymentProgress,
        id:e._id
    }
    let offer = {
        title:lang=="ar"?e.offer.title_ar:e.offer.title_en,
        end:e.offer.end,
        id:e.offer._id,
        imgs:e.offer.imgs,
        type:e.offer.type,
        fromDate:e.offer.fromDate,
        toDate:e.offer.toDate,
        oldPrice:e.offer.oldPrice,
        newPrice:e.offer.newPrice,
        coins:e.offer.coins,
    }
    if(e.offer.place){
        offer.place = {
            name:lang=="ar"?e.offer.place.name_ar:e.offer.place.name_en,
            id:e.offer.place._id,
            logo:e.offer.place.logo,
        }
    }
    index.offer = offer
    return index;
}
