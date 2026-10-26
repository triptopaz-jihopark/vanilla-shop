// 상품 목록 렌더링 흐름
// 1. createProductCard — 상품 객체를 받아 카드 HTML 문자열을 돌려준다
// 2. loadProducts      — API를 호출하고 응답을 두 번 벗긴 뒤 상품 배열을 반환한다
// 3. render            — 배열을 map으로 카드 HTML로 바꾸고 join으로 합쳐 삽입한다

// [1-12 재료] 참조/값 실습용 샘플 데이터. 렌더링에는 더 이상 쓰지 않음
const sampleProducts = [
    {
        id: 1,
        thumbnail: "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp",
        brand: "Essence",
        title: "Essence Mascara Lash Princess",
        price: 9.99,
        rating: 2.56,
        reviews: [{}, {}, {}],
    },
    {
        id: 2,
        thumbnail: "https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp",
        brand: "Glamour Beauty",
        title: "Eyeshadow Palette with Mirror",
        price: 19.99,
        rating: 3.56,
        reviews: [{}, {}, {}],
    },
    {
        id: 3,
        thumbnail: "https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp",
        brand: "Glamour Beauty",
        title: "Eyeshadow Palette with Mirror",
        price: 29.99,
        rating: 3.56,
        reviews: [{}, {}, {}],
    },
];

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
        </li>
    `;
}

const productList = document.querySelector(".product-list");

// 상품 배열 -> 카드 HTML 배열 -> 하나의 문자열로 삽입
// productList.innerHTML = sampleProducts.map((product) => createProductCard(product)).join("");

// async/await
async function loadProducts() {
    const response = await fetch("https://dummyjson.com/products");
    const data = await response.json();
    return data.products;
}

// 상품 랜더링 rendering
// join("")을 빼면 배열이 문자열로 변환될 때 쉼표가 들어간다.
async function render() {
    const products = await loadProducts();
    productList.innerHTML = products.map((product) => createProductCard(product)).join("");
}
render();
