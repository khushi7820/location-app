import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import AddressForm from "./pages/AddressForm";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/address"
          element={<AddressForm />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;