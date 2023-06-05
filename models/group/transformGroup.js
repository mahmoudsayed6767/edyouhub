
import {isInArray} from "../../helpers/CheckMethods";

export async function transformGroup(e,lang,myUser,userId) {
    let index = {
        name:e.name,
        about:e.about,
        type:e.type,
        postedType:e.postedType,
        isParticipant:userId?isInArray(myUser.groups,userId):false,
        createdAt:e.createdAt,
        id: e._id,                    
    }
    if(e.owner){
        index.owner = {
            fullname:val.fullname,
            img:val.img,
            id:val._id,  
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
        postedType:e.postedType,
        isParticipant:userId?isInArray(myUser.groups,userId):false,
        createdAt:e.createdAt,
        id: e._id,                    
    }
    if(e.owner){
        index.owner = {
            fullname:val.fullname,
            img:val.img,
            id:val._id,  
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
            fullname:val.fullname,
            img:val.img,
            id:val._id,  
        }
    }
    return index
}
