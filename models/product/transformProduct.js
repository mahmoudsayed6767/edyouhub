
export async function transformProduct(e,lang) {
    let index ={
        name:lang=="ar"?e.name_ar:e.name_en,
        name_en:e.name_en,
        name_ar:e.name_ar,
        quantity:e.quantity,
        sku:e.sku,
        img:e.img,
        available:e.available,
        id: e._id,
    }
    if(e.brand){
        index.brand ={
            name:lang=="ar"?e.brand.name_ar:e.brand.name_en,
            id: e.brand._id,
            img: e.brand.img,
        }
    }
    if(e.category){
        index.category = {
            name:lang=="ar"?e.category.name_ar:e.category.name_en,
            img: e.category.img,
            type: e.category.type,
            id: e.category._id,
        }
    }
    if(e.subCategory){
        index.subCategory = {
            name:lang=="ar"?e.subCategory.name_ar:e.subCategory.name_en,
            id: e.subCategory._id,
            type: e.subCategory.type,
            img: e.subCategory.img,
        }
    }
    /*colors */
    let colors = []
    for (let val of e.colors) {
        let value ={
            name:lang=="ar"?val.name_ar:val.name_en,
            id: val._id,
            img: val.img,
        }
        colors.push(value)
    }
    index.colors = colors
    /*sizes */
    let sizes = []
    for (let val of e.sizes) {
        let value ={
            index:val.index,
            name:lang=="ar"?val.name_ar:val.name_en,
            name_ar:val.name_ar,
            name_en:val.name_en,
            retailPrice:parseFloat(val.retailPrice).toFixed(2),
            costPrice:val.costPrice,
            count:val.count,
        }
        sizes.push(value)
    }
    index.sizes = sizes
 
    return index
}
export async function transformProductById(e,lang,myUser,userId){
    let index ={
        name:lang=="ar"?e.name_ar:e.name_en,
        name_en:e.name_en,
        name_ar:e.name_ar,
        sku:e.sku,
        quantity:e.quantity,
        img:e.img,
        description_ar:e.description_ar,
        description_en:e.description_en,
        description:lang=="ar"?e.description_ar:e.description_en,
        sallCount:e.sallCount,
        available:e.available,
        createdAt:e.createdAt,
        id: e._id,
    }
    if(e.category){
        index.category = {
            name:lang=="ar"?e.category.name_ar:e.category.name_en,
            img: e.category.img,
            type: e.category.type,
            id: e.category._id,
        }
    }
    if(e.subCategory){
        index.subCategory = {
            name:lang=="ar"?e.subCategory.name_ar:e.subCategory.name_en,
            id: e.subCategory._id,
            type: e.subCategory.type,
            img: e.subCategory.img,
        }
    }
    if(e.brand){
        index.brand ={
            name:lang=="ar"?e.brand.name_ar:e.brand.name_en,
            id: e.brand._id,
            img: e.brand.img,
        }
    }
    /*colors */
    let colors = []
    for (let val of e.colors) {
        let value ={
            name:lang=="ar"?val.name_ar:val.name_en,
            id: val._id,
            img: val.img,
        }
        colors.push(value)
    }
    index.colors = colors
    /*sizes */
    let sizes = []
    for (let val of e.sizes) {
        let value ={
            index:val.index,
            name:lang=="ar"?val.name_ar:val.name_en,
            name_ar:val.name_ar,
            name_en:val.name_en,
            retailPrice:parseFloat(val.retailPrice).toFixed(2),
            costPrice:val.costPrice,
            count:val.count,
        }
        sizes.push(value)
    }
    index.sizes = sizes
    return index
}
