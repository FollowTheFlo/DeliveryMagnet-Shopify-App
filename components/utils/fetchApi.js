const fetchApi = (props) => {
    console.log('fetchApi', props);
    const {method, body, url} = props;
    console.log('method', method);
    console.log('body', body);
    console.log('url', url);

    if(!method || !body || !url) return Promise.reject('one of the props is null');

    return fetch(url, {
            
              method,
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body,
            
          })
          .then(response => {
            if (response.status >= 200 && response.status <= 299) {
                return response.json();
            } else{
                throw Error(response.statusText);
            }              
        })    
          
}

export default fetchApi;