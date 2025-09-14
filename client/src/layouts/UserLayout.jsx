import { Outlet } from 'react-router';
import UserNavbar from '../components/navbars/UserNavbar/UserNabvar';

export const UserLayout = () => {
  return (
    <>
      <header>
        <UserNavbar />
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
      </footer>
    </>
  )
}
