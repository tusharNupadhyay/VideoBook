import { Outlet } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar.jsx';
import Sidebar from '../components/sidebar/Sidebar.jsx';


export default function MainLayout() {
 
  return (
    <div className="flex min-h-screen bg-neutral-900">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 ml-20">
        <Navbar />
        <main className="flex flex-col flex-1 bg-neutral-900">
        <Outlet />
        </main>
      </div>
    </div>
  );
}
