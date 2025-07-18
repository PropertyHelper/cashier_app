import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import {ChakraProvider, defaultSystem} from "@chakra-ui/react";

//  ChakraProvider is to support Chakra UI library
ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ChakraProvider value={defaultSystem}>
            <App />
        </ChakraProvider>
    </React.StrictMode>,
)