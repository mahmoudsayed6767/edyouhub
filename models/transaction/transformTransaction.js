
export async function transformTransaction(e,lang) {
    let index = {
        transactionId:e.transactionId,
        type:e.type,
        status:e.status,
        dateMillSec:e.dateMillSec,
        cost:e.cost,
        tax:e.tax,
        totalCost:e.totalCost,
        billUrl:e.billUrl,
        id: e._id,
    }
    if(e.user){
        let user = {
            fullname:e.user.fullname,
            img:e.user.img?e.user.img:"",
            type:e.user.type,
            id:e.user._id, 
            city:e.user.city?{
                cityName:lang=="ar"?e.user.city.cityName_ar:e.user.city.cityName_en,
                id:e.user.city._id
            }:null
        }
        if(e.user.country){
            user.country={
                countryName:lang=="ar"?e.user.country.countryName_ar:e.user.country.countryName_en,
                id:e.user.country._id
            }
        }
        index.user = user
    }
    if(e.package && e.type =="1"){
        index.package = {
            name:lang=="ar"?e.package.name_ar:e.package.name_en,
            description:lang=="ar"?e.package.description_ar:e.package.description_en,
            defaultPackage:e.package.defaultPackage,
            type:e.package.type,
            id: e.package._id,
        }
        index.packageDuration = e.packageDuration
    }
    if(e.ads){
        index.ads = {
            title:lang=="ar"?e.ads.title_ar:e.ads.title_en,
            unitNumber:e.ads.unitNumber?e.ads.unitNumber:e._id,
            id: e.ads._id,
        }
        
    }
    return index
}