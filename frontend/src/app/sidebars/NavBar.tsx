import { APP } from '../../store/Store';

import "./../../styles.scss";
import "./../../themes.scss";

const NavBar = () => {
    const app = APP((state) => state);

    const buttonWidth = app.settings.side_bars.navBarHeight.value * 0.5; // Same as button width

    return (
        <div
            className={`navbar ${app.settings.general.colorTheme.value}`}
            style={{
                height: `${app.settings.side_bars.navBarHeight.value}px`,
                display: 'flex',
                position: 'absolute',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                bottom: 0,
                width: '100%',
                backgroundColor: 'var(--warmGreyMedium)',
            }}
        >
            <div className="row">
                {['Dashboard', 'Carplay', 'Settings'].map((view) => (
                    <div className="column" key={view} style={{ position: 'relative' }}>
                        <button
                            className="nav-button"
                            onClick={() => app.update({ system: { view } })}
                            style={{
                                fill:
                                    app.system.view === view
                                        ? 'var(--themeDefault)'
                                        : 'var(--boxColorLighter)',
                                zIndex: 2,  // Ensure button stays above the glow bar
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="nav-icon"
                                width={buttonWidth}
                                height={buttonWidth}
                            >
                                <use xlinkHref={`/assets/svg/${view.toLowerCase()}.svg#${view.toLowerCase()}`}></use>
                            </svg>
                        </button>
                        {app.system.view === view && (
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: 0,  // Position the glow bar just below the button
                                    left: '50%',
                                    transform: 'translateX(-50%)', // Center the glow bar
                                    width: buttonWidth * 1.5,  // Same width as the button
                                    height: '1px',
                                    backgroundColor: 'var(--themeDefault)',
                                    boxShadow: `0 0 15px 2px var(--themeDefault)`, // Glow effect
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NavBar;
