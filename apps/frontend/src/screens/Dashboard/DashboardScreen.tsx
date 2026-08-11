// components
import Box from "../../components/Common/Box";
import SiteLayout from "../../layouts/SiteLayout";
import Header from "../../components/Header/Header";
import MyAssets from "../../components/Widgets/MyAssets/MyAssets";
import RecentActivity from "../../components/Widgets/RecentActivity/RecentActivity";
import OpenOrders from "../../components/Widgets/OpenOrders/OpenOrders";
import { Link } from "react-router-dom";

const DashboardScreen: React.FC = () => (
  <SiteLayout>
    <Header icon="trending_up" title="Spot Overview" />
    <div style={{ marginBottom: 24 }}>
      <Box>
        <div className="box-title box-vertical-padding box-horizontal-padding no-select">
          <div className="flex flex-center flex-space-between">
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>
              Your spot trading hub
            </p>
            <Link
              to="/market"
              style={{ color: "var(--primary)", fontWeight: 600 }}
            >
              Open market
            </Link>
          </div>
        </div>
        <div
          className="box-content box-text box-horizontal-padding box-content-height-nobutton"
          style={{ fontSize: 13, color: "var(--text)" }}
        >
          Track balances, review live orders, and jump directly into the market
          terminal. This dashboard now reflects the repurposed spot platform.
        </div>
      </Box>
    </div>
    <div className="flex flex-destroy flex-space-between">
      <div className="flex-1 box-right-padding">
        <MyAssets />
      </div>
      <div className="flex-1 box-right-padding">
        <OpenOrders />
      </div>
      <div className="flex-1">
        <RecentActivity />
      </div>
    </div>
  </SiteLayout>
);

export default DashboardScreen;
