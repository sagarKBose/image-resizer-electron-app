const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const heightInput = document.querySelector("#height");
const widthInput = document.querySelector("#width");

function loadImage(e) {
  const file = e.target.files[0];

  if (!isImageValid(file)) {
    showErrorMessage("Please select an image file");
    widthInput.value = "";
    heightInput.value = "";
    filename.innerText = "";
    outputPath.innerText = "";
    return;
  }

  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function () {
    widthInput.value = image.width;
    heightInput.value = image.height;
  };

  form.style.display = "block";
  filename.innerText = file.name;
  outputPath.innerText = exportPath.join(
    operatingSys.homedir(),
    "resized-image"
  );
}

function isImageValid(file) {
  const imageTypes = ["image/png", "image/jpeg", "image/gif", "image/png"];

  return file && imageTypes.includes(file.type);
}

function sendImageData(e) {
  e.preventDefault();

  if (!img.files[0] || !isImageValid(img.files[0])) {
    showErrorMessage("Please select an image first");
    return;
  }

  const width = widthInput.value;
  const height = heightInput.value;
  const imgPath = electron.getFilePath(img.files[0]);

  if (width === "" || height === "") {
    showErrorMessage("Please fill in a height & width");
    return;
  }

  ipcRenderer.send("image:re-size", {
    imgPath,
    width,
    height,
  });
}

function showErrorMessage(message) {
  Toastify.toast({
    text: message,
    duration: 3000,
    close: false,
    gravity: "top",
    position: "left",
    style: {
      background: "red",
      color: "white",
      textAlign: "center",
    },
  });
}

function showSuccessMessage(message) {
  Toastify.toast({
    text: message,
    duration: 3000,
    close: false,
    gravity: "top",
    position: "left",
    style: {
      background: "green",
      color: "white",
      textAlign: "center",
    },
  });
}

ipcRenderer.on("image:resized-success", () =>
  showSuccessMessage("Image re-sized successfully!")
);

img.addEventListener("change", loadImage);

form.addEventListener("submit", sendImageData);
