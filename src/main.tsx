import { logger } from "@/utils/logger";
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {Provider} from "react-redux"
import { store } from './lib/redux/store.ts';
import { loadUser } from './lib/redux/slice/localStorageSlice.ts';
import { BrowserRouter } from 'react-router-dom';

// Hydrate auth state before rendering
store.dispatch(loadUser());

createRoot(document.getElementById("root")!).render(
<Provider store={store}>
    <BrowserRouter>
        <App />
    </BrowserRouter>
</Provider>
);
