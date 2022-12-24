
export async function transformVacancy(e,lang) {
    let index = {
        profession:e.profession,
        requirements:e.requirements,
        description: e.description,
        id: e._id,
        createdAt: e.createdAt,                       
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

export async function transformVacancyById(e,lang) {
    let index = {
        profession:e.profession,
        requirements:e.requirements,
        description: e.description,
        id: e._id,
        createdAt: e.createdAt,                       
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
