
export async function transformAdmissionRequest(e,lang) {
    let index = {
        status:e.status,
        type:e.type,
        firstName: e.firstName,
        secondName: e.secondName,
        familyName: e.familyName,
        age: e.age,
        haveSibling:e.haveSibling,
        id: e._id,
        createdAt: e.createdAt,                       
    }
    if(e.admission){
        let admission = {
            status:e.admission.status,
            title: e.admission.title,
            description: e.admission.description,
            fromDate: e.admission.fromDate,
            toDate: e.admission.toDate,
            allGrades:e.admission.allGrades,
            id: e.admission._id,                   
        }
        index.admission = admission
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
        index.business = business

    }
    if(e.faculty){
        index.faculty = {
            name:lang=="ar"?e.faculty.name_ar:e.faculty.name_en,
            id:e.faculty._id,                         
        }
    }
    if(e.grade){
        index.grade = {
            name:lang=="ar"?e.grade.name_ar:e.grade.name_en,
            id: e.grade._id,
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
        birthday: e.birthday,
        age: e.age,
        admission: e.admission,
        fatherInfo:e.fatherInfo,
        motherInfo:e.motherInfo,
        haveSibling:e.haveSibling,
        interviewDate:e.interviewDate,
        rejectReason:e.rejectReason,
        id: e._id,
        createdAt: e.createdAt,                       
    }
    if(e.admission){
        let admission = {
            status:e.admission.status,
            title: e.admission.title,
            description: e.admission.description,
            fromDate: e.admission.fromDate,
            toDate: e.admission.toDate,
            allGrades:e.admission.allGrades,
            id: e.admission._id,                   
        }
        index.admission = admission
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
        index.business = business

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
            name:lang=="ar"?e.faculty.name_ar:e.faculty.name_en,
            id:e.faculty._id,                         
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
