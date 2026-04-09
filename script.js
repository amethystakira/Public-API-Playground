const endpoints = {
  dog: "https://dog.ceo/api/breeds/image/random",
  joke: "https://official-joke-api.appspot.com/random_joke",
  user: "https://randomuser.me/api/",
  posts: "https://jsonplaceholder.typicode.com/posts",
};

const elements = {
  dog: {
    button: document.getElementById("dog-btn"),
    copyButton: document.getElementById("copy-dog-btn"),
    status: document.getElementById("dog-status"),
    panel: document.getElementById("dog-result"),
    image: document.getElementById("dog-image"),
    breed: document.getElementById("dog-breed"),
    url: document.getElementById("dog-url"),
  },
  joke: {
    button: document.getElementById("joke-btn"),
    nextButton: document.getElementById("next-joke-btn"),
    status: document.getElementById("joke-status"),
    panel: document.getElementById("joke-result"),
    setup: document.getElementById("joke-setup"),
    punchline: document.getElementById("joke-punchline"),
  },
  user: {
    button: document.getElementById("user-btn"),
    status: document.getElementById("user-status"),
    panel: document.getElementById("user-result"),
    image: document.getElementById("user-image"),
    name: document.getElementById("user-name"),
    email: document.getElementById("user-email"),
    country: document.getElementById("user-country"),
    age: document.getElementById("user-age"),
  },
  posts: {
    button: document.getElementById("posts-btn"),
    status: document.getElementById("posts-status"),
    panel: document.getElementById("posts-result"),
    list: document.getElementById("posts-list"),
  },
};

// Reusable fetch helper for all API requests.
async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Request failed");
  }

  return response.json();
}

function setStatus(statusElement, message, isError = false) {
  statusElement.textContent = message;
  statusElement.classList.toggle("error", isError);
}

function showPanel(panel, shouldShow) {
  panel.hidden = !shouldShow;
}

function copyTextFallback(text) {
  const helper = document.createElement("textarea");
  helper.value = text;
  helper.setAttribute("readonly", "");
  helper.style.position = "absolute";
  helper.style.left = "-9999px";
  document.body.appendChild(helper);
  helper.select();

  const isCopied = document.execCommand("copy");
  document.body.removeChild(helper);

  if (!isCopied) {
    throw new Error("Copy failed");
  }
}

function renderPostsMessage(message) {
  const { list } = elements.posts;
  list.innerHTML = "";

  const infoCard = document.createElement("article");
  const infoText = document.createElement("p");

  infoCard.className = "post-item";
  infoText.textContent = message;

  infoCard.appendChild(infoText);
  list.appendChild(infoCard);
}

// Converts "australian-shepherd" into "Australian Shepherd".
function formatBreedName(imageUrl) {
  const match = imageUrl.match(/breeds\/([^/]+)/);

  if (!match) {
    return "Unknown Breed";
  }

  const rawBreed = match[1].replace(/-/g, " ");
  return rawBreed.replace(/\b\w/g, (char) => char.toUpperCase());
}

async function loadDog() {
  const { button, copyButton, status, panel, image, breed, url } = elements.dog;

  button.disabled = true;
  copyButton.disabled = true;
  showPanel(panel, false);
  setStatus(status, "Loading...");

  try {
    const data = await fetchJson(endpoints.dog);
    const imageUrl = data.message;

    image.src = imageUrl;
    image.alt = `${formatBreedName(imageUrl)} dog`;
    breed.textContent = formatBreedName(imageUrl);
    url.href = imageUrl;
    url.textContent = imageUrl;

    showPanel(panel, true);
    setStatus(status, "");
    copyButton.disabled = false;
  } catch (error) {
    setStatus(status, "Something went wrong", true);
  } finally {
    button.disabled = false;
  }
}

async function copyDogImageUrl() {
  const imageUrl = elements.dog.url.textContent;

  if (!imageUrl) {
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(imageUrl);
    } else {
      copyTextFallback(imageUrl);
    }

    setStatus(elements.dog.status, "Image URL copied");
  } catch (error) {
    setStatus(elements.dog.status, "Something went wrong", true);
  }
}

async function loadJoke() {
  const { button, nextButton, status, panel, setup, punchline } = elements.joke;

  button.disabled = true;
  nextButton.disabled = true;
  showPanel(panel, true);
  setStatus(status, "Loading...");

  try {
    const data = await fetchJson(endpoints.joke);

    setup.textContent = data.setup;
    punchline.textContent = data.punchline;

    showPanel(panel, true);
    setStatus(status, "");
    nextButton.disabled = false;
  } catch (error) {
    setStatus(status, "Something went wrong", true);
  } finally {
    button.disabled = false;
    nextButton.disabled = false;
  }
}

async function loadUser() {
  const { button, status, panel, image, name, email, country, age } = elements.user;

  button.disabled = true;
  showPanel(panel, true);
  setStatus(status, "Loading...");

  try {
    const data = await fetchJson(endpoints.user);
    const user = data.results[0];

    image.src = user.picture.large;
    image.alt = `${user.name.first} ${user.name.last}`;
    name.textContent = `${user.name.first} ${user.name.last}`;
    email.textContent = user.email;
    country.textContent = user.location.country;
    age.textContent = String(user.dob.age);

    showPanel(panel, true);
    setStatus(status, "");
  } catch (error) {
    setStatus(status, "Something went wrong", true);
  } finally {
    button.disabled = false;
  }
}

async function loadPosts() {
  const { button, status, panel, list } = elements.posts;

  button.disabled = true;
  showPanel(panel, true);
  renderPostsMessage("Loading posts...");
  setStatus(status, "Loading...");

  try {
    const posts = await fetchJson(endpoints.posts);
    const firstFivePosts = posts.slice(0, 5);

    list.innerHTML = "";

    firstFivePosts.forEach((post) => {
      const article = document.createElement("article");
      const title = document.createElement("h3");
      const body = document.createElement("p");

      article.className = "post-item";
      title.textContent = post.title;
      body.textContent = post.body;

      article.append(title, body);
      list.appendChild(article);
    });

    setStatus(status, "");
  } catch (error) {
    renderPostsMessage("Unable to load posts right now. Please try again.");
    setStatus(status, "Something went wrong", true);
  } finally {
    button.disabled = false;
  }
}

elements.dog.button.addEventListener("click", loadDog);
elements.dog.copyButton.addEventListener("click", copyDogImageUrl);
elements.joke.button.addEventListener("click", loadJoke);
elements.joke.nextButton.addEventListener("click", loadJoke);
elements.user.button.addEventListener("click", loadUser);
elements.posts.button.addEventListener("click", loadPosts);
renderPostsMessage("Posts will appear here.");
