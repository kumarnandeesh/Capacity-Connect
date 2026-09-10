import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import TraineeHome from "./pages/trainee/TraineeHome";
import TraineeProfile from "./pages/trainee/TraineeProfile";
import BrowseCourses from "./pages/trainee/BrowseCourses";
import MyCourses from "./pages/trainee/MyCourses";
import CourseDetail from "./pages/trainee/CourseDetail";
import Assessments from "./pages/trainee/Assessments";
import TakeAssessment from "./pages/trainee/TakeAssessment";
import Results from "./pages/trainee/Results";

import TrainerHome from "./pages/trainer/TrainerHome";
import TrainerProfile from "./pages/trainer/TrainerProfile";
import TrainerCourses from "./pages/trainer/TrainerCourses";
import TrainerCourseDetail from "./pages/trainer/TrainerCourseDetail";
import Questionnaires from "./pages/trainer/Questionnaires";
import QuestionnaireResults from "./pages/trainer/QuestionnaireResults";
import Performance from "./pages/trainer/Performance";
import TrainerFeedback from "./pages/trainer/TrainerFeedback";

import AdminHome from "./pages/admin/AdminHome";
import Approvals from "./pages/admin/Approvals";
import Roles from "./pages/admin/Roles";
import AdminCourses from "./pages/admin/AdminCourses";
import Competency from "./pages/admin/Competency";
import Notifications from "./pages/admin/Notifications";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}/home`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Trainee */}
      <Route path="/trainee/home" element={<ProtectedRoute role="trainee"><TraineeHome /></ProtectedRoute>} />
      <Route path="/trainee/profile" element={<ProtectedRoute role="trainee"><TraineeProfile /></ProtectedRoute>} />
      <Route path="/trainee/browse" element={<ProtectedRoute role="trainee"><BrowseCourses /></ProtectedRoute>} />
      <Route path="/trainee/my-courses" element={<ProtectedRoute role="trainee"><MyCourses /></ProtectedRoute>} />
      <Route path="/trainee/my-courses/:id" element={<ProtectedRoute role="trainee"><CourseDetail /></ProtectedRoute>} />
      <Route path="/trainee/assessments" element={<ProtectedRoute role="trainee"><Assessments /></ProtectedRoute>} />
      <Route path="/trainee/assessments/:id" element={<ProtectedRoute role="trainee"><TakeAssessment /></ProtectedRoute>} />
      <Route path="/trainee/results" element={<ProtectedRoute role="trainee"><Results /></ProtectedRoute>} />

      {/* Trainer */}
      <Route path="/trainer/home" element={<ProtectedRoute role="trainer"><TrainerHome /></ProtectedRoute>} />
      <Route path="/trainer/profile" element={<ProtectedRoute role="trainer"><TrainerProfile /></ProtectedRoute>} />
      <Route path="/trainer/courses" element={<ProtectedRoute role="trainer"><TrainerCourses /></ProtectedRoute>} />
      <Route path="/trainer/courses/:id" element={<ProtectedRoute role="trainer"><TrainerCourseDetail /></ProtectedRoute>} />
      <Route path="/trainer/questionnaires" element={<ProtectedRoute role="trainer"><Questionnaires /></ProtectedRoute>} />
      <Route path="/trainer/questionnaires/:id" element={<ProtectedRoute role="trainer"><QuestionnaireResults /></ProtectedRoute>} />
      <Route path="/trainer/performance" element={<ProtectedRoute role="trainer"><Performance /></ProtectedRoute>} />
      <Route path="/trainer/feedback" element={<ProtectedRoute role="trainer"><TrainerFeedback /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/home" element={<ProtectedRoute role="admin"><AdminHome /></ProtectedRoute>} />
      <Route path="/admin/approvals" element={<ProtectedRoute role="admin"><Approvals /></ProtectedRoute>} />
      <Route path="/admin/roles" element={<ProtectedRoute role="admin"><Roles /></ProtectedRoute>} />
      <Route path="/admin/courses" element={<ProtectedRoute role="admin"><AdminCourses /></ProtectedRoute>} />
      <Route path="/admin/competency" element={<ProtectedRoute role="admin"><Competency /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute role="admin"><Notifications /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
