const template = document.createElement("template");

const getBaseURL = () => {
  return new URL(".", import.meta.url);
};

async function loadHTML(htmlRelativeUrl, baseUrl) {
  const htmlUrl = new URL(htmlRelativeUrl, baseUrl).href;
  const response = await fetch(htmlUrl);
  return response.text();
}

const templateHTML = await loadHTML("./logoComponent.html", getBaseURL());

template.innerHTML = `
  <link rel="stylesheet" href="${getBaseURL() + "logoComponent.css"}">
  ${templateHTML}
`;

class LogoGenerator extends HTMLElement {
  constructor() {
    super();
    this.currentAnimation = null;
    this.isDragging = false;
    this.offset = { x: 0, y: 0 };
    this.attachShadow({ mode: "open" });
  }

  static get observedAttributes() {
    return ["text", "color", "font", "animation", "size", "background", "texture", "width", "height"];
  }

  connectedCallback() {
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.render();

    this.shadowRoot.getElementById("applyButton").onclick = () =>
      this.updateLogo();

    this.shadowRoot.getElementById("downloadButton").onclick = () =>
      this.downloadLogo();

    this.shadowRoot.getElementById("generateCodeButton").onclick = () =>
      this.generateCode();

    const logoElement = this.shadowRoot.getElementById("logo");
    logoElement.addEventListener("mousedown", this.onMouseDown.bind(this));
    document.addEventListener("mousemove", this.onMouseMove.bind(this));
    document.addEventListener("mouseup", this.onMouseUp.bind(this));
    
    // Handle background texture change
    this.shadowRoot.getElementById("backgroundTextureSelect").onchange = (event) => {
      this.setAttribute("texture", event.target.value);
      this.updateBackground();
    };
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === "animation") {
        this.updateAnimation(newValue);
      }
      this.render();
    }
  }

  updateBackground() {
    const background = this.getAttribute("background") || "";
    const texture = this.getAttribute("texture") || "";
    const containerElement = this.shadowRoot.querySelector("#logoContainer");
    containerElement.style.backgroundImage = `${texture ? `url(${texture})` : "none"}, ${background ? `url(${background})` : "none"}`;
  }

  updateAnimation(name) {
    const logoElement = this.shadowRoot.getElementById("logo");
    if (logoElement) {
      console.log('Élément logo trouvé:', logoElement);

      // Retirer la classe d'animation si elle existe déjà
      if (this.currentAnimation) {
        logoElement.classList.remove(this.currentAnimation);
      }

      // Forcer un recalcul du style (truc de recalcul du DOM pour réinitialiser l'animation)
      void logoElement.offsetWidth; // Forcer un "reflow" du DOM pour redémarrer l'animation

      // Ajouter la nouvelle classe d'animation
      this.currentAnimation = name;
      logoElement.classList.add(this.currentAnimation);

    } else {
      console.error("Élément logo introuvable !");
    }
  }

  adjustFontSizeToFit(container, element, specifiedFontSize) {
    let fontSize = specifiedFontSize;
    element.style.fontSize = fontSize + 'px';  // Appliquer la taille définie par l'utilisateur
    const maxWidth = container.clientWidth;
    const maxHeight = container.clientHeight;

    // Réduire la taille de la police jusqu'à ce que le texte tienne dans le conteneur
    while ((element.scrollWidth > maxWidth || element.scrollHeight > maxHeight) && fontSize > 10) {
      fontSize -= 1;
      element.style.fontSize = fontSize + 'px';
    }
  }

  render() {
    const text = this.getAttribute("text") || "Logo";
    const color = this.getAttribute("color") || "black";
    const font = this.getAttribute("font") || "Arial";
    const animation = this.getAttribute("animation") || "";
    const size = this.getAttribute("size") || "100";
    const background = this.getAttribute("background") || "";
    const texture = this.getAttribute("texture") || "";
    const width = this.getAttribute("width") || "200";
    const height = this.getAttribute("height") || "200";

    const logoElement = this.shadowRoot.querySelector("#logo");
    const containerElement = this.shadowRoot.querySelector("#logoContainer");
    
    logoElement.textContent = text;
    logoElement.style.color = color;
    logoElement.style.fontFamily = font;

    // Mettre à jour l'animation
    this.updateAnimation(animation);

    // Ajuster dynamiquement la taille de la police pour tenir dans le container en prenant en compte la taille définie
    this.adjustFontSizeToFit(containerElement, logoElement, parseInt(size));

    // Mettre à jour l'image de fond
    this.updateBackground();

    // Mettre à jour la taille du carré
    containerElement.style.width = `${width}px`;
    containerElement.style.height = `${height}px`;
  }

  updateLogo() {
    const text = this.shadowRoot.getElementById("logoText").value;
    const color = this.shadowRoot.getElementById("logoColor").value;
    const font = this.shadowRoot.getElementById("logoFont").value;
    const size = this.shadowRoot.getElementById("logoSize").value;
    const animation = this.shadowRoot.getElementById("logoAnimation").value;
    const background = this.shadowRoot.getElementById("backgroundImage").value;
    const texture = this.shadowRoot.getElementById("backgroundTextureSelect").value;
    const width = this.shadowRoot.getElementById("logoWidth").value;
    const height = this.shadowRoot.getElementById("logoHeight").value;

    if (text) this.setAttribute("text", text);
    this.setAttribute("color", color);
    this.setAttribute("font", font);
    this.setAttribute("size", size);
    this.setAttribute("animation", animation);
    this.setAttribute("background", background);
    this.setAttribute("texture", texture);
    this.setAttribute("width", width);
    this.setAttribute("height", height);
  }

  downloadLogo() {
    const containerElement = this.shadowRoot.querySelector("#logoContainer");
    html2canvas(containerElement, { useCORS: true }).then(canvas => {
      const link = document.createElement("a");
      link.download = "logo.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  }

  generateCode() {
    const text = this.getAttribute("text") || "Logo";
    const color = this.getAttribute("color") || "black";
    const font = this.getAttribute("font") || "Arial";
    const animation = this.getAttribute("animation") || "";
    const size = this.getAttribute("size") || "100";
    const background = this.getAttribute("background") || "";
    const texture = this.getAttribute("texture") || "";
    const width = this.getAttribute("width") || "200";
    const height = this.getAttribute("height") || "200";

    const code = `
<logo-generator
  text="${text}"
  color="${color}"
  font="${font}"
  animation="${animation}"
  size="${size}"
  background="${background}"
  texture="${texture}"
  width="${width}"
  height="${height}"
></logo-generator>`;

    alert(code); // Display the code in an alert for simplicity
  }

  onMouseDown(event) {
    this.isDragging = true;
    const logoElement = this.shadowRoot.getElementById("logo");
    const rect = logoElement.getBoundingClientRect();
    this.offset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  onMouseMove(event) {
    if (this.isDragging) {
      const logoElement = this.shadowRoot.getElementById("logo");
      const containerElement = this.shadowRoot.getElementById("logoContainer");
      const containerRect = containerElement.getBoundingClientRect();
  
      let left = event.clientX - containerRect.left - this.offset.x;
      let top = event.clientY - containerRect.top - this.offset.y;
  
      // Limiter le mouvement à l'intérieur du conteneur
      left = Math.max(0, Math.min(left, containerRect.width - logoElement.offsetWidth));
      top = Math.max(0, Math.min(top, containerRect.height - logoElement.offsetHeight));
  
      logoElement.style.position = "absolute";
      logoElement.style.left = `${left}px`;
      logoElement.style.top = `${top}px`;
    }
  }

  onMouseUp() {
    this.isDragging = false;
  }
}

customElements.define("logo-generator", LogoGenerator);