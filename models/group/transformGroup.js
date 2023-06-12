
import {isInArray} from "../../helpers/CheckMethods";

export async function transformGroup(e,lang,myUser,userId) {
    let index = {
        name:e.name,
        about:e.about,
        type:e.type,
        img:e.img,
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
