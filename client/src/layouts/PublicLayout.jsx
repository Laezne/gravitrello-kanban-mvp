import { Outlet } from 'react-router';

export const PublicLayout = () => {
  return (
     <>
      <header>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
      </footer>
    </>
  );
};