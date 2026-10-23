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
