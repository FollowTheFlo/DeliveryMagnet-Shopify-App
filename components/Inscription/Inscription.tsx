
import { Button, Checkbox, Form, FormLayout, TextField } from '@shopify/polaris';
import axios from 'axios';
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { SuccessResponse } from '../../model/responses.model';

const Inscription:React.FC = (props) => {
    const [newsletter, setNewsletter] = useState(false);
    const [code, setCode] = useState('');
  
    const handleSubmit = useCallback((_event) => {
      console.log('handleSubmit1', code);
      if(!code) {
        console.log('Please enter code');
        return;
      }
        console.log('handleSubmit', code);
      axios.post('/api/integration/activate',{code:code})
      .then(response => {
        const result = response?.data as SuccessResponse;

        console.log('response integration api', result);       
                  
      })
      .catch(err => {
        console.log('err fulfillment', err);
      })
    }, []);
  
  
    const handleCodeChange = useCallback((value) =>{ 
      console.log('handleChange', value);
      setCode(value);
    
    }, []);
  
    return (
      <Form onSubmit={handleSubmit}>
        <FormLayout>
          {/* <Checkbox
            label="Sign up for the Polaris newsletter"
            checked={newsletter}
            onChange={handleNewsLetterChange}
          /> */}
  
          <TextField
            value={code}
            onChange={handleCodeChange}
            label="Api code"
            type="number"
            helpText={
              <span>
                Generate Api code on RouteMagnet first.
              </span>
            }
          />
  
          <Button submit>Integrate with RouteMagnet</Button>
        </FormLayout>
      </Form>
    );
}

export default Inscription;