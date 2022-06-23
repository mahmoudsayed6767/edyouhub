import { isInArray } from "../../helpers/CheckMethods";
export async function transformPlace(e,lang,myUser,userId) {
    let index = {
        name:lang=="ar"?e.name_ar:e.name_en,
        name_en:e.name_en,
        name_ar:e.name_ar,
        phone:e.phone,
        id:e._id,
        logo:e.logo,
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
            categoryName:lang=="ar"?val.name_ar:val.name_en,
            id:val._id,                         
        })
    }
   
    /* subCategories*/
    let subCategories=[]
    for (let val of e.subCategories) {
        subCategories.push({
            categoryName:lang=="ar"?val.name_ar:val.name_en,
            id:val._id,                         
        })
    }
    index.categories = categories;
    index.subCategories = subCategories;
    return index;
}
