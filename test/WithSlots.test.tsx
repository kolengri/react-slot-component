import { describe, expect, test } from 'bun:test';
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { withSlots } from '../src/withSlots';

type Slots = {
  Header: { children?: ReactNode; title: string };
  Footer: { children?: ReactNode; label: string };
};

const Layout = withSlots<Slots>(props => {
  const { children, slotProps } = props;

  return createElement(
    'main',
    null,
    slotProps.Header
      ? createElement('h1', null, slotProps.Header.title, slotProps.Header.children)
      : createElement('h1', null, 'Default header'),
    slotProps.Footer
      ? createElement('footer', null, slotProps.Footer.label, slotProps.Footer.children)
      : createElement('footer', null, 'Default footer'),
    children
  );
});

describe('withSlots', () => {
  test('collects named slot props and removes slots from regular children', () => {
    const html = renderToStaticMarkup(
      createElement(
        Layout,
        null,
        createElement(Layout.Header, { title: 'Welcome' }, ' Header content'),
        createElement('p', null, 'Body')
      )
    );

    expect(html).toBe('<main><h1>Welcome Header content</h1><footer>Default footer</footer><p>Body</p></main>');
  });

  test('supports propagated slot props and direct slot props take precedence', () => {
    const html = renderToStaticMarkup(
      createElement(
        Layout,
        {
          propagateSlotProps: {
            Header: { title: 'Fallback' },
            Footer: { label: 'Footer' },
          },
        },
        createElement(Layout.Header, { title: 'Override' })
      )
    );

    expect(html).toBe('<main><h1>Override</h1><footer>Footer</footer></main>');
  });

  test('does not rely on defaultProps, which React 19 ignores for functions', () => {
    expect((Layout as { defaultProps?: unknown }).defaultProps).toBeUndefined();
  });
});
