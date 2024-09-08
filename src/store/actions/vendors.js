import apiFactory from '../../common/services/apiFactory';
import { APP } from '../types';

export const getFoodCategories = (params) => { 
    return new Promise((resolve, reject) => { 
        apiFactory.get(`vendors/food-categories?${params.join('&')}`).then(
          ({ data }) => {
              resolve(data);
          },
          (error) => {
              reject(error);
          }
        );
    });
};

export const getVendors = (
  page = 1,
  latitude = 41.328939,
  longitude = 19.813715,
  orderBy,
  orderDirection,
  perPage = 15,
  filterKeys, 
) => {
    const params = [`lat=${latitude}`, `lng=${longitude}`, `page=${page}`, `per_page=${perPage}`];
    if (orderBy) {
        params.push(`ordering_attribute=${orderBy}`);
        params.push(`ordering_order=${orderDirection}`);
    }

    if (!!filterKeys && filterKeys.length > 0) {
        for (let i = 0; i < filterKeys.length; i++) {
            params.push(filterKeys[i]);
            if (filterKeys[i].includes('ordering_attribute')) {
                params.push('ordering_order=1');
            }
        }
    }
 
    return new Promise(async (resolve, reject) => {
        apiFactory.get(`vendors?${params.join('&')}`).then(
          ({ data }) => {
              resolve(data.vendors);
          },
          (error) => {
              reject(error);
          }
        );
    });
};

export const getVendorDetail=(id, latitude, longitude, order_method)=>{
    let url = `vendors/${id}?lat=${latitude}&lng=${longitude}`;
    if(order_method != null) {
        url = `${url}&order_method=${order_method}`;
    }
    return new Promise((resolve, reject) => { 
        apiFactory.get(url).then(
            ({ data }) => { 
                resolve(data.vendor);
            },
            (error) => { 
                reject(error);
            }
        );
    }); 
}


export const checkVendorOpen=(id)=>{
    let url = `check-vendor-open/${id}`;
    return new Promise((resolve, reject) => { 
        apiFactory.get(url).then(
            ({ data }) => { 
                resolve(data.vendor_open == 1);
            },
            (error) => { 
                reject(error);
            }
        );
    }); 
}

export const getFeaturedBlocks = (latitude = 41.328939, longitude = 19.813715, filterKeys) => async (dispatch) => {
     
    const params = [`lat=${latitude}`, `lng=${longitude}`];
     
    if (!!filterKeys && filterKeys.length > 0) {
        for (let i = 0; i < filterKeys.length; i++) {
            params.push(filterKeys[i]); 
        }
    }
  
    return new Promise(async (resolve, reject) => {
        apiFactory.get(`vendors/mobile-feature-blocks?${params.join('&')}`).then(
          ({ data }) => {
              resolve(data.result);
          },
          (error) => {
              reject(error);
          }
        );
    });
};

export const getProductFavourites = () => async (dispatch) => {
    return new Promise(async (resolve, reject) => {
        apiFactory.get('products/favourites').then(
          ({ data }) => {
            //   dispatch({
            //       type: APP.SET_ALL_FAVOURITES,
            //       payload: data.vendors,
            //   });
              resolve(data.products)
          },
          (error) => {
              reject(error);
          }
        );
    });
};

export const getVendorFavourites = (latitude, longitude) => async (dispatch) => {
    return new Promise(async (resolve, reject) => {
        apiFactory.get(`vendors/favourites?lat=${latitude}&lng=${longitude}`).then(
          ({ data }) => {
            resolve(data.vendors)
          },
          (error) => {
              reject(error);
          }
        );
    });
};

export const toggleFavourite = (vendorId, isFavourite) => async (dispatch) => {
    return new Promise(async (resolve, reject) => {
        apiFactory
          .post('vendors/favourites', {
              vendor_id: vendorId,
              favourite: isFavourite,
          })
          .then(
            (response) => {
                resolve();
            },
            (error) => {
                reject(error);
            }
          );
    });
};


export const toggleProductFavourite = (productId, isFavourite) => async (dispatch) => {
    return new Promise(async (resolve, reject) => {
        apiFactory
          .post('products/favourites', {
              product_id: productId,
              favourite: isFavourite,
          })
          .then(
            (response) => {
                resolve();
            },
            (error) => {
                reject(error);
            }
          );
    });
};
