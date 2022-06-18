
export async function transformFund(e,lang) {
    let index = {
        fullname:e.fullname,
        address:e.address,
        phone:e.phone,
        job:e.job,
        reason:e.reason,
        totalFees:e.totalFees,
        endDate:e.endDate,
        status:e.status,
        firstPaid:e.firstPaid,
        id:e._id
    }
    if(e.owner){
        index.owner = {
            phone:e.owner.phone,
            fullname:e.owner.fullname,
            id:e.owner._id
        }
    }
    return index
}
export async function transformFundById(e,lang) {
    let index = {
        reason:e.reason,
        fullname:e.fullname,
        address:e.address,
        phone:e.phone,
        job:e.job,
        workPosition:e.workPosition,
        firstPaid:e.firstPaid,
        personalId:e.personalId,
        personalIdImgs:e.personalIdImgs,
        utilityBills:e.utilityBills,
        billType:e.billType,
        utilityBillsImgs:e.utilityBillsImgs,
        proofIncome:e.proofIncome,
        proofIncomeImgs:e.proofIncomeImgs,
        totalFees:e.totalFees,
        endDate:e.endDate,
        status:e.status,
        id:e._id
    }
    if(e.owner){
        index.owner = {
            phone:e.owner.phone,
            fullname:e.owner.fullname,
            id:e.owner._id
        }
    }
    /* students*/
    let students=[]
    for (let val of e.students) {
        let student = {
            studentName:val.studentName,
            type:val.type,
            year:val.year,
            busFees:val.busFees,
            tuitionFees:val.tuitionFees,
            feesLetter:val.feesLetter,
            id:val._id,                         
        }
        if(val.educationPhase){
            student.educationPhase = {
                educationPhase:lang=="ar"?val.educationPhase.educationPhase_ar:val.educationPhase.educationPhase_en,
                id: val.educationPhase._id,
            }
        }
        if(val.educationSystem){
            student.educationSystem = {
                educationSystem:lang=="ar"?val.educationSystem.educationSystem_ar:val.educationSystem.educationSystem_en,
                img: val.educationSystem.img,
                id: val.educationSystem._id,
            }
        }
        if(val.educationInstitution){
            student.educationInstitution = {
                educationInstitution:lang=="ar"?val.educationInstitution.educationInstitution_ar:val.educationInstitution.educationInstitution_en,
                id: val.educationInstitution._id,
            }
        }
        students.push(student)
    }
    index.students = students;
    return index
}
