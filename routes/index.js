import express from 'express';
import userRoute from './user/user.route';
import offerRoute  from './offer/offer.route';
import ReportRoute  from './reports/report.route';
import NotifRoute  from './notif/notif.route';
import AboutRoute  from './about/about.route';
import AdminRoute  from './admin/admin.route';
import billRoute  from './bill/bill.route';
import educationInstitutionRoute  from './education institution/education institution.route';
import favouriteRoute  from './favourite/favourite.route';
import termsRoute  from './terms/terms.route';
import settingRoute  from './setting/setting.route';
import contactRoute  from './contact/contact.route';
import categoriesRoute  from './category/category.route';
import educationSystemRoute  from './education system/education system.route';
import placeRoute  from './place/place.route';
import packagesRoute from './package/package.route';
import fundsRoute from './fund/fund.route';
import premiumsRoute from './premium/premium.route';
import feesRoute from './fees/fees.route';
import studentRoute from './student/student.route';
import countriesRoute from './country/country.route';
import citiesRoute from './city/city.route';
import businessRoute from './business/business.route';
import transactionsRoute from './transactions/transactions.route';
import colorRoute from './color/color.route';
import couponRoute from './coupon/coupon.route';
import productRoute from './product/product.route';
import suppliesRoute from './supplies/supplies.route';
import brandRoute from './brand/brand.route';
import cartsRoute from './cart/cart.route';
import ordersRoute from './order/order.route';
import gradeRoute from './grade/grade.route';
import individualSuppliesRoute from './individual supplies/individual supplies.route';
import branchRoute  from './branch/branch.route';
import offerCartRoute  from './offerCart/offerCart.route';
import specializationRoute from './specialization/specialization.route'
import { requireAuth } from '../services/passport';
import AdmissionRoute from "./admission/admission.route";
import VacancyRoute from "./vacancy/vacancy.route";
import AdmissionRequestRoute from "./admissionRequest/admissionRequest.route"
import VacancyRequest from "./vacancyRequest/vacancyRequest.route"
import HigherEducation from "./higherEducation/higherEducation.route"
import FollowRoute from "./follow/follow.route"
import MessageRoute from "./message/message.route"
import connectionRoute from "./connection/connection.route"
const router = express.Router();
router.use('/offerCart', offerCartRoute);
router.use('/HigherEducations', HigherEducation);
router.use('/follow', FollowRoute);
router.use('/messages', MessageRoute);
router.use('/connections', connectionRoute);
router.use('/admissions', AdmissionRoute);
router.use('/vacancies', VacancyRoute);
router.use('/admissionRequests', AdmissionRequestRoute);
router.use('/vacancyRequests', VacancyRequest);
router.use('/cart', cartsRoute);
router.use('/specializations', specializationRoute);
router.use('/branches',branchRoute);
router.use('/branches',branchRoute);
router.use('/grades', gradeRoute);
router.use('/individualSupplies', individualSuppliesRoute);
router.use('/', userRoute);
router.use('/brands',brandRoute);
router.use('/colors',colorRoute);
router.use('/coupons',couponRoute);
router.use('/products',productRoute);
router.use('/supplies',suppliesRoute);
router.use('/orders',ordersRoute);

router.use('/transactions', transactionsRoute);
router.use('/funds',fundsRoute);
router.use('/fees',feesRoute);
router.use('/countries',countriesRoute);
router.use('/cities',citiesRoute);
router.use('/students',studentRoute);
router.use('/premiums',premiumsRoute);
router.use('/business',businessRoute);
router.use('/educationInstitutions',educationInstitutionRoute);
router.use('/contact-us',contactRoute);
router.use('/educationSystems',educationSystemRoute);
router.use('/places',placeRoute);
router.use('/categories',categoriesRoute);
router.use('/offers',offerRoute);
router.use('/setting',settingRoute);
router.use('/reports',requireAuth, ReportRoute);
router.use('/notif',requireAuth, NotifRoute);
router.use('/admin',requireAuth, AdminRoute);
router.use('/about',AboutRoute);
router.use('/bills',billRoute);
router.use('/favourites',favouriteRoute);
router.use('/terms',termsRoute);
router.use('/packages',packagesRoute);

export default router;
