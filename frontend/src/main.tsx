import { ChakraProvider} from '@chakra-ui/react'
import { workbookTheme } from './theme/workBookTheme.ts'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './i18n/config.ts' // Import i18n configuration

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={workbookTheme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)