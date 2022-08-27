import { Feeds } from "pages";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Feeds />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
