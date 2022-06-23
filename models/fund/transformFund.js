
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
            type:e.owner.type,
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
        if(e.category){
            index.category = {
                name:lang=="ar"?e.category.name_ar:e.category.name_en,
                img: e.category.img,
                id: e.category._id,
            }
        }
        if(e.subCategory){
            index.subCategory = {
                name:lang=="ar"?e.subCategory.name_ar:e.subCategory.name_en,
                img: e.subCategory.img,
                id: e.subCategory._id,
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
