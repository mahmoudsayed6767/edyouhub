
export async function transformAddress(e,lang) {
    let index = {
        address:e.address,
        street:e.street,
        floor:e.floor,
        buildingNumber:e.buildingNumber,
        id: e._id,
        createdAt: e.createdAt,                       
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
