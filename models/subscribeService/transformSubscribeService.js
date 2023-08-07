
export async function transformSubscribeService(e,lang) {
    let index ={
        sevice:e.sevice,
        contactPersonName:e.contactPersonName,
        contactPersonTitle:e.contactPersonTitle,
        email:e.email,
        phone:e.phone,
        discount:e.discount,
        status:e.status,
        id: e._id,
        createdAt: e.createdAt,
    }
    if(e.business){
        index.business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
        }
    }
    return index
}
