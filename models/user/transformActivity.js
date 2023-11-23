
export async function transformActivity(e,lang) {
    let index = {
        createdAt:e.createdAt,
        action:e.action,
        type:e.type,
        post:e.post,
        business:e.business,
        event:e.event,
        gallery:e.gallery,
        course:e.course,
        group:e.group,
        package:e.package,
        id:e._id,                         
    }
    if(e.user){
        let user={
            fullname:e.user.fullname,
            img:e.user.img,
            id:e.user._id,
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
