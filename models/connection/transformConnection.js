
export async function transformConnection(e,lang,userId,myUser) {
    let index = {
        status:e.status,
        id: e._id,
        createdAt: e.createdAt,                       
    }
    if (e.from) {
        let from = {
            phone: e.from.phone,
            fullname: e.from.fullname,
            type: e.from.type,
            img:e.from.img,
            hasPackage:e.from.hasPackage,
            id: e.from._id
        }
        if (e.from.package) {
            from.package = {
                title:lang=="ar"?e.from.package.title_ar:e.from.package.title_en,
                type:e.from.package.type,
                badgeType:e.from.package.badgeType,
                dataView:e.from.package.dataView,
                id: e.from.package._id,
            }
        }
        index.from = from

    }
    if (e.to) {
        let to = {
            phone: e.to.phone,
            fullname: e.to.fullname,
            type: e.to.type,
            img:e.to.img,
            hasPackage:e.to.hasPackage,
            id: e.to._id
        }
        if (e.to.package) {
            to.package = {
                title:lang=="ar"?e.to.package.title_ar:e.to.package.title_en,
                type:e.to.package.type,
                badgeType:e.to.package.badgeType,
                dataView:e.to.package.dataView,
                id: e.to.package._id,
            }
        }
        index.to = to
    }
    return index
}
