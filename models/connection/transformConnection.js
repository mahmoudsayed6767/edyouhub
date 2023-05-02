
export async function transformConnection(e,lang,userId,myUser) {
    let index = {
        status:e.status,
        id: e._id,
        createdAt: e.createdAt,                       
    }
    if (e.from) {
        index.from = {
            phone: e.from.phone,
            fullname: e.from.fullname,
            type: e.from.type,
            img:e.from.img,
            id: e.from._id
        }
    }
    if (e.to) {
        index.to = {
            phone: e.to.phone,
            fullname: e.to.fullname,
            type: e.to.type,
            img:e.to.img,
            id: e.to._id
        }
    }
    return index
}
