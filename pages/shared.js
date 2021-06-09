import fetchApi from '../components/utils/fetchApi';
const jwt = require('jsonwebtoken');

const getAccessTokenFromDB = async (sessionToken) => {
    console.log('getAccessTokenFromDB');
  
    try{
      const response = await fetchApi(
        {
          method:'get',
          url:`${process.env.RM_SERVER_URL}/shopify/access_token`,
          headers:{
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
          }
        });
        if(!response || response.error !== '' || !response.accessToken) {
          console.log('accessTokenResponse error', response.error);
          return null;
        }
      return response.accessToken;
    } catch(err){
      console.log('err',err);
      return null;
    } 
}


const getShopFromBearerHeader = async (req) => {  
    console.log('getShopFromBearerHeader');
    return new Promise((resolve,reject) =>{
      try {
        if(!req.headers.authorization){
          throw 'malformed header';
        }
        const encrypted = req.headers.authorization.replace('Bearer ','');
    
       // console.log(secret, process.env.TOKEN_KEY);
        jwt.verify(encrypted, process.env.SHOPIFY_API_SECRET, (err, decoded) => {
           // console.log('err', err);
           // console.log('decoded', decoded);
           console.log('decoded',decoded);
           console.log('exp', new Date(decoded.exp) );
           console.log('nbf', new Date(decoded.nbf));
           console.log('dest', decoded.dest);
         const shop = decoded.dest.replace('https://','');
          return resolve(shop);  
        });
        //console.log('flo20DecodedToken: ',decodedToken);
    } catch (err) {
       console.log('err1',err); 
       return resolve('');  // will be seen as an error     
    }
    }) 
  }

  export {getAccessTokenFromDB, getShopFromBearerHeader}

