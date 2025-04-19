// Elementlar
const watchlistBtn = document.getElementById("watchlist-button");
const watchlistSidebar = document.getElementById("watchlist-sidebar");

// Sidebar ochish/yopish toggle
watchlistBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  watchlistSidebar.style.width = "511px";
  document.body.style.overflow = "hidden";
});

// Tashqarida bosilganda sidebar yopish
document.addEventListener("click", (event) => {
  if (!watchlistSidebar.contains(event.target)) {
    watchlistSidebar.style.width = "0";
    document.body.style.overflow = "auto";
  }
});

// Watchlistga qo‘shish
function addToWatchlist(coin) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  if (!watchlist.some((item) => item.id === coin.id)) {
    watchlist.push(coin);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    renderWatchlist();
  }
}

// Watchlistdan o‘chirish
function removeFromWatchlist(coinId) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  watchlist = watchlist.filter((item) => item.id !== coinId);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  renderWatchlist();
}

// Watchlistni ko‘rsatish
function renderWatchlist() {
  const watchlistBody = document.getElementById("watchlist-sidebar-body");
  watchlistBody.innerHTML = "";
  const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  if (watchlist.length === 0) {
    watchlistBody.innerHTML = "<p>Watchlist bo‘sh</p>";
    return;
  }

  watchlist.forEach((coin) => {
    const coinDiv = document.createElement("div");
    coinDiv.style.padding = "10px";
    coinDiv.style.borderBottom = "1px solid #fff";
    coinDiv.innerHTML = `
      <img src="${coin.image}" alt="${
      coin.id
    }" style="width: 24px; vertical-align: middle;" />
      <span>${coin.symbol.toUpperCase()} - ${coin.id}</span>
      <button style="float: right; cursor: pointer;" onclick="removeFromWatchlist('${
        coin.id
      }')">Remove</button>
    `;
    watchlistBody.appendChild(coinDiv);
  });
}

// Ilova ishga tushganda watchlistni yuklash
renderWatchlist();
