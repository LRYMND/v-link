import { APP } from '../store/Store';

import Dashboard from './pages/dashboard/Dashboard';
import Settings from './pages/settings/Settings';

import "./../themes.scss";
import "./../styles.scss";

const Content = () => {
  const userSettings = APP((state) => state);

  const viewMap = {
    Carplay: () => <></>,
    Dashboard: Dashboard,
    Settings: Settings,
  };

  const renderView = () => {
    const Component = viewMap[userSettings.view] || Dashboard;
    return <Component />;
  };

  return (
    <>
      {userSettings.startedUp ? (
        <div className='content' style={{
          height: `${userSettings.contentSize.height}px`,
          width: `${userSettings.contentSize.width}px`,
          marginTop: `${
            userSettings.view === "carplay" && userSettings.side_bars.topBarAlwaysOn.value
              ? userSettings.app.dashBarHeight.value
              : userSettings.side_bars.topBarHeight.value
          }px`,
          background: 'var(--backgroundColor)',
          fontFamily: 'Helvetica',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {renderView()}
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default Content;
