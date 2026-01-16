const drop = document.getElementById("drop");
const fileInput = document.getElementById("file");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const byHex = document.getElementById("byHex");
const bgColorInput = document.getElementById("bgColor");
const btnDownload = document.getElementById("download");
const btnCopy = document.getElementById("copy");
const prev = document.getElementById("prev");
let currentImage = null;

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
	canvas.width = currentImage.naturalWidth;
	canvas.height = currentImage.naturalHeight;
	ctx.fillStyle = bgColorInput.value;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(currentImage, 0, 0)
}
bgColorInput.addEventListener("input", () => {
	byHex.value = bgColorInput.value;
	render()
});
byHex.addEventListener("input", () => {
	const val = byHex.value;
	if (val.length != 7) {
		return
	}
	bgColorInput.value = val;
	render()
});
document.body.addEventListener("dragover", e => {
	e.preventDefault();
	drop.classList.add("dragover")
});
document.body.addEventListener("dragleave", () => {
	drop.classList.remove("dragover")
});
document.body.addEventListener("drop", e => {
	e.preventDefault();
	drop.classList.remove("dragover");
	const file = e.dataTransfer.files[0];
	handleFile(file)
});
drop.addEventListener("click", e => {
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
