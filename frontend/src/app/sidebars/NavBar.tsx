import { APP } from '../../store/Store';
import { IconLarge } from '../../theme/styles/Icons';
import styled, { css, useTheme } from 'styled-components';


const Navbar = styled.div`
  position: absolute;
  bottom: 0;
  z-index: 1;

  background-color:${({ theme }) => `${theme.colors.navbar}`};
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: ${({ app }) => `${app.settings.side_bars.navBarHeight.value}px`};
  animation: ${({ app, theme, isActive }) => css`
    ${isActive
      ? theme.animations.getSlideDown(app.settings.side_bars.navBarHeight.value)
      : theme.animations.getSlideUp(app.settings.side_bars.navBarHeight.value)} 0.3s ease-in-out forwards
  `};
`;

const NavButton = styled.button`
    background: none;
    border: none;

    &:hover {
        cursor: pointer;
    }
`;

const NavBar = ( { isActive } ) => {
  const app = APP((state) => state);
  const theme = useTheme();

  return (
    <Navbar app={app} theme={theme} isActive={isActive}>
        {['Dashboard', 'Carplay', 'Settings'].map((view) => (
          <div className="column" key={view} style={{ position: 'relative' }}>
            <NavButton onClick={() => app.update({system: {view}})}>
              <IconLarge isActive={app.system.view === view}>
                <use xlinkHref={`/assets/svg/${view.toLowerCase()}.svg#${view.toLowerCase()}`}></use>
              </IconLarge>
            </NavButton>
          </div>
        ))}
    </Navbar>
  );
};

export default NavBar;
