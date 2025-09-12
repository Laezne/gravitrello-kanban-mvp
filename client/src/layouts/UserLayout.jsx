import { Outlet } from 'react-router';

export const UserLayout = () => {
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
  )
}
