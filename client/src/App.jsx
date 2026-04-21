import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Library from './pages/Library';
import ExerciseDetail from './pages/ExerciseDetail';
import ActiveWorkout from './pages/ActiveWorkout';

export default function App() {
  return (
    <Routes>
      <Route path="/"                element={<Home />} />
      <Route path="/library"         element={<Library />} />
      <Route path="/library/:id"     element={<ExerciseDetail />} />
      <Route path="/workout/active"  element={<ActiveWorkout />} />
    </Routes>
  );
}
