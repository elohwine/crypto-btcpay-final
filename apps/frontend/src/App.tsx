import Navigation from "./navigation/Navigation";
import { ChatAssistantProvider, ChatWidget } from "./components/ChatAssistant";

// styles
import "./styles/site.css";

const App: React.FC = () => (
    <ChatAssistantProvider>
        <Navigation />
        <ChatWidget />
    </ChatAssistantProvider>
);

export default App;
