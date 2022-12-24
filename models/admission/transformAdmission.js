
export async function transformAdmission(e,lang) {
    let index = {
        status:e.status,
        title: e.title,
        description: e.description,
        fromDate: e.fromDate,
        toDate: e.toDate,
        maxApplications: e.maxApplications,
        maxAcceptance: e.maxAcceptance,
        applications:e.applications,
        acceptance:e.acceptance,
        id: e._id,
        createdAt: e.createdAt,                       
    }
    if(e.educationSystem){
        index.educationSystem = {
            name:lang=="ar"?e.educationSystem.name_ar:e.educationSystem.name_en,
            img: e.educationSystem.img,
            id: e.educationSystem._id,
        }
    }
    if(e.business){
        index.business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
        }
    }
    if(e.educationInstitution){
        index.educationInstitution = {
            name:lang=="ar"?e.educationInstitution.name_ar:e.educationInstitution.name_en,
            img: e.educationInstitution.img,
            id: e.educationInstitution._id,
        }
    }
    return index
}

export async function transformAdmissionById(e,lang) {
    let index = {
        status:e.status,
        title: e.title,
        description: e.description,
        fromDate: e.fromDate,
        toDate: e.toDate,
        maxApplications:e.maxApplications,
        maxAcceptance: e.maxAcceptance,
        applications:e.applications,
        acceptance:e.acceptance,
        id: e._id,
        createdAt: e.createdAt,                       
    }
    if(e.educationSystem){
        index.educationSystem = {
            name:lang=="ar"?e.educationSystem.name_ar:e.educationSystem.name_en,
            id: e.educationSystem._id,
        }
    }
    if(e.educationInstitution){
        index.educationInstitution = {
            name:lang=="ar"?e.educationInstitution.name_ar:e.educationInstitution.name_en,
            id: e.educationInstitution._id,
        }
    }
    if(e.business){
        index.business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
        }
    }
    /*grades*/
    let grades=[]
    for (let val of e.grades) {
        grades.push({
            name:lang=="ar"?val.name_ar:val.name_en,
            cost: val.cost,
            id:val._id,                         
        })
    }
    index.grades = grades;
    return index
}
