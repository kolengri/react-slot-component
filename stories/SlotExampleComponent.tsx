import * as React from 'react';
import { withSlots } from '../src';

type DivProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export type SlotExampleComponentProps = {} & DivProps;

export type SlotExampleComponentSlots = {
  SlotOne: DivProps & {
    'data-test': string;
    slotOneProp1: string;
    slotOneProp2: string;
  };
  SlotTwo: DivProps & {
    'data-test': string;
    slotTwoProp1: string;
    slotTwoProp2: string;
  };
};

export const SlotExampleComponent = withSlots<
  SlotExampleComponentSlots,
  SlotExampleComponentProps
>(props => {
  const { children, slotProps, ...divProps } = props;

  return (
    <div {...divProps}>
      {slotProps.SlotOne ? (
        <div data-test={slotProps.SlotOne['data-test']}>
          <div data-test="slotOneProp1">{slotProps.SlotOne.slotOneProp1}</div>
          <div data-test="slotOneProp2">{slotProps.SlotOne.slotOneProp2}</div>
          <div data-test="slotOneChildren">{slotProps.SlotOne.children}</div>
        </div>
      ) : (
        <div data-test="SlotOneDefaultContent">SlotOneDefaultContentValue</div>
      )}
      {slotProps.SlotTwo ? (
        <div data-test={slotProps.SlotTwo['data-test']}>
          <div data-test="slotTwoProp1">{slotProps.SlotTwo.slotTwoProp1}</div>
          <div data-test="slotTwoProp2">{slotProps.SlotTwo.slotTwoProp2}</div>
          <div data-test="slotTwoChildren">{slotProps.SlotTwo.children}</div>
        </div>
      ) : (
        <div data-test="SlotTwoDefaultContent">SlotTwoDefaultContentValue</div>
      )}

      {children}
    </div>
  );
});
