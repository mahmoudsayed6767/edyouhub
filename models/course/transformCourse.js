export async function transformCourse(e,lang,myUser,userId) {
    let index = {
        title:lang=="ar"?e.title_ar:e.title_en,
        status:e.status,
        id:e._id,
        imgs:e.imgs,
        fromDate:e.fromDate,
        toDate:e.toDate,
        maxApplications:e.maxApplications,
        maxAcceptance:e.maxAcceptance,
        paymentMethod:e.paymentMethod,
        cashPrice:e.cashPrice,
        installmentPrice:e.installmentPrice,
        rate:e.rate,
        rateCount:e.rateCount,
        rateNumbers:e.rateNumbers,
        sessionsNo:e.sessionsNo,
        acceptanceNo:e.acceptanceNo,
        type:e.type,
        createdAt:e.createdAt,
    }
    if(e.business){
        index.business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
        }
    }
    /*instractors*/
    let instractors=[]
    for (let val of e.instractors) {
        instractors.push({
            fullname:val.fullname,
            img:val.img,
            id:val._id,                         
        })
    }
    index.instractors = instractors
    return index;
}
export async function transformCourseById(e,lang,myUser,userId) {
    let index = {
        title:lang=="ar"?e.title_ar:e.title_en,
        description:lang=="ar"?e.description_ar:e.description_en,
        introVideo:e.introVideo,
        status:e.status,
        id:e._id,
        imgs:e.imgs,
        fromDate:e.fromDate,
        toDate:e.toDate,
        dailyTimes:e.dailyTimes,
        maxApplications:e.maxApplications,
        maxAcceptance:e.maxAcceptance,
        paymentMethod:e.paymentMethod,
        cashPrice:e.cashPrice,
        installments:e.installments,
        installmentPrice:e.installmentPrice,
        rate:e.rate,
        rateCount:e.rateCount,
        rateNumbers:e.rateNumbers,
        sessionsNo:e.sessionsNo,
        acceptanceNo:e.acceptanceNo,
        hasCertificate:e.hasCertificate,
        type:e.type,
        createdAt:e.createdAt,
    }
    if(e.business){
        index.business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
        }
    }
    /*specializations*/
    let specializations = []
    for (let val of e.specializations) {
        specializations.push({
            name: lang == "ar" ? val.name_ar : val.name_en,
            id: val._id,
        })
    }
    index.specializations = specializations;
    /* branches*/
    if (e.branches.length > 0) {
        let branches = []
        let arr = [...e.branches.slice(0, 3)]
        for (let val of arr) {
            let branch = {
                address: lang == "ar" ? val.address_ar : val.address_en,
                phone: val.phone,
                email: val.email,
                img: val.img,
                location: val.location,
                id: val._id,
            }
            if (val.country) {
                branch.country = {
                    name: lang == "ar" ? val.country.name_ar : val.country.name_en,
                    id: val.country._id
                }
            }
            if (val.city) {
                console.log(val.city)
                branch.city = {
                    name: lang == "ar" ? val.city.name_ar : val.city.name_en,
                    id: val.city._id
                }
            }
            if (val.area) {
                branch.area = {
                    name: lang == "ar" ? val.area.name_ar : val.area.name_en,
                    id: val.area._id
                }
            }
            branches.push(branch)
        }
        index.branches = branches
    }
    /*instractors*/
    let instractors=[]
    for (let val of e.instractors) {
        instractors.push({
            fullname:val.fullname,
            img:val.img,
            id:val._id,                         
        })
    }
    index.instractors = instractors
    /*tutorials*/
    let tutorials=[]
    for (let val of e.tutorials) {
        tutorials.push({
            section:lang=="ar"?val.section_ar:val.section_en,
            videos:val.videos,
            id:val._id,                         
        })
    }
    index.tutorials = tutorials

    return index;
}
