// useDropzone.svelte.ts

export interface FileError {
	code: string;
	message: string;
}

export interface FileRejection {
	file: File;
	errors: FileError[];
}

export interface DropzoneOptions {
	accept?: string | string[];
	maxSize?: number;
	minSize?: number;
	maxFiles?: number;
	multiple?: boolean;
	disabled?: boolean;
	onDrop?: (acceptedFiles: File[], rejectedFiles: FileRejection[]) => void;
	onDropAccepted?: (files: File[]) => void | Promise<void>;
	onDropRejected?: (fileRejections: FileRejection[]) => void;
	onFileDialogOpen?: () => void;
	onFileDialogCancel?: () => void;
	onError?: (error: Error) => void;
}

export interface DropzoneState {
	acceptedFiles: File[];
	rejectedFiles: FileRejection[];
	isDragActive: boolean;
	isDragging: boolean;
	isDragAccept: boolean;
	isDragReject: boolean;
	isFocused: boolean;
	rootRef: HTMLElement | null;
	inputRef: HTMLInputElement | null;
}

export interface DropzoneReturn extends DropzoneState {
	getRootProps: () => {
		ondragenter: (e: DragEvent) => void;
		ondragover: (e: DragEvent) => void;
		ondragleave: (e: DragEvent) => void;
		ondrop: (e: DragEvent) => void;
		onclick: (e: MouseEvent) => void;
		tabindex: number;
		role: string;
	};
	getInputProps: () => {
		type: string;
		multiple: boolean;
		accept: string;
		onchange: (e: Event) => void;
		style: string;
		tabindex: number;
		disabled: boolean;
	};
	open: () => void;
	removeAcceptedFile: (index: number) => void;
	removeRejectedFile: (index: number) => void;
	clearAll: () => void;
	formatFileSize: (bytes: number) => string;
}

export function createDropzone(options: DropzoneOptions = {}): DropzoneReturn {
	const {
		accept = null,
		maxSize = Infinity,
		minSize = 0,
		maxFiles = 0,
		multiple = true,
		disabled = false,
		onDrop = null,
		onDropAccepted = null,
		onDropRejected = null,
		onFileDialogOpen = null,
		onFileDialogCancel = null,
		onError = null
	} = options;

	let acceptedFiles = $state<File[]>([]);
	let rejectedFiles = $state<FileRejection[]>([]);
	let isDragActive = $state(false);
	let isDragAccept = $state(false);
	let isDragReject = $state(false);
	let isFocused = $state(false);
	let rootRef = $state<HTMLElement | null>(null);
	let inputRef = $state<HTMLInputElement | null>(null);
	let fileDialogTimeout: number | null = null;
	let dragTimeoutId = $state<number | null>(null);
	let dragCounter = 0;
	let isDraggingFile = false; // Track if we're actually dragging files

	const validateFileType = (file: File): boolean => {
		if (!accept) return true;

		const acceptTypes = Array.isArray(accept) ? accept : [accept];
		const fileType = file.type;
		const fileName = file.name.toLowerCase();

		return acceptTypes.some((type) => {
			if (type.includes('/*')) {
				const [mainType] = type.split('/');
				return fileType.startsWith(mainType + '/');
			}
			if (type.startsWith('.')) {
				return fileName.endsWith(type.toLowerCase());
			}
			return fileType === type;
		});
	};

	const validateFileSize = (file: File): boolean => {
		return file.size >= minSize && file.size <= maxSize;
	};

	const validateFiles = (files: File[]): { accepted: File[]; rejected: FileRejection[] } => {
		const accepted: File[] = [];
		const rejected: FileRejection[] = [];

		files.forEach((file) => {
			const errors: FileError[] = [];

			if (!validateFileType(file)) {
				errors.push({
					code: 'file-invalid-type',
					message: `File type not accepted. Expected: ${
						Array.isArray(accept) ? accept.join('/') : accept
					}`
				});
			}

			if (!validateFileSize(file)) {
				if (file.size > maxSize) {
					errors.push({
						code: 'file-too-large',
						message: `File is too large. Max size: ${formatFileSize(maxSize)}`
					});
				}
				if (file.size < minSize) {
					errors.push({
						code: 'file-too-small',
						message: `File is too small. Min size: ${formatFileSize(minSize)}`
					});
				}
			}

			if (errors.length > 0) {
				rejected.push({ file, errors });
			} else {
				accepted.push(file);
			}
		});

		if (maxFiles > 0 && accepted.length + acceptedFiles.length > maxFiles) {
			const allowedCount = maxFiles - acceptedFiles.length;
			const excess = accepted.splice(allowedCount);
			excess.forEach((file) => {
				rejected.push({
					file,
					errors: [
						{
							code: 'too-many-files',
							message: `Too many files. Max files: ${maxFiles}`
						}
					]
				});
			});
		}

		return { accepted, rejected };
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
	};

	const processFiles = (files: File[]): void => {
		if (disabled) return;

		try {
			const { accepted, rejected } = validateFiles(files);

			acceptedFiles = [...acceptedFiles, ...accepted];
			rejectedFiles = [...rejectedFiles, ...rejected];

			if (onDrop) onDrop(accepted, rejected);
			if (onDropAccepted && accepted.length > 0) onDropAccepted(accepted);
			if (onDropRejected && rejected.length > 0) onDropRejected(rejected);
		} catch (error) {
			if (onError && error instanceof Error) {
				onError(error);
			}
		}
	};

	const handleDragEnter = (e: DragEvent): void => {
		e.preventDefault();
		e.stopPropagation();

		if (disabled) return;

		// Check if we're actually dragging files
		if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
			isDraggingFile = true;
			dragCounter++;
			isDragActive = true;

			const items = Array.from(e.dataTransfer.items);
			const hasValidType = items.some((item) => {
				if (!accept) return true;
				return validateFileType({ type: item.type, name: '' } as File);
			});

			isDragAccept = hasValidType;
			isDragReject = !hasValidType;
		}
	};

	const handleDragOver = (e: DragEvent): void => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDragLeave = (e: DragEvent): void => {
		e.preventDefault();
		e.stopPropagation();

		if (!isDraggingFile) return;

		dragCounter--;

		if (dragCounter === 0) {
			isDragActive = false;
			isDragAccept = false;
			isDragReject = false;
			isDraggingFile = false;
		}
	};

	const handleDrop = (e: DragEvent): void => {
		e.preventDefault();
		e.stopPropagation();

		// Reset drag state
		dragCounter = 0;
		isDragActive = false;
		isDragAccept = false;
		isDragReject = false;
		isDraggingFile = false;

		// Clear timeout
		if (dragTimeoutId) {
			clearTimeout(dragTimeoutId);
			dragTimeoutId = null;
		}

		if (disabled) return;

		if (e.dataTransfer && e.dataTransfer.files.length > 0) {
			const files = Array.from(e.dataTransfer.files);
			processFiles(files);
		}
	};

	const handleFileInput = (e: Event): void => {
		const target = e.target as HTMLInputElement;
		if (target.files) {
			const files = Array.from(target.files);
			processFiles(files);
			target.value = '';
		}

		if (fileDialogTimeout) {
			clearTimeout(fileDialogTimeout);
		}
	};

	const open = (): void => {
		if (disabled) return;

		if (onFileDialogOpen) {
			onFileDialogOpen();
		}

		if (inputRef) {
			inputRef.click();

			fileDialogTimeout = window.setTimeout(() => {
				if (onFileDialogCancel) {
					onFileDialogCancel();
				}
			}, 300);
		}
	};

	// const handleKeyDown = (e: KeyboardEvent): void => {
	// 	if (disabled) return;

	// 	if (e.key === ' ' || e.key === 'Enter') {
	// 		e.preventDefault();
	// 		open();
	// 	}
	// };

	const handleClick = (e: MouseEvent): void => {
		// Only open file dialog if:
		// 1. Not disabled
		// 2. Click is directly on the root element (not bubbled from children)
		// 3. Not during/after a drag operation
		if (disabled || isDraggingFile || e.target !== e.currentTarget) {
			return;
		}

		open();
	};

	const removeAcceptedFile = (index: number): void => {
		acceptedFiles = acceptedFiles.filter((_, i) => i !== index);
	};

	const removeRejectedFile = (index: number): void => {
		rejectedFiles = rejectedFiles.filter((_, i) => i !== index);
	};

	const clearAll = (): void => {
		acceptedFiles = [];
		rejectedFiles = [];
	};

	const getAcceptString = (): string => {
		if (!accept) return '*/*';
		return Array.isArray(accept) ? accept.join(',') : accept;
	};

	const getRootProps = () => ({
		ondragenter: handleDragEnter,
		ondragover: handleDragOver,
		ondragleave: handleDragLeave,
		ondrop: handleDrop,
		onclick: handleClick,
		tabindex: disabled ? -1 : 0,
		role: 'button'
	});

	const getInputProps = () => ({
		type: 'file' as const,
		multiple,
		accept: getAcceptString(),
		onchange: handleFileInput,
		style: 'display: none',
		tabindex: -1,
		disabled
	});

	return {
		get acceptedFiles() {
			return acceptedFiles;
		},
		get rejectedFiles() {
			return rejectedFiles;
		},
		get isDragActive() {
			return isDragActive;
		},
		get isDragging() {
			return isDragActive;
		},
		get isDragAccept() {
			return isDragAccept;
		},
		get isDragReject() {
			return isDragReject;
		},
		get isFocused() {
			return isFocused;
		},
		get rootRef() {
			return rootRef;
		},
		set rootRef(value: HTMLElement | null) {
			rootRef = value;
		},
		get inputRef() {
			return inputRef;
		},
		set inputRef(value: HTMLInputElement | null) {
			inputRef = value;
		},
		getRootProps,
		getInputProps,
		open,
		removeAcceptedFile,
		removeRejectedFile,
		clearAll,
		formatFileSize
	};
}
