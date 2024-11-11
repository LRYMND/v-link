import { APP } from '../store/Store';

import Dashboard from './pages/dashboard/Dashboard';
import Settings from './pages/settings/Settings';

import "./../themes.scss";
import "./../styles.scss";

const Content = () => {
  const app = APP((state) => state);

  const viewMap = {
    Carplay: () => <></>,
    Dashboard: Dashboard,
    Settings: Settings,
  };

  const renderView = () => {
    const Component = viewMap[app.system.view] || Dashboard;
    return <Component />;
  };

  return (
    <>
      {app.system.startedUp ? (
        <div className='content' style={{
          height: `${app.system.contentSize.height}px`,
          width: `${app.system.contentSize.width}px`,
          marginTop: `${
            app.system.view === "carplay" && app.settings.side_bars.dashBar.value
              ? app.settings.dashBarHeight.value
              : app.settings.side_bars.topBarHeight.value
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
