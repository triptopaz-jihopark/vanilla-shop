// 연습용 상품 목록. API 연동 전까지 임시로 사용.
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
// join("")을 빼면 배열이 문자열로 변환될 때 쉼표가 들어간다.

productList.innerHTML = sampleProducts.map((product) => createProductCard(product)).join("");
