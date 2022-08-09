
export async function transformSupplies(e,lang) {
    let index ={
        name:lang=="ar"?e.name_ar:e.name_en,
        attachment: e.attachment,
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
export async function transformSuppliesById(e,lang) {
    let index ={
        name:lang=="ar"?e.name_ar:e.name_en,
        attachment: e.attachment,
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
    /*missingItems */
    let missingItems = []
    for (let val of e.missingItems) {
        let value ={
            name:lang=="ar"?val.name_ar:val.name_en,
            count:val.count,
        }
        missingItems.push(value)
    }
    index.missingItems = missingItems
    /*missingItems */
    let stationeries = []
    let health = []
    for (let val of e.existItems) {
        let value ={
            section:lang=="ar"?val.section_ar:val.section_en,
            count:val.count,
        }
        /*items */
        let items = []
        for (let item of val.items) {
            let value2 ={
                count:item.count,
                product:{
                    name:lang=="ar"?item.product.name_ar:item.product.name_en,
                    img:item.product.img,
                    price:item.product.sizes[0].retailPrice,
                    id: item.product._id,
                },
                
            }
            if(item.color){
                value2.color = {
                    name:lang=="ar"?item.color.name_ar:item.color.name_en,
                    id: item.color._id,
                    img: item.color.img,
                }
            }
            if(item.size){
                let selectedSize = item.product.sizes[item.size]?item.product.sizes[item.size]:item.product.sizes[0]
                console.log(selectedSize)
                value2.size = {
                    index:selectedSize.index,
                    name:lang=="ar"?selectedSize.name_ar:selectedSize.name_en,
                    retailPrice:selectedSize.retailPrice,
                    costPrice:selectedSize.costPrice,
                }
            }
            /*alternatives */
            let alternatives = []
            for (let alternative of item.alternatives) {
                let value ={
                    count:alternative.count,
                }
                if(alternative.product){
                    value.product = {
                        name:lang=="ar"?alternative.product.name_ar:alternative.product.name_en,
                        img: alternative.product.img,
                        price:item.product.sizes[0].retailPrice,
                        id: alternative.product._id,
                    }
                }
                if(alternative.color){
                    value.color = {
                        name:lang=="ar"?alternative.color.name_ar:alternative.color.name_en,
                        id: alternative.color._id,
                        img: alternative.color.img,
                    }
                }
                if(alternative.size){
                    let selectedSize = alternative.product.sizes[alternative.size]?alternative.product.sizes[alternative.size]:alternative.product.sizes[0]
                    console.log(selectedSize)
                    value.size = {
                        index:selectedSize.index,
                        name:lang=="ar"?selectedSize.name_ar:selectedSize.name_en,
                        retailPrice:selectedSize.retailPrice,
                        costPrice:selectedSize.costPrice,
                    }
                }
                alternatives.push(value)
            }
            value2.alternatives = alternatives
            items.push(value2)
        }
        value.items = items
        if(val.type=="HEALTH"){
            health.push(value)
        }else{
            stationeries.push(value)
        }
    }
    index.stationeries = stationeries
    index.health = health
    return index
}