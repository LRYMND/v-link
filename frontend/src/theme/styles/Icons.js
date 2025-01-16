import styled, { css, useTheme } from 'styled-components';
import hexToRgba from '../../app/components/HexToRGBA'

export const IconSmall = styled.svg`
    width: ${({ theme }) => theme.icons.small};
    height: ${({ theme }) => theme.icons.small};
    fill: ${({ isActive, theme }) =>
        isActive ? theme.colors.theme.blue.active : theme.colors.medium};
    transition: fill 0.3s ease-in-out;
    filter: ${({ isActive, theme }) =>
        isActive ? `drop-shadow(${theme.colors.theme.blue.navGlow})` : 'none'};
    &:hover {
        fill: ${({ isActive, theme }) =>
        isActive ? theme.colors.theme.blue.active : theme.colors.theme.blue.default};
        filter: ${({ isActive, theme }) =>
        isActive ? `drop-shadow(${theme.colors.theme.blue.default})` : 'none'};
    }
`;

export const IconMedium = styled.svg`
    width: ${({ theme }) => theme.icons.medium};
    height: ${({ theme }) => theme.icons.medium};
    fill: ${({ isActive, theme }) =>
        isActive ? theme.colors.theme.blue.active : theme.colors.medium};
    transition: fill 0.3s ease-in-out;
    filter: ${({ isActive, theme }) =>
        isActive ? `drop-shadow(${theme.colors.theme.blue.navGlow})` : 'none'};
    &:hover {
        fill: ${({ isActive, theme }) =>
        isActive ? theme.colors.theme.blue.active : theme.colors.theme.blue.default};
        filter: ${({ isActive, theme }) =>
        isActive ? `drop-shadow(${theme.colors.theme.blue.default})` : 'none'};
    }
`;

export const IconLarge = styled.svg`
    width: ${({ theme }) => theme.icons.large};
    height: ${({ theme }) => theme.icons.large};
    fill: ${({ isActive, theme }) =>
        isActive ? theme.colors.theme.blue.active : theme.colors.medium};
    transition: fill 0.3s ease-in-out;
    filter: ${({ isActive, theme }) =>
        isActive ? `drop-shadow(${theme.colors.theme.blue.navGlow})` : 'none'};
    &:hover {
        fill: ${({ isActive, theme }) =>
        isActive ? theme.colors.theme.blue.active : theme.colors.theme.blue.default};
        filter: ${({ isActive, theme }) =>
        isActive ? `drop-shadow(${theme.colors.theme.blue.default})` : 'none'};
    }
`;

export const IconExtraLarge = styled.svg`
    width: ${({ theme }) => theme.icons.xlarge};
    height: ${({ theme }) => theme.icons.xlarge};
    fill: ${({ isActive, theme }) =>
        isActive ? theme.colors.theme.blue.active : theme.colors.medium};
    transition: fill 0.3s ease-in-out;
    filter: ${({ color }) =>
        `drop-shadow(0 0px 100px ${hexToRgba(color, 1)})
        `};
    &:hover {
        fill: ${({ theme }) =>  theme.colors.theme.blue.default };
    }
`;