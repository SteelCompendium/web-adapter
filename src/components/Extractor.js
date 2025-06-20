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
	TextField,
	Typography,
} from "@mui/material";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import converterRegistry from "./ConverterRegistry";

function Extractor() {
	const [inputText, setInputText] = useState("");
	const [selectedFile, setSelectedFile] = useState(null);
	const [sourceExtractor, setSourceExtractor] = useState("Prerelease PDF Statblock Text");
	const [targetFormats, setTargetFormats] = useState({});
	const [availableExtractorFormats, setAvailableExtractorFormats] = useState([]);
	const [availableWriterFormats, setAvailableWriterFormats] = useState([]);
	const [isExtracting, setIsExtracting] = useState(false);
	const [progress, setProgress] = useState({});

	useEffect(() => {
		const extractors = converterRegistry.getAvailableExtractorFormats();
		const writers = converterRegistry.getAvailableWriterFormats();
		setAvailableExtractorFormats(extractors);
		setAvailableWriterFormats(writers);
		const initialTargetFormats = writers.reduce((acc, format) => {
			acc[format] = false;
			return acc;
		}, {});
		setTargetFormats(initialTargetFormats);
		if (extractors.length > 0) {
			setSourceExtractor(extractors[0]);
		}
	}, []);

	const handleFileSelect = (event) => {
		const file = event.target.files[0];
		if (file) {
			setSelectedFile(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				setInputText(e.target.result);
			};
			reader.readAsText(file);
		}
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

	const handleExtract = async () => {
		setIsExtracting(true);
		const selectedWriterFormats = Object.keys(targetFormats).filter((format) => targetFormats[format]);

		try {
			const statblocks = await converterRegistry.extract(inputText, sourceExtractor);

			const initialProgress = selectedWriterFormats.reduce((acc, format) => {
				acc[format] = { value: 0, total: statblocks.length };
				return acc;
			}, {});
			setProgress(initialProgress);

			const zip = new JSZip();

			for (const format of selectedWriterFormats) {
				const formatFolder = zip.folder(format.toLowerCase());
				for (const statblock of statblocks) {
					try {
						const outputText = await converterRegistry.write(statblock, format);
						const outputFileName = `${statblock.name.replace(/\s+/g, "_")}.${getFileExtension(format)}`;
						formatFolder.file(outputFileName, outputText);
					} catch (err) {
						// eslint-disable-next-line no-console
						console.error(`Error converting ${statblock.name} to ${format}:`, err);
						formatFolder.file(`${statblock.name}.error.log`, `Conversion failed: ${err.message}`);
					} finally {
						setProgress((prev) => {
							const newProgress = { ...prev };
							newProgress[format] = { ...newProgress[format], value: newProgress[format].value + 1 };
							return newProgress;
						});
					}
				}
			}

			zip.generateAsync({ type: "blob" }).then((content) => {
				saveAs(content, "extracted-statblocks.zip");
			});
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error("Error extracting from source:", err);
			// Maybe show an error to the user
		} finally {
			setIsExtracting(false);
		}
	};

	const selectedWriterFormats = Object.keys(targetFormats).filter((format) => targetFormats[format]);

	return (
		<Box sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
			<Paper sx={{ p: 2, mb: 2 }}>
				<Typography variant="h6" gutterBottom>
                    Statblock Extractor
				</Typography>
				<Typography variant="body1" paragraph>
                    This tool allows for extracting multiple statblocks from a single text source and converting them to several other formats simultaneously.
				</Typography>
				<Typography component="div" variant="body2">
					<strong>How to use:</strong>
					<ul>
						<li>Select the extractor for your input text format.</li>
						<li>Paste text into the text area, or click &quot;Select File&quot; to choose a single file from your computer.</li>
						<li>Check the boxes for all the desired output formats.</li>
						<li>Click the &quot;Extract and Convert&quot; button to begin.</li>
					</ul>
                    Once complete, a zip file containing all the converted statblocks, organized into folders by format, will be automatically downloaded.
				</Typography>
			</Paper>
			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					<Paper sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
						<FormControl fullWidth sx={{ mb: 2 }}>
							<InputLabel>Extractor</InputLabel>
							<Select
								value={sourceExtractor}
								label="Extractor"
								onChange={(e) => setSourceExtractor(e.target.value)}
							>
								{availableExtractorFormats.map((format) => (
									<MenuItem key={format} value={format}>
										{format}
									</MenuItem>
								))}
							</Select>
						</FormControl>
						<Button variant="contained" component="label" sx={{ mb: 2 }}>
                            Select File
							<input type="file" hidden onChange={handleFileSelect} />
						</Button>
						{selectedFile && <Chip label={selectedFile.name} sx={{ m: 0.5, mb: 2 }} onDelete={() => { setSelectedFile(null); setInputText(""); }} />}
						<TextField
							label="Input Text"
							multiline
							rows={10}
							value={inputText}
							onChange={(e) => setInputText(e.target.value)}
							variant="outlined"
							fullWidth
							sx={{ flexGrow: 1 }}
						/>
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
					onClick={handleExtract}
					disabled={!inputText || !sourceExtractor || selectedWriterFormats.length === 0 || isExtracting}
				>
					{isExtracting ? "Extracting..." : "Extract and Convert"}
				</Button>
			</Box>
			{isExtracting && (
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
								{progress[format]?.value || 0} / {progress[format]?.total || 0} statblocks
							</Typography>
						</Box>
					))}
				</Paper>
			)}
		</Box>
	);
}

export default Extractor;