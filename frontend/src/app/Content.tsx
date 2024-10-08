import { ApplicationSettings, Store } from '../store/Store';

import Dashboard from './pages/dashboard/Dashboard';
import Settings from './pages/settings/Settings';

import "./../themes.scss";
import "./../styles.scss";

const Content = () => {
  const applicationSettings = ApplicationSettings((state) => state.applicationSettings);
  const store = Store((state) => state);

  const viewMap = {
    Carplay: () => <></>,
    Dashboard: Dashboard,
    Settings: Settings,
  };

  const renderView = () => {
    const Component = viewMap[store.view] || Dashboard;
    return <Component />;
  };

  return (
    <>
      {store.startedUp ? (
        <div className='content' style={{
          height: `${store.contentSize.height}px`,
          width: `${store.contentSize.width}px`,
          marginTop: `${
            store.view === "carplay" && applicationSettings.side_bars.topBarAlwaysOn.value
              ? applicationSettings.app.dashBarHeight.value
              : applicationSettings.side_bars.topBarHeight.value
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
