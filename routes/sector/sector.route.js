import express from 'express';
import categoryController from '../../controllers/category/category.controller';
import { requireAuth } from '../../services/passport';
import { multerSaveTo } from '../../services/multer-service';
import { cache } from '../../services/caching'


const router = express.Router();

//find sub category under category without pagenation
router.route('/:categoryId/sub-categories')
    .get( 
        
        categoryController.findsubCategory
    );
//find sub category under category with pagenation
router.route('/:categoryId/pagenation-subCategories')
    .get( 
        
        categoryController.findsubCategoryPagenation
    );

//find category with pagenation
router.route('/withoutPagenation/get')
    .get( 
        
        categoryController.findcategory
    );
router.route('/:categoryId')
    .put(
        requireAuth,
        multerSaveTo('categorys').single('img'),
        categoryController.validateBody(true),
        categoryController.update
    )
    .get(categoryController.findById)
    .delete(requireAuth,categoryController.delete);

router.route('/')
    .post(
        requireAuth,
        multerSaveTo('categorys').single('img'),
        categoryController.validateBody(),
        categoryController.create
    )
    .get(categoryController.findcategoryPagenation);


export default router;
