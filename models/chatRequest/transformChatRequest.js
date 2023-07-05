
export async function transformChatRequest(e,lang,userId,myUser) {
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
        index.to = to
    }
    return index
}
