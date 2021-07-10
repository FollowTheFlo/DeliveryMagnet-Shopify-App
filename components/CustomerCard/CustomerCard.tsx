import { Button, Card, Form, Link, Stack, TextStyle } from '@shopify/polaris';
import { useRouter } from 'next/router';
import React, { useContext, useState } from 'react';
import { JobOrderProps } from '../../model/input.model';
import AdminContext from '../../store/admin-context';
import { useAppBridge } from '@shopify/app-bridge-react';
import {Redirect} from '@shopify/app-bridge/actions';
import styles from './CustomerCard.module.css';

const CustomerCard  = (props:JobOrderProps) => {
    const {order} = props;
    const router = useRouter();
    const adminCtx = useContext(AdminContext);
    const app = useAppBridge();
    const redirect = Redirect.create(app);

    const onClickMoreDetails = () => {   
        console.log('onClickMoreDetails'); 
        redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
            name: Redirect.ResourceType.Order,
            resource: {
                id: order.id,
            },
        });
    }
    return (
        <React.Fragment>
            <Card title="Customer">
                <Card.Section>
                    <Stack distribution="leading"
                >
                        <Stack.Item>
                        {order?.customer?.email && <TextStyle variation="subdued"> email:{order.customer.email}</TextStyle>}
                        </Stack.Item>
                        <Stack.Item>
                        {order?.customer?.phone && <TextStyle variation="subdued"> phone:{order.customer.phone}</TextStyle>}
                        </Stack.Item>
                    </Stack>
                    <Stack distribution="center">
                        <Stack.Item fill={true}>
                        <TextStyle variation="strong" >Shipment info</TextStyle>
                        </Stack.Item>
                        <Stack.Item fill={true}>
                       {order?.shippingAddress?.address1 && <div><TextStyle variation="subdued"> Address:{order.shippingAddress.address1}</TextStyle></div>}
                        </Stack.Item>
                        <Stack><Stack.Item>
                       {order?.shippingAddress?.address2 && <div><TextStyle variation="subdued"> {order.shippingAddress.address2}</TextStyle></div>}
                        </Stack.Item></Stack>
                        <Stack><Stack.Item>
                       {order?.shippingAddress?.provinceCode && <div><TextStyle variation="subdued">{order.shippingAddress.provinceCode}</TextStyle></div>}
                        </Stack.Item></Stack>
                        <Stack><Stack.Item>
                       {order?.shippingAddress?.country && <div><TextStyle variation="subdued">{order.shippingAddress.country}</TextStyle></div>}
                        </Stack.Item></Stack>
                        
                        <Stack><Stack.Item>
                        {order?.shippingAddress?.country && <div><TextStyle variation="subdued">{order.shippingAddress.country}</TextStyle></div>}
                        </Stack.Item></Stack>
                    </Stack>
                </Card.Section>
            </Card>
            <Card title="More Details">
                <Card.Section>
                <TextStyle variation="subdued"> Quick Link to Shopify Order Details</TextStyle>
                {/* <Form onSubmit={handleSubmit}>
                    
                </Form> */}
               <div  className={styles.centerEl}>
                    <Button onClick={onClickMoreDetails}>Display</Button>
                    </div>
                </Card.Section>
            </Card>
        </React.Fragment>
    )
}

export default CustomerCard;