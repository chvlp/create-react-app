import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {Toaster} from "@/components/ui/sonner.tsx";
import {TodoProvider} from "@/contexts/todo_context.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
        <TodoProvider>
              <App />
              <Toaster
                  position="top-right"
                  closeButton
                  richColors={true}
              />
        </TodoProvider>
  </StrictMode>,
)
