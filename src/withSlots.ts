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
  Props extends OwnPropsExtends,
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
const getSlotProps = (children: any, slotKeys: string[]) =>
  Children.toArray(children).reduce<SlotPropsExtends>((curr, child) => {
    if (isValidElement(child)) {
      const tag: string = (child.type as any).displayName;

      if (slotKeys?.includes(tag)) {
        curr[tag] = child.props;
      }
    }
    return curr;
  }, {});

const getCleanChildren = (children: any, slotKeys: string[]) => {
  const res = Children.toArray(children).filter(child => {
    if (isValidElement(child)) {
      const tag: string = (child.type as any).displayName;
      return !slotKeys?.includes(tag);
    }
    return true;
  });
  return res.length > 0 ? res : undefined;
};

const isComponentName = (name: any) =>
  typeof name === 'string' &&
  !EXCLUDED_NAMES.includes(name) &&
  name.match(/^[A-Z0-9]/);

const createResultComponent = (
  Component: WrappedComponent<any, any>,
  registeredSlotKeys: string[]
): WrappedComponent<any, any> => {
  const ResultComponent: WrappedComponent<any, any> = memo(props => {
    const {
      children,
      propagateSlotProps,
      slotKeys = registeredSlotKeys,
      ...otherProps
    } = props;

    // Find and get out all childProps
    const slotProps = useMemo(() => getSlotProps(children, slotKeys), [
      slotKeys,
      children,
    ]);
    // Clean children from childProps components
    const cleanChildren = useMemo(() => getCleanChildren(children, slotKeys), [
      slotKeys,
      children,
    ]);

    const passProps = useMemo(
      () => ({
        ...otherProps,
        slotProps: { ...propagateSlotProps, ...slotProps },
      }),
      [otherProps, slotProps, propagateSlotProps]
    );

    return createElement(Component, passProps, cleanChildren);
  });

  return ResultComponent;
};
/**
 * Main
 */

export const withSlots: WithSlot = Component => {
  // `defaultProps` for function components is not supported by React 19.
  // Keep the registered slot names in this closure instead of attaching them
  // to the memoized component.
  const slotKeys: string[] = [];
  const ResultComponent = memo(createResultComponent(Component, slotKeys));
  ResultComponent.displayName = `WithSlots(${Component.displayName ||
    Component.name})`;

  const ProxyComponent = new Proxy(ResultComponent, {
    get(target: any, key, receiver) {
      if (key in target || typeof key === 'symbol' || !isComponentName(key)) {
        return Reflect.get(target, key, receiver);
      }

      const cmp = Reflect.get(target, key);
      if (!cmp) {
        const NullComponent: React.FC = () => null;
        NullComponent.displayName = key as string;
        Reflect.set(target, key, NullComponent);
      }

      if (!slotKeys.includes(key as string)) {
        slotKeys.push(key as string);
      }

      return Reflect.get(target, key, receiver);
    },
  });

  return ProxyComponent;
};
