
export async function transformEducationInstitution(e,lang) {
    let index = {
        name:lang=="ar"?e.name_ar:e.name_en,
        name_ar:e.name_ar,
        name_en:e.name_en,
        img:e.img,
        id: e._id,
        createdAt: e.createdAt,                       
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
    return index
}
