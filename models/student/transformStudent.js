
export async function transformStudent(e,lang) {
    let index = {
        studentName:e.studentName,
        educationInstitutionName:e.educationInstitutionName,
        type:e.type,
        year:e.year,
        busFees:e.busFees,
        tuitionFees:e.tuitionFees,
        feesLetter:e.feesLetter,
        id:e._id,                         
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
    if(e.educationInstitution){
        index.educationInstitution = {
            educationInstitution:lang=="ar"?e.educationInstitution.educationInstitution_ar:e.educationInstitution.educationInstitution_en,
            id: e.educationInstitution._id,
        }
    }
    return index
}
