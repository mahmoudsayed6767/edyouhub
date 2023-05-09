import { isInArray } from "../../helpers/CheckMethods";

export async function transformPost(e,lang,myUser,userId) {
    let index = {
        content: e.content,
        ownerType: e.ownerType,
        files:e.files,
        likesCount:e.likesCount,
        type:e.type,
        commentsCount:e.commentsCount,
        dataType:e.dataType,
        isLike:userId?isInArray(e.likedList,userId):false,
        id:e._id,
        createdAt: e.createdAt
    }
    if(e.business){
        let business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
            hasPackage:e.business.hasPackage,

        }
        if (e.business.package) {
            business.package = {
                title:lang=="ar"?e.business.package.title_ar:e.business.package.title_en,
                type:e.business.package.type,
                badgeType:e.business.package.badgeType,
                dataView:e.business.package.dataView,
                id: e.business.package._id,
            }
        }
        index.business = business
    }
    if(e.owner){
        let owner={
            fullname:e.owner.fullname,
            img:e.owner.img,
            id:e.owner._id,
        }
        index.owner = owner
    }
    /*options*/
    let options = []
    for (let val of e.options) {
        let option = {
            title: val.title,
            chosenUsers:val.chosenUsers,
            chosenCount:val.chosenCount,
            id: val._id,
        }
        options.push(option)
    }
    index.options = options;
    if(e.vacancy) {
        let vacancy = {
            profession:e.vacancy.profession,
            requirements:e.vacancy.requirements,
            description: e.vacancy.description,
            id: e.vacancy._id,
            createdAt: e.vacancy.createdAt,   
        }
        index.vacancy = vacancy;
    }
    if(e.admission){
        let admission = {
            status:e.admission.status,
            title: e.admission.title,
            description: e.admission.description,
            fromDate: e.admission.fromDate,
            toDate: e.admission.toDate,
            allGrades:e.admission.allGrades,
            id: e.admission._id,                  
        }
        /*grades*/
        let grades=[]
        for (let val of e.admission.grades) {
            grades.push({
                name:lang=="ar"?val.name_ar:val.name_en,
                cost: val.cost,
                id:val._id,                         
            })
        }
        admission.grades = grades;
        /*faculties*/
        let faculties=[]
        for (let val of e.admission.faculties) {
            let faculty = {
                name:lang=="ar"?val.faculty.name_ar:val.faculty.name_en,
                id:val.faculty._id,                         
            }
            let grades=[]
            for (let val2 of val.grades) {
                grades.push({
                    name:lang=="ar"?val2.name_ar:val2.name_en,
                    cost: val2.cost,
                    id:val2._id,                         
                })
            }
            faculty.grades = grades;
            faculties.push(faculty)
        }
        admission.faculties = faculties;
        index.admission = admission;
    }
    if(e.event) {
        let event = {
            title:e.event.title,
            fromDate:e.event.fromDate,
            toDate:e.event.toDate,
            time:e.event.time,
            description: e.event.description,
            shortDescription:e.event.shortDescription,
            id: e.event._id,
            createdAt: e.event.createdAt,   
            imgs:e.event.imgs,
            feesType:e.event.feesType,
            paymentMethod:e.event.paymentMethod,
            cashPrice:e.event.cashPrice,
            hostname:e.event.hostname,
            address:e.event.address,
            location:e.event.location,
            contactNumbers:e.event.contactNumbers,
            ownerType:e.event.ownerType,

        }
        /*usersParticipants*/
        let usersParticipants=[]
        for (let val of e.event.usersParticipants) {
            usersParticipants.push({
                fullname:val.fullname,
                img:val.img,
                id:val._id,                         
            })
        }
        event.usersParticipants = usersParticipants;
        /*businessParticipants*/
        let businessParticipants=[]
        for (let val of e.event.businessParticipants) {
            businessParticipants.push({
                name:lang=="ar"?val.name_ar:val.name_en,
                img:val.img,
                id: val._id,                      
            })
        }
        event.businessParticipants = businessParticipants;
        index.event = event;
    }
    return index
}
export async function transformPostById(e,lang,myUser,userId) {
    let index = {
        content: e.content,
        ownerType: e.ownerType,
        files:e.files,
        likesCount:e.likesCount,
        type:e.type,
        commentsCount:e.commentsCount,
        dataType:e.dataType,
        isLike:userId?isInArray(e.likedList,userId):false,
        id:e._id,
        createdAt: e.createdAt
    }
    if(e.business){
        let business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
            hasPackage:e.business.hasPackage,

        }
        if (e.business.package) {
            business.package = {
                title:lang=="ar"?e.business.package.title_ar:e.business.package.title_en,
                type:e.business.package.type,
                badgeType:e.business.package.badgeType,
                dataView:e.business.package.dataView,
                id: e.business.package._id,
            }
        }
        index.business = business

    }
    if(e.owner){
        let owner={
            fullname:e.owner.fullname,
            username:e.owner.username,
            img:e.owner.img,
            id:e.owner._id,
        }
        index.owner = owner
    }
    /*options*/
    let options = []
    for (let val of e.options) {
        let option = {
            title: val.title,
            chosenUsers:val.chosenUsers,
            chosenCount:val.chosenCount,
            id: val._id,
        }
        options.push(option)
    }
    index.options = options;
    if(e.vacancy) {
        let vacancy = {
            profession:e.vacancy.profession,
            requirements:e.vacancy.requirements,
            description: e.vacancy.description,
            id: e.vacancy._id,
            createdAt: e.vacancy.createdAt,   
        }
        index.vacancy = vacancy;
    }
    if(e.admission){
        let index = {
            status:e.admission.status,
            title: e.admission.title,
            description: e.admission.description,
            fromDate: e.admission.fromDate,
            toDate: e.admission.toDate,
            maxApplications:e.admission.maxApplications,
            maxAcceptance: e.admission.maxAcceptance,
            applications:e.admission.applications,
            acceptance:e.admission.acceptance,
            allGrades:e.admission.allGrades,
            id: e.admission._id,
            createdAt: e.admission.createdAt,                       
        }
        /*grades*/
        let grades=[]
        for (let val of e.admission.grades) {
            grades.push({
                name:lang=="ar"?val.name_ar:val.name_en,
                cost: val.cost,
                id:val._id,                         
            })
        }
        admission.grades = grades;
        index.admission = admission;
    }
    if(e.event) {
        let event = {
            title:e.event.title,
            fromDate:e.event.fromDate,
            toDate:e.event.toDate,
            time:e.event.time,
            description: e.event.description,
            shortDescription:e.event.shortDescription,
            id: e.event._id,
            createdAt: e.event.createdAt,   
            imgs:e.event.imgs,
            feesType:e.event.feesType,
            paymentMethod:e.event.paymentMethod,
            cashPrice:e.event.cashPrice,
            hostname:e.event.hostname,
            address:e.event.address,
            location:e.event.location,
            contactNumbers:e.event.contactNumbers,
            ownerType:e.event.ownerType,

        }
        /*usersParticipants*/
        let usersParticipants=[]
        for (let val of e.event.usersParticipants) {
            usersParticipants.push({
                fullname:val.fullname,
                img:val.img,
                id:val._id,                         
            })
        }
        event.usersParticipants = usersParticipants;
        /*businessParticipants*/
        let businessParticipants=[]
        for (let val of e.event.businessParticipants) {
            businessParticipants.push({
                name:lang=="ar"?val.name_ar:val.name_en,
                img:val.img,
                id: val._id,                      
            })
        }
        event.businessParticipants = businessParticipants;
        index.event = event;
    }
    return index
}
