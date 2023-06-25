
export async function transformPackage(e,lang) {
    return{
        title:lang=="ar"?e.title_ar:e.title_en,
        title_en:e.title_en,
        title_ar:e.title_ar,
        durationType: e.durationType,
        duration: e.duration,
        cost:e.cost,
        discount:e.discount,
        oldCost:e.oldCost,
        type:e.type,
        badgeType:e.badgeType,
        dataView:e.dataView,
        createEvents:e.createEvents,
        createReels:e.createReels,
        createGroups:e.createGroups,
        createBusiness:e.createBusiness,
        enableFollow:e.enableFollow,
        sendingMessages:e.sendingMessages,
        createPosts:e.createPosts,
        createCourses:e.createCourses,
        createVacancies:e.createVacancies,
        createAdmissions:e.createAdmissions,
        id: e._id,
        createdAt: e.createdAt,
    }
    
}
