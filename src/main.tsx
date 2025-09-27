import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {Provider} from "react-redux";
import {store} from "@/stores";
import {Toaster} from "@/components/ui/sonner.tsx";
import {TodoProvider} from "@/contexts/todo_context.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <Provider store={store}>
          <TodoProvider>
              <App />
              <Toaster
                  position="top-right"
                  closeButton        // show the built-in X (we also add our own to match the mock)
                  richColors={true} // we’ll fully control the colors
              />
          </TodoProvider>
      </Provider>
  </StrictMode>,
)
