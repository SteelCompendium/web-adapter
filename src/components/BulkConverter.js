import React, { useState, useEffect } from "react";
import {
	Box,
	Button,
	Checkbox,
	Chip,
	FormControl,
	FormControlLabel,
	FormGroup,
	FormLabel,
	Grid,
	InputLabel,
	LinearProgress,
	MenuItem,
	Paper,
	Select,
	Typography,
} from "@mui/material";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import converterRegistry from "./ConverterRegistry";

function BulkConverter() {
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [sourceFormat, setSourceFormat] = useState("Prerelease PDF Statblock Text");
	const [targetFormats, setTargetFormats] = useState({});
	const [availableReaderFormats, setAvailableReaderFormats] = useState([]);
	const [availableWriterFormats, setAvailableWriterFormats] = useState([]);
	const [isConverting, setIsConverting] = useState(false);
	const [progress, setProgress] = useState({});

	useEffect(() => {
		const readers = converterRegistry.getAvailableReaderFormats();
		const writers = converterRegistry.getAvailableWriterFormats();
		setAvailableReaderFormats(readers);
		setAvailableWriterFormats(writers);
		const initialTargetFormats = writers.reduce((acc, format) => {
			acc[format] = false;
			return acc;
		}, {});
		setTargetFormats(initialTargetFormats);
	}, []);

	const handleFileSelect = (event) => {
		setSelectedFiles(Array.from(event.target.files));
	};

	const handleTargetFormatChange = (event) => {
		setTargetFormats({
			...targetFormats,
			[event.target.name]: event.target.checked,
		});
	};

	const getFileExtension = (format) => {
		switch (format.toLowerCase()) {
		case "json":
			return "json";
		case "yaml":
			return "yaml";
		default:
			return "txt";
		}
	};

	const handleConvert = async () => {
		setIsConverting(true);
		const selectedWriterFormats = Object.keys(targetFormats).filter((format) => targetFormats[format]);
		const initialProgress = selectedWriterFormats.reduce((acc, format) => {
			acc[format] = { value: 0, total: selectedFiles.length };
			return acc;
		}, {});
		setProgress(initialProgress);

		const zip = new JSZip();
		const conversionPromises = [];

		for (const format of selectedWriterFormats) {
			const formatFolder = zip.folder(format.toLowerCase());
			for (const file of selectedFiles) {
				const promise = new Promise((resolve) => {
					const reader = new FileReader();
					reader.onload = async (e) => {
						const inputText = e.target.result;
						try {
							const outputText = await converterRegistry.convert(inputText, sourceFormat, format);
							const outputFileName = `${file.name.replace(/\.[^/.]+$/, "")}.${getFileExtension(format)}`;
							formatFolder.file(outputFileName, outputText);
						} catch (err) {
							// eslint-disable-next-line no-console
							console.error(`Error converting ${file.name} to ${format}:`, err);
							formatFolder.file(`${file.name}.error.log`, `Conversion failed: ${err.message}`);
						} finally {
							setProgress((prev) => {
								const newProgress = { ...prev };
								newProgress[format] = { ...newProgress[format], value: newProgress[format].value + 1 };
								return newProgress;
							});
							resolve();
						}
					};
					reader.onerror = (err) => {
						// eslint-disable-next-line no-console
						console.error(`Error reading file ${file.name}:`, err);
						formatFolder.file(`${file.name}.error.log`, `File read failed: ${err.message}`);
						setProgress((prev) => {
							const newProgress = { ...prev };
							newProgress[format] = { ...newProgress[format], value: newProgress[format].value + 1 };
							return newProgress;
						});
						resolve(); // Resolve even on error to not block Promise.all
					};
					reader.readAsText(file);
				});
				conversionPromises.push(promise);
			}
		}

		await Promise.all(conversionPromises);

		zip.generateAsync({ type: "blob" }).then((content) => {
			saveAs(content, "converted-statblocks.zip");
		});

		setIsConverting(false);
	};

	const selectedWriterFormats = Object.keys(targetFormats).filter((format) => targetFormats[format]);

	return (
		<Box sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<Paper sx={{ p: 2, height: "100%" }}>
						<FormControl fullWidth sx={{ mb: 2 }}>
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
						<Button variant="contained" component="label">
                            Select Files
							<input type="file" hidden multiple onChange={handleFileSelect} />
						</Button>
						<Box sx={{ mt: 2, maxHeight: "300px", overflowY: "auto" }}>
							{selectedFiles.map((file, index) => (
								<Chip key={index} label={file.name} sx={{ m: 0.5 }} />
							))}
						</Box>
					</Paper>
				</Grid>
				<Grid item xs={12} md={6}>
					<Paper sx={{ p: 2, height: "100%" }}>
						<FormControl component="fieldset" variant="standard">
							<FormLabel component="legend">Output Formats</FormLabel>
							<FormGroup>
								{availableWriterFormats.map((format) => (
									<FormControlLabel
										key={format}
										control={
											<Checkbox
												checked={targetFormats[format] || false}
												onChange={handleTargetFormatChange}
												name={format}
											/>
										}
										label={format}
									/>
								))}
							</FormGroup>
						</FormControl>
					</Paper>
				</Grid>
			</Grid>

			<Box sx={{ textAlign: "center", my: 2 }}>
				<Button
					variant="contained"
					size="large"
					onClick={handleConvert}
					disabled={selectedFiles.length === 0 || selectedWriterFormats.length === 0 || isConverting}
				>
					{isConverting ? "Converting..." : "Convert"}
				</Button>
			</Box>
			{isConverting && (
				<Paper sx={{ p: 2, mt: 2, flexGrow: 1, overflowY: "auto" }}>
					<Typography variant="h6">Conversion Progress</Typography>
					{selectedWriterFormats.map((format) => (
						<Box key={format} sx={{ mt: 2 }}>
							<Typography>{format}</Typography>
							<LinearProgress
								variant="determinate"
								value={progress[format] ? (progress[format].value / progress[format].total) * 100 : 0}
							/>
							<Typography variant="body2" color="text.secondary">
								{progress[format]?.value || 0} / {progress[format]?.total || 0} files
							</Typography>
						</Box>
					))}
				</Paper>
			)}
		</Box>
	);
}

BulkConverter.propTypes = {};

export default BulkConverter;