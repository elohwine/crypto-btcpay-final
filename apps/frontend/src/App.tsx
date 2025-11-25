import Navigation from "./navigation/Navigation";
import { ChatAssistantProvider, ChatWidget } from "./components/ChatAssistant";
import TopBanner from "./components/TopBanner/TopBanner";

// styles
import "./styles/site.css";

const App: React.FC = () => (
    <ChatAssistantProvider>
        <TopBanner />
        <Navigation />
        <ChatWidget />
    </ChatAssistantProvider>
);

export default App;
