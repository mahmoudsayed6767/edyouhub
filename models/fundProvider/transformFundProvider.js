export async function transformFundProvider(e, lang) {
    let index = {
        name:lang=="ar"?e.name_ar:e.name_en,
        name_ar:e.name_ar,
        name_en:e.name_en,
        monthlyPercent:e.monthlyPercent,
        expensesRatio:e.expensesRatio,
        monthlyPercentType:e.monthlyPercentType,
        logo: e.logo,
        fundProviderOffer:e.fundProviderOffer,
        id: e._id,
        createdAt: e.createdAt,
    }
    let programsPercent=[]
    for (let val of e.programsPercent) {
        let monthlyPercent = {
            monthlyPercent:val.monthlyPercent,
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
    return index
}