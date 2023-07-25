
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
        allGrades:e.allGrades,
        allFaculties:e.allFaculties,
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
    /*faculties*/
    let faculties=[]
    for (let val of e.faculties) {
        let faculty = {
            name:lang=="ar"?val.faculty.name_ar:val.faculty.name_en,
            id:val.faculty._id,                         
        }
        let grades=[]
        for (let val2 of val.grades) {
            grades.push({
                name:lang=="ar"?val2.name_ar:val2.name_en,
                cost: val2.cost,
                id:val2._id,                         
            })
        }
        faculty.grades = grades;
        faculties.push(faculty)
    }
    index.faculties = faculties;
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
        allGrades:e.allGrades,
        allFaculties:e.allFaculties,
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
    /*faculties*/
    let faculties=[]
    for (let val of e.faculties) {
        let faculty = {
            name:lang=="ar"?val.faculty.name_ar:val.faculty.name_en,
            id:val.faculty._id,                         
        }
        let grades=[]
        for (let val2 of val.grades) {
            grades.push({
                name:lang=="ar"?val2.name_ar:val2.name_en,
                cost: val2.cost,
                id:val2._id,                         
            })
        }
        faculty.grades = grades;
        faculties.push(faculty)
    }
    index.faculties = faculties;
    return index
}
