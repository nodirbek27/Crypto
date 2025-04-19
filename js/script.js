// Elementlar
const tableBody = document.getElementById("crypto-body");
const prevPageBtn = document.getElementById("previous-page");
const nextPageBtn = document.getElementById("next-page");
const pageNumber = document.getElementById("page-number");

// Pagination
let currentPage = 1;
let totalPage = 10;

// Get data
async function getData(page) {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=gecko_desc&per_page=10&page=${page}&sparkline=false&price_change_percentage=24h`
    );
    const datas = await response.json();
    createTable(datas);
    console.log(datas);
  } catch (err) {
    console.error(err);
  }
}
getData(currentPage);

// Create table
function createTable(datas) {
  tableBody.innerHTML = "";
  datas.forEach((data) => {
    const row = document.createElement("tr");
    // Coin Name
    const coinNameWrapper = document.createElement("td");
    coinNameWrapper.innerHTML = `
    <div id="coinNameWrapper">
      <img src=${data.image} id="coin-image" alt=${data.id} />
      <div id="coinSymbolWrapper">
        <span id="coin-symbol">${data.symbol.toUpperCase()}</span>
        <span id="coin-id">${data.id}</span>
      </div>
    </div>
    `;
    row.appendChild(coinNameWrapper);

    // Coin price
    const coinPrice = document.createElement("td");
    coinPrice.textContent = data.current_price;
    row.appendChild(coinPrice);

    // Coin 24h Change
    const coinChange = document.createElement("td");
    coinChange.textContent = `${data.price_change_percentage_24h * 100}%`;
    if (data.price_change_percentage_24h < 0) {
      coinChange.style.color = "red";
    } else {
      coinChange.style.color = "green";
    }
    row.appendChild(coinChange);

    // Coin Market Cap
    const coinMarketCap = document.createElement("td");
    coinMarketCap.textContent = data.market_cap;
    row.appendChild(coinMarketCap);

    tableBody.appendChild(row);
  });
}

// Pagination buttonlar
prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    getData(currentPage);
  }
});

for (i = 1; i <= totalPage; i++) {
  const pageNumberBtn = document.createElement("span");
  pageNumberBtn.style.width = "32px";
  pageNumberBtn.style.height = "32px";
  pageNumberBtn.textContent = i;
  pageNumberBtn.addEventListener("click", () => {
    currentPage = pageNumberBtn.textContent;
    getData(currentPage)
  });
  if (currentPage == pageNumberBtn.textContent) {
      pageNumberBtn.style.backgroundColor = "rgba(255,255,255,0.16)";
      pageNumberBtn.style.borderRadius = "50%";
  }
  pageNumber.appendChild(pageNumberBtn);
}

nextPageBtn.addEventListener("click", () => {
  if (currentPage < totalPage) {
    currentPage++;
    getData(currentPage);
  }
});
