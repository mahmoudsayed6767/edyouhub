import {isInArray} from "../../helpers/CheckMethods";

export async function transformBusiness(e,lang,myUser,userId) {
    let index = {
        businessName: lang == "ar" ? e.name_ar : e.name_en,
        phones: e.phones,
        email: e.email,
        img: e.img,
        reason: e.reason,
        status: e.status,
        isFollowed:userId?isInArray(myUser.following,e._id):false,
        createdAt: e.createdAt,
        id: e._id
    }
    if (e.owner) {
        index.owner = {
            phone: e.owner.phone,
            fullname: e.owner.fullname,
            type: e.owner.type,
            id: e.owner._id
        }
    }
    return index
}
export async function transformBusinessById(e, lang,myUser,userId) {
    let index = {
        businessName: lang == "ar" ? e.name_ar : e.name_en,
        name_en: e.name_en,
        name_ar: e.name_ar,
        bio: lang == "ar" ? e.bio_ar : e.bio_en,
        bio_en: e.bio_en,
        bio_ar: e.bio_ar,
        webSite: e.webSite,
        facebook: e.facebook,
        twitter: e.twitter,
        instagram: e.instagram,
        youTube:e.youTube,
        linkedin:e.linkedin,
        gallery: e.gallery,
        phones: e.phones,
        studyType: e.studyType,
        email: e.email,
        img: e.img,
        reason: e.reason,
        status: e.status,
        isFollowed:userId?isInArray(myUser.following,e._id):false,
        createdAt: e.createdAt,
        id: e._id
    }
    if (e.owner) {
        index.owner = {
            phone: e.owner.phone,
            fullname: e.owner.fullname,
            type: e.owner.type,
            id: e.owner._id
        }
    }
    if (e.sector) {
        index.sector = {
            name: lang == "ar" ? e.sector.name_ar : e.sector.name_en,
            img: e.sector.img,
            id: e.sector._id,
        }
    }
    if (e.subSector) {
        index.subSector = {
            name: lang == "ar" ? e.subSector.name_ar : e.subSector.name_en,
            img: e.subSector.img,
            id: e.subSector._id,
        }
    }
    /*educationSystem*/
    if (e.educationSystem) {
        index.educationSystem = {
            name: lang == "ar" ? e.educationSystem.name_ar : e.educationSystem.name_en,
            img: e.educationSystem.img,
            id: e.educationSystem._id,
        }
    }
    /* branches*/
    if (e.branches.length > 0) {
        let branches = []
        let arr = [...e.branches.slice(0, 3)]
        for (let val of arr) {
            let branch = {
                address: lang == "ar" ? val.address_ar : val.address_en,
                phone: val.phone,
                email: val.email,
                img: val.img,
                location: val.location,
                id: val._id,
            }
            if (val.country) {
                branch.country = {
                    name: lang == "ar" ? val.country.name_ar : val.country.name_en,
                    id: val.country._id
                }
            }
            if (val.city) {
                console.log(val.city)
                branch.city = {
                    name: lang == "ar" ? val.city.name_ar : val.city.name_en,
                    id: val.city._id
                }
            }
            if (val.area) {
                branch.area = {
                    name: lang == "ar" ? val.area.name_ar : val.area.name_en,
                    id: val.area._id
                }
            }
            branches.push(branch)
        }
        index.branches = branches
    }
    if (e.faculties.length == 0) {
        /*grades*/
        let grades = []
        for (let val of e.grades) {
            grades.push({
                name: lang == "ar" ? val.name_ar : val.name_en,
                cost: val.cost,
                id: val._id,
            })
        }
        index.grades = grades;
    }

    /*faculties*/
    let faculties = []
    for (let val of e.faculties) {
        let faculty = {
            name: lang == "ar" ? val.name_ar : val.name_en,
            id: val._id,
        }
        let grades = [];
        for (let value of val.grades) {
            grades.push({
                name: lang == "ar" ? value.name_ar : value.name_en,
                cost: value.cost,
                id: value._id,
            })
        }
        faculty.grades = grades
        faculties.push(faculty)
    }
    index.faculties = faculties;
    if (e.specializations) {
        /*specializations*/
        let specializations = []
        for (let val of e.specializations) {
            specializations.push({
                name: lang == "ar" ? val.name_ar : val.name_en,
                id: val._id,
            })
        }
        index.specializations = specializations;
    }
    if (e.subjects) {
        /*subjects*/
        let subjects = []
        for (let val of e.subjects) {
            subjects.push({
                name: lang == "ar" ? val.name_ar : val.name_en,
                id: val._id,
            })
        }
        index.subjects = subjects;
    }
    return index
}