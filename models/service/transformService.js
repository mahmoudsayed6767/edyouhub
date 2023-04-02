
export async function transformGallery(e,lang) {
    let index ={
        title:lang=="ar"?e.title_ar:e.title_en,
        title_ar:e.title_ar,
        title_en:e.title_en,
        imgs:e.imgs,
        business:e.business,
        id: e._id,
        createdAt: e.createdAt,
    }
    return index
}
