import {isInArray} from "../../helpers/CheckMethods";

export async function transformUser(e,lang,myUser,userId) {
    let index = {
        username:e.username,
        fullname:e.fullname,
        email:e.email,
        phone:e.phone,
        type:e.type,
        accountType:e.accountType,
        age:e.age,
        gender:e.gender,
        img:e.img,
        block:e.block,
        affiliateCode:e.affiliateCode,
        isConnected:userId?isInArray(myUser.connections,e._id):false,
        pendingConnect:userId?isInArray(myUser.pendingConnections,e._id):false,
        inRecievedConnectionsList:userId?isInArray(myUser.recievedConnectionsList,e._id):false,
        cashBack:e.cashBack,
        createdAt: e.createdAt,
        hasPackage:e.hasPackage,
        id: e._id
    }
    if (e.package) {
        index.package = {
            title:lang=="ar"?e.package.title_ar:e.package.title_en,
            type:e.package.type,
            badgeType:e.package.badgeType,
            dataView:e.package.dataView,
            id: e.package._id,
        }
    }
    
    return index;
}
export async function transformUserShort(e,lang,myUser,userId) {
    let index = {
        fullname:e.fullname,
        id:e._id,
        type:e.type,
    }
    
    return index;
}
export async function transformUserById(e,lang,myUser,userId) {
    function isEmptyObject(obj) {
        for (let key in obj) {
          if (obj.hasOwnProperty(key)) {
            return false;
          }
        }
        return true;
    }
      
    let index = {
        username:e.username,
        fullname:e.fullname,
        email:e.email,
        phone:e.phone,
        affiliate:e.affiliate,
        id:e._id,
        bio:e.bio,
        type:e.type,
        accountType:e.accountType,
        phoneVerify:e.phoneVerify,
        gender:e.gender,
        img:e.img,
        block:e.block,
        balance:e.balance,
        coins:e.balance,
        cashBack:e.cashBack,
        maritalStatus:e.maritalStatus,
        educationPhase:e.educationPhase,

        experiencesType:e.experiencesType,
        experiencesProfession:e.experiencesProfession,
        experiencesOrganization:e.experiencesOrganization,
        isConnected:userId?isInArray(myUser.connections,e._id):false,
        pendingConnect:userId?isInArray(myUser.pendingConnections,e._id):false,
        inRecievedConnectionsList:userId?isInArray(myUser.recievedConnectionsList,e._id):false,
        hasPackage:e.hasPackage,
        createdAt: e.createdAt,
        
    }
    if(!isEmptyObject(e.schoolInfo)){
        index.schoolInfo = e.schoolInfo
    }
    if(!isEmptyObject(e.universityInfo)){
        index.universityInfo = e.universityInfo
    }
    if(!isEmptyObject(e.job)){
        index.job = e.job
    }
    
    if (e.package) {
        index.package = {
            title:lang=="ar"?e.package.title_ar:e.package.title_en,
            type:e.package.type,
            badgeType:e.package.badgeType,
            dataView:e.package.dataView,
            createEvents:e.package.createEvents,
            createReels:e.package.createReels,
            createGroups:e.package.createGroups,
            createBusiness:e.package.createBusiness,
            enableFollow:e.package.enableFollow,
            sendingMessages:e.package.sendingMessages,
            createPosts:e.package.createPosts,
            createCourses:e.package.createCourses,
            createVacancies:e.package.createVacancies,
            createAdmissions:e.package.createAdmissions,
            id: e.package._id,
        }
    }
    if(e.type =="affiliate"){
        index.affiliateCode = e.affiliateCode
    }
    if(e.place){
        index.place = {
            name:lang=="ar"?e.place.name_ar:e.place.name_en,
            id:e.place._id,
            type:e.place.type,
            logo:e.place.logo,
        }
    }
    if(e.country){
        index.country = {
            name:lang=="ar"?e.country.name_ar:e.country.name_en,
            img: e.country.img,
            id: e.country._id,
        }
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
    if(e.affiliate){
        index.affiliate = {
            username:e.affiliate.username,
            fullname:e.affiliate.fullname,
            email:e.affiliate.email,
            phone:e.affiliate.phone,
            id:e.affiliate._id,
            type:e.affiliate.type,
        }
        
    }
    /*kids*/
    let kids=[]
    for (let val of e.kids) {
        let kid = {
            fullname:val.fullname,
            year:val.year,
            educationInstitutionName:val.educationInstitutionName,
            age:val.age,
        }
        if(val.educationSystem){
            kid.educationSystem = {
                name:lang=="ar"?val.educationSystem.name_ar:val.educationSystem.name_en,
                id:val.educationSystem._id
            }
        }
        kids.push(kid)
    }
    index.kids = kids;

    //education
    /*higherEducation*/
    let higherEducations=[]
    for (let val of e.higherEducation) {
        let value = {
            faculty:val.faculty,                        
        }
        if(val.higherEducation){
            value.higherEducation = {
                name:lang=="ar"?val.higherEducation.name_ar:val.higherEducation.name_en,
                id:e.higherEducation._id
            }
        }
        higherEducations.push(value)
    }
    index.higherEducation = higherEducations;

    /*courses*/
    let courses=[]
    for (let val of e.courses) {
        courses.push({
            courseName:val.courseName,
            organization:val.organization,                        
        })
    }
    index.courses = courses;
    /*workExperiences*/
    let workExperiences=[]
    for (let val of e.workExperiences) {
        workExperiences.push({
            jobTitle:val.jobTitle,
            organization:val.organization,  
            startDate:val.startDate,
            endDate:val.endDate                      
        })
    }
    index.workExperiences = workExperiences;
    return index;
}
