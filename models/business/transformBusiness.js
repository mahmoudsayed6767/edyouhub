
export async function transformBusiness(e,lang) {
    let index = {
        businessName:lang=="ar"?e.name_ar:e.name_en,
        webSite:e.webSite,
        phones:e.phones,
        email:e.email,
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
        businessName:lang=="ar"?e.name_ar:e.name_en,
        name_en:e.name_en,
        name_ar:e.name_ar,
        webSite:e.webSite,
        phones:e.phones,
        email:e.email,
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
    if(e.country){
        index.country = {
            name:lang=="ar"?e.country.name_ar:e.country.name_en,
            img: e.country.img,
            id: e.country._id,
        }
    }
    if(e.city){
        index.city = {
            name:lang=="ar"?e.city.name_ar:e.city.name_en,
            id: e.city._id,
        }
    }
    if(e.area){
        index.area = {
            name:lang=="ar"?e.area.name_ar:e.area.name_en,
            id: e.area._id,
        }
    }

    
    return index
}
