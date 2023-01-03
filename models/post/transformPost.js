import { isInArray } from "../../helpers/CheckMethods";

export async function transformPost(e,lang,myUser,userId) {
    let index = {
        content: e.content,
        files:e.files,
        likesCount:e.likesCount,
        type:e.type,
        commentsCount:e.commentsCount,
        startDate:e.startDate,
        endDate:e.endDate,
        dataType:e.dataType,
        isLike:userId?isInArray(myUser.likedPosts,e._id):false,
        id:e._id,
        createdAt: e.createdAt
    }
    if(e.owner){
        let owner={
            fullname:e.owner.fullname,
            username:e.owner.username,
            img:e.owner.img,
            id:e.owner._id,
        }
        index.owner = owner
    }
    /*options*/
    let options = []
    for (let val of e.options) {
        let option = {
            name: val.title,
            id: val._id,
        }
        options.push(option)
    }
    index.options = options;
    return index
}
export async function transformPostById(e,lang,myUser,userId) {
    let index = {
        content: e.content,
        files:e.files,
        likesCount:e.likesCount,
        type:e.type,
        commentsCount:e.commentsCount,
        startDate:e.startDate,
        endDate:e.endDate,
        dataType:e.dataType,
        isLike:userId?isInArray(myUser.likedPosts,e._id):false,
        id:e._id,
        createdAt: e.createdAt
    }
    if(e.owner){
        let owner={
            fullname:e.owner.fullname,
            username:e.owner.username,
            img:e.owner.img,
            id:e.owner._id,
        }
        index.owner = owner
    }
    /*options*/
    let options = []
    for (let val of e.options) {
        let option = {
            name: val.title,
            chosenCount:val.chosenCount,
            chosenUsers:val.chosenUsers,
            id: val._id,
        }
        options.push(option)
    }
    index.options = options;
    return index
}
