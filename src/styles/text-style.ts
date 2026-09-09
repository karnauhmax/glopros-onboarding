import { css, type DefaultTheme } from 'styled-components';

import type { TextStyle, TextStyleName } from './theme';

export const textStyle =
  (name: TextStyleName) =>
  ({ theme }: { theme: DefaultTheme }) => {
    const style: TextStyle = theme.typography[name];
    return css`
      font-family: ${theme.fonts[style.family]};
      font-size: ${style.size}px;
      line-height: ${style.lineHeight};
      font-weight: ${style.weight};
      letter-spacing: ${style.letterSpacing ?? 'normal'};
    `;
  };
