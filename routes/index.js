import express from 'express';
import userRoute from './user/user.route';
import offerRoute  from './offer/offer.route';
import ReportRoute  from './reports/report.route';
import NotifRoute  from './notif/notif.route';
import AboutRoute  from './about/about.route';
//import AdminRoute  from './admin/admin.route';
import billRoute  from './bill/bill.route';
import educationInstitutionRoute  from './education institution/education institution.route';
import favouriteRoute  from './favourite/favourite.route';
import termsRoute  from './terms/terms.route';
import settingRoute  from './setting/setting.route';
import contactRoute  from './contact/contact.route';
import categoriesRoute  from './category/category.route';
import educationSystemRoute  from './education system/education system.route';
import placeRoute  from './place/place.route';
import educationPhasesRoute  from './education phase/education phase.route';
import packagesRoute from './package/package.route';
import fundsRoute from './fund/fund.route';
import premiumsRoute from './premium/premium.route';
import feesRoute from './fees/fees.route';
import studentRoute from './student/student.route';

import { requireAuth } from '../services/passport';

const router = express.Router();

router.use('/', userRoute);
router.use('/funds',fundsRoute);
router.use('/fees',feesRoute);
router.use('/students',studentRoute);

router.use('/premiums',premiumsRoute);
router.use('/educationPhases',educationPhasesRoute);
router.use('/educationInstitutions',educationInstitutionRoute);
router.use('/contact-us',contactRoute);
router.use('/educationSystems',educationSystemRoute);
router.use('/places',placeRoute);
router.use('/categories',categoriesRoute);
router.use('/offers',offerRoute);
router.use('/setting',settingRoute);
router.use('/reports',requireAuth, ReportRoute);
router.use('/notif',requireAuth, NotifRoute);
//router.use('/admin',requireAuth, AdminRoute);
router.use('/about',AboutRoute);
router.use('/bills',billRoute);
router.use('/favourites',favouriteRoute);
router.use('/terms',termsRoute);
router.use('/packages',packagesRoute);

export default router;
