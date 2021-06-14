
import { Button, Checkbox, Form, FormLayout, TextField } from '@shopify/polaris';
import axios from 'axios';
import React, { useEffect, useState, useCallback, useContext } from 'react';
import { SuccessResponse } from '../../model/responses.model';
import AdminContext from '../../store/admin-context';

const Inscription:React.FC = (props) => {
    const [newsletter, setNewsletter] = useState(false);
    const [code, setCode] = useState('');
    const ctx = useContext(AdminContext);
  
    const handleSubmit = useCallback((e) => {
      e.preventDefault();
      console.log('handleSubmit1', code);
      const tempCode = e.target.codeField.value;
      console.log('handleSubmit2', tempCode);
      if(!tempCode || tempCode === '') {
        console.log('Please enter code');
        return;
      }
    
     // setCode(tempCode);
      
        console.log('handleSubmit', tempCode);
      axios.post('/api/integration/activate',{code:tempCode})
      .then(response => {
        const result = response?.data as SuccessResponse;
        console.log('response integration api', result);

        if(!result || !result.success) {
          console.log('problem while activation')
          return;
        }
        
        ctx.onIntegrationChange(true);
                  
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
            id="codeField"
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