
export async function transformCourseParticipant(e,lang) {
    let index = {
        status:e.status,
        paymentMethod:e.paymentMethod,
        receipt:e.receipt,
        fawryCode:e.fawryCode,
        id:e._id,
        createdAt: e.createdAt
    }
    if(e.course){
        let course={
            feesType: e.course.feesType,
            price:e.course.price,
            id:e.course._id,
        }
        index.course = course
    }
    if(e.user){
        let user={
            fullname:e.user.fullname,
            username:e.user.username,
            phone:e.user.phone,
            email:e.user.email,
            img:e.user.img,
            id:e.user._id,
        }
        index.user = user
    }
    return index
}
