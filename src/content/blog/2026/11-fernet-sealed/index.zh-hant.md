---
title: "Fernet 密封：驗證加密權杖的解剖學"
description: "從位元組層級拆解 Fernet 權杖、先加密後 MAC 的流程，以及一把 32 位元組金鑰能與不能承諾的事。"
pubDate: 2026-11-23
category: "Security"
tags: ["密碼學", "Fernet", "Python", "資訊安全"]
featured: false
author: "Alex.Hsiao"
readTime: "14 分鐘"
---

# Fernet 密封：驗證加密權杖的解剖學

Fernet 權杖看起來像一串從 base64 編碼器逃出來的密碼。它其實是一筆五欄位的記錄，封口上還釘著一張收據。

Fernet 是 Python `cryptography` 套件裡的高階驗證加密配方：一把 32 位元組金鑰、一個不透明的權杖，以及 `encrypt()` 與 `decrypt()` 兩個方法。驗證加密把兩個承諾綁在一起：沒有金鑰就讀不出密文，而任何改動都會被發現。

那張收據就是整個設計的核心。Fernet 不只把位元組藏起來；它讓封套裡的每個位元組都對同一個 32 位元組標籤負責。改動密文、IV、時間戳或版本，標籤就不再吻合。訊息要嘛是金鑰持有者封進去的那一份，要嘛什麼都沒有。

這篇文章從位元組層級拆解這個格式：每個保證從哪裡來、設計在哪裡停下，以及為什麼 Python API 就只有兩個方法。

## 是配方，不是密碼學原語

AES 是區塊加密演算法。它本身不會告訴你該用哪種模式、最後一個區塊怎麼填充、IV 從哪裡來、要驗證哪些位元組，或用什麼方式比較標籤才不會洩漏時間。上述每一個選擇，都是可能把方案寫錯、卻仍能解出東西的地方。

Fernet 把這些選擇拿掉。它固定了：

- 以 **AES-128-CBC** 與 PKCS7 填充提供機密性。
- 以 **HMAC-SHA256** 提供完整性與真實性。
- **先加密後 MAC**：標籤是對完成的標頭與密文計算。
- 每個權杖都使用**全新的隨機 IV**。
- **帶版本、URL-safe 的記錄**，時間戳放在封印內。

沒有加密演算法協商，也沒有辦法要求換一種模式。API 表面就是 `encrypt()` 與 `decrypt()`。這種狹窄正是它的特色。

取捨也同樣固定。你得到的是這個組合的保證，不是現代帶關聯資料的 AEAD 所給的保證。後面會再談。

這個格式在 2012 年始於 Heroku 的一個小型 Ruby gem，作者是 Harold Giménez。Keith Rarick 在 2013 年寫了 Go 實作與規格，[pyca/cryptography](https://cryptography.io/en/latest/fernet/) 隨後把它採納為高階對稱加密配方。名字是對義大利餐後酒 Fernet 的玩笑；欄位佈局可不是。

> Fernet 不會讓訊息變成真的。它讓訊息可被發現竄改，而且只有持有金鑰的人能讀。這些承諾比較窄，卻有用得多。

## 一把金鑰，兩項任務

`Fernet.generate_key()` 回傳 44 個 URL-safe base64 字元。解碼後是 32 位元組。前 16 位元組是簽章金鑰，後 16 位元組是加密金鑰。順序是[規格](https://github.com/fernet/spec/blob/master/Spec.md)的一部分，不是本地慣例。

一把金鑰拆成兩把，是領域分隔。HMAC-SHA256 與 AES-128-CBC 從不共用金鑰材料，所以其中一種構造的弱點，無法透過共用秘密轉移到另一種。實務上兩半仍是同一個秘密：持有那 44 個字元的人，可以讀取每一則訊息，也可以偽造新的權杖。Fernet 是對稱式，所以金鑰分發是它不解決的難題。

`generate_key()` 使用作業系統的 CSPRNG。不要用雜湊密碼短語來產生金鑰，也不要把 32 個 ASCII 字元直接傳給 `Fernet(...)` 就以為可以。建構子要的是 base64url 解碼後的 32 位元組，不是解碼前的 32 個字元。

<figure class="fer-fig">
  <figcaption>
    <span class="card-tag">欄位地圖 // 01</span>
    <h3 class="fer-fig-title">一把金鑰拆成兩把；一個權杖承載五個欄位</h3>
    <p class="fer-fig-sub">金鑰的兩半從不互換角色。標籤涵蓋它之前的每一個位元組。</p>
  </figcaption>
  <div class="fer-scroll">
  <svg class="fer-svg" viewBox="0 0 840 476" role="img" aria-labelledby="fer-f1-title fer-f1-desc">
    <title id="fer-f1-title">Fernet 金鑰與權杖結構</title>
    <desc id="fer-f1-desc">32 位元組金鑰拆成 16 位元組簽章金鑰與 16 位元組加密金鑰。權杖由版本位元組、8 位元組時間戳、16 位元組 IV、密文，以及對前四個欄位計算的 32 位元組 HMAC 標籤組成。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">FERNET // 欄位地圖</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">版本 0x80 · 原始位元組</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <text x="24" y="46" class="f" font-size="7" letter-spacing="1.1">01 / 金鑰</text>
    <text x="24" y="64" class="t" font-size="10.5" font-weight="700">一把 32 位元組的秘密，兩個獨立任務</text>
    <text x="816" y="64" class="m" font-size="7.5" text-anchor="end">base64url · 44 個字元</text>
    <rect x="24" y="76" width="394" height="52" fill="var(--mono-l1)"/>
    <rect x="422" y="76" width="394" height="52" fill="var(--mono-l3)"/>
    <text x="40" y="97" fill="var(--mono-paper)" font-size="9" font-weight="700" letter-spacing="0.04em">簽章金鑰</text>
    <text x="40" y="112" fill="var(--mono-paper)" font-size="7.5">位元組 0–15 · HMAC-SHA256</text>
    <text x="438" y="97" fill="var(--mono-paper)" font-size="9" font-weight="700" letter-spacing="0.04em">加密金鑰</text>
    <text x="438" y="112" fill="var(--mono-paper)" font-size="7.5">位元組 16–31 · AES-128-CBC</text>
    <text x="24" y="144" class="f" font-size="7" letter-spacing="0.8">解碼這 44 個字元</text>
    <text x="816" y="144" class="f" font-size="7" text-anchor="end" letter-spacing="0.8">共 32 位元組</text>
    <line x1="24" y1="150" x2="816" y2="150" class="rule"/>
    <text x="24" y="174" class="f" font-size="7" letter-spacing="1.1">02 / 權杖</text>
    <text x="24" y="192" class="t" font-size="10.5" font-weight="700">五個欄位，一個固定順序</text>
    <text x="816" y="192" class="m" font-size="7.5" text-anchor="end">最少 73 位元組 · 100 個 base64url 字元</text>
    <text x="246" y="212" class="m" font-size="7.2" text-anchor="middle" letter-spacing="0.9">HMAC-SHA256 輸入 // 此括號以下的每個位元組</text>
    <path d="M24 222 V218 H468 V222" fill="none" stroke="var(--mono-l5)" stroke-width="0.7"/>
    <rect x="24" y="230" width="12" height="62" fill="var(--mono-l1)" stroke="var(--mono-grid)" stroke-width="0.7"/>
    <rect x="36" y="230" width="88" height="62" fill="var(--mono-l2)" stroke="var(--mono-grid)" stroke-width="0.7"/>
    <rect x="124" y="230" width="172" height="62" fill="var(--mono-l7)" stroke="var(--mono-grid)" stroke-width="0.7"/>
    <rect x="296" y="230" width="172" height="62" fill="var(--mono-l5)" stroke="var(--mono-grid)" stroke-width="0.7"/>
    <rect x="468" y="230" width="348" height="62" fill="var(--mono-l1)" stroke="var(--mono-grid)" stroke-width="0.7"/>
    <text x="24" y="226" class="t mono" font-size="7" font-weight="700">0x80</text>
    <line x1="30" y1="228" x2="30" y2="230" stroke="var(--mono-l5)" stroke-width="0.7"/>
    <text x="80" y="256" fill="var(--mono-paper)" font-size="7" font-weight="700" text-anchor="middle" letter-spacing="0.06em">時間戳</text>
    <text x="80" y="271" fill="var(--mono-paper)" font-size="7" text-anchor="middle">8 B · 大端序</text>
    <text x="210" y="256" class="t" font-size="7.5" font-weight="700" text-anchor="middle" letter-spacing="0.06em">IV</text>
    <text x="210" y="271" class="m" font-size="7" text-anchor="middle">16 B · CSPRNG</text>
    <text x="382" y="256" class="t" font-size="7.5" font-weight="700" text-anchor="middle" letter-spacing="0.06em">密文</text>
    <text x="382" y="271" class="m" font-size="7" text-anchor="middle">N × 16 B</text>
    <text x="642" y="256" fill="var(--mono-paper)" font-size="8" font-weight="700" text-anchor="middle" letter-spacing="0.06em">HMAC-SHA256</text>
    <text x="642" y="271" fill="var(--mono-paper)" font-size="7" text-anchor="middle">32 B · 標籤</text>
    <line x1="24" y1="304" x2="816" y2="304" class="rule"/>
    <g class="f" font-size="7">
      <line x1="24" y1="300" x2="24" y2="308" stroke="var(--mono-faint)" stroke-width="0.7"/>
      <text x="24" y="320">0</text>
      <line x1="36" y1="300" x2="36" y2="308" stroke="var(--mono-faint)" stroke-width="0.7"/>
      <text x="36" y="320" text-anchor="middle">1</text>
      <line x1="124" y1="300" x2="124" y2="308" stroke="var(--mono-faint)" stroke-width="0.7"/>
      <text x="124" y="320" text-anchor="middle">9</text>
      <line x1="296" y1="300" x2="296" y2="308" stroke="var(--mono-faint)" stroke-width="0.7"/>
      <text x="296" y="320" text-anchor="middle">25</text>
      <line x1="468" y1="300" x2="468" y2="308" stroke="var(--mono-faint)" stroke-width="0.7"/>
      <text x="468" y="320" text-anchor="middle">25 + N</text>
      <line x1="816" y1="300" x2="816" y2="308" stroke="var(--mono-faint)" stroke-width="0.7"/>
      <text x="816" y="320" text-anchor="end">57 + N</text>
    </g>
    <text x="24" y="336" class="f" font-size="7">位元組偏移 · N = 密文長度</text>
    <g font-size="8" fill="var(--mono-l2)">
      <text x="24" y="358" class="f" font-size="7">01</text>
      <text x="46" y="358">標頭是可讀的。版本與時間戳是明文，但時間戳仍經過驗證。</text>
      <text x="24" y="376" class="f" font-size="7">02</text>
      <text x="46" y="376">載荷會被填充。PKCS7 會加入 1–16 位元組，所以密文永不為空，且一定是 16 的倍數。</text>
      <text x="24" y="394" class="f" font-size="7">03</text>
      <text x="46" y="394">封印是 32 位元組。改動前面任一欄位的一個位元，標籤就不再吻合。</text>
    </g>
    <rect x="24" y="410" width="792" height="34" class="codebox"/>
    <text x="40" y="431" class="t mono" font-size="8">raw = 57 + 16 × ceil((n + 1) / 16) bytes   →   base64url = 4 × ceil(raw / 3) characters</text>
    <text x="24" y="462" class="m" font-size="7.5">Base64url 只是傳輸外殼：它增加 33%，什麼也藏不住。空訊息仍會產生 73 個原始位元組。</text>
  </svg>
  </div>
  <div class="fer-fig-src">FERNET 規範 v0x80 · 欄位大小 · 金鑰拆分</div>
</figure>

## 五個欄位，一個封印

每個權杖都是一筆串接記錄的 base64url 編碼。沒有分隔符號、沒有長度前綴、沒有可選欄位。

| 欄位 | 大小 | 起始位置 | 可見 | 作用 |
| :--- | ---: | ---: | :--- | :--- |
| 版本 | 1 位元組 | 0 | 是 | `0x80`，目前唯一定義的版本 |
| 時間戳 | 8 位元組 | 1 | 是 | uint64 大端序，Unix epoch 以來的秒數 |
| IV | 16 位元組 | 9 | 是 | 全新的隨機 AES-CBC 初始化向量 |
| 密文 | N × 16 位元組 | 25 | 否 | 填充後的 AES-128-CBC 輸出 |
| HMAC | 32 位元組 | 25 + N | 否 | 對前 25 + N 位元組計算的 SHA-256 標籤 |

從這個佈局可以推出兩個關於大小的結論。

PKCS7 永遠至少加入一個位元組，即使訊息剛好停在區塊邊界。空訊息因此會產生一個 16 位元組的密文區塊，最小的權杖是 `1 + 8 + 16 + 16 + 32 = 73` 個原始位元組。加上 base64url 填充後是 100 個字元。對 `n` 位元組的訊息，原始大小是 `57 + 16 × ceil((n + 1) / 16)`。

這筆記錄也不是自我定界的。格式沒有長度前綴，規格說傳輸層必須知道權杖在哪裡結束。一個權杖放進一個欄位、cookie 或資料庫欄位。不要把兩個權杖串起來，然後指望解析器找到接縫。

時間戳值得單獨說一句。它是明文；看到權杖的人會知道它是在哪一秒建立的。它也在 HMAC 輸入裡，所以沒有人能移動它而不破壞標籤。可見與已驗證是兩件事，Fernet 刻意讓時間戳同時具備兩者。

## 密封：加密路徑

加密依照固定順序執行：

1. 讀一次時鐘。時間戳是 `int(time.time())`，編碼成無號 64 位元大端序整數。
2. 用 PKCS7 把明文填充到 16 的倍數。
3. 產生 16 個隨機位元組作為 IV。
4. 用加密金鑰與 AES-128-CBC 加密填充後的明文。
5. 組裝 `0x80 || 時間戳 || IV || 密文`。
6. 用簽章金鑰對這些確切的位元組計算 HMAC-SHA256，附加 32 位元組標籤。
7. 對整筆記錄做 base64url 編碼。

注意標籤是對原始標頭與密文計算，不是對明文，也不是對 base64 文字。版本、時間戳與 IV 都被涵蓋。改動記錄中任何一個較早的位元，標籤就會改變。

IV 是公開且隨機的。它不是秘密，也不是從金鑰派生。它唯一的工作，是讓相同明文的兩次加密產生不同密文。在 CBC 模式裡，跨訊息重複使用 IV 會洩漏它們的第一個區塊是否相同。Fernet 每個權杖都從作業系統 CSPRNG 產生全新的 IV。

```python
from cryptography.fernet import Fernet

key = Fernet.generate_key()          # 44 個 URL-safe base64 字元
f = Fernet(key)

token = f.encrypt(b"account=42; scope=read")
```

執行兩次，權杖會不同。明文一樣；時間戳與 IV 不一樣。這就是重點。

## 開啟：解密路徑

解密把記錄反過來處理，並把檢查放在適當位置，讓未經驗證的明文永遠不會逃出來。

1. 解碼 base64url。目前實作接受有填充或無填充的輸入，格式錯誤時拋出 `InvalidToken`。
2. 檢查長度與版本。至少 9 位元組，第一個位元組是 `0x80`。未知版本直接拒絕，不用猜。
3. 讀取時間戳——尚未驗證——若有提供 TTL，就檢查時窗。超過 `ttl` 秒，或時間戳比現在超前 60 秒以上的權杖會被拒絕。
4. 對最後 32 位元組以外的每個位元組重新計算 HMAC-SHA256，並用常數時間函式比較。不吻合就是 `InvalidToken`。
5. 這時才用 AES-128-CBC 解密並移除 PKCS7 填充。填充錯誤也是 `InvalidToken`。
6. 回傳明文。

目前實作有一個微妙之處：TTL 時窗會先檢查，而且用的是尚未驗證的時間戳。這可以提早拒絕權杖，但不能接受偽造的權杖。標籤檢查仍然擋在密文與 AES 之間，兩道檢查都通過後才會回傳明文。這個順序是快速失敗，不是信任時間戳。

架構規則是先驗證、後解密。如果 AES-CBC 解密比 MAC 檢查先跑，而應用程式又洩漏填充錯誤，攻擊者就得到一個 padding oracle。Fernet 不會暴露這條路。標籤會在任何密文被解密之前驗證，而每一種失敗都收斂成同一個沒有細節的例外。

```python
from cryptography.fernet import InvalidToken

try:
    plaintext = f.decrypt(token, ttl=300)
except InvalidToken:
    ...  # 失敗時關閉；不要依原因分支
```

`InvalidToken` 刻意不提供資訊。base64 格式錯誤、版本錯誤、TTL 過期、標籤錯誤、填充錯誤——呼叫端看到的是同一個例外。不要從外部建立區分它們的邏輯。

<figure class="fer-fig">
  <figcaption>
    <span class="card-tag">流程 // 02</span>
    <h3 class="fer-fig-title">封印每個位元組，等標籤同意後才開啟</h3>
    <p class="fer-fig-sub">加密先建好記錄，再對它簽章。解密先檢查記錄，再解密。</p>
  </figcaption>
  <div class="fer-scroll">
  <svg class="fer-svg" viewBox="0 0 840 400" role="img" aria-labelledby="fer-f2-title fer-f2-desc">
    <title id="fer-f2-title">Fernet 加密與解密流程</title>
    <desc id="fer-f2-desc">加密：明文經填充後以 AES-128-CBC 加密，與版本和時間戳組裝，再用 HMAC-SHA256 簽章，最後做 base64url 編碼。解密反向執行這些步驟，任何失敗都以 InvalidToken 拒絕。</desc>
    <defs>
      <marker id="fer-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">流程 // 先加密後 MAC</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">同一把金鑰 · 兩個方向</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <text x="24" y="56" class="t" font-size="12" font-weight="800">密封</text>
    <text x="24" y="72" class="f" font-size="7" letter-spacing="0.6">encrypt()</text>
    <text x="108" y="36" class="f" font-size="7" letter-spacing="0.8">01</text>
    <text x="252" y="36" class="f" font-size="7" letter-spacing="0.8">02</text>
    <text x="396" y="36" class="f" font-size="7" letter-spacing="0.8">03</text>
    <text x="540" y="36" class="f" font-size="7" letter-spacing="0.8">04</text>
    <text x="684" y="36" class="f" font-size="7" letter-spacing="0.8">05</text>
    <rect x="108" y="42" width="132" height="64" class="term"/>
    <text x="174" y="64" class="t" font-size="8.5" font-weight="700" text-anchor="middle">明文</text>
    <text x="174" y="80" class="m" font-size="7" text-anchor="middle">任意長度位元組</text>
    <text x="174" y="93" class="f" font-size="7" text-anchor="middle">原始訊息</text>
    <rect x="252" y="42" width="132" height="64" class="box"/>
    <text x="318" y="64" class="t" font-size="8.5" font-weight="700" text-anchor="middle">填充 + AES</text>
    <text x="318" y="80" class="m" font-size="7" text-anchor="middle">PKCS7 · AES-128-CBC</text>
    <text x="318" y="93" class="f" font-size="7" text-anchor="middle">全新隨機 IV</text>
    <text x="372" y="56" class="f" font-size="7" text-anchor="end" letter-spacing="0.06em">EK</text>
    <rect x="396" y="42" width="132" height="64" class="box"/>
    <text x="462" y="64" class="t" font-size="8.5" font-weight="700" text-anchor="middle">組裝</text>
    <text x="462" y="80" class="m" font-size="7" text-anchor="middle">80 | ts | IV | ct</text>
    <text x="462" y="93" class="f" font-size="7" text-anchor="middle">標頭 + 密文</text>
    <rect x="540" y="42" width="132" height="64" class="box"/>
    <text x="606" y="64" class="t" font-size="8.5" font-weight="700" text-anchor="middle">簽章</text>
    <text x="606" y="80" class="m" font-size="7" text-anchor="middle">HMAC-SHA256</text>
    <text x="606" y="93" class="f" font-size="7" text-anchor="middle">附加 32 位元組標籤</text>
    <text x="660" y="56" class="f" font-size="7" text-anchor="end" letter-spacing="0.06em">SK</text>
    <rect x="684" y="42" width="132" height="64" class="box"/>
    <text x="750" y="64" class="t" font-size="8.5" font-weight="700" text-anchor="middle">編碼</text>
    <text x="750" y="80" class="m" font-size="7" text-anchor="middle">base64url</text>
    <text x="750" y="93" class="f" font-size="7" text-anchor="middle">→ 權杖</text>
    <line x1="242" y1="74" x2="250" y2="74" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="386" y1="74" x2="394" y2="74" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="530" y1="74" x2="538" y2="74" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="674" y1="74" x2="682" y2="74" class="arrow" marker-end="url(#fer-arrow)"/>
    <text x="108" y="124" class="m" font-size="7.5">標籤涵蓋原始標頭與密文；base64url 在之後才發生。</text>
    <line x1="108" y1="132" x2="816" y2="132" class="rule"/>
    <line x1="24" y1="146" x2="816" y2="146" class="dash"/>
    <rect x="344" y="138" width="152" height="16" fill="var(--mono-paper)"/>
    <text x="420" y="149" class="f" font-size="7" text-anchor="middle" letter-spacing="0.8">同一把金鑰 · 相反方向</text>
    <text x="24" y="188" class="t" font-size="12" font-weight="800">開啟</text>
    <text x="24" y="204" class="f" font-size="7" letter-spacing="0.6">decrypt(ttl)</text>
    <text x="108" y="168" class="f" font-size="7" letter-spacing="0.8">01</text>
    <text x="228" y="168" class="f" font-size="7" letter-spacing="0.8">02</text>
    <text x="348" y="168" class="f" font-size="7" letter-spacing="0.8">03</text>
    <text x="468" y="168" class="f" font-size="7" letter-spacing="0.8">04</text>
    <text x="588" y="168" class="f" font-size="7" letter-spacing="0.8">05</text>
    <text x="708" y="168" class="f" font-size="7" letter-spacing="0.8">06</text>
    <rect x="108" y="174" width="108" height="64" class="term"/>
    <text x="162" y="196" class="t" font-size="8" font-weight="700" text-anchor="middle">權杖</text>
    <text x="162" y="212" class="m" font-size="7" text-anchor="middle">bytes or str</text>
    <text x="162" y="225" class="f" font-size="7" text-anchor="middle">完整記錄</text>
    <rect x="228" y="174" width="108" height="64" class="box"/>
    <text x="282" y="196" class="t" font-size="8" font-weight="700" text-anchor="middle">解碼</text>
    <text x="282" y="212" class="m" font-size="7" text-anchor="middle">base64url</text>
    <text x="282" y="225" class="f" font-size="7" text-anchor="middle">版本 0x80</text>
    <rect x="348" y="174" width="108" height="64" class="box"/>
    <text x="402" y="196" class="t" font-size="8" font-weight="700" text-anchor="middle">時窗</text>
    <text x="402" y="212" class="m" font-size="7" text-anchor="middle">ts + ttl ≥ now</text>
    <text x="402" y="225" class="f" font-size="7" text-anchor="middle">未來 ≤ 60 秒</text>
    <rect x="468" y="174" width="108" height="64" class="box"/>
    <text x="522" y="196" class="t" font-size="8" font-weight="700" text-anchor="middle">驗證</text>
    <text x="522" y="212" class="m" font-size="7" text-anchor="middle">HMAC-SHA256</text>
    <text x="522" y="225" class="f" font-size="7" text-anchor="middle">常數時間</text>
    <text x="564" y="186" class="f" font-size="7" text-anchor="end" letter-spacing="0.06em">SK</text>
    <rect x="588" y="174" width="108" height="64" class="box"/>
    <text x="642" y="196" class="t" font-size="8" font-weight="700" text-anchor="middle">解密</text>
    <text x="642" y="212" class="m" font-size="7" text-anchor="middle">AES-128-CBC</text>
    <text x="642" y="225" class="f" font-size="7" text-anchor="middle">PKCS7 移除填充</text>
    <text x="684" y="186" class="f" font-size="7" text-anchor="end" letter-spacing="0.06em">EK</text>
    <rect x="708" y="174" width="108" height="64" class="term"/>
    <text x="762" y="196" class="t" font-size="8" font-weight="700" text-anchor="middle">明文</text>
    <text x="762" y="212" class="m" font-size="7" text-anchor="middle">已驗證</text>
    <text x="762" y="225" class="f" font-size="7" text-anchor="middle">否則全無</text>
    <line x1="216" y1="206" x2="226" y2="206" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="336" y1="206" x2="346" y2="206" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="456" y1="206" x2="466" y2="206" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="576" y1="206" x2="586" y2="206" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="696" y1="206" x2="706" y2="206" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="108" y1="252" x2="816" y2="252" class="rule"/>
    <text x="108" y="270" class="t" font-size="9" font-weight="800">×</text>
    <text x="126" y="270" class="t" font-size="8" font-weight="700" letter-spacing="0.02em">上方任一檢查失敗 → cryptography.fernet.InvalidToken</text>
    <text x="126" y="284" class="m" font-size="7.5">單一例外 · 不透露原因 · 不輸出部分明文</text>
    <text x="816" y="270" class="f" font-size="7" text-anchor="end">預設拒絕</text>
    <line x1="24" y1="316" x2="816" y2="316" class="rule"/>
    <text x="24" y="336" class="f" font-size="7" letter-spacing="0.9">為何順序成立</text>
    <text x="24" y="352" class="t" font-size="8" font-weight="700">先驗證，再解密</text>
    <text x="24" y="366" class="m" font-size="7">標籤會先被檢查，AES 才看到</text>
    <text x="24" y="378" class="m" font-size="7">密文；因此填充錯誤永遠不會</text>
    <text x="24" y="390" class="m" font-size="7">變成預言機。</text>
    <line x1="288" y1="326" x2="288" y2="394" class="rule"/>
    <text x="312" y="336" class="f" font-size="7" letter-spacing="0.9">為何用兩把金鑰</text>
    <text x="312" y="352" class="t" font-size="8" font-weight="700">不共用金鑰材料</text>
    <text x="312" y="366" class="m" font-size="7">HMAC 與 AES 使用 32 位元組金鑰的</text>
    <text x="312" y="378" class="m" font-size="7">不同半部。其中一邊的弱點，無法</text>
    <text x="312" y="390" class="m" font-size="7">透過另一邊轉移。</text>
    <line x1="576" y1="326" x2="576" y2="394" class="rule"/>
    <text x="600" y="336" class="f" font-size="7" letter-spacing="0.9">為何 IV 是公開的</text>
    <text x="600" y="352" class="t" font-size="8" font-weight="700">為了新鮮度，不是保密</text>
    <text x="600" y="366" class="m" font-size="7">隨機 IV 讓相同的明文</text>
    <text x="600" y="378" class="m" font-size="7">密封成不同的密文。它是刻意</text>
    <text x="600" y="390" class="m" font-size="7">以明文傳送的。</text>
  </svg>
  </div>
  <div class="fer-fig-src">FERNET v0x80 · 先加密後 MAC · 先驗證後解密</div>
</figure>

## 篡改測試台

封印只有在涵蓋正確的位元組時才有用。選一個實驗，看看第一個攔下它的檢查是什麼。

<figure class="fer-lab">
  <figcaption>
    <span class="card-tag">篡改測試台 // 03</span>
    <h3 class="fer-fig-title">封印涵蓋標頭，不只涵蓋載荷</h3>
    <p class="fer-fig-sub">選一種改動。判決會指出第一個能攔下它的檢查。</p>
  </figcaption>
  <div class="fer-chips" role="group" aria-label="選一個篡改實驗">
    <label class="fer-chip"><input type="radio" name="fer-tamper" id="fer-t0" checked><span>原封不動</span></label>
    <label class="fer-chip"><input type="radio" name="fer-tamper" id="fer-t1"><span>翻轉密文一位元</span></label>
    <label class="fer-chip"><input type="radio" name="fer-tamper" id="fer-t2"><span>時間戳加一秒</span></label>
    <label class="fer-chip"><input type="radio" name="fer-tamper" id="fer-t3"><span>使用過期權杖</span></label>
    <label class="fer-chip"><input type="radio" name="fer-tamper" id="fer-t4"><span>改掉版本位元組</span></label>
  </div>
  <div class="fer-lab-scroll">
    <div class="fer-lab-strip-wrap">
      <div class="fer-strip" aria-hidden="true">
        <div class="fer-seg fer-seg-v"><b>80</b></div>
        <div class="fer-seg fer-seg-ts"><b>時間戳</b><span>8 B</span></div>
        <div class="fer-seg fer-seg-iv"><b>IV</b><span>16 B</span></div>
        <div class="fer-seg fer-seg-ct"><b>密文</b><span>N × 16 B</span></div>
        <div class="fer-seg fer-seg-tag"><b>HMAC</b><span>32 B</span></div>
      </div>
      <div class="fer-strip-legend" aria-hidden="true">
        <span>版本</span><span>時間戳</span><span>IV</span><span>密文</span><span>標籤</span>
      </div>
    </div>
  </div>
  <div class="fer-verdicts">
    <div class="fer-verdict fer-verdict-0">
      <span class="fer-stamp">接受</span>
      <p><b>五個欄位都解析成功、標籤吻合、時窗開啟、填充有效。</b>Fernet 會傳回明文。同一則訊息加密兩次仍會長得不同，因為 IV 與時間戳都變了。</p>
    </div>
    <div class="fer-verdict fer-verdict-1">
      <span class="fer-stamp fer-stamp--reject">拒絕</span>
      <p><b>第一個失敗的檢查是驗證（VERIFY）。</b>翻轉一個位元就改變了 HMAC 輸入，32 位元組標籤不再吻合。AES 根本不會執行。這就是把可延展的 CBC 密文變成全有或全無記錄的關鍵。</p>
    </div>
    <div class="fer-verdict fer-verdict-2">
      <span class="fer-stamp fer-stamp--reject">拒絕</span>
      <p><b>第一個失敗的檢查是驗證（VERIFY）。</b>時間戳在密文之外，卻在標籤之內。加一秒仍不會關閉 TTL 時窗，所以是由 HMAC 攔下。若往前跳得更多，也會觸發 60 秒時鐘偏移檢查。</p>
    </div>
    <div class="fer-verdict fer-verdict-3">
      <span class="fer-stamp fer-stamp--reject">拒絕</span>
      <p><b>第一個失敗的檢查是時窗（WINDOW）。</b>標籤有效，訊息也是真的；它只是對接收方選的 TTL 來說太舊了。拒絕一個真實但過期的權杖是政策決定，不是密碼學失敗。</p>
    </div>
    <div class="fer-verdict fer-verdict-4">
      <span class="fer-stamp fer-stamp--reject">拒絕</span>
      <p><b>第一個失敗的檢查是解碼（DECODE）。</b>未知的版本位元組會在任何金鑰被使用前就被拒絕。版本欄位讓格式可以演進，不必猜測未來佈局的意義。</p>
    </div>
  </div>
  <div class="fer-fig-src">純 CSS · 無 JavaScript · 長條圖為示意</div>
</figure>

## 封印證明什麼——以及不證明什麼

Fernet 是一個驗證加密配方：機密性、完整性與真實性，透過組合而非單一 AEAD 原生元件達成。當你開始要求更多功能時，這個差別就很重要。

| 性質 | Fernet 如何得到 | 邊界在哪裡 |
| :--- | :--- | :--- |
| 機密性 | AES-128-CBC 與全新的隨機 IV | 金鑰持有者可以讀；時間戳仍然可見 |
| 完整性 | 對標頭與密文計算 HMAC-SHA256 | 任何一個位元改動都會拒絕整個權杖 |
| 真實性 | 以獨立的簽章金鑰計算 HMAC | 持有金鑰的人可以偽造有效權杖 |
| 新鮮度 | 對標籤涵蓋的時間戳套用 TTL 時窗 | 不是防重放；容許 60 秒時鐘偏移 |
| 格式演進 | `0x80` 版本位元組 | 未知版本會被拒絕，不會協商 |

最常讓人踩雷的缺口是**關聯資料**。Fernet 沒有 AAD 參數。如果一個權杖對租戶 A 有效，你把它拿去租戶 B 使用，Fernet 不會發現。標籤驗證的是位元組，不是意義。

把上下文綁在載荷層。把租戶、用途或路由放進加密的 JSON，並在解密後檢查。或為每個上下文用 HKDF 派生不同的金鑰。不要把上下文字串接在權杖前面就說它已被驗證；只有 HMAC 輸入裡的位元組才被涵蓋。

```python
import json
from cryptography.fernet import Fernet, InvalidToken

def seal(f: Fernet, context: str, payload: dict) -> bytes:
    envelope = {"ctx": context, "data": payload}
    return f.encrypt(json.dumps(envelope, separators=(",", ":")).encode())


def open_sealed(f: Fernet, context: str, token: bytes, ttl: int = 300) -> dict:
    envelope = json.loads(f.decrypt(token, ttl=ttl))
    if not isinstance(envelope, dict) or envelope.get("ctx") != context:
        raise InvalidToken("wrong context")
    return envelope["data"]
```

這不會阻止權杖在同一個上下文裡被重放。被捕獲的權杖在 TTL 到期前就是一個持有者憑證。如果操作是一次性的——密碼重設、付款、邀請——把 nonce 或權杖 ID 放進明文，在伺服器端記錄，並拒絕重複。TTL 縮短重放窗口；它不會關閉窗口。

前向保密也不在選單上。一把長期金鑰可以解密它加密過的每一個權杖。輪替限制了爆炸半徑；它不會回到每則訊息一把金鑰的做法。如果你需要前向保密，對稱式檔案格式就是錯的工具。

## 輪替、密碼，以及那些無聊的維運細節

### 不需要一次性切換的金鑰輪替

`MultiFernet` 接受一串 `Fernet` 實例。它用第一把金鑰加密，解密時依序嘗試每一把。

```python
from cryptography.fernet import Fernet, MultiFernet

ring = MultiFernet([Fernet(new_key), Fernet(old_key)])
new_token = ring.rotate(old_token)   # 用新金鑰重新封緘
```

`rotate()` 會保留原始時間戳。這也保留了原始 TTL：距離到期還有五分鐘的權杖，輪替後仍然距離到期五分鐘。如果你需要全新的壽命，解密後重新加密——但只限於你真的想讓它重新起算的資料。

輪替不是清單改了就算完成。重新加密已儲存的權杖，舊金鑰只保留到最老的權杖還能存活的時間，然後移除。`extract_timestamp()` 會在回傳時間戳前驗證標籤，所以用它排程重新加密是安全的。

### 密碼不是金鑰

`Fernet` 要的是金鑰，不是密碼短語。如果秘密由人提供，讓它經過帶有每位使用者專屬鹽的金鑰派生函式。cryptography 文件建議 Argon2id；輸出是 32 位元組，你再做 base64url 編碼。

```python
import base64
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.kdf.argon2 import Argon2id

password = os.environ["FERNET_PASSPHRASE"].encode()  # 位元組，執行時提供
salt = os.urandom(16)
kdf = Argon2id(
    salt=salt,
    length=32,
    iterations=1,
    lanes=4,
    memory_cost=2**21,
)
key = base64.urlsafe_b64encode(kdf.derive(password))
f = Fernet(key)
```

把鹽存在密文旁邊。不要在日誌裡記錄密碼或派生出的金鑰。上面的參數遵循文件引用的 RFC 9106 建議。如果你的 `cryptography` 版本還沒有 Argon2id API，請升級，或改用明確參數的 `Scrypt`——不要用密碼的原始 SHA-256。

### 把權杖當成憑證

Fernet 權杖是加密的，但在到期前它也是一個持有者憑證。不要把權杖放進 URL、分析事件或錯誤訊息。記錄操作，以及你自己封套裡的金鑰版本，不要記錄權杖本身。

Fernet 沒有金鑰識別碼欄位。`MultiFernet` 依序嘗試金鑰，不會告訴你是哪一把成功。如果輪替遙測很重要，把權杖包進你自己的封套並附上金鑰 ID，或在儲存時把金鑰版本記在密文旁邊。

## 自己打開一個權杖

要親眼看到佈局，而不只是相信圖，用標準函式庫解碼一個權杖。這裡用的是加密它的同一把金鑰。

```python
import base64
import hashlib
import hmac
import struct

raw = base64.urlsafe_b64decode(token)
version = raw[0]
timestamp = struct.unpack(">Q", raw[1:9])[0]
iv = raw[9:25]
ciphertext = raw[25:-32]
tag = raw[-32:]

key_bytes = base64.urlsafe_b64decode(fernet_key)
signing_key, encryption_key = key_bytes[:16], key_bytes[16:]

expected = hmac.new(signing_key, raw[:-32], hashlib.sha256).digest()
assert hmac.compare_digest(expected, tag)
assert len(ciphertext) % 16 == 0
```

然後故意破壞它。翻轉密文中的一個位元，重新編碼記錄：

```python
raw = bytearray(base64.urlsafe_b64decode(token))
raw[-40] ^= 0x01                  # 在密文內、標籤之前
tampered = base64.urlsafe_b64encode(bytes(raw))
f.decrypt(tampered)               # InvalidToken
```

對任何至少有一個區塊的權杖，位元組 `-40` 一定落在密文裡：標籤佔最後 32 位元組，所以 `-40` 是標籤前八個位元組。改動時間戳的一個位元組，標籤也會失敗。如果解密時提供 TTL，較大的時間跳躍可能會先被時窗拒絕；無論如何，都不會出現明文。這就是為什麼標頭在 MAC 裡面。

## 簡短檢查清單

- 用 `Fernet.generate_key()` 產生金鑰，放進秘密管理器，不要寫在程式碼裡。
- 解密任何會過期的內容時傳入 TTL。傳送方無法強制到期；接收方才能決定。
- 把上下文綁進明文。Fernet 沒有關聯資料。
- 一次性操作要加入 nonce。TTL 不是防重放。
- 用 `MultiFernet` 輪替，重新加密已儲存的權杖，並按排程淘汰舊金鑰。
- 密碼派生金鑰請用 Argon2id 或 Scrypt，不要只用單純的雜湊。
- 捕捉 `InvalidToken`，失敗時關閉，不要記錄敏感資訊。
- 把權杖當成持有者憑證；高價值操作使用更短的 TTL。
- 保持時鐘同步。實作容許 60 秒的未來偏移，不是無上限。
- 如果你用其他語言實作這個格式，先跑規格的驗收測試，再信任你的解析器。

## 參考資料

- [Fernet 規範 v0x80](https://github.com/fernet/spec/blob/master/Spec.md)——欄位佈局、金鑰格式與產生步驟。
- [cryptography：Fernet（對稱式加密）](https://cryptography.io/en/latest/fernet/)——API、`MultiFernet`、密碼派生與限制。
- [cryptography `fernet.rs`](https://github.com/pyca/cryptography/blob/main/src/rust/src/fernet.rs)——目前實作，包括 60 秒時鐘偏移與檢查順序。
- [fernet-rb](https://github.com/fernet/fernet-rb)——最初的 Ruby 實作。
- [RFC 4648](https://www.rfc-editor.org/rfc/rfc4648)——base64url。
- [RFC 5652 §6.3](https://www.rfc-editor.org/rfc/rfc5652#section-6.3)——PKCS#7 填充。
- [RFC 2104](https://www.rfc-editor.org/rfc/rfc2104)——HMAC。
- [NIST SP 800-38A](https://csrc.nist.gov/pubs/sp/800/38/a/final)——CBC 模式。
- [RFC 9106](https://www.rfc-editor.org/rfc/rfc9106)——Argon2 參數。

<style>
  .prose-inner .fer-fig,
  .prose-inner .fer-lab {
    margin: 26px 0;
    padding: 20px 18px 14px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
  }

  .prose-inner .fer-fig figcaption,
  .prose-inner .fer-lab figcaption {
    margin-bottom: 14px;
  }

  .prose-inner .fer-fig-title {
    margin: 4px 0 3px;
    font-size: 15.5px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.3;
    color: var(--mono-ink);
  }

  .prose-inner .fer-fig-sub {
    margin: 0;
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--mono-muted);
  }

  .prose-inner .fer-fig-src {
    margin-top: 12px;
    padding-top: 8px;
    border-top: 0.7px solid var(--mono-grid);
    font-family: var(--mono-font-mono);
    font-size: 8.5px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mono-faint);
  }

  .prose-inner .fer-scroll {
    overflow-x: auto;
  }

  .prose-inner .fer-svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .prose-inner .fer-svg text {
    font-family: var(--mono-font);
  }

  .prose-inner .fer-svg .t {
    fill: var(--mono-ink);
  }

  .prose-inner .fer-svg .m {
    fill: var(--mono-muted);
  }

  .prose-inner .fer-svg .f {
    fill: var(--mono-faint);
    font-family: var(--mono-font-mono);
  }

  .prose-inner .fer-svg .mono {
    font-family: var(--mono-font-mono);
  }

  .prose-inner .fer-svg .box {
    fill: var(--mono-paper);
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .fer-svg .term {
    fill: var(--mono-bg-subtle);
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .fer-svg .codebox {
    fill: var(--mono-bg-subtle);
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .fer-svg .rule {
    stroke: var(--mono-grid);
    stroke-width: 0.7;
  }

  .prose-inner .fer-svg .dash {
    fill: none;
    stroke: var(--mono-l5);
    stroke-width: 0.7;
    stroke-dasharray: 2 3;
  }

  .prose-inner .fer-svg .arrow {
    fill: none;
    stroke: var(--mono-ink);
    stroke-width: 0.8;
  }

  .prose-inner .fer-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }

  .prose-inner .fer-chip {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 5px 9px;
    border: 0.7px solid var(--mono-grid);
    background: var(--mono-paper);
    font-family: var(--mono-font-mono);
    font-size: 8.5px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--mono-muted);
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  }

  .prose-inner .fer-chip:hover {
    border-color: var(--mono-l5);
    color: var(--mono-ink);
  }

  .prose-inner .fer-chip input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .prose-inner .fer-chip:has(input:checked) {
    background: var(--mono-ink);
    border-color: var(--mono-ink);
    color: var(--mono-paper);
  }

  .prose-inner .fer-chip:has(input:focus-visible) {
    outline: 0.8px solid var(--mono-ink);
    outline-offset: 2px;
  }

  .prose-inner .fer-lab-scroll {
    overflow-x: auto;
  }

  .prose-inner .fer-lab-strip-wrap {
    min-width: 560px;
  }

  .prose-inner .fer-strip {
    display: flex;
    height: 74px;
    border: 0.7px solid var(--mono-grid);
    margin-bottom: 5px;
  }

  .prose-inner .fer-seg {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 3px;
    padding: 0 8px;
    border-right: 0.7px solid var(--mono-grid);
    min-width: 0;
    overflow: hidden;
    transition: background 0.15s ease;
  }

  .prose-inner .fer-seg:last-child {
    border-right: 0;
  }

  .prose-inner .fer-seg-v {
    flex: 0 0 5%;
    background: var(--mono-l1);
    color: var(--mono-paper);
    padding: 0;
    align-items: center;
  }

  .prose-inner .fer-seg-ts {
    flex: 0 0 13%;
    background: var(--mono-l2);
    color: var(--mono-paper);
  }

  .prose-inner .fer-seg-iv {
    flex: 0 0 17%;
    background: var(--mono-l7);
  }

  .prose-inner .fer-seg-ct {
    flex: 0 0 29%;
    background: var(--mono-l5);
  }

  .prose-inner .fer-seg-tag {
    flex: 0 0 36%;
    background: var(--mono-l1);
    color: var(--mono-paper);
  }

  .prose-inner .fer-seg b {
    font-family: var(--mono-font-mono);
    font-size: 7.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    white-space: nowrap;
  }

  .prose-inner .fer-seg span {
    font-family: var(--mono-font-mono);
    font-size: 6.5px;
    letter-spacing: 0.05em;
    opacity: 0.75;
    white-space: nowrap;
  }

  .prose-inner .fer-strip-legend {
    display: flex;
    margin-bottom: 14px;
    font-family: var(--mono-font-mono);
    font-size: 6.5px;
    letter-spacing: 0.07em;
    color: var(--mono-faint);
    text-transform: uppercase;
  }

  .prose-inner .fer-strip-legend span:nth-child(1) {
    flex: 0 0 5%;
  }

  .prose-inner .fer-strip-legend span:nth-child(2) {
    flex: 0 0 13%;
  }

  .prose-inner .fer-strip-legend span:nth-child(3) {
    flex: 0 0 17%;
  }

  .prose-inner .fer-strip-legend span:nth-child(4) {
    flex: 0 0 29%;
  }

  .prose-inner .fer-strip-legend span:nth-child(5) {
    flex: 0 0 36%;
  }

  .prose-inner .fer-verdict {
    display: none;
    grid-template-columns: 104px 1fr;
    gap: 16px;
    align-items: start;
    padding-top: 13px;
    border-top: 0.7px solid var(--mono-grid);
  }

  .prose-inner .fer-stamp {
    display: inline-block;
    justify-self: start;
    padding: 4px 7px;
    border: 0.8px solid var(--mono-ink);
    font-family: var(--mono-font-mono);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .prose-inner .fer-stamp--reject {
    background: var(--mono-ink);
    color: var(--mono-paper);
  }

  .prose-inner .fer-verdict p {
    margin: 0;
    font-size: 11.5px;
    line-height: 1.65;
    color: var(--mono-l2);
  }

  .prose-inner .fer-verdict p b {
    color: var(--mono-ink);
  }

  .prose-inner .fer-verdict-0 {
    display: grid;
  }

  .prose-inner .fer-lab:has(#fer-t1:checked) .fer-verdict-0,
  .prose-inner .fer-lab:has(#fer-t2:checked) .fer-verdict-0,
  .prose-inner .fer-lab:has(#fer-t3:checked) .fer-verdict-0,
  .prose-inner .fer-lab:has(#fer-t4:checked) .fer-verdict-0 {
    display: none;
  }

  .prose-inner .fer-lab:has(#fer-t0:checked) .fer-verdict-0,
  .prose-inner .fer-lab:has(#fer-t1:checked) .fer-verdict-1,
  .prose-inner .fer-lab:has(#fer-t2:checked) .fer-verdict-2,
  .prose-inner .fer-lab:has(#fer-t3:checked) .fer-verdict-3,
  .prose-inner .fer-lab:has(#fer-t4:checked) .fer-verdict-4 {
    display: grid;
  }

  .prose-inner .fer-lab:has(#fer-t1:checked) .fer-seg-ct,
  .prose-inner .fer-lab:has(#fer-t2:checked) .fer-seg-ts,
  .prose-inner .fer-lab:has(#fer-t3:checked) .fer-seg-ts,
  .prose-inner .fer-lab:has(#fer-t4:checked) .fer-seg-v {
    outline: 1.4px solid var(--mono-ink);
    outline-offset: -1.4px;
    background-image: repeating-linear-gradient(
      135deg,
      transparent 0 3px,
      rgba(28, 28, 26, 0.18) 3px 5px
    );
  }

  .prose-inner .fer-lab:has(#fer-t3:checked) .fer-strip {
    border-color: var(--mono-ink);
  }

  @media (max-width: 700px) {
    .prose-inner .fer-svg {
      min-width: 680px;
    }

    .prose-inner .fer-verdict {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .prose-inner .fer-seg span {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .prose-inner .fer-chip,
    .prose-inner .fer-seg {
      transition: none;
    }
  }
</style>
