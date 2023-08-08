
export async function transformFund(e,lang) {
    let index = {
        firstName:e.firstName,
        secondName:e.secondName,
        thirdName:e.thirdName,
        fourthName:e.fourthName,
        workStartDate:e.workStartDate,
        address:e.address,
        phone:e.phone,
        job:e.job,
        jobAddress:e.jobAddress,
        reason:e.reason,
        totalFees:e.totalFees,
        oldTotalFees:e.oldTotalFees,
        endDate:e.endDate,
        status:e.status,
        firstPaid:e.firstPaid,
        active: e.active,
        createdAt: e.createdAt, 
        id:e._id
    }
    if(e.owner){
        index.owner = {
            phone:e.owner.phone,
            fullname:e.owner.fullname,
            type:e.owner.type,
            id:e.owner._id
        }
    }
    /* educationInstitutionName*/
    let educationInstitutionName=[]
    for (let val of e.students) {
        if(val.educationInstitutionName){
            educationInstitutionName.push(val.educationInstitutionName)
        }else{

        }
        if(val.educationInstitution){
            educationInstitutionName.push(lang=="ar"?val.educationInstitution.name_ar:val.educationInstitution.name_en)
        }
    }
    index.educationInstitutionName = educationInstitutionName;
    return index
}
export async function transformFundById(e,lang) {
    let index = {
        reason:e.reason,
        firstName:e.firstName,
        secondName:e.secondName,
        thirdName:e.thirdName,
        fourthName:e.fourthName,
        workStartDate:e.workStartDate,
        address:e.address,
        phone:e.phone,
        job:e.job,
        jobAddress:e.jobAddress,
        workPosition:e.workPosition,
        firstPaid:e.firstPaid,
        personalId:e.personalId,
        personalIdImgs:e.personalIdImgs,
        utilityBills:e.utilityBills,
        billType:e.billType,
        utilityBillsImgs:e.utilityBillsImgs,
        proofIncome:e.proofIncome,
        proofIncomeCost:e.proofIncomeCost,
        proofIncomeImgs:e.proofIncomeImgs,
        totalFees:e.totalFees,
        oldTotalFees:e.oldTotalFees,
        actionType:e.actionType,
        actionFile:e.actionFile,
        actionReply:e.actionReply,
        educationFile:e.educationFile,
        partialAcceptReason:e.partialAcceptReason,
        active:e.active,
        endDate:e.endDate,
        status:e.status,
        id:e._id
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
    if(e.owner){
        index.owner = {
            phone:e.owner.phone,
            fullname:e.owner.fullname,
            type:e.owner.type,
            id:e.owner._id
        }
    }
    if(e.fundProgram){
        index.fundProgram = {
            name:lang=="ar"?e.fundProgram.name_ar:e.fundProgram.name_en,
            monthCount: e.fundProgram.monthCount,
            id: e.fundProgram._id,
        }
    }
    if(e.fundProvider){
        index.fundProvider = {
            name:lang=="ar"?e.fundProvider.name_ar:e.fundProvider.name_en,
            log: e.fundProvider.logo,
            id: e.fundProvider._id,
        }
    }
    /* students*/
    let students=[]
    for (let val of e.students) {
        let student = {
            studentName:val.studentName,
            type:val.type,
            educationInstitutionName:val.educationInstitutionName,
            id:val._id,                         
        }
        if(e.sector){
            student.sector = {
                name:lang=="ar"?e.sector.name_ar:e.sector.name_en,
                img: e.sector.img,
                id: e.sector._id,
            }
        }
        if(e.subSector){
            student.subSector = {
                name:lang=="ar"?e.subSector.name_ar:e.subSector.name_en,
                img: e.subSector.img,
                id: e.subSector._id,
            }
        }
        if(val.educationSystem){
            student.educationSystem = {
                name:lang=="ar"?val.educationSystem.name_ar:val.educationSystem.name_en,
                img: val.educationSystem.img,
                id: val.educationSystem._id,
            }
        }
        if(val.educationInstitution){
            student.educationInstitution = {
                name:lang=="ar"?val.educationInstitution.name_ar:val.educationInstitution.name_en,
                id: val.educationInstitution._id,
            }
        }
        students.push(student)
    }
    index.students = students;
    return index
}
