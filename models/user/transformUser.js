export async function transformUser(e,lang,myUser,userId) {
    let index = {
        username:e.username,
        fullname:e.fullname,
        email:e.email,
        phone:e.phone,
        id:e._id,
        type:e.type,
        accountType:e.accountType,
        age:e.age,
        gender:e.gender,
        img:e.img,
        block:e.block,
        affiliateCode:e.affiliateCode,
        cashBack:e.cashBack,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
    }
    
    return index;
}
export async function transformUserById(e,lang,myUser,userId) {
    let index = {
        username:e.username,
        fullname:e.fullname,
        email:e.email,
        phone:e.phone,
        affiliate:e.affiliate,
        id:e._id,
        type:e.type,
        accountType:e.accountType,
        phoneVerify:e.phoneVerify,
        gender:e.gender,
        img:e.img,
        block:e.block,
        balance:e.balance,
        cashBack:e.cashBack,
        maritalStatus:e.maritalStatus,
        educationPhase:e.educationPhase,
        schoolInfo:e.schoolInfo,
        universityInfo:e.universityInfo,
        job:e.job,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        
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
    let higherEducation=[]
    for (let val of e.higherEducation) {
        higherEducation.push({
            higherEducation:{
                name:lang=="ar"?val.higherEducation.name_ar:val.higherEducation.name_en,
                id:e.higherEducation._id
            },
            faculty:val.faculty,                        
        })
    }
    index.higherEducation = higherEducation;

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
