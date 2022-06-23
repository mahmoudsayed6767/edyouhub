import express from 'express';
import categoryController from '../../controllers/category/category.controller';
import { requireAuth } from '../../services/passport';
import { multerSaveTo } from '../../services/multer-service';
import { cache } from '../../services/caching'


const router = express.Router();

//find sub category under category without pagenation
router.route('/:categoryId/sub-categories')
    .get( 
        cache(10),
        categoryController.findsubCategory
    );
//find sub category under category with pagenation
router.route('/:categoryId/pagenation-subCategories')
    .get( 
        cache(10),
        categoryController.findsubCategoryPagenation
    );

//find category with pagenation
router.route('/withoutPagenation/get')
    .get( 
        cache(10),
        categoryController.findcategory
    );
router.route('/:categoryId')
    .put(
        requireAuth,
        multerSaveTo('categorys').single('img'),
        categoryController.validateBody(true),
        categoryController.update
    )
    .get(cache(10),categoryController.findById)
    .delete(requireAuth,categoryController.delete);

router.route('/')
    .post(
        requireAuth,
        multerSaveTo('categorys').single('img'),
        categoryController.validateBody(),
        categoryController.create
    )
    .get(cache(10),categoryController.findcategoryPagenation);


export default router;
