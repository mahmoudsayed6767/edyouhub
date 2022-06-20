
export async function transformEducationInstitution(e,lang) {
    let index = {
        educationInstitution:lang=="ar"?e.educationInstitution_ar:e.educationInstitution_en,
        educationInstitution_ar:e.educationInstitution_ar,
        educationInstitution_en:e.educationInstitution_en,
        img:e.img,
        id: e._id,
        createdAt: e.createdAt,                       
    }
    
    if(e.educationPhase){
        index.educationPhase = {
            educationPhase:lang=="ar"?e.educationPhase.educationPhase_ar:e.educationPhase.educationPhase_en,
            id: e.educationPhase._id,
        }
    }
    if(e.educationSystem){
        index.educationSystem = {
            educationSystem:lang=="ar"?e.educationSystem.educationSystem_ar:e.educationSystem.educationSystem_en,
            img: e.educationSystem.img,
            id: e.educationSystem._id,
        }
    }
    return index
}
