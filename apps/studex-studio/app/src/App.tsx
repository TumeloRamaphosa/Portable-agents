import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { TodayPage } from "./pages/TodayPage";
import { JobsListPage } from "./pages/JobsListPage";
import { JobPage } from "./pages/JobPage";
import { ContentPlanPage } from "./pages/ContentPlanPage";
import { CalendarPage } from "./pages/CalendarPage";
import { PipelinePage } from "./pages/PipelinePage";
import { ScreeningPage } from "./pages/ScreeningPage";
import { ChatPage } from "./pages/ChatPage";
import { SettingsPage } from "./pages/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<TodayPage />} />
          <Route path="jobs" element={<JobsListPage />} />
          <Route path="jobs/:jobId" element={<JobPage />} />
          <Route path="content-plan" element={<ContentPlanPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="pipeline" element={<PipelinePage />} />
          <Route path="screening" element={<ScreeningPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
