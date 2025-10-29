// components
import Box from '../../components/Common/Box';
import SiteLayout from '../../layouts/SiteLayout';
import Header from '../../components/Header/Header';
import BankProcess from '../../components/Widgets/BankProcess/BankProcess';

const DashboardScreen: React.FC = () => (
  <SiteLayout>
    <Header icon='sort' title='Crypto Deposits' />
    <div className='flex flex-destroy flex-space-between'>
        <div className='flex-1'>
          <BankProcess />
        </div>
    </div>
    <div style={{ marginTop: 24 }}>
      <div style={{ background: 'var(--primary-opaque, rgba(59,130,246,0.12))', borderRadius: 12, padding: 12 }}>
        <Box>
          <div className='box-title box-vertical-padding box-horizontal-padding no-select'>
            <div className='flex flex-center flex-space-between'>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Withdrawal Information</p>
            </div>
          </div>
          <div className='box-content box-text box-horizontal-padding box-content-height-nobutton' style={{ fontSize: 13, color: 'var(--text)' }}>
            <p style={{ marginBottom: 8 }}>&bull; You can make withdrawals from all the bank accounts opened in your name (individual, non-term, TL). Transfers to another person will not be processed.</p>
            <p style={{ marginBottom: 8 }}>&bull; The minimum withdrawal amount is 10 TL.</p>
            <p style={{ marginBottom: 8 }}>&bull; A processing fee of 3 TL will be charged for withdrawal transactions.</p>
            <p style={{ marginBottom: 8 }}>&bull; When you issue a withdrawal instruction, the amount will be deducted from your available balance.</p>
            <p style={{ marginBottom: 8 }}>&bull; You can cancel any instructions that have not been processed yet. In this case, the instruction amount will be returned to your available balance.</p>
            <p style={{ marginBottom: 0 }}>&bull; Withdrawal instructions given outside of bank working hours will be processed once the banks begin their working hours.</p>
          </div>
        </Box>
      </div>
    </div>
  </SiteLayout>
);

export default DashboardScreen;
