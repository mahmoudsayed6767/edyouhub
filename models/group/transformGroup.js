
import {isInArray} from "../../helpers/CheckMethods";
import moment from "moment"
export async function transformGroup(e,lang,myUser,userId) {
    let index = {
        name:e.name,
        about:e.about,
        type:e.type,
        img:e.img,
        shortDescription:e.shortDescription,
        isVerified:e.isVerified,
        usersCount:e.usersCount,
        postedType:e.postedType,
        isParticipant:userId?isInArray(myUser.groups,e._id):false,
        joinRequest:userId?isInArray(myUser.groupJoinRequests,e._id):false,
        createdAt:e.createdAt,
        id: e._id,                    
    }
    if(e.owner){
        index.owner = {
            fullname:e.owner.fullname,
            img:e.owner.img,
            id:e.owner._id,  
        }
    }
    /*admins*/
    let admins=[]
    for (let val of e.admins) {
        admins.push({
            fullname:val.fullname,
            img:val.img,
            id:val._id,                         
        })
    }
    index.admins = admins;
    return index
}
export async function transformGroupById(e,lang,myUser,userId) {
    let index = {
        name:e.name,
        about:e.about,
        type:e.type,
        img:e.img,
        description:e.description,
        shortDescription:e.shortDescription,
        isVerified:e.isVerified,
        usersCount:e.usersCount,
        postedType:e.postedType,
        isParticipant:userId?isInArray(myUser.groups,e._id):false,
        joinRequest:userId?isInArray(myUser.groupJoinRequests,e._id):false,
        createdAt:e.createdAt,
        id: e._id,                    
    }
    if(e.owner){
        index.owner = {
            fullname:e.owner.fullname,
            img:e.owner.img,
            id:e.owner._id,  
        }
    }
    /*admins*/
    let admins=[]
    for (let val of e.admins) {
        admins.push({
            fullname:val.fullname,
            img:val.img,
            id:val._id,                         
        })
    }
    index.admins = admins
    /*displayBanars*/
    let displayBanars=[]
    for (let val of e.displayBanars) {
        displayBanars.push({
            imgs: val.imgs,
            link: val.link,
            viewOn: val.viewOn,
            type: val.type,
            openPeriod: val.openPeriod,
            end: val.end,
            startDate: moment(val.startDateMillSec).format(),
            endDate: moment(val.endDateMillSec).format(),
            id: val._id,                     
        })
    }
    index.displayBanars = displayBanars
    /*staticBanars*/
    let staticBanars=[]
    for (let val of e.staticBanars) {
        staticBanars.push({
            imgs: val.imgs,
            link: val.link,
            viewOn: val.viewOn,
            type: val.type,
            openPeriod: val.openPeriod,
            end: val.end,
            startDate: moment(val.startDateMillSec).format(),
            endDate: moment(val.endDateMillSec).format(),
            id: val._id,                     
        })
    }
    index.staticBanars = staticBanars
    if(e.sponserPost) {
        let sponserPost = {
            content: e.sponserPost.content,
            status:e.sponserPost.status,
            ownerType: e.sponserPost.ownerType,
            files:e.sponserPost.files,
            likesCount:e.sponserPost.likesCount,
            type:e.sponserPost.type,
            commentsCount:e.sponserPost.commentsCount,
            dataType:e.sponserPost.dataType,
            viewPlaceType:e.sponserPost.viewPlaceType,
            sponser:e.sponser,
            isLike:userId?isInArray(e.sponserPost.likedList,userId):false,
            id:e.sponserPost._id,
            createdAt: e.sponserPost.createdAt
        }
        index.sponserPost = sponserPost
    }
    
    return index
}
export async function transformParticipant(e,lang,myUser,userId) {
    let index = {
        status:e.status,
        createdAt:e.createdAt,
        id: e._id,                    
    }
    if(e.user){
        index.user = {
            fullname:e.user.fullname,
            img:e.user.img,
            id:e.user._id,  
        }
    }
    return index
}
