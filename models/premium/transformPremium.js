
export async function transformPremium(e,lang) {
    let now = Date.parse(new Date());
    let index = {
        type:e.type,
        cost:e.cost,
        installmentDate:e.installmentDate,
        status:e.status,
        receiptNum:e.receiptNum,
        paidDate:e.paidDate,
        lastPremium:e.lastPremium,
        id:e._id,                         
    }
    if(now > Date.parse(e.installmentDate) && e.status == "PENDING"){
        index.status = "LATE"
    }
    if(e.fund){
        index.fund = {
            fullname:e.fund.fullname,
            address:e.fund.address,
            phone:e.fund.phone,
            job:e.fund.job,
            totalFees:e.fund.totalFees,
            endDate:e.fund.endDate,
            status:e.fund.status,
            id:e.fund._id
        }
    }
    if(e.fees){
        index.fees = {
            status:e.fees.status,
            id:e.fees._id
        },
        index.feesType = e.feesType
    }
    if(e.feesType){
        index.feesType = lang=="ar"?e.feesType.name_ar:e.feesType.name_en
    }
    /* students*/
    let students=[]
    for (let val of e.student) {
        let student = {
            studentName:val.studentName,
            type:val.type,
            grade:val.grade,
            feesLetter:val.feesLetter,
            id:val._id,                         
        }
        if(val.educationInstitutionName){
            student.educationInstitutionName = val.educationInstitutionName
        }else{
            if(val.educationInstitution){
                student.educationInstitutionName = lang=="ar"?val.educationInstitution.name_ar:val.educationInstitution.name_en
            }
        }
        students.push(student)
    }
    index.students = students;
    return index
}
