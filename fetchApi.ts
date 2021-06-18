
type FetchApiProps = {
   method:'get'|'post'|'delete'|'put'|'patch',
   url:string,
   body?:any, //optional when using get, can be any JSON object so set as any
   headers?:any, // if empty set default with JSOn content-type and no token
}

const fetchApi = (props:FetchApiProps) => {
    console.log('fetchApi', props);
    let {method, body, url, headers} = props;
    
    console.log('method', method);
    console.log('body', body);
    console.log('url', url);
    console.log('headers', headers);

    if(!method || (method==='post' && !body) || (method==='put' && !body) || !url) return Promise.reject('one of the props is null');

    console.log('fetchApi2');

if(!headers)
{
    console.log('no header');
    headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
}
    return fetch(url, method==='get' ? {            
              method,
              headers,                          
          } : {            
            method,
            headers,
            body,            
        }
          
          )
          .then(response => {              
              console.log('response status', response.status);
            if (response.status >= 200 && response.status <= 299) {
                return response.json();
            } else{
                throw Error('Error with status ' + response.status);
            }              
        }).catch(err=>console.log('err',JSON.stringify(err)))
          
}

export default fetchApi;



