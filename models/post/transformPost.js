import { isInArray } from "../../helpers/CheckMethods";

export async function transformPost(e,lang,myUser,userId) {
    let index = {
        content: e.content,
        group:e.group,
        status:e.status,
        ownerType: e.ownerType,
        files:e.files,
        likesCount:e.likesCount,
        type:e.type,
        commentsCount:e.commentsCount,
        dataType:e.dataType,
        viewPlaceType:e.viewPlaceType,
        sponser:e.sponser,
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
        if (e.business.subSector) {
            business.subSector = {
                name: lang == "ar" ? e.business.subSector.name_ar : e.business.subSector.name_en,
                educationType: e.business.subSector.educationType,
                id: e.business.subSector._id,
            }
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
        if (e.owner.package) {
            owner.package = {
                title:lang=="ar"?e.owner.package.title_ar:e.owner.package.title_en,
                type:e.owner.package.type,
                badgeType:e.owner.package.badgeType,
                dataView:e.owner.package.dataView,
                id: e.owner.package._id,
            }
        }
        index.owner = owner
    }
    if(e.ownerType == "APP"){
        index.appData = {
            fullname:'EdyouHub',
            img:'https://api.staging.edyouhub.com/uploads/7ac20131-4671-4dde-8d84-768dd82e882d.jpg'
        }

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
    let vacancies = []
    if(e.vacancies) {
        for (let val of e.vacancy) {
            vacancies.push({
                type:val.type,
                img:val.img,
                title:val.title,
                id: val._id,
                createdAt: val.createdAt,   
            })
        }
    }
    index.vacancies = vacancies;
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
    
    return index
}
export async function transformPostById(e,lang,myUser,userId) {
    let index = {
        content: e.content,
        group:e.group,
        status:e.status,
        ownerType: e.ownerType,
        files:e.files,
        likesCount:e.likesCount,
        type:e.type,
        commentsCount:e.commentsCount,
        dataType:e.dataType,
        viewPlaceType:e.viewPlaceType,
        sponser:e.sponser,
        isLike:userId?isInArray(e.likedList,userId):false,
        id:e._id,
        createdAt: e.createdAt
    }
    if(e.ownerType == "APP"){
        index.appData = {
            fullname:'EdyouHub',
            img:'https://api.staging.edyouhub.com/uploads/7ac20131-4671-4dde-8d84-768dd82e882d.jpg'
        }

    }
    if(e.business){
        let business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
            hasPackage:e.business.hasPackage,

        }
        if (e.business.subSector) {
            business.subSector = {
                name: lang == "ar" ? e.business.subSector.name_ar : e.business.subSector.name_en,
                educationType: e.business.subSector.educationType,
                id: e.business.subSector._id,
            }
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
        if (e.owner.package) {
            owner.package = {
                title:lang=="ar"?e.owner.package.title_ar:e.owner.package.title_en,
                type:e.owner.package.type,
                badgeType:e.owner.package.badgeType,
                dataView:e.owner.package.dataView,
                id: e.owner.package._id,
            }
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
    if(e.vacancies) {
        for (let val of e.vacancy) {
            vacancies.push({
                type:val.type,
                img:val.img,
                title:val.title,
                id: val._id,
                createdAt: val.createdAt,   
            })
        }
    }
    index.vacancies = vacancies;

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

    return index
}
