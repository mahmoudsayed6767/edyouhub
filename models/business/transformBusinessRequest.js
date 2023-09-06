
export async function transformBusinessRequest(e,lang) {
    let index = {
        status:e.status,
        id: e._id,
        createdAt: e.createdAt,                       
    }
    if (e.owner) {
        index.owner = {
            phone: e.owner.phone,
            fullname: e.owner.fullname,
            type: e.owner.type,
            id: e.owner._id
        }
    }
    console.log(e.business)
    if(e.business){
        let business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
        }
        index.business = business
    }
    return index
}

