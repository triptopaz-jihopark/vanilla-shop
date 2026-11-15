// ── 1. 요소 ──────────────────────
const productList = document.querySelector(".product-list");
const cartCounter = document.querySelector(".cart-button__count");

// ── 2. 상태 ──────────────────────
let products = [];
let cart = [];

// ── 3. 함수 ──────────────────────
function createProductCard(product) {
    return `
         <li class="product-card" data-id="${product.id}">
            <div class="product-card__thumb">
                <img class="product-card__image"
                        src="${product.thumbnail}"
                        alt="${product.title}"
                        width="300" height="300"
                        loading="lazy" decoding="async">
            </div>

            <p class="product-card__brand">${product.brand}</p>
            <h3 class="product-card__name">${product.title}</h3>

            <div class="product-card__price-row">
                <strong class="product-card__price">$${product.price}</strong>
            </div>

            <p class="product-card__rating">
                <span class="product-card__star" aria-hidden="true">★</span>
                <span class="product-card__score">${product.rating}</span>
                <span class="product-card__review-count">리뷰 ${product.reviews.length}</span>
            </p>
            <button class="product-card__add" type="button" data-id="${product.id}">담기</button>
        </li>
    `;
}

// 상품 API 호출
async function loadProducts() {
    const response = await fetch("https://dummyjson.com/products");

    if (!response.ok) {
        throw new Error(`상품 목록 요청 실패 (${response.status})`);
    }

    const data = await response.json();
    return data.products;
}

// 상품 렌더링
async function render() {
    productList.innerHTML = `<li class="product-list__loading">불러오는 중...</li>`;
    try {
        products = await loadProducts();

        productList.innerHTML = products.map((product) => createProductCard(product)).join("");
    } catch (error) {
        console.error(error);
        productList.innerHTML = `<li class="product-list__error">상품 리스트를 불러올 수 없습니다.</li>`;
    }
}

function handleProductListClick(event) {
    const clicked = event.target;

    if (clicked.classList.contains("product-card__add")) {
        const productId = Number(clicked.dataset.id);
        const product = products.find((p) => p.id === productId);
        const cartItem = cart.find((item) => item.id === productId);
        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            cart.push({...product, quantity: 1});
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
    }
}

// 뱃지는 상품 종류 수를 표시한다. 수량은 장바구니 상세에서 품목별로 보여준다.
function updateCartCount() {
    cartCounter.textContent = cart.length;
}

// ── 4. 시작 ──────────────────────
function init() {
    productList.addEventListener("click", handleProductListClick);
    render();

    cart = JSON.parse(localStorage.getItem("cart")) ?? [];
    updateCartCount();
}

init();
