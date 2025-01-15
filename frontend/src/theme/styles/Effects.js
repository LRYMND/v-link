import styled from 'styled-components';
import hexToRgba from '../../app/components/HexToRGBA'

export const Fade = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 100%;

    opacity: 0; /* Initial state */
    transition: opacity 0.3s ease-in;

    &.fade-in {
        opacity: 1;
    }

    &.fade-out {
        opacity: 0;
    }
`;

export const GlowLarge = styled.div`
  box-shadow: 0 0 50px ${({ color }) => hexToRgba(color, 0.75)};
  background: none;
`;