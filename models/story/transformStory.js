
export async function transformStory(e,lang) {
    let index ={
        content:e.content,
        preview:e.preview,
        video:e.video,
        type:e.type,
        id: e._id,
        createdAt: e.createdAt,
    }
    if(e.business){
        index.business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
        }
    }
    return index
}
