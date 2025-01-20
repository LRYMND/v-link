import { APP } from '../../store/Store';
import { IconNav } from '../../theme/styles/Icons';
import { GlowLarge } from '../../theme/styles/Effects';
import styled, { css, useTheme } from 'styled-components';


const Navbar = styled.div`
  position: absolute;
  bottom: 0;
  z-index: 3;

  background-color:${({ theme }) => `${theme.colors.navbar}`};
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
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

const Indicator = styled.div`
    position: absolute;
    bottom: 0;
    z-index: 1;

    display: ${({ isActive }) => `${isActive ? 'none' : 'flex'}`};
    justify-content: center;
    align-items: center;

    width: 100%;
    height: 20px;
    background: none;
    border: none;
`;

const Blob = styled.div`
    width: 100px;
    height: 5px;
    background: ${({ theme, isHovering }) => `${isHovering ? theme.colors.theme.blue.active : theme.colors.medium}`};
    
    border-radius: 2.5px;
    border: none;

    /* Add transition for background color change */
    transition: background 0.4s ease-in-out;
`;

const NavBar = ({ isActive, isHovering }) => {
  const app = APP((state) => state);
  const theme = useTheme();

  return (
    <>
      <Indicator isActive={isActive}>
        <GlowLarge color={theme.colors.theme.blue.active} opacity={isHovering ? 0.75 : 0}>
          <Blob theme={theme} isActive={isActive} isHovering={isHovering}/>
        </GlowLarge>
      </Indicator>
      <Navbar app={app} theme={theme} isActive={isActive}>
        {['Dashboard', 'Carplay', 'Settings'].map((view) => (
          <div className="column" key={view} style={{ position: 'relative' }}>
            <NavButton onClick={() => app.update({ system: { view } })}>
              <IconNav isActive={app.system.view === view}>
                <use xlinkHref={`/assets/svg/${view.toLowerCase()}.svg#${view.toLowerCase()}`}></use>
              </IconNav>
            </NavButton>
          </div>
        ))}
      </Navbar>
    </>
  );
};

export default NavBar;
