import {
  ComponentType,
  createElement,
  Children,
  isValidElement,
  useMemo,
  memo,
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
const isComponentName = (name: any) =>
  typeof name === 'string' &&
  !EXCLUDED_NAMES.includes(name) &&
  name.match(/^[A-Z0-9]/);

/**
 * Main
 */
export const withSlots: WithSlot = Component => {
  const ResultComponent: WrappedComponent<any, any> = memo(
    function ComponentWithSlots(props) {
      const {
        children,
        propagateSlotProps,
        slotKeys = [],
        ...otherProps
      } = props;
      const childrenArr = useMemo(() => Children.toArray(children), [children]);

      // Find and get out all childProps
      const slotProps = useMemo(
        () =>
          childrenArr.reduce<SlotPropsExtends>((curr, child) => {
            if (isValidElement(child)) {
              const tag: string = (child.type as any).displayName;

              if (slotKeys.includes(tag)) {
                curr[tag] = child.props;
              }
            }
            return curr;
          }, {}),

        [slotKeys, childrenArr]
      );

      // Clean children from childProps components
      const cleanChildren = useMemo(
        () =>
          childrenArr.filter(child => {
            if (isValidElement(child)) {
              const tag: string = (child.type as any).displayName;
              return !slotKeys.includes(tag);
            }
            return true;
          }),
        [slotKeys, childrenArr]
      );

      return createElement(
        Component,
        { ...otherProps, slotProps: { ...propagateSlotProps, ...slotProps } },
        cleanChildren
      );
    }
  );

  const ProxyComponent = new Proxy(ResultComponent, {
    get(target: any, key, receiver) {
      if (key in target || typeof key === 'symbol' || !isComponentName(key)) {
        return Reflect.get(target, key, receiver);
      }
      const slotKeys = Reflect.get(target, 'defaultProps')?.slotKeys || [];
      const NullComponent: React.FC = () => null;
      NullComponent.displayName = key as string;
      target[key] = NullComponent;

      Reflect.set(target, 'defaultProps', {
        ...target.defaultProps,
        slotKeys: [...slotKeys, key],
      });

      return Reflect.get(target, key, receiver);
    },
  });

  return ProxyComponent;
};
