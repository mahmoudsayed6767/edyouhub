
export async function transformPackage(e,lang) {
    return{
        title:lang=="ar"?e.title_ar:e.title_en,
        title_en:e.title_en,
        title_ar:e.title_ar,
        cost:e.cost,
        coins:e.coins,
        id: e._id,
        createdAt: e.createdAt,
    }
    
}
