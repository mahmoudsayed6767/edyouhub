export async function transformCategory(e, lang) {
    let index = {
        name:lang=="ar"?e.name_ar:e.name_en,
        name_en:e.name_en,
        name_ar:e.name_ar,
        img:e.img,
        type:e.type,
        hasChild:e.hasChild,
        id: e._id,
        createdAt: e.createdAt,
    }
    let childs = []
    for (let val of e.child) {
        childs.push({
            name:lang=="ar"?val.name_ar:val.name_en,
            name_en:val.name_en,
            name_ar:val.name_ar,
            img:val.img,
            type:val.type,
            parent:val.parent,
            hasChild:val.hasChild,
            id: val._id,
            createdAt: val.createdAt,
        })
    }
    index.childs = childs

    return index
}