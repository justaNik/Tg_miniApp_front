import { api } from './api.js';

window.Telegram.WebApp.expand();

// Элементы DOM
const authPage = document.querySelector(".container");
const homePage = document.getElementById("home-page");
const profilePage = document.getElementById("profile-page");
const profileNickname = document.getElementById("profile-nickname");
const gamesList = document.getElementById("games-list");
const profileActions = document.getElementById("profile-actions");
const settingsPage = document.getElementById("settings-page");
const newGameInput = document.getElementById("new-game");
const addGameBtn = document.getElementById("add-game-btn");
const backBtn = document.getElementById("back-btn");
const settingsBackBtn = document.getElementById("settings-back-btn");
const buyPremiumBtn = document.getElementById("buy-premium-btn");

// Кнопки навигации
const homeBtn = document.getElementById("home-btn");
const profileBtn = document.getElementById("profile-btn");
const settingsNavBtn = document.getElementById("settings-nav-btn");
const findPartnersBtn = document.getElementById("find-partners-btn");

// Состояние приложения
let currentUser = null;
let pageHistory = [];

// Инициализация приложения
async function initApp() {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      currentUser = await api.getCurrentUser();
      showPage('home-page');
      await renderCards();
    } catch (error) {
      console.error('Init error:', error);
      localStorage.removeItem('token');
      showPage('container');
    }
  }
}

// Навигация
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(pageId).classList.remove("hidden");
  pageHistory.push(pageId);
}

function goBack() {
  if (pageHistory.length > 1) {
    pageHistory.pop(); // Удаляем текущую страницу
    const prevPage = pageHistory[pageHistory.length - 1];
    showPage(prevPage);
  }
}

// Рендер карточек
async function renderCards(searchQuery = '') {
  const list = document.getElementById("cards-list");
  list.innerHTML = '<div class="loader">Loading...</div>';

  try {
    const users = await api.getUsers(searchQuery);
    list.innerHTML = '';
    
    users.forEach(user => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${user.name}</h3>
        <p>${user.description || ''}</p>
        <div class="games">${user.games.slice(0, 3).join(', ')}</div>
      `;
      card.addEventListener('click', () => openProfile(user.id));
      list.appendChild(card);
    });
  } catch (error) {
    list.innerHTML = '<div class="error">Failed to load users</div>';
  }
}

// Профиль пользователя
async function openProfile(userId, isCurrent = false) {
  try {
    const user = await api.getUserProfile(userId);
    
    profileNickname.value = user.name;
    gamesList.innerHTML = user.games.map(game => `
      <div class="game-item">
        ${game}
        ${isCurrent ? '<button class="remove-game">×</button>' : ''}
      </div>
    `).join('');

    profileActions.classList.toggle("hidden", !isCurrent);
    buyPremiumBtn.style.display = isCurrent ? 'block' : 'none';
    showPage("profile-page");
  } catch (error) {
    alert("Failed to load profile");
  }
}

// Регистрация
document.getElementById("sign-up").addEventListener("click", async () => {
  const nickname = document.getElementById("gaming-nickname").value.trim();
  const telegramNick = document.getElementById("telegram-nickname").value.trim();
  const termsChecked = document.getElementById("terms").checked;

  if (!nickname || !telegramNick || !termsChecked) {
    alert("Please fill out all fields and agree to the terms.");
    return;
  }

  try {
    const response = await api.registerUser({ nickname, telegram: telegramNick });
    localStorage.setItem('token', response.token);
    currentUser = response.user;
    
    authPage.classList.add("hidden");
    homePage.classList.remove("hidden");
    await renderCards();
  } catch (error) {
    alert("Registration failed. Please try again.");
  }
});

// Поиск
document.getElementById("search").addEventListener("input", async (e) => {
  await renderCards(e.target.value);
});

// Добавление игры
addGameBtn.addEventListener("click", async () => {
  const game = newGameInput.value.trim();
  if (!game) return;

  try {
    await api.updateUserGames(currentUser.id, [...currentUser.games, game]);
    currentUser.games.push(game);
    await openProfile(currentUser.id, true);
    newGameInput.value = '';
  } catch (error) {
    alert("Failed to add game");
  }
});

// Покупка премиума
buyPremiumBtn.addEventListener("click", () => {
  window.Telegram.WebApp.showAlert("Функция оплаты будет реализована позже");
});

// Навигация
homeBtn.addEventListener("click", () => {
  showPage("home-page");
});

profileBtn.addEventListener("click", () => {
  if (currentUser) openProfile(currentUser.id, true);
});

settingsNavBtn.addEventListener("click", () => {
  showPage("settings-page");
});

findPartnersBtn.addEventListener("click", () => {
  showPage("home-page");
  renderCards();
});

backBtn.addEventListener("click", goBack);
settingsBackBtn.addEventListener("click", goBack);

// Тема
const toggleDark = document.getElementById("toggle-dark");
function applyTheme() {
  const dark = localStorage.getItem("darkTheme") === "true";
  document.body.classList.toggle("dark", dark);
  toggleDark.checked = dark;
}
toggleDark.addEventListener("change", () => {
  localStorage.setItem("darkTheme", toggleDark.checked);
  applyTheme();
});
applyTheme();

// Инициализация
initApp();