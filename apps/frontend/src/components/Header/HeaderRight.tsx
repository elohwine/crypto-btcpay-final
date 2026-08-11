import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SessionDropdown from "./SessionDropdown";
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch";
import useClickOutside from "../../hooks/useClickOutside";

const HeaderRight: React.FC = () => {
  const location = useLocation();
  const spotMenuRef = useRef<HTMLLIElement | null>(null);
  const [spotMenuOpen, setSpotMenuOpen] = useState(false);
  // SessionDropdown handles auth display and signout. No need to access auth here.

  useClickOutside(spotMenuRef, () => setSpotMenuOpen(false));

  useEffect(() => {
    setSpotMenuOpen(false);
  }, [location.pathname]);

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
          <li ref={spotMenuRef}>
            <button
              type="button"
              className={spotMenuOpen ? "active" : "passive"}
              onClick={() => setSpotMenuOpen((current) => !current)}
              style={{
                margin: "0 2px",
                color: spotMenuOpen ? "var(--primary)" : "var(--muted)",
                fontWeight: 600,
                padding: "10px 15px",
                borderRadius: 25,
              }}
            >
              Spot
              <i className="material-icons" style={{ fontSize: 16, marginLeft: 4, verticalAlign: "middle" }}>
                arrow_drop_down
              </i>
            </button>
            {spotMenuOpen && (
              <ul className="box-dropdown" style={{ left: 0, right: "auto", top: 46, minWidth: 190 }}>
                <li>
                  <Link to="/market" onClick={() => setSpotMenuOpen(false)}>
                    <i className="material-icons">show_chart</i>
                    Spot market
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" onClick={() => setSpotMenuOpen(false)}>
                    <i className="material-icons">account_balance_wallet</i>
                    Assets overview
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" onClick={() => setSpotMenuOpen(false)}>
                    <i className="material-icons">receipt_long</i>
                    Recent orders
                  </Link>
                </li>
              </ul>
            )}
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
