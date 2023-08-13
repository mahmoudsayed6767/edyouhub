
export async function transformFees(e,lang) {
    let index = {
        status:e.status,
        createdAt:e.createdAt,
        id:e._id,                         
    }
    
    if(e.educationInstitution){
        index.educationInstitution = {
            name:lang=="ar"?e.educationInstitution.name_ar:e.educationInstitution.name_en,
            id: e.educationInstitution._id,
        }
    }
    if(e.student){
        let student = {
            studentName:e.student.studentName,
            type:e.student.type,
            grade:e.student.grade,
            id:e.student._id,                         
        }
        if(e.student.educationSystem){
            student.educationSystem = {
                name:lang=="ar"?e.student.educationSystem.name_ar:e.student.educationSystem.name_en,
                img: e.student.educationSystem.img,
                id: e.student.educationSystem._id,
            }
        }
        index.student = student
    }
    return index
}
