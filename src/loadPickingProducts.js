import { getAllPickingProducts } from './firebaseHelpers';

/**
 * Load all picking products from Firestore.
 * This replaces the local Excel loading.
 */
export const loadPickingProducts = async () => {
    return await getAllPickingProducts();
};

export default loadPickingProducts;
