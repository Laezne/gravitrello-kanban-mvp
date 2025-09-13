import { Outlet } from 'react-router';
import PublicNavbar from '../components/navbars/PublicNavbar/PublicNavbar';


export const PublicLayout = () => {
  return (
     <>
      <header>
        <PublicNavbar />
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
      </footer>
    </>
  );
};