import { useState, useEffect, } from "react";
import styled, { css, useTheme } from 'styled-components';

import { APP } from '../../store/Store';

import { Caption1, Title, } from '../../theme/styles/Typography';
import { Link, Button } from '../../theme/styles/Inputs';
import { IconMedium } from '../../theme/styles/Icons';
import { Fade } from '../../theme/styles/Effects';




const Sidebar = styled.div`
    align-self: flex-end;
    height: 100%;

    box-sizing: border-box;

    /* Apply the animation based on the current view */
    animation: ${({ theme, currentView, minWidth, maxWidth, collapseLength }) => css`
    ${currentView === 'Settings'
            ? theme.animations.getHorizontalExpand(minWidth, maxWidth)
            : theme.animations.getHorizontalCollapse(minWidth, maxWidth)} ${collapseLength}s ease-in-out forwards;
    `};

  /* Avoid transition conflicts */
  transition: none;
`;

const Menu = styled.div`
    width: 100%;
    height: 100%;

    gap: 10px;

    display: flex;
    flex-direction: column;
    justify-self: flex-start;
    justify-content: flex-start;
    align-items: flex-start;
`;


const SideBar = ({collapseLength}) => {

    const app = APP((state) => state)
    const theme = useTheme();

    const [moose, setMoose] = useState(false);

    const [currentPage, setCurrentPage] = useState(app.system.view)
    const [currentTab, setCurrentTab] = useState(app.system.settingPage)

    /* Switch Tabs */
    const handleTabChange = (tabIndex) => {
        console.log(tabIndex)
        app.update({ system: { settingPage: tabIndex } });
    };

    useEffect(() => {
        setCurrentTab(app.system.settingPage)
    }, [app.system.settingPage])

    return (

        <Sidebar
            theme={theme}
            app={app}
            currentPage={currentPage}
            currentView={app.system.view}
            collapseLength={collapseLength / 1000}
            minWidth={0}
            maxWidth={app.settings.side_bars.sideBarWidth.value}>
            <Menu>
                <Title>SETTINGS</Title>
                <Link onClick={() => handleTabChange(1)} isActive={currentTab === 1} >
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'left' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', width: '100%' }}>
                            <IconMedium isActive={currentTab === 1} theme={theme}>
                                <use xlinkHref={`/assets/svg/buttons/general.svg#general`}></use>
                            </IconMedium>
                            GENERAL
                        </div>
                    </div>
                </Link>

                <Link onClick={() => handleTabChange(2)} isActive={currentTab === 2} >
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'left' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', width: '100%' }}>
                            <IconMedium isActive={currentTab === 2} theme={theme}>
                                <use xlinkHref={`/assets/svg/buttons/interface.svg#interface`}></use>
                            </IconMedium>
                            INTERFACE
                        </div>
                    </div>
                </Link>

                <Link onClick={() => handleTabChange(3)} isActive={currentTab === 3} >
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'left' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', width: '100%' }}>
                            <IconMedium isActive={currentTab === 3} theme={theme}>
                                <use xlinkHref={`/assets/svg/buttons/keymap.svg#keymap`}></use>
                            </IconMedium>
                            KEYMAP
                        </div>
                    </div>

                </Link>

                <Link onClick={() => handleTabChange(4)} isActive={currentTab === 4}>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'left' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px', width: '100%' }}>
                            <IconMedium isActive={currentTab === 4} theme={theme}>
                                <use xlinkHref={`/assets/svg/buttons/system.svg#system`}></use>
                            </IconMedium>
                            SYSTEM
                        </div>
                    </div>
                </Link>

                    <Link onClick={() =>
                        setMoose(true)
                        /* 
                        openModal(
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <h1>You found the Turbo-Button!</h1>
                                <p>Sadly, it doesn't do anything.</p>
                            </div>
                        )
                        */
                        }
                        isActive={moose}
                        style={{width: theme.icons.medium}}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'left' }}>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
                                <IconMedium theme={theme} style={{ fill: moose ? theme.colors.medium : 'none' }}>
                                    <use xlinkHref={`/assets/svg/moose.svg#moose`}></use>
                                </IconMedium>
                            </div>
                        </div>
                        <Caption1 style={{color: theme.colors.light}}> v2.2.1</Caption1>
                    </Link>
                    
            </Menu>
        </Sidebar>

    );
};


export default SideBar;
