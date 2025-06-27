import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
	Container,
	Box,
	TextField,
	Button,
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
import converterRegistry from "./components/ConverterRegistry";
import JSONValidator from "./components/JSONValidator";
import BulkConverter from "./components/BulkConverter";
import Extractor from "./components/Extractor";

const textAreaStyle = {
	position: "absolute",
	top: 0,
	left: 0,
	width: "100%",
	height: "100%",
	"& .MuiInputBase-root": {
		height: "100%",
		alignItems: "flex-start",
	},
	"& textarea": {
		height: "100% !important",
		overflowY: "auto !important",
		boxSizing: "border-box",
		fontFamily: "monospace",
	},
};

function TabPanel({ children, value, index, sx, ...other }) {
	return (
		<Box
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
			sx={{
				flexGrow: 1,
				display: value === index ? "flex" : "none",
				flexDirection: "column",
				...sx,
			}}
		>
			{value === index && (
				<Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
					{children}
				</Box>
			)}
		</Box>
	);
}

TabPanel.propTypes = {
	children: PropTypes.node,
	value: PropTypes.number.isRequired,
	index: PropTypes.number.isRequired,
	sx: PropTypes.object,
};

function App() {
	const [inputText, setInputText] = useState("");
	const [outputText, setOutputText] = useState("");
	const [sourceFormat, setSourceFormat] = useState("Automagically Identify Input Format");
	const [targetFormat, setTargetFormat] = useState("YAML");
	const [error, setError] = useState("");
	const [availableReaderFormats, setAvailableReaderFormats] = useState([]);
	const [availableWriterFormats, setAvailableWriterFormats] = useState([]);
	const [tabValue, setTabValue] = useState(0);

	useEffect(() => {
		setAvailableReaderFormats(converterRegistry.getAvailableReaderFormats());
		setAvailableWriterFormats(converterRegistry.getAvailableWriterFormats());
	}, []);

	const handleConvert = async () => {
		try {
			setError("");
			const result = await converterRegistry.convert(inputText, sourceFormat, targetFormat);
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
			maxWidth={false}
			disableGutters
			sx={{
				display: "flex",
				flexDirection: "column",
				height: "calc(100vh - 40px)",
			}}
		>
			<Container
				sx={{
					display: "flex",
					alignItems: "left",
					margin: "0",
				}}
			>
				<a
					href="https://steelcompendium.io"
					target="_blank"
					rel="noopener noreferrer"
					style={{
						top: "10px",
						left: "10px",
						zIndex: 1300,
						paddingRight: "1rem",
					}}
				>
					<img
						src={`${process.env.PUBLIC_URL}/steel_compendium_glow@512.png`}
						alt="Steel Compendium Logo"
						style={{
							height: "40px",
						}}
					/>
				</a>
				<Box sx={{ borderBottom: 1, borderColor: "divider" }}>
					<Tabs
						value={tabValue}
						onChange={handleTabChange}
						aria-label="converter tabs"
					>
						<Tab label="Draw Steel Converter" />
						<Tab label="Bulk Converter" />
						<Tab label="Extractor" />
						<Tab label="Validator" />
					</Tabs>
				</Box>
			</Container>
			<Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
				<TabPanel value={tabValue} index={0} sx={{ height: "100%" }}>
					{error && (
						<Alert severity="error" square>
							{error}
						</Alert>
					)}

					<Box sx={{ p: 2 }}>
						<Grid container spacing={2} alignItems="center">
							<Grid item xs={12} md>
								<FormControl fullWidth>
									<InputLabel>Input Format</InputLabel>
									<Select
										value={sourceFormat}
										label="Source Format"
										onChange={(e) => setSourceFormat(e.target.value)}
									>
										{availableReaderFormats.map((format) => (
											<MenuItem key={format} value={format}>
												{format}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>
							<Grid item xs={12} md="auto">
								<Box sx={{ textAlign: "center", width: "100%" }}>
									<Button
										variant="contained"
										size="large"
										onClick={handleConvert}
										disabled={!inputText || !sourceFormat || !targetFormat}
									>
										Convert
									</Button>
								</Box>
							</Grid>
							<Grid item xs={12} md>
								<FormControl fullWidth>
									<InputLabel>Output Format</InputLabel>
									<Select
										value={targetFormat}
										label="Target Format"
										onChange={(e) => setTargetFormat(e.target.value)}
									>
										{availableWriterFormats.map((format) => (
											<MenuItem key={format} value={format}>
												{format}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>
						</Grid>
					</Box>

					<Grid container sx={{ flexGrow: 1 }}>
						<Grid
							item
							xs={12}
							md={6}
							sx={{ display: "flex", flexDirection: "column" }}
						>
							<Paper
								square
								sx={{ display: "flex", flexDirection: "column", flexGrow: 1, p: 1 }}
							>
								<Box sx={{
									flexGrow: 1,
									position: "relative",
								}}>
									<TextField
										sx={textAreaStyle}
										multiline
										value={inputText}
										onChange={(e) => setInputText(e.target.value)}
										placeholder="Paste your ability or statblock here..."
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
							<Paper
								square
								sx={{ display: "flex", flexDirection: "column", flexGrow: 1, p: 1 }}
							>
								<Box sx={{
									flexGrow: 1,
									position: "relative",
								}}>
									<TextField
										sx={textAreaStyle}
										multiline
										value={outputText}
										InputProps={{
											readOnly: true,
										}}
										placeholder="Converted ability or statblock will appear here..."
									/>
								</Box>
							</Paper>
						</Grid>
					</Grid>
				</TabPanel>

				<TabPanel value={tabValue} index={1}>
					<BulkConverter />
				</TabPanel>
				<TabPanel value={tabValue} index={2}>
					<Extractor />
				</TabPanel>
				<TabPanel value={tabValue} index={3}>
					<JSONValidator onValidData={handleValidData} />
				</TabPanel>
			</Box>
		</Container>
	);
}

export default App;