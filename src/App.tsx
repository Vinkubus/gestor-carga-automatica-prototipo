import { HashRouter, Route, Routes } from 'react-router-dom';
import { ConcentradorPage } from './pages/ConcentradorPage';
import { DetailPage } from './pages/DetailPage';
import { ToastViewport } from './components/ui/ToastViewport';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ConcentradorPage />} />
        <Route path="/procesos/:id" element={<DetailPage />} />
      </Routes>
      <ToastViewport />
    </HashRouter>
  );
}

export default App;
