import "./../../styles.scss"
import "./../../themes.scss"
import "./navbar.scss";

const NavBar = ({ applicationSettings, view, setView }) => {
	const gradientId = 'gradient';

	return (
		<div className={`navbar ${applicationSettings.app.colorTheme.value}`} style={{ height: `${applicationSettings.app.navBarHeight.value}px` }}>
			<div className="row">
				<svg height="20" width="100%" style={{ position: 'absolute', top: 5, left: 0 }}>
					<defs>
						<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor="black" stopOpacity="1" />
							<stop offset="33%" stopColor="var(--sectionColor)" stopOpacity="1" />
							<stop offset="66%" stopColor="var(--sectionColor)" stopOpacity="1" />
							<stop offset="100%" stopColor="black" stopOpacity="1" />
						</linearGradient>
					</defs>

					<rect
						width="100%"
						height="2"
						style={{ fill: `url(#${gradientId})` }}
					/>
				</svg>
				<div className="column">
					{applicationSettings.connections.activateCAN.value ?
						<button className="button-styles nav-button" onClick={() => setView('Dashboard')} style={{ fill: (view === 'Dashboard') ? 'var(--fillActive)' : 'var(--fillInactive)' }}>
							<svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" width={(applicationSettings.app.navBarHeight.value * 0.6)} height={(applicationSettings.app.navBarHeight.value * 0.6)}>
								<use xlinkHref="/assets/svg/gauge.svg#gauge"></use>
							</svg>
						</button>
						: <></>}
				</div>
				<div className="column">
					{applicationSettings.connections.activateMMI.value ?
						<button className="button-styles nav-button" onClick={() => setView('Carplay')} style={{ fill: (view === 'Carplay') ? 'var(--fillActive)' : 'var(--fillInactive)' }}>
							<svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" width={(applicationSettings.app.navBarHeight.value * 0.6)} height={(applicationSettings.app.navBarHeight.value * 0.6)}>
								<use xlinkHref="/assets/svg/carplay.svg#carplay"></use>
							</svg>
						</button>
						: <></>}
				</div>
				<div className="column">
					<button className="button-styles nav-button" onClick={() => setView('Settings')} style={{ fill: (view === 'Settings') ? 'var(--fillActive)' : 'var(--fillInactive)' }}>
						<svg xmlns="http://www.w3.org/2000/svg" className="nav-icon" width={(applicationSettings.app.navBarHeight.value * 0.6)} height={(applicationSettings.app.navBarHeight.value * 0.6)}>
							<use xlinkHref="/assets/svg/settings.svg#settings"></use>
						</svg>
					</button>
				</div>
			</div>
		</div >
	);
};


export default NavBar;
