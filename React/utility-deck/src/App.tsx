import { Route, Routes } from "react-router";
import UrlToMarkdownPage from "./features/url-to-markdown/UrlToMarkdownPage";
import HomePage from "../pages/HomePage";

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/tools/url-to-markdown" element={<UrlToMarkdownPage />} />
        </Routes>
    );
}

export default App;
