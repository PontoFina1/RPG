const defaultCharacters = [
  {
    id: 1,
    name: "Alyra Solis",
    class: "Guerreiro",
    faction: "Aliança Solar",
    level: 47,
    image: "https://images.unsplash.com/photo-1614149162883-504ce4d13909?auto=format&fit=crop&w=900&q=80",
    curiosities: "Coleciona mapas de ruínas proibidas e sempre escreve seus relatos em primeira pessoa.",
    personality: "Disciplinada, protetora e determinada. Lidera com empatia, mas mantém postura rígida em batalha.",
    skills: ["Investida Solar", "Muralha de Aço", "Voto do Guardião"],
    powerStats: { Ataque: 82, Defesa: 94, Magia: 44, Agilidade: 63, Estratégia: 79 }
  },
  {
    id: 2,
    name: "Morthen Vyx",
    class: "Mago",
    faction: "Ordem Arcana",
    level: 52,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    curiosities: "Anota variações temporais em cadernos numerados por eras.",
    personality: "Analítico e reservado. Prefere resolver conflitos com planejamento e manipulação arcana.",
    skills: ["Dobra Temporal", "Selo Etéreo", "Chuva de Cometas"],
    powerStats: { Ataque: 66, Defesa: 58, Magia: 99, Agilidade: 57, Estratégia: 95 }
  },
  {
    id: 3,
    name: "Kael Windrider",
    class: "Arqueiro",
    faction: "Clã da Névoa",
    level: 44,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    curiosities: "Consegue reconhecer trilhas apenas pelo padrão do vento e das folhas.",
    personality: "Sereno e observador. Age com precisão e evita confrontos desnecessários.",
    skills: ["Flecha Fantasma", "Passo do Falcão", "Rajada Geminada"],
    powerStats: { Ataque: 88, Defesa: 52, Magia: 40, Agilidade: 91, Estratégia: 74 }
  }
];

const characters = JSON.parse(localStorage.getItem("rpg_characters") || "null") || defaultCharacters;
const forums = JSON.parse(localStorage.getItem("rpg_forums") || "{}");

const dom = {
  grid: document.getElementById("characterGrid"),
  classFilter: document.getElementById("classFilter"),
  factionFilter: document.getElementById("factionFilter"),
  roleSelect: document.getElementById("roleSelect"),
  catalogView: document.getElementById("catalogView"),
  bookView: document.getElementById("bookView"),
  emptyState: document.getElementById("emptyState"),
  backButton: document.getElementById("backButton"),
  saveAdminChanges: document.getElementById("saveAdminChanges"),
  imageInput: document.getElementById("imageInput"),
  personalityInput: document.getElementById("personalityInput"),
  imageLabel: document.getElementById("imageLabel"),
  personalityLabel: document.getElementById("personalityLabel"),
  bookImage: document.getElementById("bookImage"),
  bookName: document.getElementById("bookName"),
  bookClass: document.getElementById("bookClass"),
  bookFaction: document.getElementById("bookFaction"),
  bookLevel: document.getElementById("bookLevel"),
  bookCuriosities: document.getElementById("bookCuriosities"),
  bookPersonality: document.getElementById("bookPersonality"),
  bookSkills: document.getElementById("bookSkills"),
  tabs: document.querySelectorAll(".tab-button"),
  tabPanels: document.querySelectorAll(".tab-content"),
  forumForm: document.getElementById("forumForm"),
  forumTitle: document.getElementById("forumTitle"),
  forumContent: document.getElementById("forumContent"),
  forumList: document.getElementById("forumList"),
  statsChart: document.getElementById("statsChart"),
  powerBars: document.getElementById("powerBars")
};

let currentCharacterId = null;
let currentRole = "user";

function persistCharacters() {
  localStorage.setItem("rpg_characters", JSON.stringify(characters));
}

function persistForums() {
  localStorage.setItem("rpg_forums", JSON.stringify(forums));
}

function renderCatalog() {
  const selectedClass = dom.classFilter.value;
  const selectedFaction = dom.factionFilter.value;
  const filtered = characters.filter((c) => (selectedClass === "all" || c.class === selectedClass) && (selectedFaction === "all" || c.faction === selectedFaction));

  dom.grid.innerHTML = "";
  filtered.forEach((c) => {
    const card = document.createElement("button");
    card.className = "character-card";
    card.type = "button";
    card.innerHTML = `
      <img src="${c.image}" alt="Retrato de ${c.name}" loading="lazy" />
      <div class="card-content">
        <h2>${c.name}</h2>
        <div class="tags">
          <span class="tag">${c.class}</span>
          <span class="tag">${c.faction}</span>
        </div>
      </div>`;
    card.addEventListener("click", () => openBook(c.id));
    dom.grid.appendChild(card);
  });

  dom.emptyState.classList.toggle("hidden", filtered.length > 0);
}

function updateAdminVisibility() {
  const visible = currentRole === "admin";
  [dom.imageInput, dom.personalityInput, dom.imageLabel, dom.personalityLabel, dom.saveAdminChanges].forEach((el) => el.classList.toggle("hidden", !visible));
}

function renderPowerBars(character) {
  dom.powerBars.innerHTML = "";
  Object.entries(character.powerStats).forEach(([name, value]) => {
    const row = document.createElement("div");
    row.className = "power-row";
    row.innerHTML = `<span>${name}</span><div class="power-track"><div class="power-fill" style="width:${value}%"></div></div><strong>${value}</strong>`;
    dom.powerBars.appendChild(row);
  });
}

function drawRadar(character) {
  const ctx = dom.statsChart.getContext("2d");
  const entries = Object.entries(character.powerStats);
  const cx = 160;
  const cy = 110;
  const r = 80;
  ctx.clearRect(0, 0, dom.statsChart.width, dom.statsChart.height);

  for (let layer = 1; layer <= 4; layer += 1) {
    ctx.beginPath();
    entries.forEach((_, i) => {
      const angle = ((Math.PI * 2) / entries.length) * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * ((r / 4) * layer);
      const y = cy + Math.sin(angle) * ((r / 4) * layer);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = "#d1b78c";
    ctx.stroke();
  }

  entries.forEach(([label], i) => {
    const angle = ((Math.PI * 2) / entries.length) * i - Math.PI / 2;
    const x = cx + Math.cos(angle) * (r + 15);
    const y = cy + Math.sin(angle) * (r + 15);
    ctx.fillStyle = "#523a21";
    ctx.font = "12px Inter";
    ctx.fillText(label, x - 20, y + 4);
  });

  ctx.beginPath();
  entries.forEach(([_, value], i) => {
    const angle = ((Math.PI * 2) / entries.length) * i - Math.PI / 2;
    const radius = (value / 100) * r;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = "rgba(245,185,66,.45)";
  ctx.strokeStyle = "#9f6f24";
  ctx.fill();
  ctx.stroke();
}

function renderForum(characterId) {
  const list = forums[characterId] || [];
  dom.forumList.innerHTML = "";

  list.forEach((topic) => {
    const item = document.createElement("li");
    item.className = "forum-item";
    item.innerHTML = `
      <button class="delete-topic ${currentRole === "admin" ? "" : "hidden"}" data-id="${topic.id}" type="button">remover</button>
      <h4>${topic.title}</h4>
      <p>${topic.content}</p>
      <span class="forum-meta">por ${topic.author} · ${topic.createdAt}</span>
    `;
    dom.forumList.appendChild(item);
  });

  dom.forumList.querySelectorAll(".delete-topic").forEach((button) => {
    button.addEventListener("click", () => {
      forums[characterId] = (forums[characterId] || []).filter((topic) => topic.id !== button.dataset.id);
      persistForums();
      renderForum(characterId);
    });
  });
}

function openBook(characterId) {
  const character = characters.find((item) => item.id === characterId);
  if (!character) return;

  currentCharacterId = characterId;
  dom.bookImage.src = character.image;
  dom.bookImage.alt = `Retrato de ${character.name}`;
  dom.bookName.textContent = character.name;
  dom.bookClass.textContent = character.class;
  dom.bookFaction.textContent = character.faction;
  dom.bookLevel.textContent = character.level;
  dom.bookCuriosities.textContent = character.curiosities;
  dom.bookPersonality.textContent = character.personality;
  dom.bookSkills.innerHTML = character.skills.map((skill) => `<li>${skill}</li>`).join("");

  dom.imageInput.value = character.image;
  dom.personalityInput.value = character.personality;
  renderPowerBars(character);
  drawRadar(character);
  renderForum(characterId);
  updateAdminVisibility();

  dom.catalogView.classList.add("hidden");
  dom.bookView.classList.remove("hidden");
}

function activateTab(tabName) {
  dom.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabName));
  dom.tabPanels.forEach((panel) => panel.classList.toggle("hidden", panel.id !== `tab-${tabName}`));
}

function saveAdminChanges() {
  if (currentRole !== "admin") return;
  const character = characters.find((item) => item.id === currentCharacterId);
  if (!character) return;

  character.image = dom.imageInput.value.trim() || character.image;
  character.personality = dom.personalityInput.value.trim() || character.personality;
  persistCharacters();
  openBook(character.id);
  renderCatalog();
}

function createForumTopic(event) {
  event.preventDefault();
  if (!currentCharacterId) return;

  const title = dom.forumTitle.value.trim();
  const content = dom.forumContent.value.trim();
  if (!title || !content) return;

  const topic = {
    id: crypto.randomUUID(),
    title,
    content,
    author: currentRole === "admin" ? "Admin" : "Usuário",
    createdAt: new Date().toLocaleString("pt-BR")
  };

  forums[currentCharacterId] = [topic, ...(forums[currentCharacterId] || [])];
  persistForums();
  dom.forumForm.reset();
  renderForum(currentCharacterId);
}

dom.classFilter.addEventListener("change", renderCatalog);
dom.factionFilter.addEventListener("change", renderCatalog);
dom.roleSelect.addEventListener("change", () => {
  currentRole = dom.roleSelect.value;
  updateAdminVisibility();
  if (currentCharacterId) renderForum(currentCharacterId);
});
dom.backButton.addEventListener("click", () => {
  dom.bookView.classList.add("hidden");
  dom.catalogView.classList.remove("hidden");
});
dom.saveAdminChanges.addEventListener("click", saveAdminChanges);
dom.tabs.forEach((tab) => tab.addEventListener("click", () => activateTab(tab.dataset.tab)));
dom.forumForm.addEventListener("submit", createForumTopic);

activateTab("curiosidades");
renderCatalog();
