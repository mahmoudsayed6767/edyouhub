import { isInArray } from "../../helpers/CheckMethods";

export async function transformPost(e,lang,myUser,userId) {
    let index = {
        content: e.content,
        files:e.files,
        likesCount:e.likesCount,
        type:e.type,
        commentsCount:e.commentsCount,
        startDate:e.startDate,
        endDate:e.endDate,
        dataType:e.dataType,
        isLike:userId?isInArray(myUser.likedPosts,e._id):false,
        id:e._id,
        createdAt: e.createdAt
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
            id: e.event._id,
            createdAt: e.event.createdAt,   
        }
        index.event = event;
    }
    return index
}
export async function transformPostById(e,lang,myUser,userId) {
    let index = {
        content: e.content,
        files:e.files,
        likesCount:e.likesCount,
        type:e.type,
        commentsCount:e.commentsCount,
        startDate:e.startDate,
        endDate:e.endDate,
        dataType:e.dataType,
        isLike:userId?isInArray(myUser.likedPosts,e._id):false,
        id:e._id,
        createdAt: e.createdAt
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
            chosenCount:val.chosenCount,
            chosenUsers:val.chosenUsers,
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
            id: e.event._id,
            createdAt: e.event.createdAt,   
        }
        index.event = event;
    }
    return index
}
