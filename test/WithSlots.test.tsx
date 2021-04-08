import React from 'react';
import { SlotExampleComponent } from '../stories/SlotExampleComponent';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

// Component, [caseName, expected data-test, expected data-test value]
type Scenario = [string, JSX.Element, [string, string | boolean][]][];

const SCENARIOS: Scenario = [
  [
    'All slots filed test case',
    <SlotExampleComponent>
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
    </SlotExampleComponent>,
    [
      ['SlotOneDefaultContent', false],
      ['SlotTwoDefaultContent', false],
      ['SlotOne', true],
      ['SlotTwo', true],
      ['SlotThree', false],
      ['SlotOneChildren', 'SlotOneChildrenValue'],
      ['SlotTwoChildren', 'SlotTwoChildrenValue'],
      ['SlotExampleChildren', 'SlotExampleChildrenValue'],
    ],
  ],
  [
    'No slots filed test case',
    <SlotExampleComponent>
      <div data-test="SlotExampleChildren">SlotExampleChildrenValue</div>
    </SlotExampleComponent>,
    [
      ['SlotOne', false],
      ['SlotTwo', false],
      ['SlotThree', false],
      ['SlotOneChildren', false],
      ['SlotTwoChildren', false],
      ['SlotExampleChildren', 'SlotExampleChildrenValue'],
    ],
  ],
  [
    'Default content in slots',
    <SlotExampleComponent>
      <div data-test="SlotExampleChildren">SlotExampleChildrenValue</div>
    </SlotExampleComponent>,
    [
      ['SlotOneDefaultContent', 'SlotOneDefaultContentValue'],
      ['SlotTwoDefaultContent', 'SlotTwoDefaultContentValue'],
      ['SlotOne', false],
      ['SlotTwo', false],
      ['SlotThree', false],
      ['SlotOneChildren', false],
      ['SlotTwoChildren', false],
      ['SlotExampleChildren', 'SlotExampleChildrenValue'],
    ],
  ],
];

describe('Slot example', () => {
  test.each(SCENARIOS)('Test case: %s', (_caseName, Component, testCases) => {
    const wrapped = shallow(Component).dive();
    testCases.forEach(([dataType, value]) => {
      if (typeof value === 'boolean') {
        expect(wrapped.find(`[data-test="${dataType}"]`)).toHaveLength(
          value ? 1 : 0
        );
      }
      if (typeof value === 'string') {
        const child = wrapped.find(`[data-test="${dataType}"]`);
        expect(child.children().text()).toBe(value);
      }
    });
  });
});
