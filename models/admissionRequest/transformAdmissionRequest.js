
export async function transformAdmissionRequest(e,lang) {
    let index = {
        status:e.status,
        type:e.type,
        firstName: e.firstName,
        secondName: e.secondName,
        familyName: e.familyName,
        age: e.age,
        addmission: e.addmission,
        haveSibling:e.haveSibling,
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
    if(e.business){
        index.business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
        }
    }
    if(e.grade){
        index.grade = {
            name:lang=="ar"?e.grade.name_ar:e.grade.name_en,
            id: e.grade._id,
        }
    }
    if(e.faculty){
        index.faculty = {
            name:lang=="ar"?val.faculty.name_ar:val.faculty.name_en,
            id:val.faculty._id,                         
        }
    }
    return index
}

export async function transformAdmissionRequestById(e,lang) {
    let index = {
        status:e.status,
        type:e.type,
        firstName: e.firstName,
        secondName: e.secondName,
        familyName: e.familyName,
        birthday: birthday,
        age: e.age,
        addmission: e.addmission,
        fatherInfo:e.fatherInfo,
        motherInfo:e.motherInfo,
        haveSibling:e.haveSibling,
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
    if(e.faculty){
        index.faculty = {
            name:lang=="ar"?val.faculty.name_ar:val.faculty.name_en,
            id:val.faculty._id,                         
        }
    }
    if(e.grade){
        index.grade = {
            name:lang=="ar"?e.grade.name_ar:e.grade.name_en,
            id: e.grade._id,
        }
    }
    if(e.country){
        index.country = {
            name:lang=="ar"?e.country.name_ar:e.country.name_en,
            id: e.country._id,
        }
    }
    if(e.city){
        index.city = {
            name:lang=="ar"?e.city.name_ar:e.city.name_en,
            id: e.city._id,
        }
    }
    if(e.area){
        index.area = {
            name:lang=="ar"?e.area.name_ar:e.area.name_en,
            id: e.area._id,
        }
    }
    return index
}
