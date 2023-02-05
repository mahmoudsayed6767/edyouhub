
export async function transformVacancyRequest(e,lang) {
    let index = {
        fullname:e.fullname,
        type:e.type,
        age:e.age,
        phone: e.phone,
        vacancy:e.vacancy,
        attachment:e.attachment,
        id: e._id,
        createdAt: e.createdAt,                       
    }
    if (e.owner) {
        index.owner = {
            phone: e.owner.phone,
            fullname: e.owner.fullname,
            type: e.owner.type,
            id: e.owner._id
        }
    }
    return index
}

export async function transformVacancyRequestById(e,lang) {
    let index = {
        fullname:e.fullname,
        type:e.type,
        age:e.age,
        phone: e.phone,
        vacancy:e.vacancy,
        attachment:e.attachment,
        id: e._id,
        createdAt: e.createdAt,                       
    }
    if (e.owner) {
        index.owner = {
            phone: e.owner.phone,
            fullname: e.owner.fullname,
            type: e.owner.type,
            id: e.owner._id
        }
    }
    return index
}
