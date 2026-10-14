# 상품 카드 사용 필드

dummyjson `/products` 응답 중 상품 카드에 사용할 필드를 정리한다.

## 응답 구조

상품 배열은 최상위에 바로 오지 않고 `products` 키 안에 들어있다.

```json
{
  "products": [ { /* 상품 */ }, { /* 상품 */ } ],
  "total": 194,
  "skip": 0,
  "limit": 30
}
```

## 사용 필드

| 필드 | 타입 | 용도 |
|---|---|---|
| `id` | number | 상품 식별. 화면에 노출하지 않고 `data-id`로 보관하며, M2 장바구니에서 사용한다 |
| `thumbnail` | string | 카드 이미지 |
| `brand` | string | 브랜드명 |
| `title` | string | 상품명 |
| `price` | number | 가격 |
| `rating` | number | 별점 |
| `reviews.length` | number | 리뷰 수 |

## 주의할 점

- **`images`가 아니라 `thumbnail`을 쓴다.** `images`는 배열이라 `images[0]`으로 꺼내야 하고, 상세 페이지용이다.
- **`reviews`는 모든 상품이 3개로 고정**이라 리뷰 수가 전부 동일하게 표시된다.
- **통화는 달러 표기를 유지한다.** 더미 데이터 실습이므로 원화 환산은 하지 않는다.

## 보류한 것

| 보류 | 이유 | 재검토 시점 |
|---|---|---|
| `discountPercentage` (할인율·할인가) | 응답에 할인가 필드가 없어 `price`와 `discountPercentage`로 직접 계산해야 한다. 소수점 처리도 필요해 M1 범위를 넘어선다 | M5 (데이터 가공) |
| 뱃지 (쿠폰/무료배송/신상품) | 해당 데이터가 응답에 없다. `warrantyInformation`, `shippingInformation`, `availabilityStatus`는 모두 문장 형태의 문자열이라 짧은 라벨로 쓰기 어렵다 | M5 (데이터 가공) |

마크업과 CSS에는 `product-card__discount`, `product-card__origin-price` 자리를 남겨두었다.
