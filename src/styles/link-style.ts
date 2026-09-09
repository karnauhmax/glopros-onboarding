import { css } from 'styled-components';

export const linkStyle = css`
  color: ${({ theme }) => theme.colors.text.link};
  text-decoration: none;
  transition: color ${({ theme }) => theme.transitions.fast};

  @media (hover: hover) {
    &:hover {
      color: ${({ theme }) => theme.colors.brand};
      text-decoration: underline;
    }
  }
`;
