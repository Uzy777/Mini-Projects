import { Route, Routes } from "react-router";
import UrlToMarkdownPage from "./features/url-to-markdown/UrlToMarkdownPage";
import VideoToGifPage from "./features/video-to-gif/VideoToGifPage";
import HomePage from "../pages/HomePage";

function App() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/tools/url-to-markdown" element={<UrlToMarkdownPage />} />
            <Route path="/tools/video-to-gif" element={<VideoToGifPage />} />
        </Routes>
    );
}

export default App;
