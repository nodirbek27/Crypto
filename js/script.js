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
    tableBody.innerHTML = `<tr><td colspan="4">Yuklanmoqda...</td></tr>`;
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=gecko_desc&per_page=10&page=${page}&sparkline=false&price_change_percentage=24h`
    );
    if (!response.ok) throw new Error("API so‘rovi muvaffaqiyatsiz");
    const datas = await response.json();
    currentData = datas;
    createTable(datas);
    updatePagination();
    console.log(datas);
  } catch (err) {
    console.error(err);
    tableBody.innerHTML = `<tr><td colspan="4">Ma'lumotlarni yuklashda xato: ${err.message}</td></tr>`;
  }
}
getData(currentPage, currentCurrency);

// Watchlistga qo‘shish
function addToWatchlist(coin) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  if (!watchlist.some((item) => item.id === coin.id)) {
    watchlist.push(coin);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    renderWatchlist();
  }
}

// Jadval yaratish
function createTable(datas) {
  tableBody.innerHTML = "";

  // Qidiruv filtri
  const query = searchInput.value.toLowerCase();
  const filteredData = query
    ? datas.filter(
        (data) =>
          data.id.toLowerCase().includes(query) ||
          data.symbol.toLowerCase().includes(query)
      )
    : datas;

  if (filteredData.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="4">Hech narsa topilmadi</td></tr>`;
    return;
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
    const coinChangeEye = document.createElement("img");
    coinChangeEye.src = "../images/icons/eye.png";
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
      addToWatchlist(data);
      console.log(data);
      
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
