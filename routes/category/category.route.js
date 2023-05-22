import express from 'express';
import CategoryController from '../../controllers/category/category.controller';
import { requireAuth } from '../../services/passport';
import { multerSaveTo } from '../../services/multer-service';
import { permissions } from '../../services/permissions';


const router = express.Router();

//find sub category under category without pagenation
router.route('/:categoryId/sub-categories')
    .get(
        CategoryController.findsubCategory
    )

//find sub category under category with pagenation

router.route('/:categoryId/pagenation-subCategories')
    .get(
        CategoryController.findsubCategoryPagenation
    )
//find category under category with pagenation

router.route('/pagenation-categories')
    .get(
        CategoryController.findCategoryPagenation
    )
router.route('/:categoryId')
    .put(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('categories').single('img'),
        CategoryController.validateBody(true),
        CategoryController.update
    )
    .get(CategoryController.findById)
    .delete(requireAuth,permissions('ADMIN'),CategoryController.delete);

router.route('/')
    .post(
        requireAuth,
        permissions('ADMIN'),
        multerSaveTo('categories').single('img'),
        CategoryController.validateBody(),
        CategoryController.create
    )
    .get(CategoryController.findCategory);

router.route('/createMulti/categories')
    .post(
        requireAuth,
        permissions('ADMIN'),
        CategoryController.createMultiCategory
    )

router.route('/createMulti/subCategories')
    .post(
        requireAuth,
        permissions('ADMIN'),
        CategoryController.createMultiSubCategory
    )
    


export default router;
