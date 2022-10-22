import express from 'express';
import CategoryController from '../../controllers/category/category.controller';
import { requireAuth } from '../../services/passport';
import { multerSaveTo } from '../../services/multer-service';
import { cache } from '../../services/caching'


const router = express.Router();

//find sub category under category without pagenation
router.get('/:categoryId/sub-categories', CategoryController.findsubCategory);
//find sub category under category with pagenation
router.get('/:categoryId/pagenation-subCategories', CategoryController.findsubCategoryPagenation);
//find category under category with pagenation
router.get('/pagenation-categories', CategoryController.findCategoryPagenation);

router.route('/:categoryId')
    .put(
        requireAuth,
        multerSaveTo('categories').single('img'),
        CategoryController.validateBody(true),
        CategoryController.update
    )
    .get(CategoryController.findById)
    .delete(requireAuth,CategoryController.delete);

router.route('/')
    .post(
        requireAuth,
        multerSaveTo('categories').single('img'),
        CategoryController.validateBody(),
        CategoryController.create
    )
    .get(CategoryController.findCategory);

router.route('/createMulti/categories')
    .post(
        requireAuth,
        CategoryController.createMultiCategory
    )

router.route('/createMulti/subCategories')
    .post(
        requireAuth,
        CategoryController.createMultiSubCategory
    )
    


export default router;
