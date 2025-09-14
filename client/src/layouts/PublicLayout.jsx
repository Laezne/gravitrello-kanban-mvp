import { Outlet } from 'react-router';
import PublicNavbar from '../components/navbars/PublicNavbar/PublicNavbar';
import UserNavbar from '../components/navbars/UserNavbar/UserNabvar';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContextProvider';


export const PublicLayout = () => {
  const {user} = useContext(AuthContext);
  
  return (
     <>
      <header>
        {!user ?
          <PublicNavbar />
          :
          <UserNavbar />
        }
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
      </footer>
    </>
  );
};