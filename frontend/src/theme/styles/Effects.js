import styled from 'styled-components';
import hexToRgba from '../../app/components/HexToRGBA'

export const Fade = styled.div`
    width: 100%;
    height: 100%;

    opacity: 0;
    transition: opacity ${({ fadeLength }) => `${fadeLength}s`} ease-in;

    &.fade-in {
        opacity: 1;
    }

    &.fade-out {
        opacity: 0;
    }
`;

export const GlowLarge = styled.div`
  box-shadow: 0 0 50px ${({ color, opacity }) => hexToRgba(color, opacity)};

  transition: box-shadow 0.4s ease-in-out;
  background: none;
`;