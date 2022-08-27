import { isInArray } from "../../helpers/CheckMethods";
import i18n from "i18n";
import moment from 'moment';


export async function transformOrder(e,lang) {
    let index ={
        total:e.total,
        finalTotal:e.finalTotal,
        delivaryCost:e.delivaryCost,
        totalDiscount:e.totalDiscount,
        client:{
            fullname:e.client.fullname,
            phone:e.client.phone,
            type:e.client.type,
            id:e.client._id,
        },
        status:e.status,
        paymentSystem:e.paymentSystem,
        createdAt:e.createdAt,
        id: e._id,
    }
    if(e.address){
        let address = {
            street:e.address.street,
            address:e.address.address,
            floor:e.address.floor,
            buildingNumber:e.address.buildingNumber,
            id: e.address._id,
        }
        
        if(e.address.city){
            address.city = {
                name:lang=="ar"?e.address.city.name_ar:e.address.city.name_en,
                id: e.address.city._id,
            }
        }
        if(e.address.area){
            address.area = {
                name:lang=="ar"?e.address.area.name_ar:e.address.area.name_en,
                id: e.address.area._id,
            }
        }
        index.address = address
    }
    return index
}
export async function transformOrderById(e,lang){
    let index ={
        total:e.total,
        finalTotal:e.finalTotal,
        delivaryCost:e.delivaryCost,
        totalDiscount:e.totalDiscount,
        destination:e.destination,
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
        createdAt:e.createdAt,
        id: e._id,
    }
    
    
    /*suppliesList */
    let suppliesList = []
    for (let v of e.suppliesList) {
        let list = {
            discount:v.discount
        }
        if(v.promoCode){
            list.promoCode={
                couponNumber:v.promoCode.couponNumber,
                discountType:v.promoCode.discountType,
                discount:v.promoCode.discount,
                id:v.promoCode._id,
            }
        }
        if(v.supplies){
            let supplies = {
                name:lang=="ar"?v.supplies.name_ar:v.supplies.name_en,
                id: v.supplies._id,
            }
            if(v.supplies.educationSystem){
                supplies.educationSystem = {
                    name:lang=="ar"?v.supplies.educationSystem.name_ar:v.supplies.educationSystem.name_en,
                    id: v.supplies.educationSystem._id,
                }
            }
            if(v.supplies.grade){
                supplies.grade = {
                    name:lang=="ar"?v.supplies.grade.name_ar:v.supplies.grade.name_en,
                    id: v.supplies.grade._id,
                }
            }
            list.supplies = supplies
            /*items */
            let items = []
            for (let val of v.items) {
                console.log("lang",val.product.name_en)
                let value ={
                    unitCost:val.unitCost,
                    product:{ 
                        name:lang=="ar"?val.product.name_ar:val.product.name_en,
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
            list.items = items
        }
        suppliesList.push(list)
    }
    index.suppliesList = suppliesList
    if(e.address){
        let address = {
            street:e.address.street,
            address:e.address.address,
            floor:e.address.floor,
            buildingNumber:e.address.buildingNumber,
            id: e.address._id,
        }
        
        if(e.address.city){
            address.city = {
                name:lang=="ar"?e.address.city.name_ar:e.address.city.name_en,
                id: e.address.city._id,
            }
        }
        if(e.address.area){
            address.area = {
                name:lang=="ar"?e.address.area.name_ar:e.address.area.name_en,
                id: e.address.area._id,
            }
        }
        index.address = address
    }
    return index
}
