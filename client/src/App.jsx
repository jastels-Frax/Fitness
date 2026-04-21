import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Library from './pages/Library';
import ExerciseDetail from './pages/ExerciseDetail';
import WorkoutBuilder from './pages/WorkoutBuilder';
import ActiveWorkout from './pages/ActiveWorkout';
import History from './pages/History';
import Metrics from './pages/Metrics';
import Settings from './pages/Settings';
import TabBar from './components/TabBar';

export default function App() {
  const location = useLocation();
  const hideTabBar = ['/workout/active', '/workout/builder'].includes(location.pathname);

  return (
    <>
      <div style={{ paddingBottom: hideTabBar ? 0 : 64 }}>
        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/library"         element={<Library />} />
          <Route path="/library/:id"     element={<ExerciseDetail />} />
          <Route path="/workout/builder" element={<WorkoutBuilder />} />
          <Route path="/workout/active"  element={<ActiveWorkout />} />
          <Route path="/history"         element={<History />} />
          <Route path="/metrics"         element={<Metrics />} />
          <Route path="/settings"        element={<Settings />} />
        </Routes>
      </div>
      <TabBar />
    </>
  );
}
