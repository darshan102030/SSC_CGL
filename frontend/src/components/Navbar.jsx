import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-ssc-dark text-ssc-light p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">SSC CGL Mock Test</Link>
        <div className="flex gap-1 md:gap-4">
          <NavLink to="/" className={({isActive}) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-ssc-primary dark:bg-blue-900/30' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
            Dashboard
          </NavLink>
          <NavLink to="/history" className={({isActive}) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-ssc-primary dark:bg-blue-900/30' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
            History
          </NavLink>
          <NavLink to="/upload" className={({isActive}) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-ssc-primary dark:bg-blue-900/30' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
            Upload Qs
          </NavLink>
          <NavLink to="/manage-questions" className={({isActive}) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-ssc-primary dark:bg-blue-900/30' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
            Manage Qs
          </NavLink>
          <NavLink to="/papers/upload" className={({isActive}) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-ssc-primary dark:bg-blue-900/30' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
            Upload Paper
          </NavLink>
          <NavLink to="/papers" className={({isActive}) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-ssc-primary dark:bg-blue-900/30' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
            Full Papers
          </NavLink>
          <NavLink to="/papers/dashboard" className={({isActive}) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-ssc-primary dark:bg-blue-900/30' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
            Paper Analytics
          </NavLink>
          <NavLink to="/settings" className={({isActive}) => `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-ssc-primary dark:bg-blue-900/30' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
            Settings
          </NavLink>
          <Link to="/create-test" className="px-4 py-2 ml-2 rounded-lg bg-ssc-primary hover:bg-blue-600 text-white text-sm font-medium transition-colors shadow-sm">
            New Test
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
