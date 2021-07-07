import { Card, Stack, TextStyle } from '@shopify/polaris';
import React, { useContext, useState } from 'react';
import { JobOrderProps } from '../../model/input.model';

const CustomerCard  = (props:JobOrderProps) => {
    const {order} = props;
    return (
        <React.Fragment>
            <Card title="Customer">
                <Card.Section>
                    <Stack distribution="center"
                >
                        <Stack.Item fill={true}>
                        {order?.customer?.email && <TextStyle variation="subdued"> email:{order.customer.email}</TextStyle>}
                        {order?.customer?.phone && <TextStyle variation="subdued"> phone:{order.customer.phone}</TextStyle>}
                        </Stack.Item>
                    </Stack>
                    <Stack distribution="center">
                        <Stack.Item fill={true}>
                        <TextStyle variation="subdued"> More stuff</TextStyle>
                        </Stack.Item>
                    </Stack>
                </Card.Section>
            </Card>
        </React.Fragment>
    )
}

export default CustomerCard;