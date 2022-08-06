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
        hasPromoCode:e.hasPromoCode,
        city:{
            cityName:lang=="ar"?e.city.cityName_ar:e.city.cityName_en,
            id: e.city._id,
        },
        area:{
            areaName:lang=="ar"?e.area.areaName_ar:e.area.areaName_en,
            id: e.area._id,
        },
        createdAt:e.createdAt,
        id: e._id,
    }
    if(e.supplies){
        index.supplies = {
            name:lang=="ar"?e.supplies.name_ar:e.supplies.name_en,
            grade: e.supplies.grade,
            id: e.supplies._id,
        }
    }
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
        accept:e.accept,
        reason:e.reason,
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
    if(e.supplies){
        index.supplies = {
            name:lang=="ar"?e.supplies.name_ar:e.supplies.name_en,
            grade: e.supplies.grade,
            id: e.supplies._id,
        }
    }
    /*items */
    let items = []
    for (let val of e.items) {
        let value ={
            unitCost:val.unitCost,
            product:{ 
                name:lang="ar"?val.product.name_ar:val.product.name_en,
                img:val.product.img[0],
                id: val.product._id,
            },
            count:val.count,
        }
        if(val.color){
            value.color={
                name:lang=="ar"?val.color.name_ar:val.color.name_en,
                id: val.color._id,
                img: val.color.img,
            }
        }
        if(val.size){
            let selectedSize = val.product.sizes[val.size]?val.product.sizes[val.size]:val.product.sizes[0]
            value.size = {
                name:lang=="ar"?selectedSize.name_ar:selectedSize.name_en,
                retailPrice:selectedSize.retailPrice,
                index:selectedSize.index
            }
        }
        items.push(value)
    }
    index.items = items
    return index
}
