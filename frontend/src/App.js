import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AppLayout from "@/components/AppLayout";
import DashboardHome from "@/pages/DashboardHome";
import NewApplication from "@/pages/NewApplication";
import ApplicationDetail from "@/pages/ApplicationDetail";
import ErrorBoundary from "@/components/ErrorBoundary";
import Settings from "@/pages/Settings";
import AdminDashboard from "@/pages/AdminDashboard";

function App() {
  return (
    <div className="App grain min-h-screen">
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: "#141414",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#F3F4F6",
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="new" element={<NewApplication />} />
              <Route path="settings" element={<Settings />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="application/:id" element={<ApplicationDetail />} />
            </Route>
          </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
