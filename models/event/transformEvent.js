
export async function transformEvent(e,lang) {
    let index = {
        title:e.title,
        description:e.description,
        fromDate:e.fromDate,
        toDate:e.toDate,
        time:e.time,
        id: e._id,                    
    }
    if(e.business){
        index.business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            id: e.business._id,
        }
    }
    /*usersParticipants*/
    let usersParticipants=[]
    for (let val of e.usersParticipants) {
        usersParticipants.push({
            fullname:val.fullname,
            id:val._id,                         
        })
    }
    index.usersParticipants = usersParticipants;
    /*businessParticipants*/
    let businessParticipants=[]
    for (let val of e.businessParticipants) {
        businessParticipants.push({
            name:lang=="ar"?val.name_ar:val.name_en,
            id: val._id,                      
        })
    }
    index.businessParticipants = businessParticipants;
    return index
}
export async function transformEventById(e,lang) {
    let index = {
        title:e.title,
        description:e.description,
        hostname:e.hostname,
        address:e.address,
        location:e.location,
        contactNumbers:e.contactNumbers,
        email:e.email,
        fromDate:e.fromDate,
        toDate:e.toDate,
        time:e.time,
        id: e._id,
        createdAt: e.createdAt,                       
    }
    if(e.business){
        index.business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            id: e.business._id,
        }
    }
    /*usersParticipants*/
    let usersParticipants=[]
    for (let val of e.usersParticipants) {
        usersParticipants.push({
            fullname:val.fullname,
            id:val._id,                         
        })
    }
    index.usersParticipants = usersParticipants;
    /*businessParticipants*/
    let businessParticipants=[]
    for (let val of e.businessParticipants) {
        businessParticipants.push({
            name:lang=="ar"?val.name_ar:val.name_en,
            id: val._id,                      
        })
    }
    index.businessParticipants = businessParticipants;
    return index
}
