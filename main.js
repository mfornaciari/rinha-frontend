const main = document.querySelector("main");
const inputLabel = main.querySelector("label");
const input = main.querySelector("input");
const reader = new FileReader();
const queue = [];
const enqueuedByPass = 150;
let enqueuedThisPass = 0;
const lastElementObserver = new IntersectionObserver(handleScrollForward, { rootMargin: "0px 0px 20% 0px" });
let lastElement;

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
      main.replaceChildren();
      renderTitle(file.name);
      enqueue(json, null, null, true);
      for (const item of queue) render(item);
      lastElement = document.getElementById(queue[queue.length - 1].id);
      lastElementObserver.observe(lastElement);
      enqueuedThisPass = 0;
    } catch (error) {
      console.log(error);
      renderError();
    }
  });
  reader.readAsText(file);
}

// ENQUEUING
function enqueue(data, parent = null, indexOnParent = null, root = false) {
  const item = buildItem(data, parent, indexOnParent, root);
  queue.push(item);
  if (parent?.children != null) parent.children.push(item);
  enqueuedThisPass += 1;
  if (!isObject(data)) return item;

  let childIndex = 0;
  for (const [property, value] of Object.entries(data)) {
    li = enqueue({}, item, childIndex);
    enqueue(property, li, 0);
    enqueue(value, li, 1);
    childIndex += 1;
    item.indexOfLastEnqueuedChild = childIndex;
    if (enqueuedThisPass >= enqueuedByPass) break;
  }
  return item;
}

function buildItem(data, parent = null, indexOnParent = null, root) {
  return {
    id: crypto.randomUUID(),
    data,
    parent,
    indexOnParent,
    children: [],
    indexOfLastEnqueuedChild: 0,
    root,
  };
}

// RENDERING
function renderTitle(filename) {
  const title = document.createElement("h1");
  title.textContent = filename;
  title.setAttribute("id", "file-title");
  main.appendChild(title);
}

function renderError() {
  const renderedErrorMessage = document.getElementById("error-message");
  if (renderedErrorMessage != null) return;

  const errorMessage = document.createElement("p");
  errorMessage.textContent = "Invalid file. Please load a valid JSON file.";
  errorMessage.setAttribute("id", "error-message");
  main.appendChild(errorMessage);
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
  if (item.root === true) element.setAttribute("class", "root");
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

  const valueData = item.parent.children[1].data;
  if (Array.isArray(valueData)) return "name-span ol-title";
  if (isNaN(item.data)) return "name-span";

  return "number-span";
}

function getTextContent(item) {
  if (item.indexOnParent === 0) return `${item.data}:`;

  return ` ${item.data}`;
}

//SCROLLING
function handleScrollForward(entries, _observer) {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const previousQueueLength = queue.length;
      const lastEnqueued = queue[queue.length - 1];
      enqueueForward(lastEnqueued);
      for (const item of queue.slice(previousQueueLength)) render(item);
      enqueuedThisPass = 0;
      lastElementObserver.unobserve(lastElement);
      lastElement = document.getElementById(queue[queue.length - 1].id);
      lastElementObserver.observe(lastElement);
    }
  }
}

function enqueueForward(item) {
  const data = item.data;
  const parent = item.parent;
  if (parent != null && !isObject(data)) {
    enqueueForward(item.parent);
    return;
  }

  const childrenToEnqueue = Object.entries(data).slice(item.indexOfLastEnqueuedChild);
  if (parent != null && childrenToEnqueue.length === 0) {
    enqueueForward(item.parent);
    return;
  }

  let childIndex = item.indexOfLastEnqueuedChild;
  for (const [property, value] of childrenToEnqueue) {
    li = enqueue({}, item, childIndex);
    enqueue(property, li, 0);
    enqueue(value, li, 1);
    childIndex += 1;
    item.indexOfLastEnqueuedChild = childIndex;
    if (enqueuedThisPass >= enqueuedByPass) break;
  }
}

//HELPERS
function isObject(data) {
  return data != null && typeof data === "object";
}

function isEmpty(object) {
  return Object.keys(object).length === 0;
}
