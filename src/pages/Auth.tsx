
import { useParams, Navigate } from 'react-router-dom';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import ForgotPasswordPage from './auth/ForgotPasswordPage';

export default function Auth() {
  const { type } = useParams<{ type: string }>();

  switch (type) {
    case 'login':
      return <LoginPage />;
    case 'register':
      return <RegisterPage />;
    case 'forgot-password':
      return <ForgotPasswordPage />;
    default:
      return <Navigate to="/auth/login" replace />;
  }
}
