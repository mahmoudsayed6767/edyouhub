
export async function transformEducationInstitution(e,lang) {
    let index = {
        name:lang=="ar"?e.name_ar:e.name_en,
        name_ar:e.name_ar,
        name_en:e.name_en,
        img:e.img,
        id: e._id,
        createdAt: e.createdAt,                       
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
    return index
}
