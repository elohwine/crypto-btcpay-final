import { Link, useLocation } from 'react-router-dom';
import { useAppTheme } from '../../lib/themeUtils';

// interfaces
interface IProps {
  url: string;
  icon: string;
  title: string;
}

const NavbarButton: React.FC<IProps> = ({ url, icon, title }) => {
  const location = useLocation();
  const { primary } = useAppTheme();

  return (
    <Link
      to={url}
      className={location.pathname.toLowerCase().includes(url) ? 'active nowrap' : 'passive nowrap'}
      style={location.pathname.toLowerCase().includes(url) ? { color: primary } : undefined}
    >
      <i className='material-icons'>{icon}</i>
      <span>{title}</span>
    </Link>
  );
};

export default NavbarButton;
