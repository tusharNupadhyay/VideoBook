import { Outlet } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar.jsx';
import Sidebar from '../components/sidebar/Sidebar.jsx';


export default function MainLayout() {

  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden ml-20">
        <Navbar />
        <main className='flex flex-1 overflow-y-auto bg-gray-100'>
        <Outlet />
        </main>
      </div>
    </div>
  );
}
