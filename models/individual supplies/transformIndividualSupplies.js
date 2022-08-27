
export async function transformIndividualSupplies(e) {
    let index ={
        fullname:e.fullname,
        email:e.email,
        phone:e.phone,
        educationInstitution: e.educationInstitution,
        grade: e.grade,
        attachment: e.attachment,
        status:e.status,
        supplies: e.supplies,
        createdAt:e.createdAt,
        id: e._id,
    }
    return index
}
