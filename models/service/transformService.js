
export async function transformService(e,lang) {
    let index ={
        title:e.title,
        details:e.details,
        priceType:e.priceType,
        price:e.price,
        attachment:e.attachment,
        imgs:e.imgs,
        id: e._id,
        createdAt: e.createdAt,
    }
    if(e.specialization){
        let specialization = {
            name:lang=="ar"?e.specialization.name_ar:e.specialization.name_en,
            id: e.specialization._id,
        }
        index.specialization = specialization
    }
    if(e.business){
        let business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
        }
        if(e.business.package){
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
