import { Outlet } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar.jsx';
import Sidebar from '../components/sidebar/Sidebar.jsx';


export default function MainLayout() {

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className='flex flex-1 overflow-y-auto p-4 bg-gray-100'>
        <Outlet />
        </main>
      </div>
    </div>
  );
}
