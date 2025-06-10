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

function TabPanel ({ children, value, index, ...other }) {
	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
		>
			{value === index && (
				<Box sx={{ p: 3 }}>
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

function App () {
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
		<Container maxWidth="lg" sx={{ py: 4 }}>
			<Typography variant="h3" component="h1" gutterBottom align="center">
				Statblock Converter & Validator
			</Typography>

			<Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
				<Tabs value={tabValue} onChange={handleTabChange} aria-label="converter tabs">
					<Tab label="Format Converter" />
					<Tab label="JSON Schema Validator" />
				</Tabs>
			</Box>

			<TabPanel value={tabValue} index={0}>
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				<Grid container spacing={3}>
					<Grid item xs={12} md={6}>
						<Paper sx={{ p: 2 }}>
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
							<TextField
								fullWidth
								multiline
								rows={10}
								value={inputText}
								onChange={(e) => setInputText(e.target.value)}
								placeholder="Paste your statblock here..."
								variant="outlined"
							/>
						</Paper>
					</Grid>

					<Grid item xs={12} md={6}>
						<Paper sx={{ p: 2 }}>
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
							<TextField
								fullWidth
								multiline
								rows={10}
								value={outputText}
								InputProps={{
									readOnly: true,
								}}
								placeholder="Converted statblock will appear here..."
								variant="outlined"
							/>
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
		</Container>
	);
}

export default App;