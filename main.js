// 연습용 객체
const sampleProduct = {
  id: 1,
  thumbnail: "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp",
  brand: "Essence",
  title: "Essence Mascara Lash Princess",
  price: 9.99,
  rating: 2.56,
  reviews: [{}, {}, {}],
};

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

// console.log(createProductCard(sampleProduct));
const productList = document.querySelector(".product-list");
productList.innerHTML = createProductCard(sampleProduct);
