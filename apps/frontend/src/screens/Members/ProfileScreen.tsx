// components
import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';
import Profile from '../../components/Widgets/Profile/Profile';
import RecentActivity from '../../components/Widgets/RecentActivity/RecentActivity';

const ProfileScreen: React.FC = () => (
  <SiteLayout>
    {/* Include the global Header so navigation, theme switch and session UI appear on the Profile page */}
    <div style={{ padding: '12px', maxWidth: 980, margin: '0 auto', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', marginBottom: 18 }}>
        <Header title="Profile" />
      </div>

      <div style={{ width: '100%', marginBottom: 28 }}>
        <Profile />
      </div>

      {/* Recent activity - full width under profile and assets */}
      <div style={{ width: '100%' }}>
        <RecentActivity />
      </div>
    </div>
  </SiteLayout>
);

export default ProfileScreen;
