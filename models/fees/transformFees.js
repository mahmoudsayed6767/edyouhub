
export async function transformFees(e,lang) {
    let index = {
        status:e.status,
        createdAt:e.createdAt,
        id:e._id,                         
    }
    
    if(e.educationInstitution){
        index.educationInstitution = {
            educationInstitution:lang=="ar"?e.educationInstitution.educationInstitution_ar:e.educationInstitution.educationInstitution_en,
            id: e.educationInstitution._id,
        }
    }
    if(e.student){
        let student = {
            studentName:e.student.studentName,
            type:e.student.type,
            year:e.student.year,
            busFees:e.student.busFees,
            tuitionFees:e.student.tuitionFees,
            id:e.student._id,                         
        }
        if(e.student.educationPhase){
            student.educationPhase = {
                educationPhase:lang=="ar"?e.student.educationPhase.educationPhase_ar:e.student.educationPhase.educationPhase_en,
                id: e.student.educationPhase._id,
            }
        }
        if(e.student.educationSystem){
            student.educationSystem = {
                educationSystem:lang=="ar"?e.student.educationSystem.educationSystem_ar:e.student.educationSystem.educationSystem_en,
                img: e.student.educationSystem.img,
                id: e.student.educationSystem._id,
            }
        }
        index.student = student
    }
    return index
}
