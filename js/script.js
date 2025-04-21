// Elementlar
const tableBody = document.getElementById("crypto-body");
const prevPageBtn = document.getElementById("previous-page");
const nextPageBtn = document.getElementById("next-page");
const pageNumber = document.getElementById("page-number");
const searchInput = document.getElementById("search-input");
const currencySelect = document.getElementById("currency");

// Pagination
let currentPage = 1;
let totalPage = 10;
let currentData = [];
let currentCurrency = "usd";

// Ma'lumotlarni olish
async function getData(page, currency) {
  try {
    tableBody.innerHTML = "";
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=gecko_desc&per_page=10&page=${page}&sparkline=false&price_change_percentage=24h`
    );
    if (response.ok) {
      const datas = await response.json();
      currentData = datas;
      createTable(datas);
      updatePagination();
      getWatchlist(currentCurrency);
    }
  } catch (err) {
    console.error(err);
  }
}
getData(currentPage, currentCurrency);

// Jadval yaratish
function createTable(datas) {
  tableBody.innerHTML = "";
  // Qidiruv
  const filteredData = searchInput.value
    ? datas.filter(
        (data) =>
          data.id.includes(searchInput.value) ||
          data.symbol.includes(searchInput.value)
      )
    : datas;
  if (filteredData.length === 0) {
    return (tableBody.innerHTML = `<tr><td colspan="4" style="color: red;"><i>Bunday coin topilmadi!</i></td></tr>`);
  }

  filteredData.forEach((data) => {
    const row = document.createElement("tr");
    // Coin Name
    const coinNameWrapper = document.createElement("td");
    coinNameWrapper.innerHTML = `
      <div id="coinNameWrapper">
        <img src="${data.image}" id="coin-image" alt="${data.id}" />
        <div id="coinSymbolWrapper">
          <span id="coin-symbol">${data.symbol.toUpperCase()}</span>
          <span id="coin-id">${data.id}</span>
        </div>
      </div>`;
    row.appendChild(coinNameWrapper);
    // Coin Price
    const coinPrice = document.createElement("td");
    coinPrice.textContent = data.current_price.toLocaleString("en-US", {
      style: "currency",
      currency: currentCurrency.toUpperCase(),
    });
    row.appendChild(coinPrice);

    // Coin 24h Change
    const coinChange = document.createElement("td");
    const coinChangeDiv = document.createElement("div");
    // Coin Change eye
    const watchlist = JSON.parse(localStorage.getItem("watchlist"));
    const coinChangeEye = document.createElement("img");
    coinChangeEye.src = watchlist.some((coin) => coin.id === data.id)
      ? "../images/icons/eye_green.png"
      : "../images/icons/eye.png";
    coinChangeEye.style.cursor = "pointer";
    // Coin Change Percent
    const coinChangePercent = document.createElement("span");
    coinChangePercent.textContent = `${
      data.price_change_percentage_24h > 0 ? "+" : ""
    }${data.price_change_percentage_24h.toFixed(2)}%`;
    coinChangePercent.style.color =
      data.price_change_percentage_24h < 0 ? "red" : "green";
    coinChangePercent.style.width = "70px";
    coinChangeDiv.appendChild(coinChangeEye);
    coinChangeDiv.appendChild(coinChangePercent);
    coinChangeDiv.style.display = "flex";
    coinChangeDiv.style.alignItems = "center";
    coinChangeDiv.style.justifyContent = "end";
    coinChange.appendChild(coinChangeDiv);
    row.appendChild(coinChange);
    coinChangeEye.addEventListener("click", (e) => {
      e.stopPropagation();
      saveToLocalStorage(data);
      getWatchlist(currentCurrency);
    });

    // Coin Market Cap
    const coinMarketCap = document.createElement("td");
    coinMarketCap.textContent = data.market_cap.toLocaleString("en-US", {
      style: "currency",
      currency: currentCurrency.toUpperCase(),
    });
    row.appendChild(coinMarketCap);
    tableBody.appendChild(row);
  });
}

// Currency
currencySelect.addEventListener("change", () => {
  currentCurrency = currencySelect.value;
  getData(currentPage, currentCurrency);
});

// Qidiruv
searchInput.addEventListener("input", () => {
  createTable(currentData);
});

// Pagination tugmalarini yangilash
function updatePagination() {
  pageNumber.innerHTML = "";
  for (let i = 1; i <= totalPage; i++) {
    const pageNumberBtn = document.createElement("span");
    pageNumberBtn.style.width = "32px";
    pageNumberBtn.style.height = "32px";
    pageNumberBtn.style.display = "inline-flex";
    pageNumberBtn.style.alignItems = "center";
    pageNumberBtn.style.justifyContent = "center";
    pageNumberBtn.style.cursor = "pointer";
    pageNumberBtn.textContent = i;
    if (i === currentPage) {
      pageNumberBtn.style.backgroundColor = "rgba(255,255,255,0.16)";
      pageNumberBtn.style.borderRadius = "50%";
    }
    pageNumberBtn.addEventListener("click", () => {
      currentPage = i;
      getData(currentPage, currentCurrency);
    });
    pageNumber.appendChild(pageNumberBtn);
  }
}

// Pagination tugmalari
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    getData(currentPage, currentCurrency);
  }
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < totalPage) {
    currentPage++;
    getData(currentPage, currentCurrency);
  }
});

// -------- Watchlist ----------
// Elementlar
const watchlistBtn = document.getElementById("watchlist-button");
const watchlistSidebar = document.getElementById("watchlist-sidebar");

// Sidebar ochish/yopish
watchlistBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  watchlistSidebar.style.width = "511px";
  document.body.style.overflow = "hidden";
});

// Sidebar yopish
document.addEventListener("click", (event) => {
  if (!watchlistSidebar.contains(event.target)) {
    watchlistSidebar.style.width = "0";
    document.body.style.overflow = "auto";
  }
});

// Watchlistga qo‘shish
function saveToLocalStorage(coin) {
  if (!coin || !coin.id) {
    console.error("Error:", coin);
    return;
  }
  let selectedCoins = JSON.parse(localStorage.getItem("watchlist"));
  if (!selectedCoins.some((item) => item.id === coin.id)) {
    selectedCoins.push(coin);
    localStorage.setItem("watchlist", JSON.stringify(selectedCoins));
  }
}

// Watchlistdan o‘chirish
function removeFromWatchlist(coinId) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist"));
  watchlist = watchlist.filter((item) => item.id !== coinId);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  getWatchlist(currentCurrency);
}

// Watchlistni ko‘rsatish
function getWatchlist(currentCurrency) {
  const watchlistBody = document.getElementById("watchlist-sidebar-body");
  const watchlistCoins = document.getElementById("watchlist-coins");
  watchlistBody.innerHTML = "";
  watchlistCoins.innerHTML = "";
  const watchlist = JSON.parse(localStorage.getItem("watchlist"));

  watchlist.forEach((coin) => {
    // --- Watchlist sidebar body ---
    const coinDiv = document.createElement("div");
    coinDiv.style.display = "flex";
    coinDiv.style.flexDirection = "column";
    coinDiv.style.alignItems = "center";
    coinDiv.style.width = "198px";
    coinDiv.style.height = "248px";
    coinDiv.style.padding = "15px";
    coinDiv.style.backgroundColor = "#14161a";
    coinDiv.style.borderRadius = "25px";
    // Image
    const coinDivImg = document.createElement("img");
    coinDivImg.src = coin.image;
    coinDivImg.style.width = "120px";
    coinDivImg.style.height = "120px";
    coinDivImg.style.marginBottom = "35px";
    coinDiv.appendChild(coinDivImg);

    // Price
    const coinDivPrice = document.createElement("span");
    coinDivPrice.textContent = coin.current_price.toLocaleString("en-US", {
      style: "currency",
      currency: currentCurrency.toUpperCase(),
    });
    coinDivPrice.style.color = "#fff";
    coinDivPrice.style.marginBottom = "15px";
    coinDiv.appendChild(coinDivPrice);
    const coinDivRemoveBtn = document.createElement("button");
    coinDivRemoveBtn.style.backgroundColor = "#ff0000";
    coinDivRemoveBtn.style.padding = "4px 16px";
    coinDivRemoveBtn.style.color = "#fff";
    coinDivRemoveBtn.textContent = "Remove";
    coinDivRemoveBtn.style.cursor = "pointer";
    coinDiv.appendChild(coinDivRemoveBtn);
    coinDivRemoveBtn.addEventListener("click", () => {
      removeFromWatchlist(coin.id);
    });
    watchlistBody.style.display = "flex";
    watchlistBody.style.alignItems = "center";
    watchlistBody.style.flexWrap = "wrap";
    watchlistBody.style.gap = "20px";

    watchlistBody.appendChild(coinDiv);

    // --- Watchlist hero ---
    const coinDivHero = document.createElement("div");
    coinDivHero.style.display = "flex";
    coinDivHero.style.flexDirection = "column";
    coinDivHero.style.alignItems = "center";
    // Image
    const coinDivHeroImg = document.createElement("img");
    coinDivHeroImg.src = coin.image;
    coinDivHeroImg.style.width = "80px";
    coinDivHeroImg.style.height = "80px";
    coinDivHeroImg.style.marginBottom = "10px";
    coinDivHero.appendChild(coinDivHeroImg);

    const coinChangeDiv = document.createElement("div");
    // Coin Name
    const coinChangeName = document.createElement("span");
    coinChangeName.textContent = coin.symbol;
    coinChangeName.style.color = "#fff";
    coinChangeName.style.textTransform = "uppercase";
    coinChangeName.style.marginRight = "4px";
    // Coin Change Percent
    const coinChangePercent = document.createElement("span");
    coinChangePercent.textContent = `${
      coin.price_change_percentage_24h > 0 ? "+" : ""
    }${coin.price_change_percentage_24h.toFixed(2)}%`;
    coinChangePercent.style.color =
      coin.price_change_percentage_24h < 0 ? "red" : "green";
    coinChangePercent.style.width = "70px";
    coinChangeDiv.style.marginBottom = "4px";
    coinChangeDiv.appendChild(coinChangeName);
    coinChangeDiv.appendChild(coinChangePercent);
    coinDivHero.appendChild(coinChangeDiv);
    // Price
    const coinDivHeroPrice = document.createElement("span");
    coinDivHeroPrice.style.fontSize = "22px";
    coinDivHeroPrice.style.fontWeight = "500";
    coinDivHeroPrice.textContent = coin.current_price.toLocaleString("en-US", {
      style: "currency",
      currency: currentCurrency.toUpperCase(),
    });
    coinDivHeroPrice.style.color = "#fff";
    coinDivHeroPrice.style.marginBottom = "15px";
    coinDivHero.appendChild(coinDivHeroPrice);
    watchlistCoins.style.display = "flex";
    watchlistCoins.style.alignItems = "center";
    watchlistCoins.style.justifyContent = "space-around";
    watchlistCoins.appendChild(coinDivHero);
  });
}

getWatchlist(currentCurrency);
