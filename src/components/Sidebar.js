import { Home, Search, Library, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../style/Sidebar.css';

const Sidebar = () => {

  const navLinks = [
    { to: '/', icon: <Home size={24} />, label: 'Home' },
    { to: '/search', icon: <Search size={24} />, label: 'Search' },
    { to: '/library', icon: <Library size={24} />, label: 'Your Library' },
    { to: '/downloade', icon: <Download size={24} />, label: 'Downloaded' },
  ];


  return (
    <div className={`sidebar-container `}>
      <div className="sidebar-header">
        {<span className="logo-icon">🎵</span>}
      </div>

      <nav className="sidebar-nav">
        {navLinks.map(item => (
          <Link key={item.to} to={item.to} className="sidebar-link">
            {item.icon}
            { <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
