import { Link } from "react-router-dom";
import { useAuth } from "../../lib/auth";

// components
import NavbarButton from "./NavbarButton";

const Navbar: React.FC = () => {
  const { user } = useAuth();
  return (
    <nav className="navbar-inner no-select" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="logo">
        <Link to="/market">
          <img
            draggable="false"
            alt="Magnum"
            src={`${process.env.PUBLIC_URL}/images/logo.png`}
          />
        </Link>
      </div>
      {/* Show sign in / sign up links for unauthenticated users so landing page has quick access */}
      {!user && (
        <div style={{ padding: "8px 12px", display: "flex", gap: 8 }}>
          <Link to="/members/signin" className="button button-outline">
            Sign in
          </Link>
          <Link to="/members/signup" className="button button-purple">
            Sign up
          </Link>
        </div>
      )}
      <h3>Main menu</h3>
      <ul>
        <li>
          <NavbarButton url="/capital" icon="equalizer" title="Capital" />
        </li>
        <li>
          <NavbarButton
            url="/wallet"
            icon="account_balance_wallet"
            title="My wallet"
          />
        </li>
        <li>
          <NavbarButton
            url="/dashboard"
            icon="dashboard"
            title="Deposit / Withdraw"
          />
        </li>
      </ul>
      <h3>Others</h3>
      <ul>
        <li>
          <NavbarButton url="/about" icon="info" title="About Us" />
        </li>
        <li>
          <NavbarButton
            url="/members"
            icon="account_circle"
            title="My profile"
          />
        </li>
        {user?.role === 'ADMIN' && (
          <li>
            <NavbarButton url="/admin" icon="admin_panel_settings" title="Admin" />
          </li>
        )}
        <li>
          <NavbarButton url="/messages" icon="chat" title="Messages" />
        </li>
        <li>
          <NavbarButton url="/settings" icon="settings" title="Settings" />
        </li>
      </ul>
      <div className="copyright" style={{ marginTop: 'auto' }}>
        <strong>Magnum</strong>
        <p>
          {new Date().getFullYear()} &copy; All rights reserved.
        </p>
      </div>
    </nav>
  );
};

export default Navbar;
