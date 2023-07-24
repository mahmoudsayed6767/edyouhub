
export async function transformComment(e,lang) {
    let index = {
        comment: e.comment,
        type:e.type,
        post:e.post,
        replies:e.replies,
        id:e._id,
        createdAt: e.createdAt
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
    }
    if(e.user){
        let user={
            fullname:e.user.fullname,
            username:e.user.username,
            img:e.user.img,
            id:e.user._id,
        }
        index.user = user
    }
    return index
}
