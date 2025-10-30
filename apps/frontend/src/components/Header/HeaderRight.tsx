import { Link, useLocation } from "react-router-dom";
import SessionDropdown from "./SessionDropdown";
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch";

const HeaderRight: React.FC = () => {
  const location = useLocation();
  // SessionDropdown handles auth display and signout. No need to access auth here.

  return (
    <div className="header-right no-select">
      <div className="flex flex-center">
        <ul className="header-menu nowrap">
          <li>
            <Link
              to="/market"
              className={
                location.pathname.toLowerCase().includes("/market")
                  ? "active"
                  : "passive"
              }
            >
              Market
            </Link>
          </li>
          <li>
            <Link
              to="/data"
              className={
                location.pathname.toLowerCase().includes("/data")
                  ? "active"
                  : "passive"
              }
            >
              Data
            </Link>
          </li>
          <li>
            <Link
              to="/docs"
              className={
                location.pathname.toLowerCase().includes("/docs")
                  ? "active"
                  : "passive"
              }
            >
              Docs
            </Link>
          </li>
          <li>
            <Link
              to="/api"
              className={
                location.pathname.toLowerCase().includes("/api")
                  ? "active"
                  : "passive"
              }
            >
              API
            </Link>
          </li>
        </ul>
        <ul className="header-icons nowrap">
          <li>
            <Link to="/search">
              <i className="material-icons">search</i>
            </Link>
          </li>
          <li>
            <Link
              to="/members/notifications"
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <span
                className="notification-badge"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-contrast)",
                }}
              >
                23
              </span>
              <i className="material-icons" style={{ color: "var(--primary)" }}>
                notifications
              </i>
            </Link>
          </li>
        </ul>
        <ul className="header-user nowrap">
          <li>
            <ThemeSwitch />
          </li>
          <li>
            <SessionDropdown />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HeaderRight;
