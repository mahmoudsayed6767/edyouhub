
export async function transformVacancy(e,lang) {
    let index = {
        title:e.title,
        profession:e.profession,
        requirements:e.requirements,
        importantNeeds:e.importantNeeds,
        subject:e.subject,
        description: e.description,
        img:e.img,
        salary:e.salary,
        experiences:e.experiences,
        id: e._id,
        createdAt: e.createdAt,                       
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
    if(e.educationInstitution){
        index.educationInstitution = {
            name:lang=="ar"?e.educationInstitution.name_ar:e.educationInstitution.name_en,
            img: e.educationInstitution.img,
            id: e.educationInstitution._id,
        }
    }
    if(e.educationSystem){
        index.educationSystem = {
            name:lang=="ar"?e.educationSystem.name_ar:e.educationSystem.name_en,
            img: e.educationSystem.img,
            id: e.educationSystem._id,
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

export async function transformVacancyById(e,lang) {
    let index = {
        title:e.title,
        profession:e.profession,
        requirements:e.requirements,
        importantNeeds:e.importantNeeds,
        subject:e.subject,
        description: e.description,
        img:e.img,
        salary:e.salary,
        experiences:e.experiences,
        id: e._id,
        createdAt: e.createdAt,                       
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
    if(e.educationInstitution){
        index.educationInstitution = {
            name:lang=="ar"?e.educationInstitution.name_ar:e.educationInstitution.name_en,
            img: e.educationInstitution.img,
            id: e.educationInstitution._id,
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
