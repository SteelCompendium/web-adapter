import React, { useState } from "react";
import PropTypes from "prop-types";
import {
	Box,
	TextField,
	Button,
	Typography,
	Alert,
	Paper,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	Chip,
	List,
	ListItem,
	ListItemText,
	Divider,
	Grid,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import validator from "../validation/validator";

const JSONValidator = ({ onValidData }) => {
	const [jsonInput, setJsonInput] = useState("");
	const [validationResult, setValidationResult] = useState(null);
	const [isValidating, setIsValidating] = useState(false);

	const handleValidate = () => {
		if (!jsonInput.trim()) {
			setValidationResult({
				valid: false,
				errors: [{ message: "Please enter JSON to validate" }],
			});
			return;
		}

		setIsValidating(true);

		// Use setTimeout to allow UI to update
		setTimeout(() => {
			const result = validator.validateJSON(jsonInput);
			setValidationResult(result);
			setIsValidating(false);

			// If validation is successful and callback is provided, call it with the data
			if (result.valid && onValidData) {
				onValidData(result.data);
			}
		}, 100);
	};

	const handleClear = () => {
		setJsonInput("");
		setValidationResult(null);
	};

	const handleLoadSample = async () => {
		try {
			const response = await fetch("/sample-statblock.json");
			if (response.ok) {
				const sampleJson = await response.text();
				setJsonInput(sampleJson);
				setValidationResult(null);
			} else {
				// eslint-disable-next-line no-console
				console.error("Failed to load sample JSON");
			}
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error("Error loading sample JSON:", error);
		}
	};

	const getValidationIcon = () => {
		if (!validationResult) return null;
		return validationResult.valid
			? <CheckCircleIcon color="success" />
			: <ErrorIcon color="error" />;
	};

	const getValidationColor = () => {
		if (!validationResult) return "primary";
		return validationResult.valid ? "success" : "error";
	};

	const formatErrorPath = (error) => {
		if (!error.instancePath) return "Root level";
		return error.instancePath.replace(/\//g, " → ").replace(/^→ /, "");
	};

	return (
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
					<Typography variant="h6">
						JSON Input
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Validate your JSON against the Draw Steel statblock schema.
					</Typography>
					<Box sx={{
						overflowY: "auto",
						flexGrow: 1,
					}}>
						<TextField
							sx={{ width: "100%" }}
							multiline
							minRows={20}
							maxRows={50}
							value={jsonInput}
							onChange={(e) => setJsonInput(e.target.value)}
							placeholder="Paste your JSON here to validate against the statblock schema..."
						/>
					</Box>
					<Box sx={{ p: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
						<Button
							variant="contained"
							onClick={handleValidate}
							disabled={isValidating || !jsonInput.trim()}
							startIcon={getValidationIcon()}
							color={getValidationColor()}
						>
							{isValidating ? "Validating..." : "Validate JSON"}
						</Button>
						<Button
							variant="outlined"
							onClick={handleLoadSample}
							startIcon={<FileDownloadIcon />}
						>
							Load Sample
						</Button>
						<Button
							variant="outlined"
							onClick={handleClear}
							disabled={!jsonInput && !validationResult}
						>
							Clear
						</Button>
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
					<Typography variant="h6">
						Validation Results
					</Typography>
					{validationResult ? (
						<Box sx={{ overflowY: "auto", flexGrow: 1 }}>
							{validationResult.valid ? (
								<Alert severity="success" icon={<CheckCircleIcon />} square>
									<Typography variant="subtitle1">
										✅ JSON is valid!
									</Typography>
									<Typography variant="body2">
										The JSON conforms to the Draw Steel statblock schema.
									</Typography>
								</Alert>
							) : (
								<Alert severity="error" icon={<ErrorIcon />} square>
									<Typography variant="subtitle1">
										❌ JSON validation failed
									</Typography>
									<Typography variant="body2" sx={{ mb: 1 }}>
										Found {validationResult.errors.length} error(s):
									</Typography>

									<Accordion>
										<AccordionSummary expandIcon={<ExpandMoreIcon />}>
											<Typography variant="body2">
												View Validation Errors ({validationResult.errors.length})
											</Typography>
										</AccordionSummary>
										<AccordionDetails>
											<List dense>
												{validationResult.errors.map((error, index) => (
													<React.Fragment key={index}>
														<ListItem sx={{ pl: 0, alignItems: "flex-start" }}>
															<ListItemText
																primary={
																	<Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
																		<Chip
																			label={`Error ${index + 1}`}
																			size="small"
																			color="error"
																			variant="outlined"
																		/>
																		<Typography variant="body2" component="span" fontWeight="medium">
																			{formatErrorPath(error)}
																		</Typography>
																	</Box>
																}
																secondary={
																	<Typography variant="body2" color="text.secondary">
																		{error.message}
																		{error.allowedValues && (
																			<Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
																				Allowed values: {error.allowedValues.join(", ")}
																			</Typography>
																		)}
																	</Typography>
																}
															/>
														</ListItem>
														{index < validationResult.errors.length - 1 && <Divider />}
													</React.Fragment>
												))}
											</List>
										</AccordionDetails>
									</Accordion>
								</Alert>
							)}
						</Box>
					) : (
						<Box
							sx={{
								flexGrow: 1,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								textAlign: "center",
							}}
						>
							<Typography variant="body1" color="text.secondary">
								Validation results will appear here.
							</Typography>
						</Box>
					)}
				</Paper>
			</Grid>
		</Grid>
	);
};

JSONValidator.propTypes = {
	onValidData: PropTypes.func,
};

JSONValidator.defaultProps = {
	onValidData: null,
};

export default JSONValidator;