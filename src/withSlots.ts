import React from 'react';

// Extendable type
type ComponentsPropsExtends = Record<string, Record<string, any>>;
type OwnPropsExtends = Record<string, any>;

type WrappedComponent<
  Props,
  Components extends ComponentsPropsExtends
> = React.ComponentType<
  Props & {
    slotsProps: Partial<Components>;
  }
>;

type ResultComponentExtraComponents<
  Components extends ComponentsPropsExtends
> = {
  [key in keyof Components]: React.FC<Components[key]>;
};

// Component with included extra components
type ResultComponent<
  Components extends ComponentsPropsExtends,
  Props extends OwnPropsExtends = OwnPropsExtends
> = React.ComponentType<Props> & ResultComponentExtraComponents<Components>;

// Main function interface
interface IAsComposableComponent {
  <
    Components extends ComponentsPropsExtends,
    Props extends OwnPropsExtends = OwnPropsExtends
  >(
    Component: WrappedComponent<Props, Components>
  ): ResultComponent<Components, Props>;
}

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

const startsWithCapital = (word: string) => word.match(/^[A-Z]/);
const isComponentName = (name: string) =>
  !EXCLUDED_NAMES.includes(name) && startsWithCapital(name);

export const withSlots: IAsComposableComponent = Component => {
  const slotsKeys: (string | symbol)[] = [];

  const ResultComponent: WrappedComponent<any, any> = props => {
    const { children } = props;
    const childrenArr = React.useMemo(() => React.Children.toArray(children), [
      children,
    ]);

    // Find and get out all childProps
    const slotsProps = React.useMemo(
      () =>
        childrenArr.reduce<ComponentsPropsExtends>((curr, child) => {
          if (React.isValidElement(child)) {
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
    const cleanChildren = React.useMemo(
      () =>
        childrenArr.filter(child => {
          if (React.isValidElement(child)) {
            const tag: string = (child.type as any).displayName;
            return !slotsKeys.includes(tag);
          }
          return true;
        }),
      [childrenArr]
    );

    return React.createElement(
      Component,
      { ...props, slotsProps },
      cleanChildren
    );
  };

  return new Proxy(ResultComponent, {
    get(target: any, key) {
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
