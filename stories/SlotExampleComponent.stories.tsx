import React from 'react';
import { Meta, Story } from '@storybook/react';

import {
  SlotExampleComponent,
  SlotExampleComponentProps,
} from './SlotExampleComponent';

const meta: Meta = {
  title: 'Slot Example Component',
  component: SlotExampleComponent,
  argTypes: {
    children: {
      control: {
        type: 'text',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<SlotExampleComponentProps> = ({ children, ...args }) => (
  <SlotExampleComponent {...args}>
    <SlotExampleComponent.SlotOne
      data-test="SlotOne"
      slotOneProp1="slotOneProp1Value"
      slotOneProp2="slotOneProp2Value"
    >
      <div data-test="SlotOneChildren">SlotOneChildrenValue</div>
    </SlotExampleComponent.SlotOne>
    <SlotExampleComponent.SlotTwo
      data-test="SlotTwo"
      slotTwoProp1="slotTwoProp1Value"
      slotTwoProp2="slotTwoProp2Value"
    >
      <div data-test="SlotTwoChildren">SlotTwoChildrenValue</div>
    </SlotExampleComponent.SlotTwo>
    <div data-test="SlotExampleChildren">SlotExampleChildrenValue</div>
    {children}
  </SlotExampleComponent>
);

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};
