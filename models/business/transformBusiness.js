
export async function transformBusiness(e,lang) {
    let index = {
        businessName:lang=="ar"?e.businessName_ar:e.businessName_en,
        webSite:e.webSite,
        logo:e.logo,
        reason:e.reason,
        status:e.status,
        createdAt: e.createdAt, 
        id:e._id
    }
    if(e.owner){
        index.owner = {
            phone:e.owner.phone,
            fullname:e.owner.fullname,
            type:e.owner.type,
            id:e.owner._id
        }
    }
    return index
}
export async function transformBusinessById(e,lang) {
    let index = {
        businessName:lang=="ar"?e.businessName_ar:e.businessName_en,
        businessName_en:e.businessName_en,
        businessName_ar:e.businessName_ar,
        webSite:e.webSite,
        logo:e.logo,
        reason:e.reason,
        status:e.status,
        createdAt: e.createdAt, 
        id:e._id
    }
    if(e.owner){
        index.owner = {
            phone:e.owner.phone,
            fullname:e.owner.fullname,
            type:e.owner.type,
            id:e.owner._id
        }
    }
    if(e.educationSystem){
        index.educationSystem = {
            name:lang=="ar"?e.educationSystem.name_ar:e.educationSystem.name_en,
            img: e.educationSystem.img,
            id: e.educationSystem._id,
        }
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
    if(e.country){
        index.country = {
            countryName:lang=="ar"?e.country.name_ar:e.country.name_en,
            img: e.country.img,
            id: e.country._id,
        }
    }
    if(e.city){
        index.city = {
            cityName:lang=="ar"?e.city.name_ar:e.city.name_en,
            id: e.city._id,
        }
    }
    if(e.area){
        index.area = {
            areaName:lang=="ar"?e.area.name_ar:e.area.name_en,
            id: e.area._id,
        }
    }

    
    return index
}
