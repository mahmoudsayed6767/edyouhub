
export async function transformFeesRequest(e,lang) {
    let index = {
        name:e.name,
        phone:e.phone,
        amount:e.amount,
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
