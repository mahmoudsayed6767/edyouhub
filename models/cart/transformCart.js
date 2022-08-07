
export async function transformCart(e,lang) {
    let index ={
        id: e._id,
    }
    if(e.supplies){
        let supplies = {
            name:lang=="ar"?e.supplies.name_ar:e.supplies.name_en,
            id: e.supplies._id,
        }
        if(e.supplies.educationSystem){
            supplies.educationSystem = {
                name:lang=="ar"?e.supplies.educationSystem.name_ar:e.supplies.educationSystem.name_en,
                id: e.supplies.educationSystem._id,
            }
        }
        if(e.supplies.grade){
            supplies.grade = {
                name:lang=="ar"?e.supplies.grade.name_ar:e.supplies.grade.name_en,
                id: e.supplies.grade._id,
            }
        }
        index.supplies = supplies
    }
    /*iterms */
    let items = []
    for (let val of e.items) {
        let item ={
            count: val.count,
        }
        if(val.color){
            item.color={
                name:lang=="ar"?val.color.name_ar:val.color.name_en,
                id: val.color._id,
                img: val.color.img,
            }
        }
        if(val.size){
            let selectedSize = val.product.sizes[val.size]?val.product.sizes[val.size]:val.product.sizes[0]
            item.size = {
                name:lang=="ar"?selectedSize.name_ar:selectedSize.name_en,
                retailPrice:selectedSize.retailPrice,
                costPrice:selectedSize.costPrice,
                count:selectedSize.count,
                index:selectedSize.index
            }
        }
        if(val.product){
            let product = {
                name:lang=="ar"?val.product.name_ar:val.product.name_en,
                quantity:val.product.quantity,
                img:val.product.img,
                available:val.product.available,
            }
            
            /*colors */
            let colors = []
            for (let color of val.product.colors) {
                console.log(color)
                let value ={
                    name:lang=="ar"?color.name_ar:color.name_en,
                    id: color._id,
                    img: color.img,
                }
                colors.push(value)
            }
            product.colors = colors
            /*sizes */
            let sizes = []
            for (let size of val.product.sizes) {
                let theSize ={
                    index:size.index,
                    name:lang=="ar"?size.name_ar:size.name_en,
                    retailPrice:size.retailPrice,
                    costPrice:size.costPrice,
                    count:size.count,
                }
                sizes.push(theSize)
            }
            product.sizes = sizes
            item.product = product
        }
        items.push(item)
    }
    index.items = items
    return index
}

