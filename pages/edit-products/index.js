import React from 'react';
import {
  Banner,
  Card,
  DisplayText,
  Form,
  FormLayout,
  Frame,
  Layout,
  Page,
  PageActions,
  TextField,
  Toast,
} from '@shopify/polaris';
import store from 'store-js';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { useState } from 'react';
import { useEffect } from 'react';

const UPDATE_PRICE = gql`
  mutation productVariantUpdate($input: ProductVariantInput!) {
    productVariantUpdate(input: $input) {
      product {
        title
      }
      productVariant {
        id
        price
      }
    }
  }
`;

function EditProduct(props) {
 console.log('fct EditProduct', props);
  const [discount, setDiscount] = useState('');
  const [price, setPrice] = useState('');
  const [variantId, setVariantId] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    console.log('flo useEffect');
    setDiscount(itemToBeConsumed())
  }, [])

  const itemToBeConsumed = () => {
    const item = store.get('item');
    const price = item.variants.edges[0].node.price;
    const variantId = item.variants.edges[0].node.id;
    const discounter = price * 0.1;   
    setPrice(price);
    setVariantId(variantId);
    return (price - discounter).toFixed(2);
  };

  const handleChange = (field) => {
    return (value) => {
     // this.setState({ [field]: value }
      if(field === 'discount') {
        setDiscount(value);
      } else if(field === 'price') {
        setPrice(value);
      } else if(field === 'variantId') {
        setVariantId(value);
      } else if(field === 'showToast') {
        setShowToast(value);
      }
    }
  };


  // componentDidMount() {
  //   this.setState({ discount: this.itemToBeConsumed() });
  // }

  //return {
   // const { name, price, discount, variantId } = this.state;
    return (
        <Mutation
          mutation={UPDATE_PRICE}
        >
          {(handleSubmit, {error, data}) => {
              const showError = error && (
                <Banner status="critical">{error.message}</Banner>
              );
              const showToast = data && data.productVariantUpdate && (
                <Toast
                  content="Sucessfully updated"
                  onDismiss={() => {
                    setShowToast(false);
                  }}
                />
              );

            return (
                <Frame>
            <Page>
                <Layout>
                {showToast}
                  <Layout.Section>
                    {showError}
                  </Layout.Section>
                <Layout.Section>
                    <DisplayText size="large">{name}</DisplayText>
                    <Form>
                    <Card sectioned>
                        <FormLayout>
                        <FormLayout.Group>
                            <TextField
                            prefix="$"
                            value={price}
                            disabled={true}
                            label="Original price"
                            type="price"
                            />
                            <TextField
                            prefix="$"
                            value={discount}
                            onChange={handleChange('discount')}
                            label="Discounted price"
                            type="discount"
                            />
                        </FormLayout.Group>
                        <p>
                            This sale price will expire in two weeks
                        </p>
                        </FormLayout>
                    </Card>
                    <PageActions
                        primaryAction={[
                        {
                            content: 'Save',
                            onAction: () => {
                                console.log('submitted');
                                const productVariableInput = {
                                  id: variantId,
                                  price: discount,
                                };
                                handleSubmit({
                                    variables: { input: productVariableInput },
                                   });
                            }
                        }
                        ]}
                        secondaryActions={[
                        {
                            content: 'Remove discount'
                        }
                        ]}
                    />
                    </Form>
                </Layout.Section>
                </Layout>
            </Page>
            </Frame>
            );
        }}
        </Mutation>
        );
//  }

 

  
}



export default EditProduct;