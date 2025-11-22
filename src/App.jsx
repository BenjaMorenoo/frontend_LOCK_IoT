import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Logs from "./pages/Logs";
import Profesores from "./pages/Profesores";
import Casilleros from "./pages/Casilleros";
import ChangePassword from "./pages/ChangePassword";
import Sedes from "./pages/Sedes";
import Escuelas from "./pages/Escuelas";
import Jefes from "./pages/Jefes";
import Admins from "./pages/Admins";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardHome from "./pages/DashboardHome";
import { SidebarProvider } from "./contexts/SidebarContext";

function App() {
  return (
    <SidebarProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          >
            <Route path="logs" element={<DashboardHome />} />
            <Route path="profesores" element={<Profesores />} />
            <Route path="casilleros" element={<Casilleros />} />
            <Route path="sedes" element={<Sedes />} />
            <Route path="admins" element={<Admins />} />
            <Route path="escuelas" element={<Escuelas />} />
            <Route path="jefes" element={<Jefes />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SidebarProvider>
  );
}

export default App;
