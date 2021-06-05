const fetchApi = (props) => {
    console.log('fetchApi', props);
    let {method, body, url, headers} = props;
    
    console.log('method', method);
    console.log('body', body);
    console.log('url', url);
    console.log('headers', headers);

    if(!method || (method==='post' && !body) || !url) return Promise.reject('one of the props is null');

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
            if (response.status >= 200 && response.status <= 299) {
                return response.json();
            } else{
                throw Error(response.statusText);
            }              
        })    
          
}

export default fetchApi;



