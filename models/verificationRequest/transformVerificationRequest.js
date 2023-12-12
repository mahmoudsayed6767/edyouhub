
export async function transformVerificationRequest(e,lang) {
    let index = {
        status:e.status,
        taxId:e.taxId,
        commercialRegistry:e.commercialRegistry,
        managerId:e.managerId,
        accountName:e.accountName,
        accountNumber:e.accountNumber,
        bankName:e.bankName,
        bankBranch:e.bankBranch,
        iban:e.iban,
        swiftCode:e.swiftCode,
        key:e.key,
        id: e._id,
        createdAt: e.createdAt,                       
    }
    if (e.owner) {
        index.owner = {
            phone: e.owner.phone,
            fullname: e.owner.fullname,
            type: e.owner.type,
            id: e.owner._id
        }
    }
    if(e.business){
        let business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
        }
        index.business = business

    }
    if(e.package){
        index.package = {
            title:lang=="ar"?e.package.title_ar:e.package.title_en,
            type:e.package.type,
            badgeType:e.package.badgeType,
            dataView:e.package.dataView,
            id: e.package._id,
        }
    }
    return index
}

export async function transformVerificationRequestById(e,lang) {
    let index = {
        status:e.status,
        taxId:e.taxId,
        commercialRegistry:e.commercialRegistry,
        managerId:e.managerId,
        accountName:e.accountName,
        accountNumber:e.accountNumber,
        bankName:e.bankName,
        bankBranch:e.bankBranch,
        iban:e.iban,
        swiftCode:e.swiftCode,
        key:e.key,
        id: e._id,
        createdAt: e.createdAt,                       
    }
    if (e.owner) {
        index.owner = {
            phone: e.owner.phone,
            fullname: e.owner.fullname,
            type: e.owner.type,
            id: e.owner._id
        }
    }
    if(e.business){
        let business = {
            name:lang=="ar"?e.business.name_ar:e.business.name_en,
            img:e.business.img,
            id: e.business._id,
        }
        index.business = business

    }
    if(e.package){
        index.package = {
            title:lang=="ar"?e.package.title_ar:e.package.title_en,
            type:e.package.type,
            badgeType:e.package.badgeType,
            dataView:e.package.dataView,
            id: e.package._id,
        }
    }
    return index
}
