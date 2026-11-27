---
title: "Fernet 密封：认证加密令牌的解剖学"
description: "从字节层级拆解 Fernet 令牌、先加密后 MAC 的流程，以及一把 32 字节密钥能与不能承诺的事。"
pubDate: 2026-11-23
category: "Security"
tags: ["密码学", "Fernet", "Python", "信息安全"]
featured: false
author: "Alex.Hsiao"
readTime: "14 分钟"
cardImage: "./cover.webp"
cardImageAlt: "NIST SP 800-38A 的 CBC 加密与解密链式图"
---

# Fernet 密封：认证加密令牌的解剖学

Fernet 令牌看起来像一串从 base64 编码器逃出来的密码。它其实是一条五字段的记录，封口上还钉着一张收据。

Fernet 是 Python `cryptography` 包里的高层认证加密配方：一把 32 字节密钥、一个不透明的令牌，以及 `encrypt()` 与 `decrypt()` 两个方法。认证加密把两个承诺绑在一起：没有密钥就读不出密文，而任何改动都会被发现。

那张收据就是整个设计的核心。Fernet 不只把字节藏起来；它让封套里的每个字节都对同一个 32 字节标签负责。改动密文、IV、时间戳或版本，标签就不再匹配。消息要么是密钥持有者封进去的那一份，要么什么都没有。

这篇文章从字节层级拆解这个格式：每个保证从哪里来、设计在哪里停下，以及为什么 Python API 就只有两个方法。

## 是配方，不是密码学原语

AES 是分组加密算法。它本身不会告诉你该用哪种模式、最后一个分组怎么填充、IV 从哪里来、要认证哪些字节，或用什么方式比较标签才不会泄露时间。上述每一个选择，都是可能把方案写错、却仍能解出东西的地方。

Fernet 把这些选择拿走。它固定了：

- 用 **AES-128-CBC** 与 PKCS7 填充提供机密性。
- 用 **HMAC-SHA256** 提供完整性与真实性。
- **先加密后 MAC**：标签是对完成的头部与密文计算。
- 每个令牌都使用**全新的随机 IV**。
- **带版本、URL-safe 的记录**，时间戳放在封印内。

没有加密算法协商，也没有办法要求换一种模式。API 表面就是 `encrypt()` 与 `decrypt()`。这种狭窄正是它的特色。

取舍也同样固定。你得到的是这个组合的保证，不是现代带关联数据的 AEAD 所给的保证。后面会再谈。

这个格式在 2012 年始于 Heroku 的一个小型 Ruby gem，作者是 Harold Giménez。Keith Rarick 在 2013 年写了 Go 实现与规范，[pyca/cryptography](https://cryptography.io/en/latest/fernet/) 随后把它采纳为高层对称加密配方。名字是对意大利餐后酒 Fernet 的玩笑；字段布局可不是。

> Fernet 不会让消息变成真的。它让消息可以被发现篡改，而且只有持有密钥的人能读。这些承诺比较窄，却有用得多。

## 一把密钥，两项任务

`Fernet.generate_key()` 返回 44 个 URL-safe base64 字符。解码后是 32 字节。前 16 字节是签名密钥，后 16 字节是加密密钥。顺序是[规范](https://github.com/fernet/spec/blob/master/Spec.md)的一部分，不是本地约定。

一把密钥拆成两把，是域分离。HMAC-SHA256 与 AES-128-CBC 从不共享密钥材料，所以其中一种构造的弱点，无法通过共享秘密转移到另一种。实际上两半仍是同一个秘密：持有那 44 个字符的人，可以读取每一条消息，也可以伪造新的令牌。Fernet 是对称的，所以密钥分发是它不解决的难题。

`generate_key()` 使用操作系统的 CSPRNG。不要用哈希口令来生成密钥，也不要把 32 个 ASCII 字符直接传给 `Fernet(...)` 就以为可以。构造函数要的是 base64url 解码后的 32 字节，不是解码前的 32 个字符。

<figure class="fer-fig">
  <figcaption>
    <span class="card-tag">字段地图 // 01</span>
    <h3 class="fer-fig-title">一把密钥拆成两把；一个令牌承载五个字段</h3>
    <p class="fer-fig-sub">密钥的两半从不互换角色。标签覆盖它之前的每一个字节。</p>
  </figcaption>
  <div class="fer-scroll">
  <svg class="fer-svg" viewBox="0 0 840 476" role="img" aria-labelledby="fer-f1-title fer-f1-desc">
    <title id="fer-f1-title">Fernet 密钥与令牌结构</title>
    <desc id="fer-f1-desc">32 字节密钥拆成 16 字节签名密钥与 16 字节加密密钥。令牌由版本字节、8 字节时间戳、16 字节 IV、密文，以及对前四个字段计算的 32 字节 HMAC 标签组成。</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">FERNET // 字段地图</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">版本 0x80 · 原始字节</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <text x="24" y="46" class="f" font-size="7" letter-spacing="1.1">01 / 密钥</text>
    <text x="24" y="64" class="t" font-size="10.5" font-weight="700">一把 32 字节的秘密，两项独立任务</text>
    <text x="816" y="64" class="m" font-size="7.5" text-anchor="end">base64url · 44 个字符</text>
    <rect x="24" y="76" width="394" height="52" fill="var(--mono-l1)"/>
    <rect x="422" y="76" width="394" height="52" fill="var(--mono-l3)"/>
    <text x="40" y="97" fill="var(--mono-paper)" font-size="9" font-weight="700" letter-spacing="0.04em">签名密钥</text>
    <text x="40" y="112" fill="var(--mono-paper)" font-size="7.5">字节 0–15 · HMAC-SHA256</text>
    <text x="438" y="97" fill="var(--mono-paper)" font-size="9" font-weight="700" letter-spacing="0.04em">加密密钥</text>
    <text x="438" y="112" fill="var(--mono-paper)" font-size="7.5">字节 16–31 · AES-128-CBC</text>
    <text x="24" y="144" class="f" font-size="7" letter-spacing="0.8">解码这 44 个字符</text>
    <text x="816" y="144" class="f" font-size="7" text-anchor="end" letter-spacing="0.8">共 32 字节</text>
    <line x1="24" y1="150" x2="816" y2="150" class="rule"/>
    <text x="24" y="174" class="f" font-size="7" letter-spacing="1.1">02 / 令牌</text>
    <text x="24" y="192" class="t" font-size="10.5" font-weight="700">五个字段，一个固定顺序</text>
    <text x="816" y="192" class="m" font-size="7.5" text-anchor="end">最少 73 字节 · 100 个 base64url 字符</text>
    <text x="246" y="212" class="m" font-size="7.2" text-anchor="middle" letter-spacing="0.9">HMAC-SHA256 输入 // 此括号以下的每个字节</text>
    <path d="M24 222 V218 H468 V222" fill="none" stroke="var(--mono-l5)" stroke-width="0.7"/>
    <rect x="24" y="230" width="12" height="62" fill="var(--mono-l1)" stroke="var(--mono-grid)" stroke-width="0.7"/>
    <rect x="36" y="230" width="88" height="62" fill="var(--mono-l2)" stroke="var(--mono-grid)" stroke-width="0.7"/>
    <rect x="124" y="230" width="172" height="62" fill="var(--mono-l7)" stroke="var(--mono-grid)" stroke-width="0.7"/>
    <rect x="296" y="230" width="172" height="62" fill="var(--mono-l5)" stroke="var(--mono-grid)" stroke-width="0.7"/>
    <rect x="468" y="230" width="348" height="62" fill="var(--mono-l1)" stroke="var(--mono-grid)" stroke-width="0.7"/>
    <text x="24" y="226" class="t mono" font-size="7" font-weight="700">0x80</text>
    <line x1="30" y1="228" x2="30" y2="230" stroke="var(--mono-l5)" stroke-width="0.7"/>
    <text x="80" y="256" fill="var(--mono-paper)" font-size="7" font-weight="700" text-anchor="middle" letter-spacing="0.06em">时间戳</text>
    <text x="80" y="271" fill="var(--mono-paper)" font-size="7" text-anchor="middle">8 B · 大端序</text>
    <text x="210" y="256" class="t" font-size="7.5" font-weight="700" text-anchor="middle" letter-spacing="0.06em">IV</text>
    <text x="210" y="271" class="m" font-size="7" text-anchor="middle">16 B · CSPRNG</text>
    <text x="382" y="256" class="t" font-size="7.5" font-weight="700" text-anchor="middle" letter-spacing="0.06em">密文</text>
    <text x="382" y="271" class="m" font-size="7" text-anchor="middle">N × 16 B</text>
    <text x="642" y="256" fill="var(--mono-paper)" font-size="8" font-weight="700" text-anchor="middle" letter-spacing="0.06em">HMAC-SHA256</text>
    <text x="642" y="271" fill="var(--mono-paper)" font-size="7" text-anchor="middle">32 B · 标签</text>
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
    <text x="24" y="336" class="f" font-size="7">字节偏移 · N = 密文长度</text>
    <g font-size="8" fill="var(--mono-l2)">
      <text x="24" y="358" class="f" font-size="7">01</text>
      <text x="46" y="358">头部是可读的。版本与时间戳是明文，但时间戳仍经过认证。</text>
      <text x="24" y="376" class="f" font-size="7">02</text>
      <text x="46" y="376">载荷会被填充。PKCS7 会加入 1–16 字节，所以密文永不为空，且一定是 16 的倍数。</text>
      <text x="24" y="394" class="f" font-size="7">03</text>
      <text x="46" y="394">封印是 32 字节。改动前面任一字段的一个比特，标签就不再匹配。</text>
    </g>
    <rect x="24" y="410" width="792" height="34" class="codebox"/>
    <text x="40" y="431" class="t mono" font-size="8">raw = 57 + 16 × ceil((n + 1) / 16) bytes   →   base64url = 4 × ceil(raw / 3) characters</text>
    <text x="24" y="462" class="m" font-size="7.5">Base64url 只是传输外壳：它增加 33%，什么都藏不住。空消息仍会产生 73 个原始字节。</text>
  </svg>
  </div>
  <div class="fer-fig-src">FERNET 规范 v0x80 · 字段大小 · 密钥拆分</div>
</figure>

## 五个字段，一个封印

每个令牌都是一条串联记录的 base64url 编码。没有分隔符、没有长度前缀、没有可选字段。

| 字段 | 大小 | 起始位置 | 可见 | 作用 |
| :--- | ---: | ---: | :--- | :--- |
| 版本 | 1 字节 | 0 | 是 | `0x80`，目前唯一定义的版本 |
| 时间戳 | 8 字节 | 1 | 是 | uint64 大端序，Unix epoch 以来的秒数 |
| IV | 16 字节 | 9 | 是 | 全新的随机 AES-CBC 初始化向量 |
| 密文 | N × 16 字节 | 25 | 否 | 填充后的 AES-128-CBC 输出 |
| HMAC | 32 字节 | 25 + N | 否 | 对前 25 + N 字节计算的 SHA-256 标签 |

从这个布局可以推出两个关于大小的结论。

PKCS7 永远至少加入一个字节，即使消息刚好停在分组边界。空消息因此会产生一个 16 字节的密文分组，最小的令牌是 `1 + 8 + 16 + 16 + 32 = 73` 个原始字节。加上 base64url 填充后是 100 个字符。对 `n` 字节的消息，原始大小是 `57 + 16 × ceil((n + 1) / 16)`。

这条记录也不是自定界的。格式没有长度前缀，规范说传输层必须知道令牌在哪里结束。一个令牌放进一个字段、cookie 或数据库字段。不要把两个令牌串起来，然后指望解析器找到接缝。

时间戳值得单独说一句。它是明文；看到令牌的人会知道它是在哪一秒创建的。它也在 HMAC 输入里，所以没有人能移动它而不破坏标签。可见与已认证是两件事，Fernet 刻意让时间戳同时具备两者。

## 密封：加密路径

加密按固定顺序执行：

1. 读一次时钟。时间戳是 `int(time.time())`，编码成无符号 64 位大端序整数。
2. 用 PKCS7 把明文填充到 16 的倍数。
3. 生成 16 个随机字节作为 IV。
4. 用加密密钥与 AES-128-CBC 加密填充后的明文。
5. 组装 `0x80 || 时间戳 || IV || 密文`。
6. 用签名密钥对这些确切的字节计算 HMAC-SHA256，附加 32 字节标签。
7. 对整条记录做 base64url 编码。

注意标签是对原始头部与密文计算，不是对明文，也不是对 base64 文本。版本、时间戳与 IV 都被覆盖。改动记录中任何一个较早的比特，标签就会改变。

IV 是公开且随机的。它不是秘密，也不是从密钥派生。它唯一的工作，是让相同明文的两次加密产生不同密文。在 CBC 模式里，跨消息重复使用 IV 会泄露它们的第一个分组是否相同。Fernet 每个令牌都从操作系统 CSPRNG 生成全新的 IV。

<figure class="fig">
  <img src="/images/fernet/nist-cbc-fig2.webp" alt="NIST CBC 模式图：每个明文分组先与 IV 或前一个密文分组做 XOR 再加密，解密则反向还原。" width="1407" height="1270" loading="lazy" />
  <figcaption><b>官方图示</b> — NIST SP 800-38A Figure 2。CBC 加密时，每个明文分组会先与前一个密文分组（第一个分组则与 IV）做 XOR，再送进分组加密；解密反向而行。Fernet 把这个模式用在 AES-128-CBC，随后才用 HMAC-SHA256 对整条记录做认证，所以这幅 NIST 图只覆盖机密性。来源：<a href="https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38a.pdf">NIST SP 800-38A</a>（美国政府出版物，公共领域）</figcaption>
</figure>

```python
from cryptography.fernet import Fernet

key = Fernet.generate_key()          # 44 个 URL-safe base64 字符
f = Fernet(key)

token = f.encrypt(b"account=42; scope=read")
```

运行两次，令牌会不同。明文一样；时间戳与 IV 不一样。这就是重点。

## 开启：解密路径

解密把记录反过来处理，并把检查放在适当位置，让未认证的明文永远不会逃出来。

1. 解码 base64url。目前实现接受带填充或不带填充的输入，格式错误时抛出 `InvalidToken`。
2. 检查长度与版本。至少 9 字节，第一个字节是 `0x80`。未知版本直接拒绝，不用猜。
3. 读取时间戳——尚未验证——如果提供了 TTL，就检查时间窗。超过 `ttl` 秒，或时间戳比现在超前 60 秒以上的令牌会被拒绝。
4. 对最后 32 字节以外的每个字节重新计算 HMAC-SHA256，并用常数时间函数比较。不匹配就是 `InvalidToken`。
5. 这时才用 AES-128-CBC 解密并移除 PKCS7 填充。填充错误也是 `InvalidToken`。
6. 返回明文。

目前实现有一个微妙之处：TTL 时间窗会先检查，而且用的是尚未验证的时间戳。这可以提前拒绝令牌，但不能接受伪造的令牌。标签检查仍然挡在密文与 AES 之间，两道检查都通过后才会返回明文。这个顺序是快速失败，不是信任时间戳。

架构规则是先认证、后解密。如果 AES-CBC 解密比 MAC 检查先跑，而应用又泄露填充错误，攻击者就得到一个 padding oracle。Fernet 不会暴露这条路。标签会在任何密文被解密之前验证，而每一种失败都收敛成同一个没有细节的异常。

```python
from cryptography.fernet import InvalidToken

try:
    plaintext = f.decrypt(token, ttl=300)
except InvalidToken:
    ...  # 失败时关闭；不要按原因分支
```

`InvalidToken` 刻意不提供信息。base64 格式错误、版本错误、TTL 过期、标签错误、填充错误——调用方看到的是同一个异常。不要从外部建立区分它们的逻辑。

<figure class="fer-fig">
  <figcaption>
    <span class="card-tag">流程 // 02</span>
    <h3 class="fer-fig-title">封印每个字节，等标签同意后才开启</h3>
    <p class="fer-fig-sub">加密先建好记录，再对它签名。解密先检查记录，再解密。</p>
  </figcaption>
  <div class="fer-scroll">
  <svg class="fer-svg" viewBox="0 0 840 400" role="img" aria-labelledby="fer-f2-title fer-f2-desc">
    <title id="fer-f2-title">Fernet 加密与解密流程</title>
    <desc id="fer-f2-desc">加密：明文经填充后以 AES-128-CBC 加密，与版本和时间戳组装，再用 HMAC-SHA256 签名，最后做 base64url 编码。解密反向执行这些步骤，任何失败都以 InvalidToken 拒绝。</desc>
    <defs>
      <marker id="fer-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">流程 // 先加密后 MAC</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">同一把密钥 · 两个方向</text>
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
    <text x="174" y="80" class="m" font-size="7" text-anchor="middle">任意长度字节</text>
    <text x="174" y="93" class="f" font-size="7" text-anchor="middle">原始消息</text>
    <rect x="252" y="42" width="132" height="64" class="box"/>
    <text x="318" y="64" class="t" font-size="8.5" font-weight="700" text-anchor="middle">填充 + AES</text>
    <text x="318" y="80" class="m" font-size="7" text-anchor="middle">PKCS7 · AES-128-CBC</text>
    <text x="318" y="93" class="f" font-size="7" text-anchor="middle">全新随机 IV</text>
    <text x="372" y="56" class="f" font-size="7" text-anchor="end" letter-spacing="0.06em">EK</text>
    <rect x="396" y="42" width="132" height="64" class="box"/>
    <text x="462" y="64" class="t" font-size="8.5" font-weight="700" text-anchor="middle">组装</text>
    <text x="462" y="80" class="m" font-size="7" text-anchor="middle">80 | ts | IV | ct</text>
    <text x="462" y="93" class="f" font-size="7" text-anchor="middle">头部 + 密文</text>
    <rect x="540" y="42" width="132" height="64" class="box"/>
    <text x="606" y="64" class="t" font-size="8.5" font-weight="700" text-anchor="middle">签名</text>
    <text x="606" y="80" class="m" font-size="7" text-anchor="middle">HMAC-SHA256</text>
    <text x="606" y="93" class="f" font-size="7" text-anchor="middle">附加 32 字节标签</text>
    <text x="660" y="56" class="f" font-size="7" text-anchor="end" letter-spacing="0.06em">SK</text>
    <rect x="684" y="42" width="132" height="64" class="box"/>
    <text x="750" y="64" class="t" font-size="8.5" font-weight="700" text-anchor="middle">编码</text>
    <text x="750" y="80" class="m" font-size="7" text-anchor="middle">base64url</text>
    <text x="750" y="93" class="f" font-size="7" text-anchor="middle">→ 令牌</text>
    <line x1="242" y1="74" x2="250" y2="74" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="386" y1="74" x2="394" y2="74" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="530" y1="74" x2="538" y2="74" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="674" y1="74" x2="682" y2="74" class="arrow" marker-end="url(#fer-arrow)"/>
    <text x="108" y="124" class="m" font-size="7.5">标签覆盖原始头部与密文；base64url 在之后才发生。</text>
    <line x1="108" y1="132" x2="816" y2="132" class="rule"/>
    <line x1="24" y1="146" x2="816" y2="146" class="dash"/>
    <rect x="344" y="138" width="152" height="16" fill="var(--mono-paper)"/>
    <text x="420" y="149" class="f" font-size="7" text-anchor="middle" letter-spacing="0.8">同一把密钥 · 相反方向</text>
    <text x="24" y="188" class="t" font-size="12" font-weight="800">开启</text>
    <text x="24" y="204" class="f" font-size="7" letter-spacing="0.6">decrypt(ttl)</text>
    <text x="108" y="168" class="f" font-size="7" letter-spacing="0.8">01</text>
    <text x="228" y="168" class="f" font-size="7" letter-spacing="0.8">02</text>
    <text x="348" y="168" class="f" font-size="7" letter-spacing="0.8">03</text>
    <text x="468" y="168" class="f" font-size="7" letter-spacing="0.8">04</text>
    <text x="588" y="168" class="f" font-size="7" letter-spacing="0.8">05</text>
    <text x="708" y="168" class="f" font-size="7" letter-spacing="0.8">06</text>
    <rect x="108" y="174" width="108" height="64" class="term"/>
    <text x="162" y="196" class="t" font-size="8" font-weight="700" text-anchor="middle">令牌</text>
    <text x="162" y="212" class="m" font-size="7" text-anchor="middle">bytes or str</text>
    <text x="162" y="225" class="f" font-size="7" text-anchor="middle">完整记录</text>
    <rect x="228" y="174" width="108" height="64" class="box"/>
    <text x="282" y="196" class="t" font-size="8" font-weight="700" text-anchor="middle">解码</text>
    <text x="282" y="212" class="m" font-size="7" text-anchor="middle">base64url</text>
    <text x="282" y="225" class="f" font-size="7" text-anchor="middle">版本 0x80</text>
    <rect x="348" y="174" width="108" height="64" class="box"/>
    <text x="402" y="196" class="t" font-size="8" font-weight="700" text-anchor="middle">时间窗</text>
    <text x="402" y="212" class="m" font-size="7" text-anchor="middle">ts + ttl ≥ now</text>
    <text x="402" y="225" class="f" font-size="7" text-anchor="middle">未来 ≤ 60 秒</text>
    <rect x="468" y="174" width="108" height="64" class="box"/>
    <text x="522" y="196" class="t" font-size="8" font-weight="700" text-anchor="middle">验证</text>
    <text x="522" y="212" class="m" font-size="7" text-anchor="middle">HMAC-SHA256</text>
    <text x="522" y="225" class="f" font-size="7" text-anchor="middle">常数时间</text>
    <text x="564" y="186" class="f" font-size="7" text-anchor="end" letter-spacing="0.06em">SK</text>
    <rect x="588" y="174" width="108" height="64" class="box"/>
    <text x="642" y="196" class="t" font-size="8" font-weight="700" text-anchor="middle">解密</text>
    <text x="642" y="212" class="m" font-size="7" text-anchor="middle">AES-128-CBC</text>
    <text x="642" y="225" class="f" font-size="7" text-anchor="middle">PKCS7 移除填充</text>
    <text x="684" y="186" class="f" font-size="7" text-anchor="end" letter-spacing="0.06em">EK</text>
    <rect x="708" y="174" width="108" height="64" class="term"/>
    <text x="762" y="196" class="t" font-size="8" font-weight="700" text-anchor="middle">明文</text>
    <text x="762" y="212" class="m" font-size="7" text-anchor="middle">已验证</text>
    <text x="762" y="225" class="f" font-size="7" text-anchor="middle">否则全无</text>
    <line x1="216" y1="206" x2="226" y2="206" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="336" y1="206" x2="346" y2="206" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="456" y1="206" x2="466" y2="206" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="576" y1="206" x2="586" y2="206" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="696" y1="206" x2="706" y2="206" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="108" y1="252" x2="816" y2="252" class="rule"/>
    <text x="108" y="270" class="t" font-size="9" font-weight="800">×</text>
    <text x="126" y="270" class="t" font-size="8" font-weight="700" letter-spacing="0.02em">上方任一检查失败 → cryptography.fernet.InvalidToken</text>
    <text x="126" y="284" class="m" font-size="7.5">单一异常 · 不透露原因 · 不输出部分明文</text>
    <text x="816" y="270" class="f" font-size="7" text-anchor="end">默认拒绝</text>
    <line x1="24" y1="316" x2="816" y2="316" class="rule"/>
    <text x="24" y="336" class="f" font-size="7" letter-spacing="0.9">为何顺序成立</text>
    <text x="24" y="352" class="t" font-size="8" font-weight="700">先验证，再解密</text>
    <text x="24" y="366" class="m" font-size="7">标签会先被检查，AES 才看到</text>
    <text x="24" y="378" class="m" font-size="7">密文；因此填充错误永远不会</text>
    <text x="24" y="390" class="m" font-size="7">变成预言机。</text>
    <line x1="288" y1="326" x2="288" y2="394" class="rule"/>
    <text x="312" y="336" class="f" font-size="7" letter-spacing="0.9">为何用两把密钥</text>
    <text x="312" y="352" class="t" font-size="8" font-weight="700">不共享密钥材料</text>
    <text x="312" y="366" class="m" font-size="7">HMAC 与 AES 使用 32 字节密钥的</text>
    <text x="312" y="378" class="m" font-size="7">不同半部。一边的弱点，无法</text>
    <text x="312" y="390" class="m" font-size="7">通过另一边转移。</text>
    <line x1="576" y1="326" x2="576" y2="394" class="rule"/>
    <text x="600" y="336" class="f" font-size="7" letter-spacing="0.9">为何 IV 是公开的</text>
    <text x="600" y="352" class="t" font-size="8" font-weight="700">为了新鲜度，不是保密</text>
    <text x="600" y="366" class="m" font-size="7">随机 IV 让相同的明文</text>
    <text x="600" y="378" class="m" font-size="7">密封成不同的密文。它是刻意</text>
    <text x="600" y="390" class="m" font-size="7">以明文传输的。</text>
  </svg>
  </div>
  <div class="fer-fig-src">FERNET v0x80 · 先加密后 MAC · 先认证后解密</div>
</figure>

## 篡改测试台

封印只有在覆盖正确字节时才有用。选一个实验，看看第一个拦下它的检查是什么。

<figure class="fer-lab">
  <figcaption>
    <span class="card-tag">篡改测试台 // 03</span>
    <h3 class="fer-fig-title">封印覆盖头部，不只覆盖载荷</h3>
    <p class="fer-fig-sub">选一种改动。判决会指出第一个能拦下它的检查。</p>
  </figcaption>
  <div class="fer-chips" role="group" aria-label="选择一个篡改实验">
    <label class="fer-chip"><input type="radio" name="fer-tamper" id="fer-t0" checked><span>原封不动</span></label>
    <label class="fer-chip"><input type="radio" name="fer-tamper" id="fer-t1"><span>翻转密文一比特</span></label>
    <label class="fer-chip"><input type="radio" name="fer-tamper" id="fer-t2"><span>时间戳加一秒</span></label>
    <label class="fer-chip"><input type="radio" name="fer-tamper" id="fer-t3"><span>使用过期令牌</span></label>
    <label class="fer-chip"><input type="radio" name="fer-tamper" id="fer-t4"><span>改掉版本字节</span></label>
  </div>
  <div class="fer-lab-scroll">
    <div class="fer-lab-strip-wrap">
      <div class="fer-strip" aria-hidden="true">
        <div class="fer-seg fer-seg-v"><b>80</b></div>
        <div class="fer-seg fer-seg-ts"><b>时间戳</b><span>8 B</span></div>
        <div class="fer-seg fer-seg-iv"><b>IV</b><span>16 B</span></div>
        <div class="fer-seg fer-seg-ct"><b>密文</b><span>N × 16 B</span></div>
        <div class="fer-seg fer-seg-tag"><b>HMAC</b><span>32 B</span></div>
      </div>
      <div class="fer-strip-legend" aria-hidden="true">
        <span>版本</span><span>时间戳</span><span>IV</span><span>密文</span><span>标签</span>
      </div>
    </div>
  </div>
  <div class="fer-verdicts">
    <div class="fer-verdict fer-verdict-0">
      <span class="fer-stamp">接受</span>
      <p><b>五个字段都解析成功、标签匹配、时间窗开启、填充有效。</b>Fernet 会返回明文。同一条消息加密两次仍会看起来不同，因为 IV 与时间戳都变了。</p>
    </div>
    <div class="fer-verdict fer-verdict-1">
      <span class="fer-stamp fer-stamp--reject">拒绝</span>
      <p><b>第一个失败的检查是验证（VERIFY）。</b>翻转一个比特就改变了 HMAC 输入，32 字节标签不再匹配。AES 根本不会执行。这就是把可延展的 CBC 密文变成全有或全无记录的关键。</p>
    </div>
    <div class="fer-verdict fer-verdict-2">
      <span class="fer-stamp fer-stamp--reject">拒绝</span>
      <p><b>第一个失败的检查是验证（VERIFY）。</b>时间戳在密文之外，却在标签之内。加一秒仍不会关闭 TTL 时间窗，所以是由 HMAC 拦下。若往前跳得更多，也会触发 60 秒时钟偏移检查。</p>
    </div>
    <div class="fer-verdict fer-verdict-3">
      <span class="fer-stamp fer-stamp--reject">拒绝</span>
      <p><b>第一个失败的检查是时间窗（WINDOW）。</b>标签有效，消息也是真的；它只是对接收方选的 TTL 来说太旧了。拒绝一个真实但过期的令牌是策略决定，不是密码学失败。</p>
    </div>
    <div class="fer-verdict fer-verdict-4">
      <span class="fer-stamp fer-stamp--reject">拒绝</span>
      <p><b>第一个失败的检查是解码（DECODE）。</b>未知的版本字节会在任何密钥被使用前就被拒绝。版本字段让格式可以演进，不必猜测未来布局的含义。</p>
    </div>
  </div>
  <div class="fer-fig-src">纯 CSS · 无 JavaScript · 长条图为示意</div>
</figure>

## 封印证明什么——以及不证明什么

Fernet 是一个认证加密配方：机密性、完整性与真实性，通过组合而非单一 AEAD 原语实现。当你开始要求更多功能时，这个差别就很重要。

| 性质 | Fernet 如何得到 | 边界在哪里 |
| :--- | :--- | :--- |
| 机密性 | AES-128-CBC 与全新的随机 IV | 密钥持有者可以读；时间戳仍然可见 |
| 完整性 | 对头部与密文计算 HMAC-SHA256 | 任何一个比特改动都会拒绝整个令牌 |
| 真实性 | 用独立的签名密钥计算 HMAC | 持有密钥的人可以伪造有效令牌 |
| 新鲜度 | 对标签覆盖的时间戳套用 TTL 时间窗 | 不是防重放；容许 60 秒时钟偏移 |
| 格式演进 | `0x80` 版本字节 | 未知版本会被拒绝，不会协商 |

最常让人踩坑的缺口是**关联数据**。Fernet 没有 AAD 参数。如果一个令牌对租户 A 有效，你把它拿去租户 B 使用，Fernet 不会发现。标签认证的是字节，不是意义。

把上下文绑在载荷层。把租户、用途或路由放进加密的 JSON，并在解密后检查。或为每个上下文用 HKDF 派生不同的密钥。不要把上下文字符串接在令牌前面就说它已被认证；只有 HMAC 输入里的字节才被覆盖。

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

这不会阻止令牌在同一个上下文里被重放。被捕获的令牌在 TTL 到期前就是一个持有者凭证。如果操作是一次性的——密码重置、付款、邀请——把 nonce 或令牌 ID 放进明文，在服务器端记录，并拒绝重复。TTL 缩短重放窗口；它不会关闭窗口。

前向保密也不在菜单上。一把长期密钥可以解密它加密过的每一个令牌。轮换限制了爆炸半径；它不会回到每条消息一把密钥的做法。如果你需要前向保密，对称文件格式就是错的工具。

## 轮换、密码，以及那些无聊的运维细节

### 不需要一次性切换的密钥轮换

`MultiFernet` 接受一串 `Fernet` 实例。它用第一把密钥加密，解密时依次尝试每一把。

```python
from cryptography.fernet import Fernet, MultiFernet

ring = MultiFernet([Fernet(new_key), Fernet(old_key)])
new_token = ring.rotate(old_token)   # 用新密钥重新封缄
```

`rotate()` 会保留原始时间戳。这也保留了原始 TTL：距离到期还有五分钟的令牌，轮换后仍然距离到期五分钟。如果你需要全新的寿命，解密后重新加密——但仅限于你真的想让它重新计时的数据。

轮换不是清单改了就算完成。重新加密已存储的令牌，旧密钥只保留到最老的令牌还能存活的时间，然后移除。`extract_timestamp()` 会在返回时间戳前验证标签，所以用它安排重新加密是安全的。

### 密码不是密钥

`Fernet` 要的是密钥，不是口令。如果秘密由人提供，让它经过带有每个用户专属盐的密钥派生函数。cryptography 文档建议 Argon2id；输出是 32 字节，你再做 base64url 编码。

```python
import base64
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.kdf.argon2 import Argon2id

password = os.environ["FERNET_PASSPHRASE"].encode()  # 字节，运行时提供
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

把盐存在密文旁边。不要在日志里记录密码或派生出的密钥。上面的参数遵循文档引用的 RFC 9106 建议。如果你的 `cryptography` 版本还没有 Argon2id API，请升级，或改用明确参数的 `Scrypt`——不要用密码的原始 SHA-256。

### 把令牌当成凭证

Fernet 令牌是加密的，但在到期前它也是一个持有者凭证。不要把令牌放进 URL、分析事件或错误消息。记录操作，以及你自己封套里的密钥版本，不要记录令牌本身。

Fernet 没有密钥标识符字段。`MultiFernet` 依次尝试密钥，不会告诉你是哪一把成功。如果轮换遥测很重要，把令牌包进你自己的封套并附上密钥 ID，或在存储时把密钥版本记在密文旁边。

## 自己打开一个令牌

要亲眼看到布局，而不只是相信图，用标准库解码一个令牌。这里用的是加密它的同一把密钥。

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

然后故意破坏它。翻转密文中的一个比特，重新编码记录：

```python
raw = bytearray(base64.urlsafe_b64decode(token))
raw[-40] ^= 0x01                  # 在密文内、标签之前
tampered = base64.urlsafe_b64encode(bytes(raw))
f.decrypt(tampered)               # InvalidToken
```

对任何至少有一个分组的令牌，字节 `-40` 一定落在密文里：标签占最后 32 字节，所以 `-40` 是标签前八个字节。改动时间戳的一个字节，标签也会失败。如果解密时提供 TTL，较大的时间跳跃可能会先被时间窗拒绝；无论如何，都不会出现明文。这就是为什么头部在 MAC 里面。

## 简短检查清单

- 用 `Fernet.generate_key()` 生成密钥，放进秘密管理器，不要写在代码里。
- 解密任何会过期的内容时传入 TTL。发送方无法强制到期；接收方才能决定。
- 把上下文绑进明文。Fernet 没有关联数据。
- 一次性操作要加入 nonce。TTL 不是防重放。
- 用 `MultiFernet` 轮换，重新加密已存储的令牌，并按计划淘汰旧密钥。
- 密码派生密钥请用 Argon2id 或 Scrypt，不要只用单纯的哈希。
- 捕获 `InvalidToken`，失败时关闭，不要记录敏感信息。
- 把令牌当成持有者凭证；高价值操作使用更短的 TTL。
- 保持时钟同步。实现容许 60 秒的未来偏移，不是无上限。
- 如果你用其他语言实现这个格式，先跑规范的验收测试，再信任你的解析器。

## 参考资料

- [Fernet 规范 v0x80](https://github.com/fernet/spec/blob/master/Spec.md)——字段布局、密钥格式与生成步骤。
- [cryptography：Fernet（对称加密）](https://cryptography.io/en/latest/fernet/)——API、`MultiFernet`、密码派生与限制。
- [cryptography `fernet.rs`](https://github.com/pyca/cryptography/blob/main/src/rust/src/fernet.rs)——当前实现，包括 60 秒时钟偏移与检查顺序。
- [fernet-rb](https://github.com/fernet/fernet-rb)——最初的 Ruby 实现。
- [RFC 4648](https://www.rfc-editor.org/rfc/rfc4648)——base64url。
- [RFC 5652 §6.3](https://www.rfc-editor.org/rfc/rfc5652#section-6.3)——PKCS#7 填充。
- [RFC 2104](https://www.rfc-editor.org/rfc/rfc2104)——HMAC。
- [NIST SP 800-38A](https://csrc.nist.gov/pubs/sp/800/38/a/final)——CBC 模式。
- [RFC 9106](https://www.rfc-editor.org/rfc/rfc9106)——Argon2 参数。

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
