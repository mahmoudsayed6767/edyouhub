import { isInArray } from "../../helpers/CheckMethods";
import i18n from "i18n";
import moment from 'moment';
export async function transformBill(e,lang) {
    let index = {
        id:e._id,
        offerCode: e.offerCode,
        status:e.status,
        createdAt:e.createdAt,
        doneDate:e.doneDateMillSec
    }
    if(e.place){
        index.place = {
            name:lang=="ar"?e.place.name_ar:e.place.name_en,
            rate:e.place.rate,
            type:e.place.type,
            logo:e.place.logo,
            id:e.place._id,
        }
    }
    if(e.client){
        index.client= {
            fullname :e.client.fullname,
            type:e.client.type,
            id:e.client._id,
        }
    }
    if(e.offer){
        index.offer= {
            title:lang=="ar"?e.offer.title_ar:e.offer.title_en,
            description:lang=="ar"?e.offer.description_ar:e.offer.description_en,
            imgs:e.offer.imgs,
            id:e.offer._id,
        }
    }
    return index;
}
export async function transformBillById(e,lang) {
    let index = {
        offerCode: e.offerCode,
        id:e._id,
        status:e.status,
        createdAt:e.createdAt,
        doneDate:e.doneDateMillSec
    }
    if(e.place){
        index.place = {
            name:lang=="ar"?e.place.name_ar:e.place.name_en,
            rate:e.place.rate,
            id:e.place._id,
            type:e.place.type,
            logo:e.place.logo,
        }
    }
    if(e.client){
        index.client= {
            fullname : e.client.fullname,
            type:e.client.type,
            id:e.client._id,
        }
    }
    if(e.actionUser){
        index.actionUser= {
            fullname : e.actionUser.fullname,
            type : e.actionUser.type,
            id:e.actionUser._id,
        }
    }
    if(e.offer){
        index.offer= {
            title:lang=="ar"?e.offer.title_ar:e.offer.title_en,
            description:lang=="ar"?e.offer.description_ar:e.offer.description_en,
            imgs:e.offer.imgs,
            id:e.offer._id,
        }
    }
    return index;
}
