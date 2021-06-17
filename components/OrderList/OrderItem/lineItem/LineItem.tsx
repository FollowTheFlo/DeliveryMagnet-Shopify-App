import { Card,
    ResourceList,
    Stack,
    TextStyle,
    Thumbnail,
    ButtonGroup,
    Button,
    Tabs,
    TextField,
    Heading,
    Badge,
    Collapsible,
} from '@shopify/polaris';

import styles from './OrderItem.module.css';


import React, { useCallback, useState } from 'react';
import { LineItem } from '../../../../model/orders.model';

type LineItemProps = {
    key:string;
    lineItem:LineItem;
}

const LineItemBlock = (props:LineItemProps) => {
    const {key, lineItem} = props;

    return (
        <React.Fragment>
          {lineItem.image.originalSrc}
          <Thumbnail
            source={lineItem.image.originalSrc}
            alt={lineItem.title}
/>
        </React.Fragment>

       
    )

}

export default LineItemBlock;