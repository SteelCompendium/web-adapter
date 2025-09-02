import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Buffer } from "buffer";

if (!globalThis.Buffer) {
	globalThis.Buffer = Buffer;
}

const theme = createTheme({
	palette: {
		mode: "dark",
		primary: {
			main: "#71797E",
		},
		secondary: {
			main: "#f48fb1",
		},
		background: {
			default: "#121212",
			paper: "#1e1e1e",
		},
	},
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<App />
		</ThemeProvider>
	</React.StrictMode>,
);