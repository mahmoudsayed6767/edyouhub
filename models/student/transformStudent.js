
export async function transformStudent(e,lang) {
    let index = {
        studentName:e.studentName,
        studentId:e.studentId,
        educationInstitutionName:e.educationInstitutionName,
        type:e.type,
        grade:e.grade,
        feesLetter:e.feesLetter,
        id:e._id,                         
    }
    if(e.sector){
        index.sector = {
            name:lang=="ar"?e.sector.name_ar:e.sector.name_en,
            img: e.sector.img,
            id: e.sector._id,
        }
    }
    if(e.subSector){
        index.subSector = {
            name:lang=="ar"?e.subSector.name_ar:e.subSector.name_en,
            img: e.subSector.img,
            id: e.subSector._id,
        }
    }
    if(e.educationSystem){
        index.educationSystem = {
            name:lang=="ar"?e.educationSystem.name_ar:e.educationSystem.name_en,
            img: e.educationSystem.img,
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

export async function transformStudentById(e,lang) {
    let index = {
        studentName:e.studentName,
        studentId:e.studentId,
        educationInstitutionName:e.educationInstitutionName,
        type:e.type,
        feesLetter:e.feesLetter,
        id:e._id,                         
    }
    if(e.sector){
        index.sector = {
            name:lang=="ar"?e.sector.name_ar:e.sector.name_en,
            img: e.sector.img,
            id: e.sector._id,
        }
    }
    if(e.subSector){
        index.subSector = {
            name:lang=="ar"?e.subSector.name_ar:e.subSector.name_en,
            img: e.subSector.img,
            id: e.subSector._id,
        }
    }
    if(e.educationSystem){
        index.educationSystem = {
            name:lang=="ar"?e.educationSystem.name_ar:e.educationSystem.name_en,
            img: e.educationSystem.img,
            id: e.educationSystem._id,
        }
    }
    if(e.educationInstitution){
        index.educationInstitution = {
            name:lang=="ar"?e.educationInstitution.name_ar:e.educationInstitution.name_en,
            id: e.educationInstitution._id,
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

