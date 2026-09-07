import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import RegisterPage from '../pages/RegisterPage';
import KioskPage from '../pages/KioskPage';
import AdminPage from '../pages/AdminPage';
import StationLayout from '../pages/stations/StationLayout';
import Station1Phishing from '../pages/stations/Station1Phishing';
import Station2WiFi from '../pages/stations/Station2WiFi';
import Station3Password from '../pages/stations/Station3Password';
import Station4Ransomware from '../pages/stations/Station4Ransomware';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Default → Registration desk */}
          <Route path="/" element={<Navigate to="/register" replace />} />

          {/* Registration desk */}
          <Route path="/register" element={<RegisterPage />} />

          {/* Kiosk PIN gate — optionally ?station=1..4 */}
          <Route path="/kiosk" element={<KioskPage />} />

          {/* Admin dashboard */}
          <Route path="/admin" element={<AdminPage />} />

          {/* Station routes with explicit stationId props */}
          <Route
            path="/station/1"
            element={
              <StationLayout stationId={1}>
                <Station1Phishing />
              </StationLayout>
            }
          />
          <Route
            path="/station/2"
            element={
              <StationLayout stationId={2}>
                <Station2WiFi />
              </StationLayout>
            }
          />
          <Route
            path="/station/3"
            element={
              <StationLayout stationId={3}>
                <Station3Password />
              </StationLayout>
            }
          />
          <Route
            path="/station/4"
            element={
              <StationLayout stationId={4}>
                <Station4Ransomware />
              </StationLayout>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
