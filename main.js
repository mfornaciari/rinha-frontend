const main = document.querySelector("main");
const heading = main.querySelector("h1");
const subtitle = main.querySelector("p");
const button = main.querySelector("label");
const input = main.querySelector("input");
const elements = [heading, subtitle, button, input];

input.addEventListener("change", event => {
  handleFileChange(event.currentTarget.files[0]);
});

const reader = new FileReader();

function handleFileChange(file) {
  reader.onload = event => {
    let json;
    let invalidJson = false;
    const string = event.currentTarget.result;
    try {
      json = JSON.parse(string);
    } catch (error) {
      invalidJson = true;
    }
    if (invalidJson) {
      renderError();
    } else {
      removeAll();
      renderTitle(file.name);
      renderData(json);
    }
  };
  reader.readAsText(file);
}

function renderError() {
  const errorMessageInElements = elements.find(element => element.id === "error-message");
  if (errorMessageInElements != null) return;

  const errorMessage = document.createElement("p");
  errorMessage.textContent = "Invalid file. Please load a valid JSON file.";
  errorMessage.setAttribute("id", "error-message");
  main.appendChild(errorMessage);
  elements.push(errorMessage);
}

function removeAll() {
  for (const element of elements) element.remove();
}

function renderTitle(filename) {
  const title = document.createElement("h1");
  title.textContent = filename;
  title.setAttribute("id", "file-title");
  main.appendChild(title);
}

function renderData(data) {
  if (Array.isArray(data)) {
    renderArray(data, main);
  } else if (typeof data == "object") {
    renderObject(data, main);
  }
}

function renderArray(data, parent) {
  const ol = document.createElement("ol");
  parent.appendChild(ol);
  const li = document.createElement("li");
  ol.appendChild(li);
  for (const element of data) {
    if (Array.isArray(element)) {
      renderArray(element, li);
    } else if (typeof element === "object") {
      renderObject(element, li);
    } else {
      li.textContent = String(element);
    }
  }
}

function renderObject(data, parent) {
  const dl = document.createElement("dl");
  parent.appendChild(dl);
  for (const key in data) {
    const dt = document.createElement("dt");
    dt.textContent = key;
    dl.appendChild(dt);
    const dd = document.createElement("dd");
    dl.appendChild(dd);
    if (Array.isArray(data[key])) {
      renderArray(data[key], dd);
    } else if (typeof data[key] === "object") {
      renderObject(data[key], dd);
    } else {
      dd.textContent = String(data[key]);
    }
  }
}
