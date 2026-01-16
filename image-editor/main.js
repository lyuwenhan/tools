const drop = document.getElementById("drop");
const fileInput = document.getElementById("file");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const bgColorInput = document.getElementById("bgColor");
const btnDownload = document.getElementById("download");
const setW = document.getElementById("setW");
const setH = document.getElementById("setH");
const btnCopy = document.getElementById("copy");
const removeTrans = document.getElementById("removeTrans");
const noSmooth = document.getElementById("noSmooth");
const dragOverlay = document.getElementById("dragOverlay");
const prev = document.getElementById("prev");
let currentImage = null;
let imgWidth = 1,
	imgHeight = 1;
let realWidth = 1,
	realHeight = 1;
let useSmooth = true,
	remTrans = false;

function loadImageFromFile(file) {
	return new Promise((resolve, reject) => {
		const img = new Image;
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = URL.createObjectURL(file)
	})
}
async function handleFile(file) {
	if (!file || !file.type.startsWith("image/")) return;
	try {
		currentImage = await loadImageFromFile(file);
		setW.value = realWidth = imgWidth = currentImage.naturalWidth;
		setH.value = realHeight = imgHeight = currentImage.naturalHeight;
		render();
		prev.hidden = false;
		btnDownload.disabled = false;
		btnCopy.disabled = false;
		drop.textContent = "Loaded: " + file.name
	} catch {
		alert("Failed to load image.")
	}
}

function render() {
	if (!currentImage) return;
	canvas.width = imgWidth;
	canvas.height = imgHeight;
	ctx.imageSmoothingEnabled = useSmooth;
	if (remTrans) {
		ctx.fillStyle = bgColorInput.value;
		ctx.fillRect(0, 0, canvas.width, canvas.height)
	}
	ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height)
}
setH.addEventListener("input", () => {
	if (!setH.value) {
		return
	}
	imgHeight = Math.max(1, Number(setH.value) || 1);
	imgWidth = Math.max(1, Math.round(realWidth * imgHeight / realHeight));
	setH.value = imgHeight;
	setW.value = imgWidth;
	render()
});
setW.addEventListener("input", () => {
	if (!setW.value) {
		return
	}
	imgWidth = Math.max(1, Number(setW.value) || 1);
	imgHeight = Math.max(1, Math.round(realHeight * imgWidth / realWidth));
	setH.value = imgHeight;
	setW.value = imgWidth;
	render()
});
removeTrans.addEventListener("input", () => {
	remTrans = removeTrans.checked;
	render()
});
noSmooth.addEventListener("input", () => {
	useSmooth = !noSmooth.checked;
	render()
});
bgColorInput.addEventListener("input", () => {
	render()
});
document.addEventListener("dragover", e => {
	e.preventDefault();
	dragOverlay.hidden = false;
	drop.classList.add("dragover")
});
dragOverlay.addEventListener("dragleave", () => {
	dragOverlay.hidden = true;
	drop.classList.remove("dragover")
});
document.addEventListener("drop", e => {
	e.preventDefault();
	dragOverlay.hidden = true;
	drop.classList.remove("dragover");
	const file = e.dataTransfer.files[0];
	handleFile(file)
});
drop.addEventListener("click", () => {
	fileInput.click()
});
fileInput.addEventListener("change", e => {
	const file = e.target.files[0];
	handleFile(file);
	fileInput.value = ""
});
btnDownload.addEventListener("click", () => {
	const a = document.createElement("a");
	a.href = canvas.toDataURL("image/png");
	a.download = "output.png";
	a.click()
});
btnCopy.addEventListener("click", async () => {
	canvas.toBlob(async blob => {
		try {
			await navigator.clipboard.write([new ClipboardItem({
				"image/png": blob
			})]);
			alert("Image copied to clipboard.")
		} catch {
			alert("Copy failed (permission required).")
		}
	}, "image/png")
});
