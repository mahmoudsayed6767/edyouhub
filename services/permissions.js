
import ApiError from '../helpers/ApiError';
import {isInArray } from "../helpers/CheckMethods";
import i18n from 'i18n'
/**
 * 
 * @param {*} permissionType 
 * @returns 
 */
export function permissions(permissionType = 'ADMIN') {
  return (req, res, next) => {
    if(permissionType === 'ADMIN') {
      if(!isInArray(["ADMIN","SUB-ADMIN"],req.user.type)){
        return next(new ApiError(403, i18n.__('admin.auth')));
      }
      next();
    }else{
      next();
    }
  }
}