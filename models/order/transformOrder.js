import { isInArray } from "../../helpers/CheckMethods";
import i18n from "i18n";
import moment from 'moment';


export async function transformOrder(e,lang) {
    let index ={
        total:e.total,
        finalTotal:e.finalTotal,
        delivaryCost:e.delivaryCost,
        discount:e.discount,
        client:{
            fullname:e.client.fullname,
            phone:e.client.phone,
            type:e.client.type,
            id:e.client._id,
        },
        status:e.status,
        paymentSystem:e.paymentSystem,
        freeShipping:e.freeShipping,
        hasPromoCode:e.hasPromoCode,
        accept:e.accept,
        rated: e.rated,
        deliveredDateMillSec:e.deliveredDateMillSec,
        refusedDateMillSec:e.refusedDateMillSec,
        cancelDateMillSec:e.cancelDateMillSec,
        city:{
            cityName:lang=="ar"?e.city.cityName_ar:e.city.cityName_en,
            delivaryCost: e.city.delivaryCost,
            id: e.city._id,
        },
        area:{
            areaName:lang=="ar"?e.area.areaName_ar:e.area.areaName_en,
            delivaryCost: e.area.delivaryCost,
            id: e.area._id,
        },
        rated: e.rated,
        createdAt:e.createdAt,
        id: e._id,
    }
    /*productOrders */
    let productOrders = []
    for (let val of e.productOrders) {
        let value ={
            unitCost:val.unitCost,
            product:{ 
                name:lang="ar"?val.product.name_ar:val.product.name_en,
                img:val.product.img[0],
                id: val.product._id,
            },
            count:val.count,
        }
        productOrders.push(value)
    }
    index.productOrders = productOrders
    return index
}
export async function transformOrderById(e,lang){
    let index ={
        total:e.total,
        finalTotal:e.finalTotal,
        delivaryCost:e.delivaryCost,
        discount:e.discount,
        destination:e.destination,
        address:e.address,
        phone:e.phone,
        client:{
            fullname:e.client.fullname,
            img:e.client.img,
            phone:e.client.phone,
            type:e.client.type,
            id:e.client._id,
        },
        status:e.status,
        paymentSystem:e.paymentSystem,
        hasPromoCode:e.hasPromoCode,
        freeShipping:e.freeShipping,
        accept:e.accept,
        reason:e.reason,
        rated: e.rated,
        deliveredDateMillSec:e.deliveredDateMillSec,
        refusedDateMillSec:e.refusedDateMillSec,
        cancelDateMillSec:e.cancelDateMillSec,
        city:{
            cityName:lang=="ar"?e.city.cityName_ar:e.city.cityName_en,
            delivaryCost: e.city.delivaryCost,
            id: e.city._id,
        },
        area:{
            areaName:lang=="ar"?e.area.areaName_ar:e.area.areaName_en,
            delivaryCost: e.area.delivaryCost,
            id: e.area._id,
        },
        rated: e.rated,
        createdAt:e.createdAt,
        id: e._id,
    }
    if(e.promoCode){
        index.promoCode={
            couponNumber:e.promoCode.couponNumber,
            discountType:e.promoCode.discountType,
            discount:e.promoCode.discount,
            id:e.promoCode._id,
        }
    }
    /*productOrders */
    let productOrders = []
    for (let val of e.productOrders) {
        let value ={
            unitCost:val.unitCost,
            product:{ 
                name:lang="ar"?val.product.name_ar:val.product.name_en,
                img:val.product.img[0],
                id: val.product._id,
            },
            count:val.count,
        }
        productOrders.push(value)
    }
    index.productOrders = productOrders
    return index
}
