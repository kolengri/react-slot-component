# Vue inspired slot like high order component for React

## react-slot-component

[![NPM](https://img.shields.io/npm/v/react-slot-component.svg)](https://www.npmjs.com/package/react-slot-component)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Badges](https://badgen.net/npm/license/react-slot-component)](https://www.npmjs.com/package/react-slot-component)
[![Badges](https://badgen.net/npm/dependents/react-slot-component)](https://www.npmjs.com/package/react-slot-component)
[![Badges](https://badgen.net/npm/types/react-slot-component)](https://www.npmjs.com/package/react-slot-component)
[![Badges](https://badgen.net/github/issues/kolengri/react-slot-component)](https://www.npmjs.com/package/react-slot-component)
[![Badges](https://badgen.net/bundlephobia/min/react-slot-component)](https://bundlephobia.com/result?p=react-slot-component)
[![Badges](https://badgen.net/bundlephobia/minzip/react-slot-component)](https://bundlephobia.com/result?p=react-slot-component)

## Install

```bash
npm install --save react-slot-component
```

```bash
yarn add react-slot-component
```

## Usage

The aim of this package is to end up with annoying practice of passing the subcomponents to the layouts using properties. The package allows you to create and use layouts with replaceable default slots with pure JSX/TSX syntax.

### Prepare your Layout

```tsx
// SlotExampleComponent.tsx

import * as React from 'react';
import { withSlots } from 'react-slot-component';

export type SlotExampleComponentProps = {};

// Describe you future slots name with props

export type SlotExampleComponentSlots = {
  SlotOne: {
    children: React.ReactNode;
    slotOneProp1: string;
    slotOneProp2: string;
  };
  SlotTwo: {
    children: React.ReactNode;
    slotTwoProp1: string;
    slotTwoProp2: string;
  };
};

export const SlotExampleComponent = withSlots<
  SlotExampleComponentSlots,
  SlotExampleComponentProps
>(props => {
  const {
    children,
    // All future slot props passed via slotProps prop
    slotProps,
  } = props;

  return (
    <div>
      {slotProps.SlotOne ? (
        <div>
          <div>{slotProps.SlotOne.slotOneProp1}</div>
          <div>{slotProps.SlotOne.slotOneProp2}</div>
          <div>{slotProps.SlotOne.children}</div>
        </div>
      ) : (
        <div data-test="SlotOneDefaultContent">SlotOneDefaultContentValue</div>
      )}
      {slotProps.SlotTwo ? (
        <div>
          <div>{slotProps.SlotTwo.slotTwoProp1}</div>
          <div>{slotProps.SlotTwo.slotTwoProp2}</div>
          <div>{slotProps.SlotTwo.children}</div>
        </div>
      ) : (
        <div>SlotTwoDefaultContentValue</div>
      )}

      {children}
    </div>
  );
});
```

### Use in app with replaced layout parts

```tsx
// App.tsx
import React from 'react';

import { SlotExampleComponent } from './Layout';

export const App = () => {
  return (
    <SlotExampleComponent {...args}>
      <SlotExampleComponent.SlotOne
        slotOneProp1="slotOneProp1Value"
        slotOneProp2="slotOneProp2Value"
      >
        SlotOneChildrenValue
      </SlotExampleComponent.SlotOne>
      <SlotExampleComponent.SlotTwo
        data-test="SlotTwo"
        slotTwoProp1="slotTwoProp1Value"
        slotTwoProp2="slotTwoProp2Value"
      >
        SlotTwoChildrenValue
      </SlotExampleComponent.SlotTwo>
      SlotExampleChildrenValue
    </SlotExampleComponent>
  );
};
```

### Optionally allow replace slot components with same name to override each other

This is especially useful for route transitions, where you briefly have both routes in DOM at the same time.

## License

MIT © [kolengri](https://github.com/kolengri)
