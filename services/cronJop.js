import Schedule from 'node-schedule';
import moment from 'moment';
import Offer from "../models/offer/offer.model";
import Event from "../models/event/event.model";
import Story from "../models/story/story.model";
import User from "../models/user/user.model";
import Course from '../models/course/course.model';
import FundProviderOffer from "../models/fundProvider/fundProviderOffer.model"
import FundProvider from "../models/fundProvider/fundProvider.model"
import { checkExistThenGet} from "../helpers/CheckMethods";

export function cronJop() {
    try { //    */2 * * * *
        //sec min hour day month year
        Schedule.scheduleJob('*/10 * * * * *', async function(){
            console.log("cron")
            let now = Date.parse(new Date());
            // Offer.find({deleted:false,end:false,toDateMillSec:{$lte:now}})
            // .then(async(data)=>{
            //     data.map(async(e) =>{
            //         Offer.findByIdAndUpdate(e._id,{end:true},{new:true}).then((docs)=>{
            //             console.log('done update offer')
                        
            //         }).catch((err)=>{
            //             console.log(err);
            //         })
            //     })
            // })
            // Story.find({deleted:false,end:false,expireDateMillSec:{$lte:now}})
            // .then(async(data)=>{
            //     data.map(async(e) =>{
            //         Story.findByIdAndUpdate(e._id,{end:true},{new:true}).then((docs)=>{
            //             console.log('done update story')
                        
            //         }).catch((err)=>{
            //             console.log(err);
            //         })
            //     })
            // })
            // Event.find({deleted:false,status:{$ne:'PASS'}})
            // .then(async(data)=>{
            //     data.map(async(e) =>{
            //         let status = e.status;
            //         if(now > e.fromDateMillSec) status = 'CURRENT'
            //         if(now > e.toDateMillSec) status = 'PASS'
            //         Event.findByIdAndUpdate(e._id,{status:status},{new:true}).then((docs)=>{
            //             console.log('done update event')
                        
            //         }).catch((err)=>{
            //             console.log(err);
            //         })
            //     })
            // })
            // Course.find({deleted:false,status:{$ne:'DONE'}})
            // .then(async(data)=>{
            //     data.map(async(e) =>{
            //         let status = e.status;
            //         if(now > e.fromDateMillSec) status = 'CURRENT'
            //         if(now > e.toDateMillSec) status = 'DONE'
            //         Course.findByIdAndUpdate(e.id,{status:status},{new:true}).then((docs)=>{
            //             console.log('done update course')
                        
            //         }).catch((err)=>{
            //             console.log(err);
            //         })
            //     })
            // })
            // User.find({deleted:false,
            // hasPackage:true,packageEndDateMillSec:{$lte:Date.parse(new Date())}})
            // .then(async(data)=>{
            //     data.map(async(e) =>{
            //         User.findByIdAndUpdate(e._id,{hasPackage:false},{new:true}).then((docs)=>{
            //             console.log('done update user')
                        
            //         }).catch((err)=>{
            //             console.log(err);
            //         })
            //     })
            // })
            FundProviderOffer.find({deleted:false,status:{$ne:'ENDED'}})
            .then(async(data)=>{
                data.map(async(e) =>{
                    let fundProvider = await checkExistThenGet(e.fundProvider,FundProvider)
                    let status = e.status;
                    if(now > e.startDateMillSec){
                        status = 'ACTIVE'
                        //update fun provider program
                        let programsPercent = [];
                        let arr = fundProvider.programsPercent;
                        let arr2 = e.programsPercent;
                        arr.forEach(element => {
                            let newPercent = {
                                oldMonthlyPercent:element.monthlyPercent,
                                fundProgram:element.fundProgram
                            }
                            var found = arr2.find(function(val) {
                                return val.fundProgram == element.fundProgram;
                            }); 
                            if(found){
                                newPercent.monthlyPercent = found.monthlyPercent
                                newPercent.hasOffer = true
                            }else{
                                newPercent.monthlyPercent = element.monthlyPercent
                                newPercent.hasOffer = false
                            }
                            programsPercent.push(newPercent)
                        });
                        fundProvider.hasOffer = true;
                        fundProvider.programsPercent = programsPercent
                        if(e.offerType == "ALL-PROGRAM" && fundProvider.monthlyPercent){
                            fundProvider.oldMonthlyPercent = fundProvider.monthlyPercent
                            fundProvider.monthlyPercent = programsPercent[0].monthlyPercent
                        }
                    }
                    if(now > e.endDateMillSec){
                        status = 'ENDED'
                        fundProvider.fundProviderOffer = null;
                        let programsPercent = [];
                        let arr = fundProvider.programsPercent;
                        arr.forEach(element => {
                            let newPercent = {
                                oldMonthlyPercent:element.oldMonthlyPercent,
                                monthlyPercent: element.oldMonthlyPercent,
                                fundProgram:element.fundProgram,
                                hasOffer:false
                            }
                            programsPercent.push(newPercent)
                        });
                        fundProvider.hasOffer = false;
                        fundProvider.programsPercent = programsPercent
                        fundProvider.monthlyPercent = fundProvider.oldMonthlyPercent
                    }
                    await fundProvider.save();
                    console.log("_id : " + e._id)
                    FundProviderOffer.findByIdAndUpdate(e._id,{status:status},{new:true}).then((docs)=>{
                        console.log('done update FundProviderOffer')
                        
                    }).catch((err)=>{
                        console.log(err);
                    })
                    
                })
            })

        });
    } catch (error) {
        throw error;
    }

}