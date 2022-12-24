
export async function transformBranch(e,lang) {
    let index ={
        address:lang=="ar"?e.address_ar:e.address_en,
        address_ar:e.address_ar,
        address_en:e.address_en,
        location:e.location,
        place: e.place,
        business:e.business,
        type:e.type,
        img:e.img,
        phone: e.phone,
        id: e._id,
        createdAt: e.createdAt,
    }
    if(e.country){
        index.country = {
            name:lang=="ar"?e.country.name_ar:e.country.name_en,
            id:e.country._id
        }
    }
    if(e.city){
        index.city = {
            name:lang=="ar"?e.city.name_ar:e.city.name_en,
            id:e.city._id
        }
    }
    if(e.area){
        index.area = {
            name:lang=="ar"?e.area.name_ar:e.area.name_en,
            id:e.area._id
        }
    }
    return index
}
