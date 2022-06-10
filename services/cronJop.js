import Schedule from 'node-schedule';
import moment from 'moment';
import Offer from "../models/offer/offer.model";
import User from "../models/user/user.model";
import Notif from "../models/notif/notif.model";
import { sendNotifiAndPushNotifi } from "../services/notification-service";
import Logger from "../services/logger";
const logger = new Logger('cronJop '+ new Date(Date.now()).toDateString())
export function cronJop() {
    try { //    */2 * * * *
        //sec min hour day month year
        Schedule.scheduleJob('*/10 * * * * *', async function(){
            console.log("cron")
            Offer.find({deleted:false,end:false,toDateMillSec:{$lte:Date.parse(new Date())}})
            .then(async(data)=>{
                data.map(async(e) =>{
                    Offer.findByIdAndUpdate(e.id,{end:true},{new:true}).then((docs)=>{
                        console.log('done update offer')
                        
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