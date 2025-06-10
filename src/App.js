import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
	Container,
	Box,
	TextField,
	Button,
	Typography,
	Paper,
	Grid,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Alert,
	Tabs,
	Tab,
} from "@mui/material";
import adapterRegistry from "./adapters/AdapterRegistry";
import JSONValidator from "./components/JSONValidator";

function TabPanel({ children, value, index, ...other }) {
	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
			style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
		>
			{value === index && (
				<Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
					{children}
				</Box>
			)}
		</div>
	);
}

TabPanel.propTypes = {
	children: PropTypes.node,
	value: PropTypes.number.isRequired,
	index: PropTypes.number.isRequired,
};

function App() {
	const [inputText, setInputText] = useState("");
	const [outputText, setOutputText] = useState("");
	const [sourceFormat, setSourceFormat] = useState("");
	const [targetFormat, setTargetFormat] = useState("");
	const [error, setError] = useState("");
	const [availableFormats, setAvailableFormats] = useState([]);
	const [tabValue, setTabValue] = useState(0);

	useEffect(() => {
		setAvailableFormats(adapterRegistry.getAvailableFormats());
	}, []);

	const handleConvert = () => {
		try {
			setError("");
			const result = adapterRegistry.convert(inputText, sourceFormat, targetFormat);
			setOutputText(result);
		} catch (err) {
			setError(err.message);
		}
	};

	const handleTabChange = (event, newValue) => {
		setTabValue(newValue);
	};

	const handleValidData = (validatedData) => {
		// When JSON is validated successfully, we could optionally do something with it
		// eslint-disable-next-line no-console
		console.log("Valid JSON data:", validatedData);
	};

	return (
		<Container
			maxWidth="false"
			sx={{
				py: 0,
				px: 0,
				display: "flex",
				flexDirection: "column",
				height: "100vh",
			}}
		>
			<Typography variant="h4" component="h4" gutterBottom align="center">
				Statblock Converter & Validator
			</Typography>

			<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
				<Tabs value={tabValue} onChange={handleTabChange} aria-label="converter tabs">
					<Tab label="Format Converter" />
					<Tab label="JSON Schema Validator" />
				</Tabs>
			</Box>

			<Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
				<TabPanel value={tabValue} index={0}>
					{error && (
						<Alert severity="error" sx={{ mb: 2 }}>
							{error}
						</Alert>
					)}

					<Grid container spacing={3} sx={{ flexGrow: 1 }}>
						<Grid
							item
							xs={12}
							md={6}
							sx={{ display: "flex", flexDirection: "column" }}
						>
							<Paper sx={{ p: 2, display: "flex", flexDirection: "column", flexGrow: 1 }}>
								<Typography variant="h6" gutterBottom>
									Input
								</Typography>
								<FormControl fullWidth sx={{ mb: 2 }}>
									<InputLabel>Source Format</InputLabel>
									<Select
										value={sourceFormat}
										label="Source Format"
										onChange={(e) => setSourceFormat(e.target.value)}
									>
										{availableFormats.map((format) => (
											<MenuItem key={format} value={format}>
												{format}
											</MenuItem>
										))}
									</Select>
								</FormControl>
								<Box sx={{
									overflowY: "auto", border: "1px solid #ccc", borderRadius: 1,
									"& .MuiTextField-root": {
										"& .MuiOutlinedInput-root": {
											"& > fieldset": {
												border: "none",
											},
										},
									},
								}}>
									<TextField
										sx={{ width: "100%" }}
										multiline
										minRows={20}
										maxRows={50}
										value={inputText}
										onChange={(e) => setInputText(e.target.value)}
										placeholder="Paste your statblock here..."
									/>
								</Box>
							</Paper>
						</Grid>

						<Grid
							item
							xs={12}
							md={6}
							sx={{ display: "flex", flexDirection: "column" }}
						>
							<Paper sx={{ p: 2, display: "flex", flexDirection: "column", flexGrow: 1 }}>
								<Typography variant="h6" gutterBottom>
									Output
								</Typography>
								<FormControl fullWidth sx={{ mb: 2 }}>
									<InputLabel>Target Format</InputLabel>
									<Select
										value={targetFormat}
										label="Target Format"
										onChange={(e) => setTargetFormat(e.target.value)}
									>
										{availableFormats.map((format) => (
											<MenuItem key={format} value={format}>
												{format}
											</MenuItem>
										))}
									</Select>
								</FormControl>
								<Box sx={{
									overflowY: "auto", border: "1px solid #ccc", borderRadius: 1,
									"& .MuiTextField-root": {
										"& .MuiOutlinedInput-root": {
											"& > fieldset": {
												border: "none",
											},
										},
									},
								}}>
									<TextField
										sx={{ width: "100%" }}
										multiline
										minRows={20}
										maxRows={50}
										value={outputText}
										InputProps={{
											readOnly: true,
										}}
										placeholder="Converted statblock will appear here..."
									/>
								</Box>
							</Paper>
						</Grid>
					</Grid>

					<Box sx={{ mt: 3, textAlign: "center" }}>
						<Button
							variant="contained"
							size="large"
							onClick={handleConvert}
							disabled={!inputText || !sourceFormat || !targetFormat}
						>
							Convert
						</Button>
					</Box>
				</TabPanel>

				<TabPanel value={tabValue} index={1}>
					<JSONValidator onValidData={handleValidData} />
				</TabPanel>
			</Box>
		</Container>
	);
}

export default App;