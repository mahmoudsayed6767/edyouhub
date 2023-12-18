
export async function transformBusinessTransfer(e,lang) {
    let index = {
        cost:e.cost,
        transferImg:e.transferImg,
        duesBefore:e.duesBefore,
        duesAfter:e.duesAfter,
        id: e._id,
        createdAt: e.createdAt,                       
    }
    if (e.actionUser) {
        index.actionUser = {
            phone: e.actionUser.phone,
            fullname: e.actionUser.fullname,
            type: e.actionUser.type,
            id: e.actionUser._id
        }
    }
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

