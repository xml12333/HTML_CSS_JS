import { Pane, FolderApi } from "https://cdn.skypack.dev/tweakpane@4.0.4";
const mimeTypeUtils = {
    toShortFormat(mimeType) {
        return mimeType.replace("image/", "");
    },

    shortToMime(short) {
        return `image/${short}`;
    },

}
const CSSUtils = {
    getCssVariableValue(el, varName, parseAsNumber = false) {
        const computedStyle = getComputedStyle(el);
        const value = computedStyle.getPropertyValue(varName)?.trim() || "";

        if (!parseAsNumber) return value;

        const match = value.match(/^([\d.]+)(px|%|em|rem|vw|vh|vmin|vmax)?$/);
        if (!match) return 0;

        const numericValue = parseFloat(match[1]);
        const unit = match[2] || "px";

        switch (unit) {
            case "em":
                return numericValue * parseFloat(computedStyle.fontSize);
            case "rem":
                return numericValue * parseFloat(getComputedStyle(document.documentElement).fontSize);
            case "%":
                // Get parent dimensions for percentage context
                const parent = el.parentElement;
                if (!parent) return 0;
                const isWidthContext = ["width", "left", "right", "margin", "padding"].some(prop =>
                    computedStyle.getPropertyValue(prop).includes(varName)
                );
                const parentSize = isWidthContext ?
                    parent.offsetWidth :
                    parent.offsetHeight;
                return (numericValue / 100) * parentSize;
            case "vw":
                return (numericValue / 100) * window.innerWidth;
            case "vh":
                return (numericValue / 100) * window.innerHeight;
            case "vmin":
                return (numericValue / 100) * Math.min(window.innerWidth, window.innerHeight);
            case "vmax":
                return (numericValue / 100) * Math.max(window.innerWidth, window.innerHeight);
            default: // px
                return numericValue;
        }
    },

};

// https://codepen.io/luis-lessrain/pen/EaxyJdY
const TweakpaneUtils = {
    appendToFolderContent(folder, elements) {
        const checkAndAppend = () => {
            const folderContent = folder.element.querySelector(".tp-fldv_c");
            if (!folderContent) return false;

            (Array.isArray(elements) ? elements : [elements]).forEach((el) => {
                if (!folderContent.contains(el)) {
                    folderContent.appendChild(el);
                }
            });

            return true;
        };

        if (checkAndAppend()) return;

        const observer = new MutationObserver(() => {
            if (checkAndAppend()) {
                observer.disconnect();
            }
        });

        observer.observe(folder.element, { childList: true, subtree: true });
    },

    appendToRootPaneContent(pane, elements) {
        const checkAndAppend = () => {
            const rootContent = pane.element.querySelector(".tp-rotv_c");
            if (!rootContent) return false;

            (Array.isArray(elements) ? elements : [elements]).forEach((el) => {
                if (!rootContent.contains(el)) {
                    rootContent.appendChild(el);
                }
            });

            return true;
        };

        if (checkAndAppend()) return;

        const observer = new MutationObserver(() => {
            if (checkAndAppend()) {
                observer.disconnect();
            }
        });

        observer.observe(pane.element, { childList: true, subtree: true });
    },

    enableAccordion(pane, targetTitles = null, defaultOpen = null) {
        const folders = new Map();

        function isTarget(folder) {
            return !targetTitles || targetTitles.length === 0 || targetTitles.includes(folder.title);
        }

        function registerFolder(folder) {
            if (!(folder instanceof FolderApi)) return;
            if (!isTarget(folder)) return;

            folders.set(folder.title, folder);

            const observer = new MutationObserver(() => {
                if (folder.expanded) {
                    folders.forEach((f) => {
                        if (f !== folder) f.expanded = false;
                    });
                }
            });

            observer.observe(folder.element, {
                attributes: true,
                attributeFilter: ["class"]
            });

            folder.__observer = observer;
        }

        pane.children
            .filter((child) => child instanceof FolderApi)
            .forEach(registerFolder);

        pane.on("folder:add", (folder) => {
            registerFolder(folder);
        });

        folders.forEach((folder, title) => {
            folder.expanded = title === defaultOpen;
        });
    },

    addImageUploader(container, options = {}) {
        const {
            allowedUploadTypes = ["image/png", "image/jpeg", "image/webp"],
                buttonOptions = { title: "Upload Image" },
                onStart = null,
                onFinish = null,
                onError = null,
                onCancel = null,
        } = options;

        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = allowedUploadTypes.join(",");
        fileInput.style.display = "none";

        fileInput.addEventListener("change", (event) => {
            const file = event.target.files[0];

            if (!file) return;

            if (!allowedUploadTypes.includes(file.type)) {
                const errorMsg = `Unsupported file type: ${file.type}`;
                console.error(errorMsg);
                if (typeof onError === "function") onError(errorMsg, file);
                return;
            }

            if (typeof onStart === "function") onStart(file);

            const reader = new FileReader();

            reader.onload = (e) => {
                const result = e.target.result;
                try {
                    if (typeof onFinish === "function") onFinish(file, result);
                } catch (err) {
                    if (typeof onError === "function") onError(err, file);
                    else console.error("Error in onFinish:", err);
                }
            };

            reader.onerror = (e) => {
                const error = e?.target?.error || new Error("Unknown FileReader error");
                if (typeof onError === "function") onError(error, file);
            };

            reader.readAsDataURL(file);
        });

        const uploadButton = container.addButton(buttonOptions);

        uploadButton.on("click", () => {

            // --- Cancel handling ---
            let fileSelected = false;

            const onFileChange = () => {
                fileSelected = true;
                window.removeEventListener("focus", onFocus);
            };

            const onFocus = () => {
                setTimeout(() => {
                    if (!fileSelected && typeof onCancel === "function") {
                        onCancel();
                    }
                }, 200);
                fileInput.removeEventListener("change", onFileChange);
            };

            window.addEventListener("focus", onFocus, { once: true });
            fileInput.addEventListener("change", onFileChange, { once: true });

            fileInput.click();
        });

        const isFolder = container.controller?.view?.element.classList.contains("tp-fldv");
        if (isFolder) {
            TweakpaneUtils.appendToFolderContent(container, fileInput);
        } else {
            TweakpaneUtils.appendToRootPaneContent(container, fileInput);
        }

        return {
            button: uploadButton,
            fileInput,
            openFileDialog: () => fileInput.click(),
        };
    },

    async createZipWithFile(blob, filename) {
        const arrayBuffer = await blob.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const fileNameBytes = new TextEncoder().encode(filename);
        const fileNameLength = fileNameBytes.length;
        const fileSize = data.length;

        const now = new Date();
        const dosTime = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xffff;
        const dosDate = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xffff;

        // --- Local File Header ---
        const header = new Uint8Array(30 + fileNameLength);
        let offset = 0;
        const writeLocalUInt32LE = (value) => {
            header[offset++] = value & 0xff;
            header[offset++] = (value >> 8) & 0xff;
            header[offset++] = (value >> 16) & 0xff;
            header[offset++] = (value >> 24) & 0xff;
        };
        const writeLocalUInt16LE = (value) => {
            header[offset++] = value & 0xff;
            header[offset++] = (value >> 8) & 0xff;
        };

        writeLocalUInt32LE(0x04034b50); // Local file header signature
        writeLocalUInt16LE(20); // Version needed
        writeLocalUInt16LE(0); // Flags
        writeLocalUInt16LE(0); // Compression: 0 = stored
        writeLocalUInt16LE(dosTime);
        writeLocalUInt16LE(dosDate);
        writeLocalUInt32LE(0); // CRC-32 (ignored)
        writeLocalUInt32LE(fileSize); // Compressed size
        writeLocalUInt32LE(fileSize); // Uncompressed size
        writeLocalUInt16LE(fileNameLength);
        writeLocalUInt16LE(0); // Extra field length
        header.set(fileNameBytes, offset);

        const fileData = new Uint8Array(header.length + fileSize);
        fileData.set(header, 0);
        fileData.set(data, header.length);
        const localHeaderOffset = 0;

        // --- Central Directory ---
        const centralHeader = new Uint8Array(46 + fileNameLength);
        offset = 0;
        const writeCentralUInt32LE = (value) => {
            centralHeader[offset++] = value & 0xff;
            centralHeader[offset++] = (value >> 8) & 0xff;
            centralHeader[offset++] = (value >> 16) & 0xff;
            centralHeader[offset++] = (value >> 24) & 0xff;
        };
        const writeCentralUInt16LE = (value) => {
            centralHeader[offset++] = value & 0xff;
            centralHeader[offset++] = (value >> 8) & 0xff;
        };

        writeCentralUInt32LE(0x02014b50); // Central directory file header signature
        writeCentralUInt16LE(20); // Version made by
        writeCentralUInt16LE(20); // Version needed
        writeCentralUInt16LE(0); // General purpose bit flag
        writeCentralUInt16LE(0); // Compression method
        writeCentralUInt16LE(dosTime);
        writeCentralUInt16LE(dosDate);
        writeCentralUInt32LE(0); // CRC-32
        writeCentralUInt32LE(fileSize);
        writeCentralUInt32LE(fileSize);
        writeCentralUInt16LE(fileNameLength);
        writeCentralUInt16LE(0); // Extra field length
        writeCentralUInt16LE(0); // File comment length
        writeCentralUInt16LE(0); // Disk number start
        writeCentralUInt16LE(0); // Internal file attributes
        writeCentralUInt32LE(0); // External file attributes
        writeCentralUInt32LE(localHeaderOffset); // Correct relative offset
        centralHeader.set(fileNameBytes, offset);

        // --- End of Central Directory Record (EOCD) ---
        const eocd = new Uint8Array(22);
        offset = 0;
        const writeEOCDUInt32LE = (value) => {
            eocd[offset++] = value & 0xff;
            eocd[offset++] = (value >> 8) & 0xff;
            eocd[offset++] = (value >> 16) & 0xff;
            eocd[offset++] = (value >> 24) & 0xff;
        };
        const writeEOCDUInt16LE = (value) => {
            eocd[offset++] = value & 0xff;
            eocd[offset++] = (value >> 8) & 0xff;
        };

        writeEOCDUInt32LE(0x06054b50); // EOCD signature
        writeEOCDUInt16LE(0); // Disk number
        writeEOCDUInt16LE(0); // Disk where central directory starts
        writeEOCDUInt16LE(1); // Number of central directory records on this disk
        writeEOCDUInt16LE(1); // Total number of records
        writeEOCDUInt32LE(centralHeader.length); // Size of central directory
        writeEOCDUInt32LE(fileData.length); // Offset of start of central dir
        writeEOCDUInt16LE(0); // Comment length

        return new Blob([fileData, centralHeader, eocd], { type: "application/zip" });
    },

    addImageDownloader(container, getImageSource, options = {}) {
        const {
            buttonOptions = { title: "Download Image" },
                filename = "processed-image.png",
                forceZip = false,
                showStatus = true,
                initialStatus = "Idle",
                onStart,
                onPrepare,
                onRender,
                onEncode,
                onFinish,
                onError,
                onFormatChange,
                onQualityChange,
                formatOptions = { enabled: true, defaultFormat: "png" },
                zipOptions = { enabled: true, defaultZip: false },
                qualityOptions = { enabled: true, defaultQuality: 100 },
        } = options;

        const downloadButton = container.addButton(buttonOptions);

        const userOptions = {
            format: formatOptions.defaultFormat,
            zip: zipOptions.defaultZip,
            quality: qualityOptions.defaultQuality,
        };

        const formatBinding = formatOptions.enabled ?
            container.addBinding(userOptions, "format", {
                label: "Format",
                options: {
                    PNG: "png",
                    JPEG: "jpeg",
                    WebP: "webp",
                },
            }) :
            null;

        const zipBinding = zipOptions.enabled ?
            container.addBinding(userOptions, "zip", { label: "ZIP" }) :
            null;

        const qualityBinding = qualityOptions.enabled ?
            container.addBinding(userOptions, "quality", {
                label: "Quality",
                min: 1,
                max: 100,
                step: 1,
            }) :
            null;

        // --- Quality visibility toggle ---
        if (formatBinding) {
            formatBinding.on("change", (ev) => {
                const fmt = ev.value;
                if (typeof onFormatChange === "function") onFormatChange(fmt);
                if (qualityBinding) {
                    qualityBinding.element.style.display = fmt === "jpeg" || fmt === "webp" ? "" : "none";
                }
            });
        }

        // --- Quality change handler ---
        if (qualityBinding) {
            qualityBinding.on("change", (ev) => {
                if (typeof onQualityChange === "function") onQualityChange(ev.value);
            });

            // Set initial visibility based on default format
            const initialFormat = formatBinding ? userOptions.format : formatOptions.defaultFormat;
            qualityBinding.element.style.display = initialFormat === "jpeg" || initialFormat === "webp" ? "" : "none";
        }

        // Status field
        let statusField = null;
        let statusTimeout = null;

        if (showStatus) {
            statusField = TweakpaneUtils.addPersistentMessage(container, undefined, {
                initial: initialStatus,
                index: container.children.length,
            });
        }

        const setStatus = (msg, autoReset = false) => {
            if (statusField) statusField.set(msg);
            if (statusTimeout) clearTimeout(statusTimeout);
            if (autoReset) {
                statusTimeout = setTimeout(() => {
                    try {
                        statusField?.set(initialStatus);
                    } catch (e) {
                        console.warn("Failed to reset status:", e);
                    }
                }, 3000);
            }
        };

        // --- Download Logic ---
        downloadButton.on("click", async () => {
            if (typeof onStart === "function") onStart();
            try {
                setStatus("Preparing image...");
                if (typeof onPrepare === "function") onPrepare();

                const result = await getImageSource();
                if (!result || (!result.imageData && !result.blob)) {
                    const error = "No image data or blob returned.";
                    console.warn(error);
                    setStatus("Failed to generate image");
                    if (typeof onError === "function") onError(error);
                    return;
                }

                const format = userOptions.format || result.format || "png";
                const mimeType = `image/${format}`;
                const useQuality = format === "jpeg" || format === "webp";
                const normalizedQuality = useQuality ? userOptions.quality / 100 : undefined;

                const timestamp = new Date()
                    .toISOString()
                    .replace(/[:.]/g, "-")
                    .replace("T", "_")
                    .slice(0, 19);

                const base = typeof filename === "function" ? filename() : filename;
                const ext = format;
                const finalName = base.replace(/(\.\w+)?$/, `-${timestamp}.${ext}`);

                let downloadBlob = null;

                if (result.blob) {
                    setStatus("Using encoded blob...");
                    if (typeof onRender === "function") onRender();
                    downloadBlob = result.blob;
                } else {
                    const { imageData } = result;
                    setStatus("Rendering image...");
                    if (typeof onRender === "function") onRender();

                    const canvas = document.createElement("canvas");
                    canvas.width = imageData.width;
                    canvas.height = imageData.height;
                    const ctx = canvas.getContext("2d");

                    await new Promise((resolve) => {
                        requestAnimationFrame(() => {
                            ctx.putImageData(imageData, 0, 0);
                            resolve();
                        });
                    });

                    setStatus("Encoding...");
                    if (typeof onEncode === "function") onEncode();

                    downloadBlob = await new Promise((resolve) => {
                        canvas.toBlob(
                            (blob) => resolve(blob),
                            mimeType,
                            normalizedQuality
                        );
                    });

                    if (!downloadBlob) {
                        const error = "Failed to encode image.";
                        setStatus(error);
                        if (typeof onError === "function") onError(error);
                        return;
                    }

                    canvas.width = canvas.height = 0;
                }

                let downloadName = finalName;
                const shouldZip = zipOptions.enabled ? userOptions.zip : forceZip;

                if (shouldZip) {
                    setStatus("Zipping...");
                    downloadBlob = await TweakpaneUtils.createZipWithFile(downloadBlob, finalName);
                    downloadName = finalName.replace(/\.\w+$/, ".zip");
                }

                const url = URL.createObjectURL(downloadBlob);
                const link = document.createElement("a");
                link.style.position = "absolute";
                link.href = url;
                link.rel = "noopener";
                link.download = downloadName;
                document.body.appendChild(link);

                const clickEvent = new MouseEvent("click", {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                });

                link.dispatchEvent(clickEvent);

                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    setStatus("Download complete ✔", true);
                    if (typeof onFinish === "function") onFinish();
                }, 250);
            } catch (e) {
                console.error(e);
                setStatus("Error during download");
                if (typeof onError === "function") onError(e);
            }
        });

        return {
            button: downloadButton,
            setStatus,
            clearStatus: () => statusField?.clear?.(),
            statusField,
            formatBinding,
            zipBinding,
            qualityBinding,
        };
    },

    addDemoImages(pane, onImageLoad, options = {}) {
        const {
            baseURL = "https://www.lessrain.com/dev/images/lr-demo-img-",
                totalImages = 370,
                thumbnailClass = "tp-demo-thumbnails",
                folderOptions = { title: "Demo Images" },
                thumbnailExtensions = ["png"],
                imageExtensions = ["jpg", "webp", "png"],
                onThumbnailClick = null,
                ordered = false,
                startIndex = 1,
        } = options;

        const demoFolder = pane.addFolder(folderOptions);
        const thumbnailContainer = document.createElement("div");
        thumbnailContainer.classList.add(thumbnailClass);
        let demoImageIds = [];
        let orderedOffset = ordered ? (startIndex - 1) % totalImages : 0;
        let hasInitialized = false;

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        async function tryImageExtensions(baseUrl, extensions) {
            for (const ext of extensions) {
                const url = `${baseUrl}.${ext}`;
                const img = new Image();
                img.src = url;
                img.crossOrigin = "Anonymous";

                const isValid = await new Promise((resolve) => {
                    img.onload = () => resolve(true);
                    img.onerror = () => resolve(false);
                });

                if (isValid) return url;
            }
            return null;
        }

        function generateThumbnails() {
            while (thumbnailContainer.firstChild) {
                const child = thumbnailContainer.firstChild;
                const img = child.querySelector("img");
                if (img) img.src = "";
                thumbnailContainer.removeChild(child);
            }

            const allImageIds = Array.from({ length: totalImages }, (_, i) => i + 1);

            if (ordered) {
                const slice = [];
                for (let i = 0; i < 20; i++) {
                    const id = allImageIds[(orderedOffset + i) % allImageIds.length];
                    slice.push(id);
                }
                orderedOffset = (orderedOffset + 20) % allImageIds.length;
                demoImageIds = slice;
            } else {
                shuffleArray(allImageIds);

                if (!hasInitialized) {
                    const startId = ((startIndex - 1) % totalImages) + 1;
                    const rest = allImageIds.filter((id) => id !== startId);
                    demoImageIds = [startId, ...rest.slice(0, 19)];
                    hasInitialized = true;
                } else {
                    demoImageIds = allImageIds.slice(0, 20);
                }
            }

            for (let i = 0; i < demoImageIds.length; i++) {
                const thumbnailWrapper = document.createElement("div");
                thumbnailWrapper.classList.add("tp-demo-thumbnail");

                const thumbnailImg = document.createElement("img");
                thumbnailWrapper.appendChild(thumbnailImg);
                thumbnailContainer.appendChild(thumbnailWrapper);
            }

            Array.from(thumbnailContainer.children).forEach(async (thumbnailWrapper, index) => {
                const id = demoImageIds[index];
                const name = `Image ${id}`;
                const baseUrl = `${baseURL}${id}`;
                const thumbnailUrl = await tryImageExtensions(`${baseUrl}-thumb`, thumbnailExtensions);

                if (!thumbnailUrl) return;

                const thumbnailImg = thumbnailWrapper.querySelector("img");
                thumbnailImg.src = thumbnailUrl;
                thumbnailImg.alt = name;

                thumbnailWrapper.addEventListener("click", async () => {
                    if (typeof onThumbnailClick === "function") {
                        onThumbnailClick(name, baseUrl);
                    }

                    const imageUrl = await tryImageExtensions(baseUrl, imageExtensions);
                    if (imageUrl) {
                        onImageLoad(imageUrl);
                    } else {
                        console.error(`Failed to load image: ${baseUrl}`);
                    }
                });
            });
        }

        function getImageList() {
            return demoImageIds.map((id) => `${baseURL}${id}`);
        }

        function loadImageIndex(index) {
            if (demoImageIds.length === 0) {
                console.warn("No images loaded yet.");
                return;
            }

            const safeIndex = ((index % demoImageIds.length) + demoImageIds.length) % demoImageIds.length;
            const baseUrl = `${baseURL}${demoImageIds[safeIndex]}`;

            tryImageExtensions(baseUrl, imageExtensions).then((imageUrl) => {
                if (imageUrl) {
                    onImageLoad(imageUrl);
                } else {
                    console.error(`Failed to load image: ${baseUrl}`);
                }
            });
        }

        demoFolder.addButton({ title: "Refresh Thumbnails" }).on("click", generateThumbnails);
        generateThumbnails();

        TweakpaneUtils.appendToFolderContent(demoFolder, thumbnailContainer);

        return {
            folder: demoFolder,
            getImageList,
            loadImageIndex,
        };
    },

    setEnabled(pane, isEnabled) {
        pane.children.forEach((control) => {
            if (control.disabled !== undefined) {
                control.disabled = !isEnabled;
            }
        });

        pane.element.querySelectorAll(".tp-fldv, .tp-fldv_c").forEach((folder) => {
            folder.style.pointerEvents = isEnabled ? "auto" : "none";
            folder.style.opacity = isEnabled ? "1" : "0.75";
        });

        pane.element.querySelectorAll("button").forEach((button) => {
            button.disabled = !isEnabled;
        });

        // Disable all inputs
        pane.element.querySelectorAll("input, select").forEach((input) => {
            input.disabled = !isEnabled;
        });
    },

    addPersistentMessage(container, label = undefined, options = {}) {
        const {
            initial = "",
                index = undefined,
                multiline = true,
                rows = 1,
        } = options;

        const proxy = { status: initial };

        const bindingOptions = {
            readonly: true,
            multiline,
            rows,
            index,
            label: label !== undefined ? label : "",
        };

        const statusBlade = container.addBinding(proxy, "status", bindingOptions);

        requestAnimationFrame(() => {
            const textareaEl = statusBlade.element.querySelector("textarea");

            if (textareaEl) {
                textareaEl.style.whiteSpace = "pre-wrap";
                textareaEl.style.overflow = "hidden";
                textareaEl.style.wordBreak = "break-word";
                textareaEl.style.resize = "none";

                // Fix for single-line height
                textareaEl.style.paddingTop = "4px";
                textareaEl.style.paddingBottom = "0px";
                textareaEl.style.lineHeight = "1.2";
                textareaEl.rows = 1;

                const resize = () => {
                    textareaEl.style.height = "0px";
                    textareaEl.style.minHeight = "20px";
                    textareaEl.style.maxHeight = "none";
                    textareaEl.style.height = `${textareaEl.scrollHeight}px`;
                };

                resize();

                statusBlade._resizeTextarea = resize;
            }

            if (label === undefined) {
                const labelContainer = statusBlade.element.querySelector(".tp-lblv_l");
                if (labelContainer) {
                    labelContainer.style.display = "none";
                    if (labelContainer.nextElementSibling) {
                        labelContainer.nextElementSibling.style.width = "100%";
                    }
                }
            }
        });

        return {
            set(text) {
                proxy.status = text;
                statusBlade.refresh();
                requestAnimationFrame(() => {
                    statusBlade._resizeTextarea?.();
                });
            },
            clear() {
                proxy.status = "";
                statusBlade.refresh();
                requestAnimationFrame(() => {
                    statusBlade._resizeTextarea?.();
                });
            },
            blade: statusBlade,
        };
    },

};

document.addEventListener("DOMContentLoaded", () => {

    const pane = new Pane();

    const canvas = document.getElementById("output");
    const ctx = canvas.getContext("2d");

    const bufferCanvas = document.createElement("canvas");
    const bufferCtx = bufferCanvas.getContext("2d");

    let originalImage = null;
    let originalImageData = null;
    let effectManager = null;
    let originalImageMeta = {
        scaleFactor: 1,
        originalWidth: 0,
        originalHeight: 0,
    };

    let canvasResolution = { width: 0, height: 0 };

    let canvasOffset = CSSUtils.getCssVariableValue(canvas, "--canvas-offset", true);
    let maxCanvasWidth = CSSUtils.getCssVariableValue(canvas, "--max-canvas-width", true);
    let maxCanvasHeight = CSSUtils.getCssVariableValue(canvas, "--max-canvas-height", true);

    function clamp(v, min = 0, max = 255) {
        return v < min ? min : v > max ? max : v;
    }

    function mulberry32(a) {
        return function() {
            a |= 0;
            a = a + 0x6D2B79F5 | 0;
            let t = Math.imul(a ^ a >>> 15, 1 | a);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    async function safeUpdate(effectId) {
        if (!effectManager) return;
        effectManager.markDirty(effectId);
        const output = await effectManager.process();
        ctx.putImageData(output, 0, 0);
    }

    async function processImage() {
        if (!effectManager || !originalImageData) return;
        effectManager.updateOriginal(originalImageData);
        const output = await effectManager.process();
        ctx.putImageData(output, 0, 0);
    }

    function createEffectManager(originalImageData) {
        const effects = [];
        let original = originalImageData;

        const manager = {
            updateOriginal(newData) {
                original = newData;
                for (const e of effects) {
                    e.cache = null;
                    e.dirty = true;
                    e.outputBuffer = null;
                }
            },

            addEffect(id, fn, { enabled = true } = {}) {
                effects.push({
                    id,
                    fn,
                    enabled,
                    dirty: true,
                    cache: null,
                    outputBuffer: null,
                });
            },

            setEnabled(id, isEnabled) {
                const effect = effects.find(e => e.id === id);
                if (effect) {
                    effect.enabled = isEnabled;
                    effect.dirty = true;
                }
            },

            markDirty(id) {
                const index = effects.findIndex(e => e.id === id);
                if (index === -1) return;

                for (let i = index; i < effects.length; i++) {
                    effects[i].dirty = true;
                    effects[i].cache = null;
                }
            },

            async process() {
                let input = original;

                for (const e of effects) {
                    if (!e.enabled) continue;

                    const { width, height } = input;

                    if (!e.outputBuffer || e.outputBuffer.width !== width || e.outputBuffer.height !== height) {
                        e.outputBuffer = new ImageData(width, height);
                    }

                    if (e.dirty || !e.cache) {
                        const result = e.fn(input, e.outputBuffer);
                        e.cache = result instanceof Promise ? await result : result;
                        e.dirty = false;
                    }

                    input = e.cache;
                }

                return input;
            },

            dispose() {
                for (const e of effects) {
                    e.cache = null;
                    e.outputBuffer = null;
                    e.fn = null;
                }
                effects.length = 0;
                original = null;
            }
        };

        return manager;
    }

    async function getDownloadImageData() {
        const isScaled = originalImageMeta.scaleFactor < 1;

        if (!isScaled) {
            return await effectManager.process();
        }

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = originalImageMeta.originalWidth;
        tempCanvas.height = originalImageMeta.originalHeight;

        const tempCtx = tempCanvas.getContext("2d");
        tempCtx.drawImage(originalImage, 0, 0, tempCanvas.width, tempCanvas.height);

        let highResImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const scale = originalImageMeta.originalWidth / canvas.width;

        if (paletteReductionParams.enablePaletteReduction) {
            const reduced = new ImageData(highResImageData.width, highResImageData.height);
            applyPaletteReduction(highResImageData, reduced);
            highResImageData = reduced;
        }

        const highResManager = createEffectManager(highResImageData);

        highResManager.addEffect("colorShift", makeScaledColorShiftEffect(scale), {
            enabled: colorShiftParams.enableColorShift,
        });

        highResManager.addEffect("waveDeform", makeScaledWaveDeformEffect(scale), {
            enabled: waveDeformParams.enableWaveDeform,
        });

        highResManager.addEffect("displacement", makeScaledDisplacementEffect(scale), {
            enabled: displacementParams.enableDisplacement
        });

        highResManager.addEffect("pixelSort", makeScaledPixelSortEffect(scale), {
            enabled: pixelSortParams.enablePixelSort,
        });

        highResManager.addEffect("dataCorruption", makeScaledDataCorruptionEffect(scale), {
            enabled: dataCorruptionParams.enableDataCorruption
        });

        highResManager.updateOriginal(highResImageData);

        const output = await highResManager.process();

        highResManager.dispose();
        tempCanvas.width = tempCanvas.height = 0;

        return output;
    }

    const colorShiftParams = {
        enableColorShift: true,
        useUniformShift: true,
        shiftAmount: { x: 20, y: 0 },
        redShift: { x: 20, y: 0 },
        greenShift: { x: 0, y: 0 },
        blueShift: { x: -20, y: 0 },
        intensity: 1.0,

    };

    const waveDeformParams = {
        enableWaveDeform: false,
        direction: "horizontal",
        amplitude: 10,
        frequency: 0.05,
        phase: 0,
        useNoise: false,
        seed: 0
    };

    const displacementParams = {
        enableDisplacement: true,
        mode: 'horizontal',
        displacementIntensity: 8,
        displacementSize: 18,
        displacementFrequency: 0.5,
        seed: 0,
    };

    const predefinedPalettes = {
        // Original palettes
        gameboy: [
            [15, 56, 15],
            [48, 98, 48],
            [139, 172, 15],
            [155, 188, 15]
        ],
        firewatch: [
            [255, 94, 77],
            [255, 160, 0],
            [72, 52, 212],
            [29, 29, 29]
        ],
        desert: [
            [239, 214, 167],
            [201, 133, 61],
            [129, 80, 47],
            [60, 42, 33]
        ],
        lavender: [
            [32, 32, 64],
            [96, 64, 128],
            [160, 128, 192],
            [240, 240, 255]
        ],
        strangerThings: [
            [12, 12, 20],
            [220, 30, 30],
            [240, 240, 240],
            [30, 30, 60]
        ],
        dawnbringer: [
            [20, 12, 28],
            [68, 36, 52],
            [48, 52, 109],
            [208, 70, 72],
            [210, 125, 44],
            [109, 194, 202],
            [218, 212, 94],
            [222, 238, 214]
        ],
        blackwhite: [
            [0, 0, 0],
            [255, 255, 255]
        ],
        grayscale4: [
            [0, 0, 0],
            [85, 85, 85],
            [170, 170, 170],
            [255, 255, 255]
        ],
        // Movie-inspired palettes
        bladeRunner: [
            [10, 10, 30],
            [200, 30, 60],
            [30, 150, 200],
            [250, 180, 80]
        ],
        madMax: [
            [255, 213, 79],
            [244, 67, 54],
            [33, 33, 33],
            [158, 158, 158]
        ],
        matrix: [
            [0, 0, 0],
            [0, 255, 70],
            [20, 20, 20],
            [100, 255, 180]
        ],
        tronLegacy: [
            [0, 0, 0],
            [0, 240, 255],
            [255, 255, 255],
            [0, 60, 160]
        ],
        drive: [
            [255, 0, 128],
            [255, 255, 255],
            [10, 10, 10],
            [80, 0, 120]
        ],
        akira: [
            [255, 0, 0],
            [30, 30, 30],
            [255, 230, 200],
            [80, 80, 80]
        ],
        // Retro/Vapor Aesthetic palettes
        vaporwave: [
            [255, 105, 180],
            [0, 255, 255],
            [255, 255, 255],
            [20, 20, 20]
        ],
        miamiVice: [
            [255, 85, 170],
            [0, 204, 204],
            [255, 255, 255],
            [0, 0, 0]
        ],
        lofi: [
            [144, 129, 112],
            [192, 159, 142],
            [236, 208, 185],
            [78, 61, 53]
        ],
        nes: [
            [124, 124, 124],
            [0, 0, 252],
            [252, 0, 0],
            [0, 0, 0]
        ],

        // Abstract/Glitch/Experimental
        glitchCore: [
            [0, 255, 255],
            [255, 0, 255],
            [255, 255, 0],
            [0, 0, 0]
        ],
        acid: [
            [255, 0, 255],
            [0, 255, 0],
            [0, 0, 255],
            [255, 255, 0]
        ]
    };

    const paletteReductionParams = {
        enablePaletteReduction: false,
        paletteName: "desert",
        distanceMode: "accurate",
        useDithering: true
    };

    const pixelSortParams = {
        enablePixelSort: false,
        direction: 'horizontal',
        blockSize: 5,
        frequency: 0.5,
        sortType: 'shuffle',
        seed: 0,
    };

    const dataCorruptionParams = {
        enableDataCorruption: false,
        blockSize: 32,
        corruptionAmount: 0.01,
        corruptionMode: "random",
        seed: 0
    };

    function resizeCanvas() {
        const { width, height } = canvasResolution;
        if (!width || !height) return;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const maxCanvasSize = Math.min(viewportWidth, viewportHeight) - canvasOffset;

        const scale = Math.min(maxCanvasSize / width, maxCanvasSize / height, 1);

        canvas.style.width = `${Math.round(width * scale)}px`;
        canvas.style.height = `${Math.round(height * scale)}px`;
    }

    function preprocessBaseImage(imageData) {
        const tempCtx = document.createElement("canvas").getContext("2d");
        const processed = tempCtx.createImageData(imageData.width, imageData.height);
        let modified = false;

        if (paletteReductionParams.enablePaletteReduction) {
            applyPaletteReduction(imageData, processed);
            modified = true;
        }

        return modified ? processed : imageData;
    }

    function drawImageOnCanvas(imageSrc) {

        //TweakpaneUtils.setEnabled(pane, false);

        if (originalImage) {
            originalImage.onload = null;
            originalImage.onerror = null;
            originalImage.src = "";
            originalImage = null;
        }

        if (effectManager && typeof effectManager.dispose === "function") {
            effectManager.dispose();
            effectManager = null;
        }

        originalImageData = null;

        originalImage = new Image();
        originalImage.crossOrigin = "Anonymous";
        originalImage.src = imageSrc;

        originalImage.onload = function() {
            const origW = originalImage.naturalWidth;
            const origH = originalImage.naturalHeight;

            const scale = Math.min(maxCanvasWidth / origW, maxCanvasHeight / origH, 1);
            const scaledW = Math.floor(origW * scale);
            const scaledH = Math.floor(origH * scale);

            canvas.width = scaledW;
            canvas.height = scaledH;

            canvasResolution.width = scaledW;
            canvasResolution.height = scaledH;
            resizeCanvas();

            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(originalImage, 0, 0, scaledW, scaledH);

            let baseImageData = ctx.getImageData(0, 0, scaledW, scaledH);

            if (paletteReductionParams.enablePaletteReduction) {
                const reduced = ctx.createImageData(baseImageData.width, baseImageData.height);
                applyPaletteReduction(baseImageData, reduced);
                baseImageData = reduced;
                ctx.putImageData(baseImageData, 0, 0);
            }

            originalImageData = baseImageData;

            originalImageMeta.scaleFactor = scale;
            originalImageMeta.originalWidth = origW;
            originalImageMeta.originalHeight = origH;

            effectManager = createEffectManager(originalImageData);

            effectManager.addEffect("colorShift", applyColorShift, {
                enabled: colorShiftParams.enableColorShift,
            });
            effectManager.addEffect("waveDeform", applyWaveDeform, {
                enabled: waveDeformParams.enableWaveDeform
            });

            effectManager.addEffect("displacement", applyDisplacement, {
                enabled: displacementParams.enableDisplacement,
            });
            effectManager.addEffect("pixelSort", applyPixelSort, {
                enabled: pixelSortParams.enablePixelSort,
            });
            effectManager.addEffect("dataCorruption", applyDataCorruption, {
                enabled: dataCorruptionParams.enableDataCorruption,
            });

            effectManager.updateOriginal(originalImageData);
            processImage();

            //TweakpaneUtils.setEnabled(pane, true);

            if (scale < 1) {
                qualityMessage.set(`Image scaled to ${Math.round(scale * 100)}% for performance`);
            } else {
                qualityMessage.set("Original resolution preserved");
            }
        };

        originalImage.onerror = function() {
            console.error("Failed to load image");
            TweakpaneUtils.setEnabled(pane, true);
        };
    }

    const optimizedPalettes = new Map();

    function precomputePalettes() {
        let name, colors, arr, i, color;
        for ([name, colors] of Object.entries(predefinedPalettes)) {
            arr = new Uint8Array(colors.length * 4);
            for (i = 0; i < colors.length; i++) {
                color = colors[i];
                arr[i * 4] = color[0];
                arr[i * 4 + 1] = color[1];
                arr[i * 4 + 2] = color[2];
                arr[i * 4 + 3] = 255;
            }
            optimizedPalettes.set(name, arr);
        }
    }

    precomputePalettes();

    function findNearestColor(r, g, b, palette) {
        let minDist = Infinity;
        let bestPr = 0,
            bestPg = 0,
            bestPb = 0;
        let i, pr, pg, pb, dr, dg, db, dist;
        const len = palette.length;

        for (i = 0; i < len; i++) {
            [pr, pg, pb] = palette[i];
            dr = r - pr;
            dg = g - pg;
            db = b - pb;
            dist = dr * dr + dg * dg + db * db;
            if (dist < minDist) {
                minDist = dist;
                bestPr = pr;
                bestPg = pg;
                bestPb = pb;
                if (dist === 0) break;
            }
        }
        return [bestPr, bestPg, bestPb];
    }

    function getDistanceFunction(mode) {
        switch (mode) {
            case "fast":
                return function(r, g, b, pr, pg, pb) {
                    return Math.abs(r - pr) + Math.abs(g - pg) + Math.abs(b - pb);
                };
            case "perceptual":
                return function(r, g, b, pr, pg, pb) {
                    let dr = r - pr;
                    let dg = g - pg;
                    let db = b - pb;
                    return 0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db;
                };
            case "accurate":
            default:
                return function(r, g, b, pr, pg, pb) {
                    let dr = r - pr;
                    let dg = g - pg;
                    let db = b - pb;
                    return dr * dr + dg * dg + db * db;
                };
        }
    }

    function distributeError(data, width, height, x, y, errR, errG, errB) {
        const diffusion = [
            [1, 0, 7 / 16],
            [-1, 1, 3 / 16],
            [0, 1, 5 / 16],
            [1, 1, 1 / 16]
        ];

        for (const [dx, dy, factor] of diffusion) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const ni = (ny * width + nx) * 4;
                data[ni] = clamp(data[ni] + errR * factor);
                data[ni + 1] = clamp(data[ni + 1] + errG * factor);
                data[ni + 2] = clamp(data[ni + 2] + errB * factor);
            }
        }
    }

    function clamp(v, min = 0, max = 255) {
        return v < min ? min : v > max ? max : v;
    }

    function applyPaletteReduction(inputImageData, outputImageData) {
        const paletteName = paletteReductionParams.paletteName || "desert";
        const distanceMode = paletteReductionParams.distanceMode || "accurate";
        const useDithering = paletteReductionParams.useDithering;

        const palette = predefinedPalettes[paletteName] || predefinedPalettes.desert;
        const src = inputImageData.data;
        const dst = outputImageData.data;
        const width = inputImageData.width;
        const height = inputImageData.height;
        const len = src.length;
        const palLen = palette.length;

        const getDist = getDistanceFunction(distanceMode);
        const cache = new Map();

        const palette32 = new Uint32Array(palLen);
        for (let j = 0; j < palLen; j++) {
            const [pr, pg, pb] = palette[j];
            palette32[j] = (pr << 24) | (pg << 16) | (pb << 8);
        }

        // Create working buffer if dithering; else use source directly
        const temp = useDithering ? new Uint8ClampedArray(src) : src;

        let i = 0,
            j = 0;
        let r = 0,
            g = 0,
            b = 0,
            a = 0;
        let key = 0,
            match = 0,
            minDist = 0,
            dist = 0,
            nearest = 0;
        let pr = 0,
            pg = 0,
            pb = 0;
        let errR = 0,
            errG = 0,
            errB = 0;
        let x = 0,
            y = 0;

        for (i = 0; i < len; i += 4) {
            r = temp[i];
            g = temp[i + 1];
            b = temp[i + 2];
            a = temp[i + 3];

            key = (r << 16) | (g << 8) | b;

            match = cache.get(key);
            if (match === undefined) {
                minDist = Infinity;
                nearest = 0;

                for (j = 0; j < palLen; j++) {
                    const p = palette32[j];
                    pr = (p >> 24) & 0xFF;
                    pg = (p >> 16) & 0xFF;
                    pb = (p >> 8) & 0xFF;

                    dist = getDist(r, g, b, pr, pg, pb);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = p;
                        if (dist === 0) break;
                    }
                }

                match = nearest;
                cache.set(key, match);
            }

            const nr = (match >> 24) & 0xFF;
            const ng = (match >> 16) & 0xFF;
            const nb = (match >> 8) & 0xFF;

            dst[i] = nr;
            dst[i + 1] = ng;
            dst[i + 2] = nb;
            dst[i + 3] = a;

            if (useDithering) {
                errR = r - nr;
                errG = g - ng;
                errB = b - nb;

                x = (i >> 2) % width;
                y = (i >> 2) / width | 0;

                distributeError(temp, width, height, x, y, errR, errG, errB);

                temp[i] = nr;
                temp[i + 1] = ng;
                temp[i + 2] = nb;
            }
        }

        return outputImageData;
    }

    function makeScaledPaletteReductionEffect() {
        return function(inputImageData, outputBuffer) {
            return applyPaletteReduction(inputImageData, outputBuffer);
        };
    }

    function applyColorShift(inputImageData, output) {
        if (!inputImageData || !colorShiftParams.enableColorShift) {
            return inputImageData;
        }

        const width = inputImageData.width;
        const height = inputImageData.height;
        const src = inputImageData.data;
        const dst = output.data;

        const blend = colorShiftParams.intensity;

        const shiftR = colorShiftParams.useUniformShift ? colorShiftParams.shiftAmount : colorShiftParams.redShift;
        const shiftG = colorShiftParams.useUniformShift ? { x: 0, y: 0 } : colorShiftParams.greenShift;
        const shiftB = colorShiftParams.useUniformShift ? { x: -colorShiftParams.shiftAmount.x, y: -colorShiftParams.shiftAmount.y } :
            colorShiftParams.blueShift;

        const roundShiftR = { x: Math.round(shiftR.x), y: Math.round(shiftR.y) };
        const roundShiftG = { x: Math.round(shiftG.x), y: Math.round(shiftG.y) };
        const roundShiftB = { x: Math.round(shiftB.x), y: Math.round(shiftB.y) };

        const maxX = width - 1;
        const maxY = height - 1;

        let i, xR, yR, xG, yG, xB, yB, r, g, b, rOrig, gOrig, bOrig, a, blendR, blendG, blendB, rValid, gValid, bValid;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                i = (y * width + x) << 2;

                xR = x + roundShiftR.x;
                yR = y + roundShiftR.y;
                xG = x + roundShiftG.x;
                yG = y + roundShiftG.y;
                xB = x + roundShiftB.x;
                yB = y + roundShiftB.y;

                rValid = xR >= 0 && xR <= maxX && yR >= 0 && yR <= maxY;
                gValid = xG >= 0 && xG <= maxX && yG >= 0 && yG <= maxY;
                bValid = xB >= 0 && xB <= maxX && yB >= 0 && yB <= maxY;

                r = rValid ? src[((yR * width + xR) << 2)] : 0;
                g = gValid ? src[((yG * width + xG) << 2) + 1] : 0;
                b = bValid ? src[((yB * width + xB) << 2) + 2] : 0;

                rOrig = src[i];
                gOrig = src[i + 1];
                bOrig = src[i + 2];
                a = src[i + 3];

                blendR = (blend * r + (1 - blend) * rOrig + 0.5) | 0;
                blendG = (blend * g + (1 - blend) * gOrig + 0.5) | 0;
                blendB = (blend * b + (1 - blend) * bOrig + 0.5) | 0;

                dst[i] = blendR;
                dst[i + 1] = blendG;
                dst[i + 2] = blendB;
                dst[i + 3] = a;
            }
        }

        return output;
    }

    function makeScaledColorShiftEffect(scale = 1) {
        return function(inputImageData, output) {
            // Create a deep copy of scaled parameters
            const getScaled = (v) => ({ x: v.x * scale, y: v.y * scale });

            const scaledParams = {
                ...colorShiftParams,
                shiftAmount: getScaled(colorShiftParams.shiftAmount),
                redShift: getScaled(colorShiftParams.redShift),
                greenShift: getScaled(colorShiftParams.greenShift),
                blueShift: getScaled(colorShiftParams.blueShift)
            };

            const original = { ...colorShiftParams };

            Object.assign(colorShiftParams, scaledParams);
            const result = applyColorShift(inputImageData, output);
            Object.assign(colorShiftParams, original);

            return result;
        };
    }

    function applyWaveDeform(inputImageData, outputImageData) {
        if (!waveDeformParams.enableWaveDeform) {
            return inputImageData;
        }

        const { width, height, data: src } = inputImageData;
        const dst = outputImageData.data;
        const {
            direction,
            amplitude,
            frequency,
            phase,
            useNoise,
            seed = 0
        } = waveDeformParams;

        const isHorizontal = direction === "horizontal";
        const widthMinus1 = width - 1;
        const heightMinus1 = height - 1;
        const rng = mulberry32(seed);

        const waveOffset = new Int32Array(isHorizontal ? height : width);
        if (useNoise) {
            for (let i = 0, len = waveOffset.length; i < len; i++) {
                waveOffset[i] = Math.round((rng() * 2 - 1) * amplitude);
            }
        } else {
            for (let i = 0, len = waveOffset.length; i < len; i++) {
                waveOffset[i] = Math.round(Math.sin(frequency * i + phase) * amplitude);
            }
        }

        let offset, yWidth, clampedYWidth, srcX, srcY, srcIdx, dstIdx;

        if (isHorizontal) {

            for (let y = 0; y < height; y++) {
                offset = waveOffset[y];
                yWidth = y * width;
                clampedYWidth = y * width;

                for (let x = 0; x < width; x++) {
                    srcX = Math.max(0, Math.min(widthMinus1, x + offset));
                    srcIdx = (yWidth + srcX) << 2;
                    dstIdx = (clampedYWidth + x) << 2;

                    dst[dstIdx] = src[srcIdx];
                    dst[dstIdx + 1] = src[srcIdx + 1];
                    dst[dstIdx + 2] = src[srcIdx + 2];
                    dst[dstIdx + 3] = src[srcIdx + 3];
                }
            }
        } else {

            for (let x = 0; x < width; x++) {
                offset = waveOffset[x];

                for (let y = 0; y < height; y++) {
                    srcY = Math.max(0, Math.min(heightMinus1, y + offset));
                    srcIdx = (srcY * width + x) << 2;
                    dstIdx = (y * width + x) << 2;

                    dst[dstIdx] = src[srcIdx];
                    dst[dstIdx + 1] = src[srcIdx + 1];
                    dst[dstIdx + 2] = src[srcIdx + 2];
                    dst[dstIdx + 3] = src[srcIdx + 3];
                }
            }
        }

        return outputImageData;
    }

    function makeScaledWaveDeformEffect(scale = 1) {
        return function(inputImageData, output) {
            const scaledParams = {
                ...waveDeformParams,
                amplitude: Math.round(waveDeformParams.amplitude * scale),
                frequency: waveDeformParams.frequency / scale, //inverse-scale to match cycles
            };

            const original = { ...waveDeformParams };

            Object.assign(waveDeformParams, scaledParams);
            const result = applyWaveDeform(inputImageData, output);
            Object.assign(waveDeformParams, original);

            return result;
        };
    }

    function applyDisplacement(inputImageData, output) {
        if (!inputImageData || !displacementParams.enableDisplacement) {
            return inputImageData;
        }

        const width = inputImageData.width;
        const height = inputImageData.height;
        const src = inputImageData.data;
        const dst = output.data;

        const {
            mode,
            displacementIntensity,
            displacementSize,
            displacementFrequency,
            seed = 0,
        } = displacementParams;

        const rng = mulberry32(seed);

        const rowStride = width << 2;
        const height4 = height << 2;
        const width4 = width << 2;

        const rowBuffer = new Uint8ClampedArray(rowStride);
        const tempColBuffer = new Uint8ClampedArray(height4);
        const colBuffer = new Uint8ClampedArray(height4);

        let y, x, dy, dx, i, j, start, offset, srcIdx, dstIdx, newX, newY;
        let apply, amount, endY, endX;

        const maxShift = (mode === 'horizontal' ? width : height) * (displacementIntensity / 100);

        const readRow = (y, buffer) => {
            start = y * rowStride;
            for (i = 0; i < rowStride; i++) {
                buffer[i] = src[start + i];
            }
        };

        const writeRow = (y, buffer) => {
            start = y * rowStride;
            for (i = 0; i < rowStride; i++) {
                dst[start + i] = buffer[i];
            }
        };

        const readColumn = (x, buffer) => {
            offset = x << 2;
            for (y = 0; y < height; y++) {
                i = (y * width4) + offset;
                j = y << 2;
                buffer[j] = src[i];
                buffer[j | 1] = src[i | 1];
                buffer[j | 2] = src[i | 2];
                buffer[j | 3] = src[i | 3];
            }
        };

        const writeColumn = (x, buffer) => {
            offset = x << 2;
            for (y = 0; y < height; y++) {
                i = (y * width4) + offset;
                j = y << 2;
                dst[i] = buffer[j];
                dst[i | 1] = buffer[j | 1];
                dst[i | 2] = buffer[j | 2];
                dst[i | 3] = buffer[j | 3];
            }
        };

        if (mode === 'horizontal') {
            for (y = 0; y < height; y += displacementSize) {
                apply = rng() < displacementFrequency;
                amount = apply ? Math.floor(rng() * maxShift) * (rng() > 0.5 ? 1 : -1) : 0;
                //amount = apply ? Math.floor(rng() * displacementIntensity) * (rng() > 0.5 ? 1 : -1) : 0;
                endY = Math.min(y + displacementSize, height);

                for (dy = y; dy < endY; dy++) {
                    for (x = 0; x < width; x++) {
                        newX = (x + amount + width) % width;
                        srcIdx = ((dy * width) + newX) << 2;
                        dstIdx = ((dy * width) + x) << 2;

                        dst[dstIdx] = src[srcIdx];
                        dst[dstIdx | 1] = src[srcIdx | 1];
                        dst[dstIdx | 2] = src[srcIdx | 2];
                        dst[dstIdx | 3] = src[srcIdx | 3];
                    }
                }
            }
        } else if (mode === 'vertical') {
            for (x = 0; x < width; x += displacementSize) {
                apply = rng() < displacementFrequency;
                //amount = apply ? Math.floor(rng() * displacementIntensity) * (rng() > 0.5 ? 1 : -1) : 0;
                amount = apply ? Math.floor(rng() * maxShift) * (rng() > 0.5 ? 1 : -1) : 0;

                const maxAmount = height;
                amount = Math.max(-maxAmount, Math.min(maxAmount, amount));

                endX = Math.min(x + displacementSize, width);

                for (dx = x; dx < endX; dx++) {
                    readColumn(dx, colBuffer);

                    if (apply && amount !== 0) {
                        for (y = 0; y < height; y++) {
                            newY = ((y + amount) % height + height) % height;
                            srcIdx = newY << 2;
                            dstIdx = y << 2;

                            tempColBuffer[dstIdx] = colBuffer[srcIdx];
                            tempColBuffer[dstIdx | 1] = colBuffer[srcIdx | 1];
                            tempColBuffer[dstIdx | 2] = colBuffer[srcIdx | 2];
                            tempColBuffer[dstIdx | 3] = colBuffer[srcIdx | 3];
                        }
                        writeColumn(dx, tempColBuffer);
                    } else {
                        writeColumn(dx, colBuffer);
                    }
                }
            }
        }

        return output;
    }

    function makeScaledDisplacementEffect(scale = 1) {
        return function(inputImageData, output) {
            const scaledParams = {
                ...displacementParams,
                displacementIntensity: displacementParams.displacementIntensity, // * scale,
                displacementSize: Math.max(1, Math.round(displacementParams.displacementSize * scale)),
                displacementFrequency: displacementParams.displacementFrequency // frequency is unitless
            };

            const original = { ...displacementParams };

            Object.assign(displacementParams, scaledParams);
            const result = applyDisplacement(inputImageData, output);
            Object.assign(displacementParams, original);

            return result;
        };
    }

    function applyPixelSort(inputImageData, output) {
        if (!inputImageData || !pixelSortParams || !pixelSortParams.enablePixelSort) {
            return inputImageData;
        }

        const params = pixelSortParams;
        const direction = params.direction || 'horizontal';
        const blockSize = params.blockSize || 32;
        const frequency = params.frequency !== undefined ? params.frequency : 0.7;
        const seed = params.seed || 0;
        const sortType = params.sortType || 'shuffle';

        const width = inputImageData.width;
        const height = inputImageData.height;
        const src = inputImageData.data;
        const dst = output.data;

        const rng = mulberry32(seed);

        const randomCount = direction === 'horizontal' ? height : width;
        const skipRandom = new Float32Array(randomCount);
        for (let i = 0; i < randomCount; i++) {
            skipRandom[i] = rng();
        }

        const frequencyThreshold = frequency;

        const maxBlockSize = Math.max(blockSize, 256);
        const sharedBlock = new Uint32Array(maxBlockSize);

        let rowStart, idx, actualSize, i, j, px, x, y;
        let r, g, b, a;

        if (direction === 'horizontal') {
            for (y = 0; y < height; y++) {
                rowStart = y * width * 4;

                if (skipRandom[y] > frequencyThreshold) {
                    for (x = 0; x < width; x++) {
                        idx = rowStart + x * 4;
                        dst[idx] = src[idx];
                        dst[idx + 1] = src[idx + 1];
                        dst[idx + 2] = src[idx + 2];
                        dst[idx + 3] = src[idx + 3];
                    }
                    continue;
                }

                for (x = 0; x < width; x += blockSize) {
                    actualSize = Math.min(blockSize, width - x);
                    for (j = 0; j < actualSize; j++) {
                        idx = rowStart + (x + j) * 4;
                        r = src[idx];
                        g = src[idx + 1];
                        b = src[idx + 2];
                        a = src[idx + 3];
                        sharedBlock[j] = (r << 24) | (g << 16) | (b << 8) | a;
                    }

                    if (sortType === 'shuffle') {
                        for (i = actualSize - 1; i > 0; i--) {
                            j = (rng() * (i + 1)) | 0;
                            px = sharedBlock[i];
                            sharedBlock[i] = sharedBlock[j];
                            sharedBlock[j] = px;
                        }
                    } else {
                        sharedBlock.subarray(0, actualSize).sort();
                    }

                    for (j = 0; j < actualSize; j++) {
                        idx = rowStart + (x + j) * 4;
                        px = sharedBlock[j];
                        dst[idx] = (px >> 24) & 0xff;
                        dst[idx + 1] = (px >> 16) & 0xff;
                        dst[idx + 2] = (px >> 8) & 0xff;
                        dst[idx + 3] = px & 0xff;
                    }
                }
            }
        } else {
            for (x = 0; x < width; x++) {
                if (skipRandom[x] > frequencyThreshold) {
                    for (y = 0; y < height; y++) {
                        idx = (y * width + x) * 4;
                        dst[idx] = src[idx];
                        dst[idx + 1] = src[idx + 1];
                        dst[idx + 2] = src[idx + 2];
                        dst[idx + 3] = src[idx + 3];
                    }
                    continue;
                }

                for (y = 0; y < height; y += blockSize) {
                    actualSize = Math.min(blockSize, height - y);

                    for (j = 0; j < actualSize; j++) {
                        idx = ((y + j) * width + x) * 4;
                        r = src[idx];
                        g = src[idx + 1];
                        b = src[idx + 2];
                        a = src[idx + 3];
                        sharedBlock[j] = (r << 24) | (g << 16) | (b << 8) | a;
                    }

                    if (sortType === 'shuffle') {
                        for (i = actualSize - 1; i > 0; i--) {
                            j = (rng() * (i + 1)) | 0;
                            px = sharedBlock[i];
                            sharedBlock[i] = sharedBlock[j];
                            sharedBlock[j] = px;
                        }
                    } else {
                        sharedBlock.subarray(0, actualSize).sort();
                    }

                    for (j = 0; j < actualSize; j++) {
                        idx = ((y + j) * width + x) * 4;
                        px = sharedBlock[j];
                        dst[idx] = (px >> 24) & 0xff;
                        dst[idx + 1] = (px >> 16) & 0xff;
                        dst[idx + 2] = (px >> 8) & 0xff;
                        dst[idx + 3] = px & 0xff;
                    }
                }
            }
        }

        return output;
    }

    function makeScaledPixelSortEffect(scale = 1) {
        return function(inputImageData, output) {
            const scaledParams = {
                ...pixelSortParams,
                blockSize: Math.max(1, Math.round(pixelSortParams.blockSize * scale)),
            };

            const original = { ...pixelSortParams };

            Object.assign(pixelSortParams, scaledParams);
            const result = applyPixelSort(inputImageData, output);
            Object.assign(pixelSortParams, original);

            return result;
        };
    }

    function applyDataCorruption(inputImageData, output) {
        if (!inputImageData || !dataCorruptionParams.enableDataCorruption) {
            return inputImageData;
        }

        let blockSize, corruptionAmount, corruptionMode, seed = 0;
        let rng, width, height, src, dst;
        let totalBlocksX, totalBlocksY;
        let width4, blockSize4, src32, dst32;
        let blockX, blockY, xStart, yStart, xEnd, yEnd;
        let y, rowStart, rowEnd, idx, srcX, srcY, srcIdx;

        ({ blockSize, corruptionAmount, corruptionMode, seed } = dataCorruptionParams);
        rng = mulberry32(seed);
        width = inputImageData.width;
        height = inputImageData.height;
        src = inputImageData.data;
        dst = output.data;

        totalBlocksX = Math.ceil(width / blockSize);
        totalBlocksY = Math.ceil(height / blockSize);

        width4 = width << 2;
        blockSize4 = blockSize << 2;

        if ((src.length & 3) === 0 && (dst.length & 3) === 0) {
            src32 = new Uint32Array(src.buffer);
            dst32 = new Uint32Array(dst.buffer);
            dst32.set(src32);
        } else {
            dst.set(src);
        }

        for (blockY = 0; blockY < totalBlocksY; blockY++) {
            for (blockX = 0; blockX < totalBlocksX; blockX++) {
                if (rng() > corruptionAmount) continue;

                xStart = blockX * blockSize;
                yStart = blockY * blockSize;
                xEnd = Math.min(xStart + blockSize, width);
                yEnd = Math.min(yStart + blockSize, height);

                // Randomly pick a mode if "random"
                let effectiveMode = corruptionMode;
                if (corruptionMode === "random") {
                    const modes = ["zero", "invert", "shift"];
                    effectiveMode = modes[(rng() * modes.length) | 0];
                }

                for (y = yStart; y < yEnd; y++) {
                    rowStart = (y * width + xStart) << 2;
                    rowEnd = (y * width + xEnd) << 2;

                    for (idx = rowStart; idx < rowEnd; idx += 4) {
                        switch (effectiveMode) {
                            case "rgb":
                                dst[idx] = (rng() * 256) | 0;
                                dst[idx + 1] = (rng() * 256) | 0;
                                dst[idx + 2] = (rng() * 256) | 0;
                                break;

                            case "zero":
                                dst[idx] = dst[idx + 1] = dst[idx + 2] = 0;
                                break;

                            case "invert":
                                dst[idx] = 255 - dst[idx];
                                dst[idx + 1] = 255 - dst[idx + 1];
                                dst[idx + 2] = 255 - dst[idx + 2];
                                break;

                            case "shift":
                                srcX = (rng() * width) | 0;
                                srcY = (rng() * height) | 0;
                                srcIdx = (srcY * width + srcX) << 2;
                                dst[idx] = src[srcIdx];
                                dst[idx + 1] = src[srcIdx + 1];
                                dst[idx + 2] = src[srcIdx + 2];
                                break;
                        }

                        // Restore original alpha
                        dst[idx + 3] = src[idx + 3];
                    }
                }
            }
        }

        return output;
    }

    function makeScaledDataCorruptionEffect(scale = 1) {
        return function(inputImageData, output) {
            const scaledParams = {
                ...dataCorruptionParams,
                blockSize: Math.max(2, Math.round(dataCorruptionParams.blockSize * scale)),
            };

            const original = { ...dataCorruptionParams };

            Object.assign(dataCorruptionParams, scaledParams);
            const result = applyDataCorruption(inputImageData, output);
            Object.assign(dataCorruptionParams, original);

            return result;
        };
    }

    // ------ Tweakpane Image I/O Folder ------
    const imageIOFolder = pane.addFolder({ title: "Image I/O", expanded: true });

    TweakpaneUtils.addImageUploader(imageIOFolder, {
        allowedUploadTypes: ['image/png', 'image/jpeg', 'image/webp'],
        buttonOptions: { title: 'Upload Image' },

        onStart: (file) => {
            TweakpaneUtils.setEnabled(pane, false);
            console.log("Started upload for:", file.name);
        },

        onFinish: (file, dataUrl) => {
            console.log("Finished uploading:", file.name);
            drawImageOnCanvas(dataUrl);
            TweakpaneUtils.setEnabled(pane, true);
        },

        onError: (err, file) => {
            console.error("Upload error:", err);
            TweakpaneUtils.setEnabled(pane, true);
        },

        onCancel: () => {
            console.log("User cancelled image selection.");
            TweakpaneUtils.setEnabled(pane, true);
        }
    });

    const qualityMessage = TweakpaneUtils.addPersistentMessage(imageIOFolder, "Image Quality");

    TweakpaneUtils.addImageDownloader(imageIOFolder, async () => {
        const imageData = await getDownloadImageData();
        return {
            imageData,
            meta: {
                scaleFactor: originalImageMeta.scaleFactor,
                originalWidth: originalImageMeta.originalWidth,
                originalHeight: originalImageMeta.originalHeight
            }
        };
    }, {
        filename: () => {
            return "output-image.png";
        },
        showStatus: true,
        formatOptions: { enabled: true, defaultFormat: "png" },
        zipOptions: { enabled: false },
        qualityOptions: { enabled: false },
        onStart: () => TweakpaneUtils.setEnabled(pane, false),
        onFinish: () => TweakpaneUtils.setEnabled(pane, true),
        onError: (err) => {
            console.error("Download error:", err);
            TweakpaneUtils.setEnabled(pane, true);
        },

    });

    const settingsFolder = pane.addFolder({ title: "Settings" });

    // ------ Tweakpane Palette Folder ------
    const paletteFolder = settingsFolder.addFolder({ title: "Palette Reduction" });

    paletteFolder.addBinding(paletteReductionParams, "enablePaletteReduction", { label: "Enable" })
        .on("change", () => {
            if (originalImage?.src) drawImageOnCanvas(originalImage.src);
        });

    paletteFolder.addBinding(paletteReductionParams, "paletteName", {
        label: "Palette",
        options: {
            "Game Boy": "gameboy",
            Firewatch: "firewatch",
            Desert: "desert",
            Lavender: "lavender",
            "Stranger Things": "strangerThings",
            Dawnbringer: "dawnbringer",
            "Black & White": "blackwhite",
            "Grayscale 4": "grayscale4",
            "Blade Runner": "bladeRunner",
            "Mad Max": "madMax",
            Matrix: "matrix",
            "Tron Legacy": "tronLegacy",
            Drive: "drive",
            Akira: "akira",
            Vaporwave: "vaporwave",
            "Miami Vice": "miamiVice",
            Lofi: "lofi",
            NES: "nes",
            "Glitch Core": "glitchCore",
            Acid: "acid"
        }
    }).on("change", () => {
        if (paletteReductionParams.enablePaletteReduction && originalImage?.src) {
            drawImageOnCanvas(originalImage.src);
        }
    });

    paletteFolder.addBinding(paletteReductionParams, "distanceMode", {
        label: "Distance",
        options: {
            Fast: "fast",
            Accurate: "accurate",
            Perceptual: "perceptual"
        }
    }).on("change", () => {
        if (paletteReductionParams.enablePaletteReduction && originalImage?.src) {
            drawImageOnCanvas(originalImage.src);
        }
    });

    paletteFolder.addBinding(paletteReductionParams, "useDithering", {
        label: "Dithering"
    }).on("change", () => {
        if (paletteReductionParams.enablePaletteReduction && originalImage?.src) {
            drawImageOnCanvas(originalImage.src);
        }
    });

    // ------ Tweakpane Color Shift Folder ------
    const colorShiftFolder = settingsFolder.addFolder({ title: "Color Shift" });

    colorShiftFolder.addBinding(colorShiftParams, "enableColorShift", { label: "Enable" })
        .on("change", ev => {
            if (!effectManager) return;
            effectManager.setEnabled("colorShift", ev.value);
            safeUpdate("colorShift");
        });

    colorShiftFolder.addBinding(colorShiftParams, "useUniformShift", { label: "Uniform Shift" })
        .on("change", () => {
            setupColorShiftInputs();
            safeUpdate("colorShift");
        });

    colorShiftFolder.addBinding(colorShiftParams, "intensity", {
        label: "Intensity",
        min: 0,
        max: 1
    }).on("change", () => safeUpdate("colorShift"));

    let colorShiftBindings = [];

    function setupColorShiftInputs() {
        colorShiftBindings.forEach(b => b.dispose());
        colorShiftBindings = [];

        if (colorShiftParams.useUniformShift) {
            colorShiftBindings.push(
                colorShiftFolder.addBinding(colorShiftParams, "shiftAmount", {
                    label: "Shift Amount",
                    min: -100,
                    max: 100
                }).on("change", () => safeUpdate("colorShift"))
            );
        } else {
            colorShiftBindings.push(
                colorShiftFolder.addBinding(colorShiftParams, "redShift", {
                    label: "Red Shift",
                    min: -100,
                    max: 100
                }).on("change", () => safeUpdate("colorShift")),

                colorShiftFolder.addBinding(colorShiftParams, "greenShift", {
                    label: "Green Shift",
                    min: -100,
                    max: 100
                }).on("change", () => safeUpdate("colorShift")),

                colorShiftFolder.addBinding(colorShiftParams, "blueShift", {
                    label: "Blue Shift",
                    min: -100,
                    max: 100
                }).on("change", () => safeUpdate("colorShift"))
            );
        }

        safeUpdate("colorShift");
    }

    setupColorShiftInputs();

    // ------ Tweakpane Wave Deform Folder ------
    const waveDeformFolder = settingsFolder.addFolder({ title: "Wave Deform" });

    waveDeformFolder.addBinding(waveDeformParams, "enableWaveDeform", { label: "Enable" })
        .on("change", (ev) => {
            if (!effectManager) return;
            effectManager.setEnabled("waveDeform", ev.value);
            safeUpdate("waveDeform");
        });

    waveDeformFolder.addBinding(waveDeformParams, "direction", {
        label: "Direction",
        options: {
            Horizontal: "horizontal",
            Vertical: "vertical"
        }
    }).on("change", () => safeUpdate("waveDeform"));

    waveDeformFolder.addBinding(waveDeformParams, "amplitude", {
        label: "Amplitude",
        min: -100,
        max: 100
    }).on("change", () => safeUpdate("waveDeform"));

    const frequencyBinding = waveDeformFolder.addBinding(waveDeformParams, "frequency", {
        label: "Frequency",
        min: 0.01,
        max: 1,
        step: 0.01
    }).on("change", () => safeUpdate("waveDeform"));

    const phaseBinding = waveDeformFolder.addBinding(waveDeformParams, "phase", {
        label: "Phase",
        min: 0,
        max: Math.PI * 2,
        step: 0.1
    }).on("change", () => safeUpdate("waveDeform"));

    waveDeformFolder.addBinding(waveDeformParams, "useNoise", { label: "Use Noise" })
        .on("change", () => {
            const usingNoise = waveDeformParams.useNoise;
            frequencyBinding.hidden = usingNoise;
            phaseBinding.hidden = usingNoise;
            safeUpdate("waveDeform");
        });

    // Initial visibility state (in case useNoise = true on load)
    frequencyBinding.hidden = waveDeformParams.useNoise;
    phaseBinding.hidden = waveDeformParams.useNoise;

    // ------ Tweakpane Displacement Folder ------
    const displacementFolder = settingsFolder.addFolder({ title: "Displacement" });

    displacementFolder.addBinding(displacementParams, "enableDisplacement", { label: "Enable" })
        .on("change", ev => {
            if (!effectManager) return;
            effectManager.setEnabled("displacement", ev.value);
            safeUpdate("displacement");
        });

    displacementFolder.addBinding(displacementParams, "mode", {
        label: "Mode",
        options: { Horizontal: "horizontal", Vertical: "vertical" }
    }).on("change", () => safeUpdate("displacement"));

    displacementFolder.addBinding(displacementParams, "displacementIntensity", {
        label: "Max Shift",
        min: -50,
        max: 50,
        step: 1,
        format: (v) => `${v}%`,
    }).on("change", ev => {
        safeUpdate("displacement");
    });

    displacementFolder.addBinding(displacementParams, "displacementSize", {
        label: "Band Size",
        min: 1,
        max: 50
    }).on("change", () => safeUpdate("displacement"));

    displacementFolder.addBinding(displacementParams, "displacementFrequency", {
        label: "Frequency",
        min: 0,
        max: 1
    }).on("change", () => safeUpdate("displacement"));

    // ------ Tweakpane Pixel Sort Folder ------
    const pixelSortFolder = settingsFolder.addFolder({ title: 'Pixel Sort (CPU-Intensive)' });

    pixelSortFolder.addBinding(pixelSortParams, 'enablePixelSort', { label: 'Enable' })
        .on('change', (ev) => {
            if (!effectManager) return;
            effectManager.setEnabled('pixelSort', ev.value);
            safeUpdate('pixelSort');
        });

    pixelSortFolder.addBinding(pixelSortParams, 'direction', {
        label: 'Direction',
        options: {
            Horizontal: 'horizontal',
            Vertical: 'vertical'
        }
    }).on('change', () => {
        safeUpdate('pixelSort');
    });

    pixelSortFolder.addBinding(pixelSortParams, 'blockSize', {
        label: 'Block Size',
        min: 1,
        max: 50,
        step: 1
    }).on('change', () => {
        safeUpdate('pixelSort');
    });

    pixelSortFolder.addBinding(pixelSortParams, 'frequency', {
        label: 'Frequency',
        min: 0,
        max: 1,
        step: 0.01
    }).on('change', () => {
        safeUpdate('pixelSort');
    });

    pixelSortFolder.addBinding(pixelSortParams, 'sortType', {
        label: 'Sort Type',
        options: {
            Shuffle: 'shuffle',
            Sort: 'sort'
        }
    }).on('change', () => {
        safeUpdate("pixelSort");
    });

    // ------ Tweakpane Data Corruption Folder ------
    const dataCorruptionFolder = settingsFolder.addFolder({ title: "Data Corruption" });

    dataCorruptionFolder.addBinding(dataCorruptionParams, "enableDataCorruption", { label: "Enable" })
        .on("change", ev => {
            if (!effectManager) return;
            effectManager.setEnabled("dataCorruption", ev.value);
            safeUpdate("dataCorruption");
        });

    dataCorruptionFolder.addBinding(dataCorruptionParams, "corruptionMode", {
        label: "Mode",
        options: {
            Random: "random",
            Zero: "zero",
            Invert: "invert",
            Shift: "shift"
        }
    }).on("change", () => safeUpdate("dataCorruption"));

    dataCorruptionFolder.addBinding(dataCorruptionParams, "blockSize", {
        label: "Block Size",
        min: 2,
        max: 64,
        step: 1
    }).on("change", () => safeUpdate("dataCorruption"));

    dataCorruptionFolder.addBinding(dataCorruptionParams, "corruptionAmount", {
        label: 'Probability',
        min: 0,
        max: 1,
        step: 0.01,
        format: (v) => `${Math.round(v * 100)}%`,
    }).on("change", () => safeUpdate("dataCorruption"));

    // ------ Tweakpane Demo Images Folder ------
    const demoImages = TweakpaneUtils.addDemoImages(
        pane,
        (loadedImage) => {
            console.log("Demo Image Loaded:", loadedImage);
            drawImageOnCanvas(loadedImage);
            TweakpaneUtils.setEnabled(pane, true);
        }, {
            baseURL: "https://www.lessrain.com/dev/images-2025/ai/lr-demo-img-2025-",
            totalImages: 330,
            thumbnailClass: "tp-demo-thumbnails",
            thumbnailExtensions: ["png"],
            imageExtensions: ["jpg", "webp", "png"],
            folderOptions: { title: "Demo Images", expanded: true },
            ordered: true,
            startIndex: 195,
            onThumbnailClick: () => {
                TweakpaneUtils.setEnabled(pane, false);
            }
        }
    );

    TweakpaneUtils.enableAccordion(pane, ["Demo Images", "Settings"], "Settings");

    const isCodePen = document.referrer.includes("codepen.io");
    const hostDomains = isCodePen ? ["codepen.io"] : [];
    hostDomains.push(window.location.hostname);

    const links = document.getElementsByTagName("a");
    LR.utils.urlUtils.validateLinks(links, hostDomains);

    TweakpaneUtils.setEnabled(pane, false);

    window.addEventListener("resize", resizeCanvas);
    demoImages.loadImageIndex(0);
});