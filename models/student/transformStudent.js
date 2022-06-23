
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
    if(e.category){
        index.category = {
            name:lang=="ar"?e.category.name_ar:e.category.name_en,
            img: e.category.img,
            id: e.category._id,
        }
    }
    if(e.subCategory){
        index.subCategory = {
            name:lang=="ar"?e.subCategory.name_ar:e.subCategory.name_en,
            img: e.subCategory.img,
            id: e.subCategory._id,
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
