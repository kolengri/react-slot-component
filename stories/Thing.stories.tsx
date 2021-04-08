import React from 'react';
import { Meta, Story } from '@storybook/react';
import { withSlots } from '../src';

type Slots = {
  Test: { test: string };
  Test2: { test: string };
};

type Props = {
  test: string;
};

const TestComponent = withSlots<Slots, Props>(props => {
  const { slotsProps, children } = props;

  return (
    <>
      {slotsProps?.Test && <p>{slotsProps.Test.test}</p>}
      {slotsProps?.Test2 && <p>{slotsProps.Test2.test}</p>}
      {JSON.stringify(slotsProps)}
      {children}
    </>
  );
});

const meta: Meta = {
  title: 'With slot test',
  component: TestComponent,
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

const Template: Story<Props> = args => (
  <TestComponent {...args}>
    <TestComponent.Test test="test"></TestComponent.Test>
    <TestComponent.Test2 test="test2"></TestComponent.Test2>
    <div>343443</div>
  </TestComponent>
);

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};
