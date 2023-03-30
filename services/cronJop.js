import Schedule from 'node-schedule';
import moment from 'moment';
import Offer from "../models/offer/offer.model";
import Event from "../models/event/event.model";
import Story from "../models/story/story.model";

export function cronJop() {
    try { //    */2 * * * *
        //sec min hour day month year
        Schedule.scheduleJob('*/10 * * * * *', async function(){
            console.log("cron")
            let now = Date.parse(new Date());
            Offer.find({deleted:false,end:false,toDateMillSec:{$lte:now}})
            .then(async(data)=>{
                data.map(async(e) =>{
                    Offer.findByIdAndUpdate(e.id,{end:true},{new:true}).then((docs)=>{
                        console.log('done update offer')
                        
                    }).catch((err)=>{
                        console.log(err);
                    })
                })
            })
            Story.find({deleted:false,end:false,expireDateMillSec:{$lte:now}})
            .then(async(data)=>{
                data.map(async(e) =>{
                    Story.findByIdAndUpdate(e.id,{end:true},{new:true}).then((docs)=>{
                        console.log('done update story')
                        
                    }).catch((err)=>{
                        console.log(err);
                    })
                })
            })
            Event.find({deleted:false,status:{$ne:'PASS'}})
            .then(async(data)=>{
                data.map(async(e) =>{
                    let status = e.status;
                    if(now > e.fromDateMillSec) status = 'CURRENT'
                    if(now > e.toDateMillSec) status = 'PASS'
                    Event.findByIdAndUpdate(e.id,{status:status},{new:true}).then((docs)=>{
                        console.log('done update event')
                        
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