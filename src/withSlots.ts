import {
  ComponentType,
  useMemo,
  createElement,
  Children,
  isValidElement,
} from 'react';

// Extendable type
type SlotPropsExtends = Record<string, Record<string, any>>;
type OwnPropsExtends = Record<string, any>;

type WrappedComponent<
  Props,
  Components extends SlotPropsExtends
> = ComponentType<
  Props & {
    slotProps: Partial<Components>;
  }
>;

type ResultComponentExtraComponents<Components extends SlotPropsExtends> = {
  [key in keyof Components]: ComponentType<Components[key]>;
};

// Component with included extra components
type ResultComponent<
  SlotProps extends SlotPropsExtends,
  Props extends OwnPropsExtends = OwnPropsExtends
> = ComponentType<Props & { propagateSlotProps?: Partial<SlotProps> }> &
  ResultComponentExtraComponents<SlotProps>;

// Main function interface
export type WithSlot = {
  <
    Slots extends SlotPropsExtends,
    Props extends OwnPropsExtends = OwnPropsExtends
  >(
    Component: WrappedComponent<Props, Slots>
  ): ResultComponent<Slots, Props>;
};

/**
 * Some known keys to exclude. Just performance optimization
 */
const EXCLUDED_NAMES = [
  // Excluded by uppercase check
  // '__docgenInfo',
  // '$$typeof',
  // 'childContextTypes',
  // 'contextType',
  // 'contextTypes',
  // 'defaultProps',
  // 'displayName',
  // 'getDefaultProps',
  // 'getDerivedStateFromProps',
  // 'propTypes',
  // 'tag',
  // 'toJSON',
  'PropTypes',
];

/**
 * Helpers
 */
const startsWithCapital = (word: string) => word.match(/^[A-Z]/);
const isComponentName = (name: string) =>
  !EXCLUDED_NAMES.includes(name) && startsWithCapital(name);

/**
 * Main
 */
export const withSlots: WithSlot = Component => {
  const slotsKeys: (string | symbol)[] = [];

  const ResultComponent: WrappedComponent<any, any> = props => {
    const { children, propagateSlotProps, ...otherProps } = props;
    const childrenArr = useMemo(() => Children.toArray(children), [children]);

    // Find and get out all childProps
    const slotProps = useMemo(
      () =>
        childrenArr.reduce<SlotPropsExtends>((curr, child) => {
          if (isValidElement(child)) {
            const tag: string = (child.type as any).displayName;

            if (slotsKeys.includes(tag)) {
              curr[tag] = child.props;
            }
          }
          return curr;
        }, {}),
      [childrenArr]
    );

    // Clean children from childProps components
    const cleanChildren = useMemo(
      () =>
        childrenArr.filter(child => {
          if (isValidElement(child)) {
            const tag: string = (child.type as any).displayName;
            return !slotsKeys.includes(tag);
          }
          return true;
        }),
      [childrenArr]
    );

    return createElement(
      Component,
      { ...otherProps, slotProps: { ...propagateSlotProps, ...slotProps } },
      cleanChildren
    );
  };

  return new Proxy(ResultComponent, {
    get(target: any, key: string | symbol) {
      if (key in target || typeof key === 'symbol') {
        return target[key];
      }

      if (isComponentName(key)) {
        const NullComponent: React.FC = () => null;
        NullComponent.displayName = key as string;
        target[key] = NullComponent;
        slotsKeys.push(key);
      }

      return target[key];
    },
  });
};
