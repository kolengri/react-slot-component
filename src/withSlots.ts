import {
  ComponentType,
  createElement,
  Children,
  isValidElement,
  useMemo,
  memo,
} from 'react';
import deepEq from 'deep-equal';

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

      if (slotKeys.includes(tag)) {
        curr[tag] = child.props;
      }
    }
    return curr;
  }, {});

const getCleanChildren = (children: any, slotKeys: string[]) => {
  const res = Children.toArray(children).filter(child => {
    if (isValidElement(child)) {
      const tag: string = (child.type as any).displayName;
      return !slotKeys.includes(tag);
    }
    return true;
  });
  return res.length > 0 ? res : undefined;
};

const isComponentName = (name: any) =>
  typeof name === 'string' &&
  !EXCLUDED_NAMES.includes(name) &&
  name.match(/^[A-Z0-9]/);

const creatResultComponent = (
  Component: WrappedComponent<any, any>
): WrappedComponent<any, any> => {
  const ResultComponent: WrappedComponent<any, any> = memo(
    props => {
      const {
        children,
        propagateSlotProps,
        slotKeys = [],
        ...otherProps
      } = props;

      // Find and get out all childProps
      const slotProps = useMemo(() => getSlotProps(children, slotKeys), [
        slotKeys,
        children,
      ]);
      // Clean children from childProps components
      const cleanChildren = useMemo(
        () => getCleanChildren(children, slotKeys),
        [slotKeys, children]
      );

      const passProps = useMemo(
        () => ({
          ...otherProps,
          slotProps: { ...propagateSlotProps, ...slotProps },
        }),
        [otherProps, slotProps, propagateSlotProps]
      );

      return createElement(Component, passProps, cleanChildren);
    },
    (prevProps, nextProps) => {
      const prevSlots = getSlotProps(prevProps.children, prevProps.slotKeys);
      const nextSlots = getSlotProps(nextProps.children, nextProps.slotKeys);
      const prevCleanChildren = getCleanChildren(
        prevProps.children,
        prevProps.slotKeys
      );
      const nextCleanChildren = getCleanChildren(
        nextProps.children,
        nextProps.slotKeys
      );
      return (
        deepEq(prevSlots, nextSlots) &&
        deepEq(prevCleanChildren, nextCleanChildren)
      );
    }
  );

  return ResultComponent;
};
/**
 * Main
 */

export const withSlots: WithSlot = Component => {
  const ResultComponent = memo(creatResultComponent(Component));
  ResultComponent.displayName = `WithSlots(${Component.displayName ||
    Component.name})`;

  const ProxyComponent = new Proxy(ResultComponent, {
    get(target: any, key, receiver) {
      if (key in target || typeof key === 'symbol' || !isComponentName(key)) {
        return Reflect.get(target, key, receiver);
      }

      const slotKeys = Reflect.get(target, 'defaultProps')?.slotKeys || [];
      const cmp = Reflect.get(target, key);
      if (!cmp) {
        const NullComponent: React.FC = memo(() => null, deepEq);
        NullComponent.displayName = key as string;
        Reflect.set(target, key, NullComponent);
      }

      Reflect.set(target, 'defaultProps', {
        ...target.defaultProps,
        slotKeys: [...slotKeys, key],
      });

      return Reflect.get(target, key, receiver);
    },
  });

  return ProxyComponent;
};
