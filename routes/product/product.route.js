import express from 'express';
import ProductController from '../../controllers/product/product.controller';
import { multerSaveTo } from '../../services/multer-service';
import { requireAuth } from '../../services/passport';
import { parseStringToArrayOfObjectsMw } from '../../utils';

const router = express.Router();

router.route('/')
    .post(
        requireAuth,
        multerSaveTo('products').array('img',10),
        parseStringToArrayOfObjectsMw('colors'),
        parseStringToArrayOfObjectsMw('sizes'),
        ProductController.validateCreatedProduct(),
        ProductController.create
    ).get(ProductController.findAll);

router.route('/withoutPagenation/get')
    .get(ProductController.getAll);

router.route('/:productId')
    .get(ProductController.findById)
    .put(
        requireAuth,
        multerSaveTo('products').fields([
            { name: 'img', maxCount: 10, options: false }
        ]),
        parseStringToArrayOfObjectsMw('colors'),
        parseStringToArrayOfObjectsMw('sizes'),
        ProductController.validateCreatedProduct(true),
        ProductController.update
    )
    .delete(requireAuth,ProductController.delete);

router.route('/:productId/active')
    .put(
        requireAuth,
        ProductController.active
    )

router.route('/:productId/dis-active')
    .put(
        requireAuth,
        ProductController.disactive
    )


export default router;
