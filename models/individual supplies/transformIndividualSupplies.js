
export async function transformIndividualSupplies(e) {
    let index ={
        fullname:e.fullname,
        email:e.email,
        phone:e.phone,
        attachment: e.attachment,
        status:e.status,
        supplies: e.supplies,
        createdAt:e.createdAt,
        id: e._id,
    }
    if(e.grade){
        index.grade ={
            name:lang=="ar"?e.grade.name_ar:e.grade.name_en,
            id: e.grade._id,
        }
    }
    if(e.educationInstitution){
        index.educationInstitution ={
            name:lang=="ar"?e.educationInstitution.name_ar:e.educationInstitution.name_en,
            id: e.educationInstitution._id,
            img: e.educationInstitution.img,
        }
    }
    return index
}
