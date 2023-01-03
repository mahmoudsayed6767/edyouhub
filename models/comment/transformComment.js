
export async function transformComment(e,lang) {
    let index = {
        comment: e.comment,
        type:e.type,
        post:e.post,
        replies:e.replies,
        id:e._id,
        createdAt: e.createdAt
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
