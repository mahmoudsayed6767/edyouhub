export async function transformFundProvider(e, lang) {
    let index = {
        name:lang=="ar"?e.name_ar:e.name_en,
        name_ar:e.name_ar,
        name_en:e.name_en,
        monthlyPercent:e.monthlyPercent,
        expensesRatio:e.expensesRatio,
        monthlyPercentType:e.monthlyPercentType,
        hasOffer:e.hasOffer,
        logo: e.logo,
        id: e._id,
        createdAt: e.createdAt,
    }
    let programsPercent=[]
    for (let val of e.programsPercent) {
        let monthlyPercent = {
            oldMonthlyPercent:val.oldMonthlyPercent,
            monthlyPercent:val.monthlyPercent,
            hasOffer:val.hasOffer,
        }
        if(val.fundProgram){
            monthlyPercent.fundProgram = {
                name:lang=="ar"?val.fundProgram.name_ar:val.fundProgram.name_en,
                id:val.fundProgram._id
            }
        }
        programsPercent.push(monthlyPercent)
    }
    index.programsPercent = programsPercent
    if(e.fundProviderOffer){
        let fundProviderOffer = {
            title:lang=="ar"?e.fundProviderOffer.title_ar:e.fundProviderOffer.title_en,
            offerType:e.fundProviderOffer.offerType,
            status:e.fundProviderOffer.status,
            monthlyPercent:e.fundProviderOffer.monthlyPercent,
            id:e.fundProviderOffer._id
        }
        index.fundProviderOffer = fundProviderOffer
    }
    return index
}