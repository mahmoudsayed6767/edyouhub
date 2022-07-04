
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
    if(now > Date.parse(installmentDate) && e.status == "PENDING"){
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
    /* students*/
    let students=[]
    for (let val of e.student) {
    let student = {
        studentName:val.studentName,
        type:val.type,
        year:val.year,
        busFees:val.busFees,
        tuitionFees:val.tuitionFees,
        feesLetter:val.feesLetter,
        id:val._id,                         
    }
    students.push(student)
    }
    index.students = students;
    return index
}
