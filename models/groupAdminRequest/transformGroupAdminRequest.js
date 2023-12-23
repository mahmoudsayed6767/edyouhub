
export async function transformGroupAdminRequest(e,lang) {
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
    if(e.group){
        let group = {
            name:e.group.name,
            id: e.group._id,
        }
        index.group = group

    }
    return index
}

export async function transformGroupAdminRequestById(e,lang) {
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
    if(e.group){
        let group = {
            name:e.group.name,
            id: e.group._id,
        }
        index.group = group

    }
    return index
}
