
export async function transformVacancyRequest(e,lang) {
    let index = {
        fullname:e.fullname,
        type:e.type,
        age:e.age,
        phone: e.phone,
        attachment:e.attachment,
        id: e._id,
        createdAt: e.createdAt,                       
    }
    if(e.vacancy){
        index.vacancy = {
            profession:e.vacancy.profession,
            requirements:e.vacancy.requirements,
            description: e.vacancy.description,
            id: e.vacancy._id,
        }
    }
    if(e.business){
        index.business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
        }
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
        attachment:e.attachment,
        interviewDate:e.interviewDate,
        rejectReason:e.rejectReason,
        id: e._id,
        createdAt: e.createdAt,                       
    }
    if(e.vacancy){
        index.vacancy = {
            profession:e.vacancy.profession,
            requirements:e.vacancy.requirements,
            description: e.vacancy.description,
            id: e.vacancy._id,
        }
    }
    if(e.business){
        index.business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
        }
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
