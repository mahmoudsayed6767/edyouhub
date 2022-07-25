
export async function transformSupplies(e,lang) {
    let index ={
        name:lang=="ar"?e.name_ar:e.name_en,
        grade: e.grade,
        createdAt:e.createdAt,
        id: e._id,
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
        grade: e.grade,
        createdAt:e.createdAt,
        id: e._id,
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
                product:{
                    name:lang=="ar"?item.product.name_ar:item.product.name_en,
                    img:item.product.img,
                    price:item.product.sizes[0].retailPrice,
                    id: item.product._id,
                },
                count:item.count,
            }
            /*alternatives */
            console.log(item.alternatives)
            let alternatives = []
            for (let alternative of item.alternatives) {
                let value ={
                    size:alternative.size,
                    color:alternative.color,                    
                }
                if(alternative.product){
                    value.product = {
                        name:lang=="ar"?alternative.product.name_ar:alternative.product.name_en,
                        img: alternative.product.img,
                        price:item.product.sizes[0].retailPrice,
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
