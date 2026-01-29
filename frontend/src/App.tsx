import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Stock from "./pages/Stock";
import Table from "./pages/Table";
import Screen from './pages/Screen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/stock" element={<Stock />} />
        <Route path="/table" element={<Table />} />
        <Route path="/screen" element={<Screen />} />
      </Routes>
    </Router>
  );
}

export default App;