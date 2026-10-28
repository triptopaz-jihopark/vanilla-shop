# 학습 메모

## 스크립트 로딩 방식 — `defer` / `async` / 옵션 없음 (M1-4a)

### 전제

- 브라우저는 HTML을 위에서 아래로 읽으며 화면을 만든다 (**파싱**)
- `<script src="...">`를 만나면 **다운로드**(파일 받기)와 **실행**(코드 돌리기) 두 단계가 필요하다
- **HTML 파싱과 JS 실행은 동시에 할 수 없다.** 다만 다운로드는 네트워크가 하므로 파싱과 병행 가능하다
- `defer` / `async`는 **`src`가 있는 외부 스크립트에만** 적용된다. 인라인 스크립트에는 효과가 없다

### 세 가지 동작

**옵션 없음** — 파싱 중 스크립트 태그를 만나면 파싱이 멈추고, 다운로드 후 실행한다. 파일이 크거나 네트워크가 느리면 사용자는 화면이 멈춘 것처럼 느낀다.

**async** — 다운로드를 네트워크에 맡기고 파싱은 계속한다. 다운로드가 끝나면 **그 즉시** 파싱을 멈추고 실행한다. 파일이 여러 개면 **먼저 받아진 것부터** 실행되므로 순서가 보장되지 않는다.

**defer** — 다운로드를 네트워크에 맡기고 파싱은 계속한다. 먼저 받아졌어도 **파싱이 완전히 끝난 뒤** 실행한다. 파일이 여러 개면 다운로드는 동시에 진행되지만 **실행은 태그 작성 순서대로** 이루어진다.

### 비교

|                             | 옵션 없음 | async | defer              |
| --------------------------- | --------- | ----- | ------------------ |
| 다운로드 중 파싱이 멈추는가 | O         | X     | X                  |
| 실행 중 파싱이 멈추는가     | O         | O     | X (멈출 파싱 없음) |
| 순서가 보장되는가           | O         | X     | O                  |

```
         시간 →
[1] 옵션 없음
HTML 파싱   ---         ---     ▼ 화면 완성
다운로드         ---
실행                ---

[2] async
HTML 파싱   ------     ---      ▼ 화면 완성
다운로드     ------
실행               ---

[3] defer
HTML 파싱   ---------    ▼ 화면 완성
다운로드     ------
실행                 ---
```

### 결론

- **`defer`가 화면을 가장 빨리 보여준다.** 파싱을 한 번도 멈추지 않기 때문
- `async`는 성능이 더 좋아서 쓰는 것이 아니라, "다른 코드와 무관하니 아무 때나 실행돼도 된다"는 선언이다. 분석 스크립트(GA)가 대표적인 경우
- `defer`의 "지연"은 **다운로드를 미루는 것이 아니라 실행**을 미룬다는 뜻이다

## 회사 `_Layout.cshtml` 확인 결과 (M1-4b)

| 위치      | 내용                                                    | 옵션        |
| --------- | ------------------------------------------------------- | ----------- |
| `head`    | 인라인 — Razor 변수를 JS 전역으로 선언                  | (해당 없음) |
| `head`    | 외부 스크립트 13개 (jQuery, swiper, moment, 자사 js 등) | **없음**    |
| `head`    | 구글 애널리틱스                                         | **`async`** |
| `body` 끝 | `site-log.js`                                           | 없음        |

**관찰**

- GA에만 `async` — 다른 코드와 무관한 분석 스크립트이므로 교과서적으로 맞는 선택
- 나머지는 `head`에 옵션 없이 있어 파싱이 그때마다 멈춘다
- 순서 의존성이 있다 (jQuery → jQuery 플러그인 → 자사 js). 그래서 `async`는 쓸 수 없다. **`defer`는 순서를 지키므로 쓸 수 있을 것으로 보이는데 붙어 있지 않다**
- 인라인 스크립트가 중간중간 섞여 있다. 외부 스크립트에만 `defer`를 붙이면 인라인이 먼저 실행되어 순서가 뒤집힌다. 이것이 미적용 이유일 가능성

**곁다리**

- `asp-append-version="true"` — 파일 해시를 쿼리스트링으로 붙여 브라우저 캐시를 무효화하는 Razor 기능
- `<script type="application/ld+json">` — 실행되는 코드가 아니라 검색엔진용 데이터. `defer`/`async`와 무관

---

## 동기 / 비동기 (M1-4c)

**동기(synchronous)** — 하나의 작업이 완전히 끝나야 다음으로 넘어간다.

**비동기(asynchronous)** — 오래 걸리는 작업을 **다른 곳에 맡겨두고** 다음 줄로 넘어간다. 맡긴 일이 끝나면 그때 돌아와서 처리한다.

### "병렬"이 아니다

JS는 일꾼이 하나다. 진짜로 두 가지를 동시에 하지는 못한다.

`setTimeout`은 JS가 시간을 세는 것이 아니라 **브라우저에게 "3초 뒤에 알려줘"라고 맡기는 것**이다. `fetch`도 네트워크에 맡긴다. 맡아주는 쪽이 JS 바깥에 있어서 JS는 손이 비는 것이지, 일꾼이 둘인 것이 아니다.

### 대표적인 예

|               | 무엇을 맡기나     |
| ------------- | ----------------- |
| `setTimeout`  | 시간              |
| `fetch`       | 네트워크 요청     |
| 이벤트 리스너 | "클릭하면 알려줘" |

셋 다 **맡겨두고 넘어간다**는 같은 구조다.

### 확인 실험

```js
console.log("1");
setTimeout(() => console.log("2"), 0);
console.log("3");
```

0초인데도 결과는 `1 → 3 → 2`. **시간이 아니라 순서의 문제다.** 맡긴 일은 지금 하던 일이 모두 끝난 뒤에야 처리된다. (원리는 이벤트 루프 — M3에서 다룬다)

### M1-5에서 만날 함정

```js
let products;
fetch("...").then((res) => {
    products = res;
});
console.log(products); // undefined
```

데이터가 도착하기 **전에** 다음 줄이 실행된다. 위 `setTimeout` 실험과 같은 일이다.
`async`/`await`는 "이건 기다렸다 가자"고 표시하는 문법이다.

---

## async / await (M1-4d)

### Q1. `await` 없이 `fetch`를 호출하면 무엇이 반환되는가

**Promise**가 반환된다.

```js
console.log(fetch('https://dummyjson.com/products'));
// Promise {<pending>}
```

Promise는 **"나중에 결과를 주겠다"는 약속 증서**다. `pending`은 아직 결과가 안 나왔다는 뜻. 증서는 받았지만 물건은 아직 안 온 상태다.

### Q2. `await`는 왜 `async` 함수 안에서만 쓸 수 있는가

`await`는 진짜로 프로그램을 멈추지 않는다. 일꾼이 하나뿐이라 진짜로 멈추면 페이지 전체가 얼어붙는다.

실제로 하는 일은 **그 함수만 일시정지시키고, 나머지 프로그램은 계속 돌게 두는 것**이다. 결과가 오면 멈췄던 자리부터 그 함수를 재개한다.

문제는 **일반 함수는 중간에 멈췄다 재개할 수 없다**는 점이다. 한번 시작하면 끝까지 달린다.

> 일반 함수는 한 번 펼치면 끝까지 읽어야 하는 책이다.
> `async` 함수는 책갈피를 꽂고 덮었다가 나중에 그 자리부터 다시 읽을 수 있는 책이다.
> `await`는 책갈피를 꽂는 행위다. 책갈피가 꽂히는 책이어야 성립한다.

`async`는 두 가지를 선언한다.

| | |
|---|---|
| ① | 이 함수는 **멈췄다 재개할 수 있다** |
| ② | 이 함수는 **Promise를 반환한다** |

②가 필요한 이유 — 함수가 중간에 멈추면 호출한 쪽은 결과를 당장 못 받는다. 아무것도 안 주면 기다릴 방법이 없으므로, "나중에 줄게"라는 약속 증서를 먼저 건네야 한다.

**실전 함정**: 파일 최상단은 `async` 함수 안이 아니다.

```js
const res = await fetch('...');   // ❌ 에러

async function loadProducts() {   // ✅ 감싸야 한다
  const res = await fetch('...');
  ...
}
loadProducts();                   // 호출도 잊지 말 것
```

### Q3. `.then()` 체이닝과 `async`/`await`는 동작이 같은가

대체로 같다. 가장 큰 차이는 **가독성**이고, `async`/`await` 쪽이 위에서 아래로 읽힌다.

다만 완전히 같지는 않다. 요청을 **여러 개 동시에** 보낼 때는 `.then()` 계열이 더 자연스러운 경우가 있다. `await`를 줄줄이 쓰면 동시에 보내도 되는 요청을 하나씩 줄 세우게 된다. 요청이 하나일 때는 신경 쓰지 않아도 된다.

---

## dummyjson 쿼리 파라미터 (M1-4e)

| 파라미터 | 역할 |
|---|---|
| `limit` | 지정한 숫자의 개수만큼만 객체를 불러온다 |
| `skip` | 지정한 숫자만큼 순서를 건너뛰고 그다음 객체부터 불러온다 |
| `select` | 객체의 프로퍼티 중 지정한 프로퍼티만 불러온다 (쉼표로 구분) |

```
https://dummyjson.com/products?limit=5
https://dummyjson.com/products?limit=5&skip=10
https://dummyjson.com/products?limit=5&select=title,price,thumbnail
```

### limit + skip = 페이지네이션

두 파라미터는 짝으로 쓰인다.

```
1페이지:  limit=30&skip=0     → 1~30번째
2페이지:  limit=30&skip=30    → 31~60번째
3페이지:  limit=30&skip=60    → 61~90번째
```

응답에 함께 오는 `total`(전체 개수)과 조합하면 총 페이지 수를 계산할 수 있다. (M5에서 사용)

### select

필요한 필드만 받으면 응답이 가벼워진다. `FIELDS.md`에 정리한 목록을 서버에 직접 요청할 수 있다는 뜻이다.

---

## await는 Promise를 벗겨낸다 (M1-5)

```js
fetch(url)          // → Promise     약속 증서
await fetch(url)    // → Response    실제 물건
```

`await`를 붙이면 Promise가 아니라 **그 안에 들어있던 값**이 나온다.

> Promise는 물품 보관증이고, `await`는 보관증을 내고 물건을 받아오는 행위다. 결과는 보관증이 아니라 물건이다.

### `await`가 두 번 필요한 이유 — Promise가 두 개다

```
① fetch(url)        →  Promise  ──await──→  Response
② response.json()   →  Promise  ──await──→  { products: [...] }
```

`.json()`은 이미 벗겨진 Response에 대고 부르는 것이고, 그 `.json()`이 **새 Promise를 또 반환**한다. 본문을 다 받아 변환하는 데 시간이 걸리기 때문이다. 그래서 두 번째 `await`로 또 벗긴다.

### 단계별로 아는 것

| 시점 | 아는 것 |
|---|---|
| `fetch(url)` 직후 | **아무것도 모름.** 요청만 떠난 상태 |
| `await fetch(url)` 이후 | 상태 코드·헤더 — 성공/실패를 안다 |
| `await response.json()` 이후 | 실제 데이터 |

이 2단계 덕분에 **본문을 받기 전에 실패를 알 수 있다.** (`response.ok`, `response.status` → M1-10에서 사용)

### 처음 틀렸던 코드

```js
const response = fetch(url);     // response = Promise
const data = response.json();    // ❌ TypeError: response.json is not a function
console.log(data);               //    (실행되지 않음)
```

Promise에는 `.json()` 메서드가 없다. **"데이터가 덜 왔다"가 아니라 "애초에 다른 타입"**이었다. 운송장에 대고 "상자 열어줘"라고 한 셈.

---

## `.then()` vs `async`/`await` (M1-6)

같은 동작을 두 문법으로 작성해 비교했다.

```js
// async / await
const response = await fetch(url);
const data = await response.json();
console.log(data);

// .then()
fetch(url)
  .then((response) => { return response.json(); })
  .then((data) => { console.log(data); });
```

### `.then()`도 Promise를 벗기는 도구다

`await`가 "벗겨서 변수에 담아줘"라면, `.then()`은 "벗겨지면 이 함수에 넣어줘"다. **`.then()` 하나가 `await` 하나에 대응**하므로, 두 번 벗기면 `.then()`도 두 개다.

`.then()` 안에서 **`return`한 값이 다음 `.then()`으로 전달**된다. Promise를 return하면 벗겨진 상태로 넘어간다. `return`을 빠뜨리면 다음 칸에 아무것도 가지 않는다.

### 차이 ① 읽는 방향

`async`/`await`는 동기 코드와 똑같이 위에서 아래로 읽힌다. `.then()`은 체인을 따라가야 한다.

### 차이 ② 변수를 쓸 수 있는 범위 — 가장 실용적인 차이

```js
// await — 둘 다 같은 스코프에 있다
const response = await fetch(url);
const data = await response.json();
// response, data 모두 접근 가능

// .then() — 콜백 안에 갇힌다
fetch(url)
  .then((response) => { return response.json(); })
  .then((data) => {
      // response는 여기서 접근 불가
  });
```

콜백의 매개변수는 그 함수 안에서만 산다. (`map`의 `product`를 바깥에서 쓰지 못했던 것과 같은 이유)

**M1-10 에러 처리에서 문제가 된다.** `response.ok`를 확인하면서 `data`도 써야 하는데, `.then()` 방식에서는 두 값이 서로 다른 함수에 흩어져 있다.

### 차이 ③ 에러 처리

| | |
|---|---|
| `async`/`await` | `try` / `catch` — 일반 코드와 동일 |
| `.then()` | 체인 끝에 `.catch()` |

### 결론

실무 기본은 `async`/`await`. `.then()`은 **읽을 줄만 알면 된다** — 오래된 코드나 라이브러리 예제에서 자주 만난다.

### 줄여 쓰기

화살표 함수는 중괄호 없이 쓰면 그 값을 자동으로 return한다.

```js
(x) => { return x * 2; }   // 길게
(x) => x * 2               // 같은 뜻

fetch(url)
  .then((response) => response.json())
  .then((data) => console.log(data));
```

---

## 멘토 메모 — Promise.all / Array.prototype (2026-10-22)

리뷰 때 멘토가 `main.js`에 남겨준 두 개의 스케치. 각각 다른 주제이며, **빠르게 적은 메모라 그대로는 동작하지 않는다.** 고쳐서 돌려보는 것 자체가 "코드를 읽고 분석하는" 연습이 된다.

### ① `Promise.all` — 여러 요청을 동시에

**문제 상황** — 서로 상관없는 요청인데 줄을 세우게 된다.

```js
const a = await fetch(url1);   // 1초
const b = await fetch(url2);   // 또 1초
const c = await fetch(url3);   // 또 1초
// 총 3초
```

**해결**

```js
const results = await Promise.all([fetch(url1), fetch(url2), fetch(url3)]);
// 총 1초
```

세 개를 동시에 출발시키고 전부 도착할 때까지 기다린다.

> 심부름 세 개를 한 사람에게 순서대로 시키는 것과, 세 명에게 동시에 보내는 것의 차이.

- 결과는 **배열로, 보낸 순서 그대로** 돌아온다 (도착 순서가 아님)
- **하나라도 실패하면 전체가 실패**한다

**원본 메모와 다른 점**

```js
Promise.all(fn1, fn2, fn3)            // ❌ 인자 3개
Promise.all([fn1(), fn2(), fn3()])    // ✅ 배열 하나 + 함수를 호출
```

`Promise.all`은 **배열 하나**를 받는다. 그리고 함수 자체가 아니라 **호출 결과(Promise)**를 넣어야 한다. `fn1`은 함수고, `fn1()`이 Promise다.

### ② `Array.prototype` — map은 어디서 오는가

**프로토타입은 모든 배열이 함께 쓰는 공용 도구 상자다.**

```js
[1,2,3].map(...)
["a","b"].map(...)
```

배열마다 `map` 복사본을 들고 있는 것이 아니다. `Array.prototype`이라는 상자에 `map`이 하나 있고, 모든 배열이 거기서 꺼내 쓴다. `map`, `filter`, `join`, `find` 전부 여기 들어있다.

> 아파트 공용 창고. 집집마다 사다리를 사두는 대신 창고에 하나 두고 꺼내 쓴다.

거기에 내 도구를 추가할 수도 있다. 멘토 메모가 그것이다.

**원본 메모와 다른 점**

```js
// 원본 — list가 undefined가 된다
Array.prototype.first = function (list) { return { ...list[0] }; };
sampleProducts.first();   // 인자 없이 호출

// 수정 — this가 호출한 배열을 가리킨다
Array.prototype.first = function () { return { ...this[0] }; };
```

메서드 안에서 **"나를 호출한 그 배열"**을 가리키는 것은 `this`다.

**진짜 포인트는 `{ ...list[0] }`**

```js
return list[0];         // 원본 객체를 그대로 돌려줌 → 받은 쪽에서 고치면 원본도 바뀜
return { ...list[0] };  // 내용을 복사한 새 객체 → 고쳐도 원본이 안전
```

멘토가 "map 안의 객체는 새로운 것이 아니다"라고 한 바로 그 지점. (→ 태스크 1-12b)

단, 스프레드도 **한 겹만** 복사한다. 객체 안에 또 객체가 있으면 그것은 여전히 공유된다. 그래서 **얕은 복사**라고 부른다.

**실무 참고** — `Array.prototype`에 메서드를 추가하는 것은 개념 설명용이고 실제 프로젝트에서는 피한다. 다른 라이브러리가 같은 이름을 쓰면 충돌하기 때문이다.

### 이어지는 곳

| 메모 | 연결 |
|---|---|
| `Promise.all` | M1-6에서 짚은 "여러 요청 동시 처리" |
| `Array.prototype` | M1-12 "배열 메서드와 참조/값" |

---

# M1-7 ~ M1-12a 정리 (2026-10-27)

## M1-7 — API 데이터로 전체 렌더링

### 구조

| 함수 | 받는 것 | 돌려주는 것 |
|---|---|---|
| `createProductCard` | 상품 객체 1개 | HTML 문자열 |
| `loadProducts` | 없음 | 상품 배열 (Promise에 싸여서) |
| `render` | 없음 | 없음 — 화면을 바꾸는 것이 목적 |

### 헷갈렸던 것 ① — `return data`가 맞나?

맞다. 다만 **`async` 함수의 반환값은 Promise에 싸여서 나온다.**

```js
const result = loadProducts();        // Promise {<pending>}
const result = await loadProducts();  // 실제 배열
```

`fetch`가 Promise를 돌려줬던 것과 같다. **`async` 함수는 전부 그렇다.** 그래서 받는 쪽에서 또 `await`로 벗겨야 하고, 그러려면 받는 쪽도 `async` 함수여야 한다. 비동기가 전염되는 이유다.

### 헷갈렸던 것 ② — `render`는 받는 것도 돌려주는 것도 없다?

"받다/돌려주다"에 두 가지 뜻이 섞여 있었다.

| | 뜻 | 확인 방법 |
|---|---|---|
| 문법적 입출력 | 괄호로 받고 `return`으로 내보내는 것 | 코드에 적혀 있음 |
| 하는 일(효과) | 함수가 일으키는 변화 | 함수 몸통을 읽어야 앎 |

`render()`는 괄호가 비어 있고 `return`이 없다. `products`는 밖에서 받은 것이 아니라 **직접 가서 가져온 것**이고, 만든 `<li>`들은 `return`으로 나가는 것이 아니라 **DOM에 직접 꽂힌다.**

```js
const result = await render();
console.log(result);   // undefined
```

그래서 `createProductCard`는 어디서든 쓸 수 있지만, `render`는 `.product-list`가 있는 페이지에서만 동작한다. **바깥을 안 건드리는 함수가 재사용하기 쉽다.**

---

## M1-8 — 로딩 표시

### 핵심 — `await` 앞에 넣어야 한다

```js
async function render() {
    productList.innerHTML = `<li>불러오는 중...</li>`;   // ← await 앞
    const products = await loadProducts();
    productList.innerHTML = products.map(...).join("");
}
```

`await` 뒤에 쓰면 **이미 데이터가 도착한 뒤**라 로딩 표시가 보일 틈이 없다.

### 지울 필요가 없다

`innerHTML`에 새 값을 넣으면 안에 있던 것이 **통째로 교체**된다. 로딩 표시를 따로 찾아 제거하는 코드가 필요 없다.

> 화이트보드를 지우고 새로 쓰는 것이 아니라, 보드를 통째로 바꾸는 셈.

### 확인 방법

개발자도구 Network 탭 → **No throttling → Slow 4G**. 인터넷이 빠르면 로딩 표시를 볼 틈이 없다.

---

## M1-9 — 에러 상황 관찰

URL을 `products` → `productss`로 바꿔 404를 유발했을 때 나온 것.

```
GET .../productss 404 (Not Found)
Uncaught (in promise) SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

### 핵심 — `fetch`는 404를 에러로 보지 않는다

```js
const response = await fetch(".../productss");   // ✅ 정상 통과
```

**"요청을 보내고 답을 받는 데 성공했다"**는 관점이다. 답의 내용이 404일 뿐이다.

> 편지를 보냈는데 "수취인 불명"이라는 **회신을 받은** 것. 편지가 안 간 것이 아니다.

많은 사람이 "404면 catch로 빠지겠지" 하고 짰다가 당하는 함정.

### `"<!DOCTYPE"... is not valid JSON`의 의미

진짜 에러는 `.json()`에서 났다. 서버가 404 **안내 HTML 페이지**를 돌려줬고, `.json()`이 그것을 JSON으로 파싱하려다 첫 글자 `<`에서 터진 것.

**이 메시지가 보이면 "API가 JSON 대신 HTML을 돌려줬다"는 신호다.** URL이 틀렸거나, 로그인 페이지로 튕겼거나, 서버 에러 페이지인 경우가 대부분.

### 헷갈렸던 것 — "render까지 가지도 못한 것 아닌가?"

아니다. **`render`는 이미 진행 중이었고, 에러가 `render`로 올라온 것이다.**

```
render()                          ← 실행 시작
  ├─ innerHTML = "로딩"            ✅ 실행됨 (화면에 보였다 = 증거)
  └─ await loadProducts()         ← 여기서 멈춰 기다림
       ├─ await fetch(...)        ✅ 성공 (404 응답을 받음)
       └─ await response.json()   ❌ 여기서 에러
```

**에러는 부른 쪽으로 거슬러 올라간다.**

```
response.json() 에러
  → loadProducts 중단, 위로 넘김 (try/catch 없음)
    → render 중단, 위로 넘김 (try/catch 없음)
      → 최상단: 아무도 안 잡음 → "Uncaught (in promise)"
```

> 직원이 처리 못 하면 위로 보고한다. 끝까지 아무도 못 처리하면 "미처리"로 기록된다.

그리고 "스크립트가 멈춘다"는 것도 정확히는 **그 함수 체인만** 멈춘다. `render();` 아래에 다른 코드가 있었다면 멀쩡히 실행됐을 것이다.

---

## M1-10 — 에러 처리

### 구조

```js
async function loadProducts() {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`상품 목록 요청 실패 (${response.status})`);
    }
    const data = await response.json();
    return data.products;
}

async function render() {
    productList.innerHTML = `<li class="product-list__loading">불러오는 중...</li>`;
    try {
        const products = await loadProducts();
        productList.innerHTML = products.map((product) => createProductCard(product)).join("");
    } catch (error) {
        console.error(error);
        productList.innerHTML = `<li class="product-list__error">상품 리스트를 불러올 수 없습니다.</li>`;
    }
}
```

### `response.ok`

**메서드가 아니라 속성**이다. 괄호로 구분한다.

```js
response.json()   // 괄호 있음 → 메서드. 동작
response.ok       // 괄호 없음 → 속성. 값
```

상태 코드가 **200~299면 `true`**, 그 외는 `false`. 정확한 코드는 `response.status`로 본다. **분기는 `ok`로, 로그에는 `status`로.**

그리고 이것은 JS 언어가 아니라 **브라우저가 제공하는 것**이다.

| 어디서 왔나 | 예 |
|---|---|
| JavaScript 언어 자체 | `map`, `filter`, `length`, `Promise` |
| 브라우저가 제공 | `document`, `fetch`, `Response.ok`, `localStorage` |

Node.js(서버)에는 `document`가 없다. "분명 되는 코드인데 여기선 안 되네?" 할 때 이 구분을 떠올릴 것.

### `throw` — 에러를 직접 던지기

지금까지의 에러는 JS가 만든 것이었다(`TypeError`, `SyntaxError`). `throw`는 **내가 만들어 던지는 것**이다.

> 지금까지는 기계가 고장 나서 멈춘 것. `throw`는 내가 비상정지 버튼을 누르는 것.

실행되면 세 가지가 일어난다.

1. 그 자리에서 **함수가 즉시 중단**된다
2. **아래 코드는 실행되지 않는다** — `.json()`이 안 불리니 "파싱 실패"가 생길 틈이 없다
3. **에러가 부른 쪽으로 올라간다** → `render`의 `catch`가 잡는다

`new Error(...)`로 감싸는 이유는 **`.message`와 `.stack`(발생 위치)이 따라오기 때문**이다. 문자열만 던지면 위치 정보가 사라진다.

**`return null`이 아니라 `throw`를 쓰는 이유** — `null`은 부른 쪽에서 매번 확인해야 하고 깜빡하면 한참 뒤 엉뚱한 자리에서 터진다. `throw`는 무시할 수 없다. **에러는 눈에 띄게 만드는 것이 안전하다.**

### 왜 `loadProducts`에서 확인하나

① "데이터를 제대로 가져왔는가"는 가져오는 쪽의 책임이다.

② **`render`의 `catch`에서는 이미 늦다.** `.json()`이 `loadProducts` 안에 있으므로, 거기서 막지 않으면 에러가 "JSON 파싱 실패"로 변질된 뒤에 올라온다.

### `console.error`를 쓸 것

```js
console.log(error);    // 흰 글씨
console.error(error);  // 빨간 글씨 + 스택 추적 + Errors 필터에 잡힘
```

그리고 `catch (error)`로 받아놓고 안 쓰면 **에러가 조용히 사라진다.** 사용자에겐 친절한 메시지, 개발자에겐 실제 에러 — 둘 다 필요하다.

### 에러 메시지는 "나중에 로그를 볼 자신"을 위해 쓴다

```
404 에러가 발생하였습니다.      ← 무슨 요청이 실패했는지 모름
상품 목록 요청 실패 (404)       ← 어디서 났는지 바로 보임
```

### 작업 습관

테스트용으로 바꿔둔 URL, `console.log`, 주석 처리한 코드가 그대로 커밋되는 사고가 흔하다. **커밋 전 `git diff`로 한 번 훑을 것.**

---

## M1-12a — 원시 타입과 참조 타입

### 변수에 무엇이 담기는가

| | 변수에 담기는 것 |
|---|---|
| **원시 타입** (숫자, 문자열, boolean, null, undefined) | **값 자체** |
| **참조 타입** (객체, 배열, 함수) | **값이 있는 곳의 주소** |

> 원시 타입은 쪽지에 숫자를 적어두는 것. 복사하면 쪽지가 두 장 생기고 서로 무관하다.
> 참조 타입은 쪽지에 **집 주소**를 적어두는 것. 복사하면 쪽지는 두 장이지만 **가리키는 집은 하나**다.

### 실험 결과

```js
let a = 1;  let b = a;  b = 2;
console.log(a);        // 1    ← 값을 복사했으므로 별개

let obj1 = {n:1};  let obj2 = obj1;  obj2.n = 2;
console.log(obj1.n);   // 2    ← 같은 집을 고쳤다

const arr1 = [1,2,3];  const arr2 = arr1;  arr2.push(4);
console.log(arr1);     // [1,2,3,4]  ← 같은 배열

const arr = [1,2,3];  arr.push(4);
console.log(arr);      // [1,2,3,4]  ← const여도 내용은 바꿀 수 있다
```

### 헷갈렸던 것 — 등호 왼쪽에 점이 있는가

```js
obj4.n = 2;       // 왼쪽에 점(.)  → 집 안의 가구를 바꾼다      → 원본도 바뀜
obj4 = { n: 2 };  // 왼쪽이 변수   → 쪽지를 새 주소로 바꿔 쓴다  → 원본은 그대로
```

```
처음:              obj3 ──┐
                          ├──→ [집A: {n:1}]
                   obj4 ──┘

obj4.n = 2:        obj3 ──┐
                          ├──→ [집A: {n:2}]   ← 둘 다 영향받음
                   obj4 ──┘

obj4 = {n:2}:      obj3 ─────→ [집A: {n:1}]   ← 그대로
                   obj4 ─────→ [집B: {n:2}]   ← 새 집으로 이사
```

**쪽지는 처음부터 두 장이었다.** 공유된 것은 변수가 아니라 **가리키는 대상**이다. 그래서 "독립했다"보다 **"가리키는 대상이 바뀌었다"**가 정확한 표현이다.

### `const`가 막는 것

```js
const arr = [1, 2, 3];
arr = [4, 5, 6];   // ❌ 왼쪽이 변수 자체 → const가 막음
arr.push(4);       // ✅ 변수를 안 건드림
arr[0] = 99;       // ✅ 집 안을 바꾸는 것
```

**`const`는 "쪽지를 다시 쓰지 마라"는 뜻이다.** 집 안을 어떻게 고치든 상관하지 않는다.

### 두 질문을 분리할 것

| | 질문 | 답 |
|---|---|---|
| A | 재할당이 **가능한가?** | `let`이면 O, `const`면 X |
| B | 재할당하면 **원본도 바뀌나?** | 아니오. 내 쪽지만 바뀐다 |

`const`는 A만 통제한다. B는 `let`이든 `const`든 항상 같다.

### 진짜로 복사하려면 — 새 집을 짓는다

```js
const obj2 = { ...obj1 };   // 내용을 옮겨 담은 새 객체
const arr2 = [...arr1];     // 새 배열
```

멘토 메모의 `{ ...list[0] }`가 이것이다. 다만 **한 겹만** 새로 짓는다(얕은 복사). → M1-12b

### 왜 지금 이것을 하는가

M4에서 이런 버그가 난다.

```js
const item = products.find((p) => p.id === 1);   // 주소를 받음
item.quantity = 3;                                // 장바구니 수량 변경
// → 상품 목록의 원본 상품도 quantity가 3이 된다
```

에러도 안 나고 조용히 일어난다. M2에서 `find`를 쓰기 시작하므로 그전에 짚고 간다.

---

## 이번 구간에서 반복된 교훈

- **에러 메시지를 끝까지 읽을 것.** `is not valid JSON`, `is not a function` 모두 원인을 직접 가리키고 있었다
- **"왜 이렇게 됐지?"로 접근할 것.** 쉼표를 지우려다 배열→문자열 변환을 알게 됐고, 404를 쫓다가 `fetch`의 2단계 구조를 알게 됐다
- **주석은 코드 바로 위에, "왜"를 적을 것.** 주석이 코드에서 떨어지면 금방 거짓말이 된다
- **커밋 전에 `git diff`**

---

## M1-12b — map의 얕은 복사

### 두 가지를 구분할 것

```js
sampleProducts.map((i) => { console.log(i); });
//                   ↑           ↑
//          콜백이 받는 것    여기서 찍히는 것 = 요소 하나(객체)
```

`console.log(i)`는 **배열 안을 들여다본 것**이다. `map` 자체가 무엇을 돌려주는지는 결과를 받아서 찍어야 보인다.

```js
const result = sampleProducts.map((i) => { console.log(i); });
console.log(result);   // [undefined, undefined, undefined]  ← 배열이다
```

콜백이 아무것도 `return` 안 했으니 안은 `undefined`지만 **상자 자체는 배열**이고, **요소 3개가 들어가 3개가 나왔다.**

> 컨베이어 벨트에 물건 3개를 올리면 가공이 되든 안 되든 끝에서 3개가 나온다. 아무것도 안 내보내면 빈 칸 3개가 나온다.

M1-7에서 화면이 비었던 이유가 이것이었다. (`return` 누락 → `[undefined, ...]` → `join("")` → `""`)

| | 무엇인가 |
|---|---|
| 콜백의 매개변수 | 배열의 **요소 하나** |
| `map(...)`의 반환값 | **새 배열** (요소 개수는 그대로) |

### 새 배열이지만 안의 객체는 새것이 아니다

```js
const copied = sampleProducts.map((p) => p);

console.log(sampleProducts === copied);        // false  ← 배열은 새것
console.log(sampleProducts[0] === copied[0]);  // true   ← 객체는 같은 것
```

```
원본 배열 = 집 주소 3개가 적힌 장부 A

map(p => p) 실행
  → 새 장부 B를 만들고
  → A에 적힌 주소들을 그대로 베껴 적는다

장부 A  [ 주소1 | 주소2 | 주소3 ]
장부 B  [ 주소1 | 주소2 | 주소3 ]   ← 장부는 다른 책, 적힌 주소는 같음
           ↓
        같은 집
```

### 헷갈렸던 것 — `===`는 무엇을 비교하는가

**쪽지(변수)가 몇 장인지가 아니라, 쪽지에 적힌 주소를 비교한다.**

```js
const a = [1, 2, 3];
const b = a;
console.log(a === b);   // true   ← 쪽지는 두 장이지만 적힌 주소가 같다
```

변수를 두 개 쓰면 쪽지는 **항상** 두 장이다. 그러므로 "쪽지가 두 장이라서 `false`"는 성립하지 않는다.

`map`에서 `false`가 나오는 이유는 **`map`이 새 배열(새 집)을 지어서 두 쪽지에 다른 주소가 적혔기** 때문이다.

```
const copied = sampleProducts
  쪽지A [주소1] ──┐
  쪽지B [주소1] ──┴──→ [배열]        === true

const copied = sampleProducts.map(p => p)
  쪽지A [주소1] ──→ [배열 원본]
  쪽지B [주소2] ──→ [배열 새것]       === false
```

### 그래서 생기는 일

```js
copied[0].price = 0;
console.log(sampleProducts[0].price);   // 0   ← 원본도 바뀐다
```

**멘토 메모 "map 안의 객체는 새로운 것이 아니다"가 이 말이었다.**

### 칸 안을 바꾸는 것과 칸을 바꾸는 것

```js
copied[0].price = 0;         // ① 주소가 가리키는 집 안을 바꿈  → 원본도 바뀜
copied[1] = { title: "..." } // ② 장부 칸에 다른 주소를 적음     → 원본은 그대로
```

M1-12a의 구분이 배열 칸에 적용된 것이다. 등호 왼쪽에 **속성 접근이 있으면 ①**, **칸 자체에 대입하면 ②**.

```js
obj4.n = 2;        // 집 안을 바꿈    → 원본도 바뀜
obj4 = { n: 2 };   // 쪽지를 바꿔 씀  → 원본은 그대로
```

방향은 상관없다. 원본을 바꾸든 `copied`를 바꾸든 같은 집을 보고 있으므로 양쪽에서 다 보인다.

### 정리

> `map`은 새 배열을 만든다. 하지만 그 배열에 담기는 것은 **원본과 같은 객체의 주소**다.
> 그래서 어느 쪽에서든 **그 객체의 속성을 바꾸면** 양쪽 모두에서 바뀐 값이 보인다.
> 단, 배열의 칸에 **다른 객체를 넣는 것**은 그 배열에만 영향을 준다.

### 진짜로 복사하려면 — map 안에서 새 객체를 만든다

```js
const copied = sampleProducts.map((p) => ({ ...p }));

console.log(sampleProducts[0] === copied[0]);   // false  ← 새 집
copied[0].price = 0;
console.log(sampleProducts[0].price);           // 9.99   ← 원본 안전
```

**괄호를 빠뜨리면 안 된다.**

```js
(p) => { ...p }      // ❌ 중괄호를 '함수 몸통'으로 해석 → 문법 에러
(p) => ({ ...p })    // ✅ 괄호로 감싸야 '객체'로 해석
```

화살표 함수에서 객체를 바로 돌려줄 때만 생기는 함정이다. 중괄호가 "함수 몸통"과 "객체" 두 가지 뜻을 모두 갖기 때문.

### 얕은 복사의 한계

```js
console.log(sampleProducts[0].reviews === copied[0].reviews);   // true ← 여전히 공유
```

`{ ...p }`는 p의 속성들을 새 객체에 **옮겨 담을 뿐**이다. `reviews`는 배열(참조 타입)이라 **주소가 옮겨 담긴다.**

> 집은 새로 지었는데 그 안의 금고 주소는 그대로 베껴 적은 셈.

이것이 **얕은 복사**라 부르는 이유다. 한 겹만 새로 만들고 그 안쪽은 여전히 공유된다. 지금 과제에서는 `reviews`를 직접 수정할 일이 없어 문제가 되지 않지만, **"스프레드를 썼으니 완전히 안전하다"고 믿으면 안 된다.**

---

## M1-12c — filter / find / reduce

### 실험 설계 주의

처음에 이렇게 확인했더니 진짜 모습이 안 드러났다.

```js
sampleProducts.filter((p) => p);      // 전부 통과 → 개수 그대로
sampleProducts.reduce((p) => p);      // 누적값을 그대로 반환 → 첫 요소
```

**콜백이 아무 일도 하지 않으면 메서드의 성격이 드러나지 않는다.** `filter`는 조건을 줘야 하고, `reduce`는 두 번째 매개변수까지 써야 한다.

- `p`가 객체이므로 JS에서 항상 "참"으로 취급 → `filter`가 전부 통과시킴
- `reduce` 콜백은 `(누적값, 현재요소)` 두 개를 받는데 하나만 썼음

### filter

콜백이 **`true`/`false`를 돌려주길** 기대한다. "이걸 남길까요?"를 묻는 것.

```js
sampleProducts.filter((p) => p.price > 15);    // 조건에 맞는 것만
```

**항상 배열을 돌려준다.** 0개여도 `[]`, 1개여도 `[{...}]`.

```js
Array.isArray(sampleProducts.filter((p) => p.price > 100));   // true
```

### 헷갈렸던 것 — filter와 find

처음에 "filter는 배열이 될 수도 객체가 될 수도 있다"고 생각했는데, 그건 `find`다.

```js
products.filter((p) => p.id === 1)   // [{...}]  ← 배열 (1개짜리)
products.find((p) => p.id === 1)     // {...}    ← 객체 그 자체
```

| | 돌려주는 것 | 못 찾으면 |
|---|---|---|
| `filter` | **배열** (조건에 맞는 전부) | `[]` 빈 배열 |
| `find` | **요소 자체** (처음 찾은 하나) | `undefined` |

> `filter`는 체로 거르는 것 — 남은 것들을 그릇에 담아 준다.
> `find`는 찾아서 집어 오는 것 — 손에 하나를 쥐여 준다.

**M2에서 바로 쓰인다.** "장바구니에 이 상품이 이미 있나?"를 확인할 때 `find`를 쓴다. 찾았으면 그 객체의 수량을 올려야 하므로 객체 자체가 필요하다.

### reduce

콜백이 두 개를 받는다.

```js
(누적값, 현재요소) => 새_누적값
```

```js
sampleProducts.reduce((acc, cur) => acc + cur.price, 0);
//                                                   ↑ 시작값
```

동작 과정

```
시작값 0
1회차:  acc=0      cur=상품1(9.99)   → 0 + 9.99 = 9.99
2회차:  acc=9.99   cur=상품2(19.99)  → 9.99 + 19.99 = 29.98
3회차:  acc=29.98  cur=상품3(29.99)  → 29.98 + 29.99 = 59.97
결과: 59.97
```

**이전 회차의 결과가 다음 회차의 `acc`로 들어간다.** 눈덩이를 굴리는 것.

### reduce가 돌려주는 타입은 내가 정한다

```js
reduce((acc, cur) => acc + cur.price, 0)    // 59.97                 (숫자)
reduce((acc, cur) => acc + cur.brand, "")   // "EssenceGlamour..."   (문자열)
```

시작값을 `[]`나 `{}`로 주면 배열이나 객체도 만들 수 있다. `map`과 `filter`가 하는 일을 `reduce`로 전부 흉내 낼 수 있다. **그래서 가장 강력하고 가장 어렵다.**

### 정리

| | 콜백이 돌려줘야 할 것 | 메서드가 돌려주는 것 | 개수 |
|---|---|---|---|
| `map` | 변환된 값 | **새 배열** | 그대로 (n → n) |
| `filter` | `true` / `false` | **새 배열** | 줄어듦 (n → 0~n) |
| `find` | `true` / `false` | **요소 자체** | 하나 또는 `undefined` |
| `reduce` | 새 누적값 | **내가 정한 것** | 하나 |

> `map`은 컨베이어 벨트 — 3개 넣으면 3개 나온다
> `filter`는 체 — 3개 넣으면 0~3개가 남는다
> `find`는 집게 — 하나를 집어 온다
> `reduce`는 믹서 — 전부 갈아서 하나로 만든다

### 공통점

`map` `filter` `find` `reduce` `join` 모두 **원본을 바꾸지 않는다.** 새것을 만들어 돌려준다.

반면 `push`는 원본을 직접 고친다 (M1-12a 실험 ③에서 `arr2.push(4)`가 `arr1`도 바꿨다). → M1-12d에서 정리

---

## M1-12d — 원본을 바꾸는 메서드 구분

### 확인 방법

메서드를 실행한 뒤 **원본만** 찍어본다. 반환값은 받지 않는다.

```js
const fresh = () => [3, 1, 2];   // 매번 새 배열을 만드는 함수

let a;
a = fresh(); a.push(4);       console.log("push   ", a);
a = fresh(); a.pop();         console.log("pop    ", a);
a = fresh(); a.sort();        console.log("sort   ", a);
a = fresh(); a.reverse();     console.log("reverse", a);
a = fresh(); a.splice(1, 1);  console.log("splice ", a);
a = fresh(); a.slice(0, 2);   console.log("slice  ", a);
a = fresh(); a.concat(4);     console.log("concat ", a);
```

### 결과

| 메서드 | 원본 | 반환값 |
|---|---|---|
| `push(4)` | `[3,1,2,4]` **변함** | `4` (새 길이) |
| `pop()` | `[3,1]` **변함** | `2` (꺼낸 요소) |
| `sort()` | `[1,2,3]` **변함** | `[1,2,3]` (원본 자체) |
| `reverse()` | `[2,1,3]` **변함** | `[2,1,3]` (원본 자체) |
| `splice(1,1)` | `[3,2]` **변함** | `[1]` (제거된 요소들) |
| `slice(0,2)` | `[3,1,2]` 그대로 | `[3,1]` (새 배열) |
| `concat(4)` | `[3,1,2]` 그대로 | `[3,1,2,4]` (새 배열) |

**변경 메서드**: `push` `pop` `sort` `reverse` `splice`
**비변경 메서드**: `slice` `concat` — 그리고 `map` `filter` `find` `reduce` `join`

### 반환값이 더 중요하다

**변경 메서드는 "결과 배열"을 돌려주지 않는다.** 원본을 직접 고치는 것이 일이므로 반환값은 부가 정보다.

```js
const result = arr.push(4);   // result = 4  (배열이 아님!)
```

"push한 결과를 변수에 담아야지" 하고 쓰면 숫자가 들어온다.

### sort의 함정

```js
b.sort() === b;   // true
```

**`sort`가 돌려주는 것은 새 배열이 아니라 원본 그 자체다.** 같은 주소를 다시 건네줄 뿐이다.

```js
const sorted = products.sort((a, b) => a.price - b.price);
// sorted와 products는 같은 배열. products의 순서도 영구히 바뀐다
```

M5에서 정렬을 넣을 때 이것을 모르면 **"필터를 바꿨더니 원래 순서로 안 돌아온다"**는 버그를 만난다.

**피하는 법** — 복사본을 정렬한다.

```js
const sorted = [...products].sort((a, b) => a.price - b.price);
```

### slice와 splice — 한 글자 차이, 정반대 성격

| | 영어 뜻 | 하는 일 |
|---|---|---|
| **slice** | 얇게 **썰어 가져오다** | 원본은 두고 잘라낸 사본을 준다 |
| **splice** | 잘라 **이어 붙이다** | 원본을 직접 수술한다 |

> `slice`는 빵을 썰어 한 조각 가져오는 것, `splice`는 필름을 잘라내고 다시 이어 붙이는 것. 후자는 원본 필름이 바뀐다.

가장 많이 헷갈리는 짝이다.

### 원본을 바꾸지 않는 최신 버전

```js
arr.toSorted()     // 정렬된 새 배열 (원본 그대로)
arr.toReversed()   // 뒤집힌 새 배열
arr.toSpliced()    // splice 결과를 새 배열로
arr.with(0, 99)    // 0번째만 바꾼 새 배열
```

**`to`로 시작하면 원본을 바꾸지 않는 버전**이다. 비교적 최근에 추가되었고 현재 브라우저에서 동작한다.

`[...products].sort(...)`로도 같은 효과를 낼 수 있다.

### 왜 이 구분이 중요한가

원본을 바꾸는 메서드를 모르고 쓰면 **에러 없이 조용히** 다른 곳이 망가진다. M4에서 장바구니를 다루고 M5에서 필터·정렬을 다룰 때 바로 나타난다.

**기본 전략: 가능하면 원본을 바꾸지 않는 쪽을 쓴다.** 꼭 바꿔야 할 때만 변경 메서드를 쓰고, 그때는 "지금 원본을 바꾸고 있다"를 의식한다.
