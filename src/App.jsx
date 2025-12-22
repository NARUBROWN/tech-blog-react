import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CreatePost from './pages/CreatePost';
import PostEdit from './pages/PostEdit';
import CreateCategory from './pages/CreateCategory';
import PostDetail from './pages/PostDetail';
import ProfileSettings from './pages/ProfileSettings';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />

            <Route
              path="post/create"
              element={
                <ProtectedRoute>
                  <CreatePost />
                </ProtectedRoute>
              }
            />

            <Route
              path="post/edit/:id"
              element={
                <ProtectedRoute>
                  <PostEdit />
                </ProtectedRoute>
              }
            />

            <Route
              path="category/create"
              element={
                <ProtectedRoute>
                  <CreateCategory />
                </ProtectedRoute>
              }
            />

            <Route
              path="settings"
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />

            <Route path="post/:slug" element={<PostDetail />} />
            <Route path="post/share/:id" element={<PostDetail />} />
            <Route path="recap/share/:year" element={<Navigate to="/?recap=true" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
