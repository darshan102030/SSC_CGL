import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-ssc-dark text-ssc-light p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">SSC CGL Mock Test</Link>
        <div className="space-x-4">
          <Link to="/" className="hover:text-ssc-primary">Dashboard</Link>
          <Link to="/upload" className="hover:text-ssc-primary">Upload</Link>
          <Link to="/create-test" className="hover:text-ssc-primary">New Test</Link>
          <Link to="/history" className="hover:text-ssc-primary">History</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
