import { isInArray } from "../../helpers/CheckMethods";
export async function transformPlace(e,lang,myUser,userId) {
    let index = {
        name:lang=="ar"?e.name_ar:e.name_en,
        name_en:e.name_en,
        name_ar:e.name_ar,
        phone:e.phone,
        id:e._id,
        logo:e.logo,
        cover:e.cover,
        createdAt:e.createdAt,
    }
    if(e.owner){
        index.owner= {
            fullname:e.owner.fullname,
            id:e.owner._id,
        }
    }
    return index;
}
export async function transformPlaceById(e,lang,myUser,userId) {
    let index = {
        name:lang=="ar"?e.name_ar:e.name_en,
        name_ar:e.name_ar,
        name_en:e.name_en,
        phone:e.phone,
        id:e._id,
        type:e.type,
        logo:e.logo,
        cover:e.cover,
        createdAt:e.createdAt,
    }
    
    if(e.owner){
        index.owner= {
            fullname:e.owner.fullname,
            phone:e.owner.phone,
            id:e.owner._id,
            type:e.owner.type,
            img:e.owner.img,
        }
    }
    /*Categories*/
    let categories=[]
    for (let val of e.categories) {
        categories.push({
            name:lang=="ar"?val.name_ar:val.name_en,
            id:val._id,                         
        })
    }
   
    /* subCategories*/
    let subCategories=[]
    for (let val of e.subCategories) {
        subCategories.push({
            name:lang=="ar"?val.name_ar:val.name_en,
            id:val._id,                         
        })
    }
    index.categories = categories;
    index.subCategories = subCategories;
    /* branches*/
    if(e.branches.length > 0){
        let branches = []
        let arr= [...e.branches.slice(0,1)]
        for (let val of arr) {
            let branch = {
                address:lang=="ar"?val.address_ar:val.address_en,
                phone:val.phone,
                img:val.img,
                location:val.location,
                id:val._id,                         
            }
            if(val.city){
                console.log(val.city)
                branch.city = {
                    name:lang=="ar"?val.city.name_ar:val.city.name_en,
                    id:val.city._id
                }
            }
            if(val.area){
                branch.area = {
                    name:lang=="ar"?val.area.name_ar:val.area.name_en,
                    id:val.area._id
                }
            }
            branches.push(branch)
        }
        index.branches = branches[0]
    }
    return index;
}
