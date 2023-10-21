const main = document.querySelector("main");
const inputLabel = main.querySelector("label");
const input = main.querySelector("input");
const reader = new FileReader();
const queue = [];
const maxQueueLength = 150;

inputLabel.addEventListener("keypress", event => {
  if (event.key === "Enter") input.click();
});
input.addEventListener("change", event => {
  handleFileChange(event.currentTarget.files[0]);
});

function handleFileChange(file) {
  reader.addEventListener("load", event => {
    try {
      const json = JSON.parse(event.currentTarget.result);
      removeAll();
      renderTitle(file.name);
      enqueue(json);
      for (const item of queue) render(item);
    } catch (error) {
      console.log(error);
      renderError();
    }
  });
  reader.readAsText(file);
}

function renderError() {
  const renderedErrorMessage = document.getElementById("error-message");
  if (renderedErrorMessage != null) return;

  const errorMessage = document.createElement("p");
  errorMessage.textContent = "Invalid file. Please load a valid JSON file.";
  errorMessage.setAttribute("id", "error-message");
  main.appendChild(errorMessage);
}

function removeAll() {
  while (main.firstChild != null) main.removeChild(main.firstChild);
}

function renderTitle(filename) {
  const title = document.createElement("h1");
  title.textContent = filename;
  title.setAttribute("id", "file-title");
  main.appendChild(title);
}

function enqueue(data, parent = null, indexOnParent = null) {
  const item = buildItem(data, parent, indexOnParent);
  queue.push(item);
  if (parent?.children != null) parent.children.push(item);
  if (!isObject(data)) return item;

  let childIndex = 0;
  for (const [property, value] of Object.entries(data)) {
    li = enqueue({}, item, childIndex);
    enqueue(property, li, 0);
    enqueue(value, li, 1);
    childIndex += 1;
    if (queue.length >= maxQueueLength) {
      item.indexOfLastEnqueuedChild = childIndex;
      break;
    }
  }
  return item;
}

function buildItem(data, parent = null, indexOnParent = null) {
  return {
    id: queue.length,
    data,
    parent,
    indexOnParent,
    children: [],
    indexOfLastEnqueuedChild: null,
  };
}

function render(item) {
  const tag = getTag(item.data);
  const element = document.createElement(tag);
  element.setAttribute("id", item.id);
  if (tag === "span") {
    const cssClass = getCssClass(item);
    element.setAttribute("class", cssClass);
    element.textContent = getTextContent(item);
  }
  const parentElement = item.parent != null ? document.getElementById(item.parent.id) : main;
  parentElement.appendChild(element);
}

function getTag(data) {
  if (!isObject(data)) return "span";
  if (Array.isArray(data)) return "ol";
  if (!isEmpty(data)) return "ul";

  return "li";
}

function getCssClass(item) {
  if (item.indexOnParent === 1) return "value-span";
  if (isNaN(item.data)) return "name-span";

  return "number-span";
}

function getTextContent(item) {
  if (item.indexOnParent === 0) return `${item.data}:`;

  return ` ${item.data}`;
}

function isObject(data) {
  return data != null && typeof data === "object";
}

function isEmpty(object) {
  return Object.keys(object).length === 0;
}
