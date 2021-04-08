import * as React from 'react';
import { withSlots } from '../..';

type DivProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export type SlotExampleComponentProps = {} & DivProps;

export type SlotExampleComponentSlots = {
  SlotOne: {
    slotOneProp1: string;
    slotOneProp2: string;
    children: React.ReactNode;
  };
  SlotTwo: {
    slotTwoProp1: string;
    slotTwoProp2: string;
    children: React.ReactNode;
  };
};

export const SlotExampleComponent = withSlots<
  SlotExampleComponentSlots,
  SlotExampleComponentProps
>(props => {
  const { children, slotProps, ...divProps } = props;

  return (
    <div {...divProps}>
      {slotProps.SlotOne?.children}

      {children}
    </div>
  );
});
