
export async function transformGrade(e,lang) {
    let index = {
        name:lang=="ar"?e.name_ar:e.name_en,
        name_ar:e.name_ar,
        name_en:e.name_en,
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
    return index
}
