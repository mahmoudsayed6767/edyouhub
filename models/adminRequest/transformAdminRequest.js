
export async function transformAdminRequest(e,lang) {
    let index = {
        status:e.status,
        service:e.service,
        from:e.from,
        id: e._id,
        createdAt: e.createdAt,                       
    }
    if (e.to) {
        index.to = {
            phone: e.to.phone,
            fullname: e.to.fullname,
            type: e.to.type,
            id: e.to._id
        }
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

export async function transformAdminRequestById(e,lang) {
    let index = {
        status:e.status,
        service:e.service,
        from:e.from,
        
        id: e._id,
        createdAt: e.createdAt,                       
    }
    if (e.to) {
        index.to = {
            phone: e.to.phone,
            fullname: e.to.fullname,
            type: e.to.type,
            id: e.to._id
        }
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
