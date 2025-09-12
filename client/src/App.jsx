import { AuthContextProvider } from './context/AuthContextProvider';
import { AppRoutes } from './routes/AppRoutes';

const App = () => {
  return (
    <AuthContextProvider>
      <AppRoutes />
    </AuthContextProvider>
  );
};

export default App;