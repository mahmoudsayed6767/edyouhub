
export async function transformMessage(e,lang) {
    let index = {
        content:e.content,
        dataType: e.dataType,
        incommingDate: e.incommingDate,
        duration: e.duration,
        sent:e.sent,
        delivered:e.delivered,
        seen: e.seen,
        seendate:e.seendate,
        createdAt:e.createdAt,
        id:e._id
    }
    if(e.from){
        let from = {
            fullname:e.from.fullname,
            img:e.from.img,
            phone:e.from.phone,
            id:e.from._id
        }
        index.from = from
    }
    if(e.to){
        let to = {
            fullname:e.to.fullname,
            phone:e.to.phone,
            img:e.to.img,
            id:e.to._id
        }
        index.to = to
    }
    if(e.business){
        index.business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
        }
    }
    return index;
}
