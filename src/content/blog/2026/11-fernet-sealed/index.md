---
title: "Fernet, Sealed: The Anatomy of an Authenticated Token"
description: "A field-by-field tour of the Fernet token, the encrypt-then-MAC pipeline behind it, and the limits of what one 32-byte key can promise."
pubDate: 2026-11-23
category: "Security"
tags: ["Cryptography", "Fernet", "Python", "Security"]
featured: false
author: "Alex.Hsiao"
readTime: "14 min read"
cardImage: "./cover.webp"
cardImageAlt: "NIST SP 800-38A diagram of CBC encryption and decryption chained through AES"
---

# Fernet, Sealed: The Anatomy of an Authenticated Token

A Fernet token looks like a password that escaped a base64 encoder. It is actually a five-field record with a receipt stapled across the flap.

Fernet is the high-level authenticated-encryption recipe in Python's `cryptography` package: one 32-byte key, one opaque token, `encrypt()` and `decrypt()`. Authenticated encryption joins two promises: the ciphertext cannot be read without the key, and it cannot be changed without the change being detected.

That receipt is the whole idea. Fernet does not just hide bytes; it makes every byte of the envelope answer to one 32-byte tag. Change the ciphertext, the IV, the timestamp, or the version, and the tag stops matching. The message is either exactly what the key holder sealed, or it is nothing at all.

This is a tour of the format at the byte level — where each guarantee comes from, where the design stops, and why the Python API is only two methods long.

<figure class="fig">
  <img src="/images/fernet/nist-cbc-fig2.webp" alt="NIST CBC mode diagram: each plaintext block is XORed with the IV or the previous ciphertext block before encryption, and decryption reverses the chain." width="1407" height="1270" loading="lazy" />
  <figcaption><b>Official figure</b> — NIST SP 800-38A, Figure 2. In CBC encryption each plaintext block is XORed with the previous ciphertext block (the IV for the first block) before the block cipher; decryption reverses the chain. Fernet uses this mode with AES-128-CBC and then authenticates the whole record with HMAC-SHA256, so the NIST figure covers confidentiality only. Source: <a href="https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38a.pdf">NIST SP 800-38A</a> (U.S. government publication; public domain)</figcaption>
</figure>

## A recipe, not a primitive

AES is a block cipher. On its own it does not tell you which mode to use, how to pad the last block, where the IV comes from, what to authenticate, or how to compare a tag without leaking timing. Every one of those choices is a place to get the scheme wrong while still producing something that decrypts.

Fernet removes the choices. It fixes:

- **AES-128-CBC** with PKCS7 padding for confidentiality.
- **HMAC-SHA256** for integrity and authenticity.
- **Encrypt-then-MAC**: the tag is computed over the finished header and ciphertext.
- **A fresh random IV** for every token.
- **A versioned, URL-safe record** with a timestamp inside the seal.

There is no cipher negotiation and no way to ask for a different mode. The API surface is `encrypt()` and `decrypt()`. That narrowness is the feature.

The trade-off is fixed too. You get the guarantees of this exact composition, not the guarantees of a modern AEAD with associated data. More on that below.

The format began in 2012 as a small Ruby gem written by Harold Giménez at Heroku. Keith Rarick wrote a Go implementation and the specification in 2013, and [pyca/cryptography](https://cryptography.io/en/latest/fernet/) adopted it as its high-level symmetric recipe. The name is a joke about the Italian digestif. The field layout is not.

> Fernet does not make a message true. It makes the message tamper-evident, and readable only by someone holding the key. Those are narrower promises, and far more useful ones.

## One key, two jobs

`Fernet.generate_key()` returns 44 URL-safe base64 characters. Decode them and you have 32 bytes. The first 16 are the signing key; the last 16 are the encryption key. The order is part of the [specification](https://github.com/fernet/spec/blob/master/Spec.md), not a local convention.

Two keys out of one is domain separation. HMAC-SHA256 and AES-128-CBC never share key material, so a weakness in one construction cannot be pivoted into the other through a shared secret. Both halves are still one secret in practice: anyone who holds the 44-character string can read every message and forge new ones. Fernet is symmetric, so key distribution is the hard problem it does not solve.

`generate_key()` uses the operating system's CSPRNG. Do not build a key by hashing a passphrase, and do not pass a 32-character ASCII string to `Fernet(...)` and expect it to work. The constructor wants 32 bytes *after* base64url decoding, not 32 characters before.

<figure class="fer-fig">
  <figcaption>
    <span class="card-tag">FIELD MAP // 01</span>
    <h3 class="fer-fig-title">One key splits in two; one token carries five fields</h3>
    <p class="fer-fig-sub">The key halves never swap jobs. The tag covers every byte that precedes it.</p>
  </figcaption>
  <div class="fer-scroll">
  <svg class="fer-svg" viewBox="0 0 840 476" role="img" aria-labelledby="fer-f1-title fer-f1-desc">
    <title id="fer-f1-title">Fernet key and token anatomy</title>
    <desc id="fer-f1-desc">A 32-byte key splits into a 16-byte signing key and a 16-byte encryption key. A token is a version byte, an 8-byte timestamp, a 16-byte IV, ciphertext, and a 32-byte HMAC tag computed over the first four fields.</desc>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">FERNET // FIELD MAP</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">VERSION 0x80 · RAW BYTES</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <text x="24" y="46" class="f" font-size="7" letter-spacing="1.1">01 / THE KEY</text>
    <text x="24" y="64" class="t" font-size="10.5" font-weight="700">One 32-byte secret, two independent jobs</text>
    <text x="816" y="64" class="m" font-size="7.5" text-anchor="end">base64url · 44 characters</text>
    <rect x="24" y="76" width="394" height="52" fill="var(--mono-l1)"/>
    <rect x="422" y="76" width="394" height="52" fill="var(--mono-l3)"/>
    <text x="40" y="97" fill="var(--mono-paper)" font-size="9" font-weight="700" letter-spacing="0.04em">SIGNING KEY</text>
    <text x="40" y="112" fill="var(--mono-paper)" font-size="7.5">bytes 0–15 · HMAC-SHA256</text>
    <text x="438" y="97" fill="var(--mono-paper)" font-size="9" font-weight="700" letter-spacing="0.04em">ENCRYPTION KEY</text>
    <text x="438" y="112" fill="var(--mono-paper)" font-size="7.5">bytes 16–31 · AES-128-CBC</text>
    <text x="24" y="144" class="f" font-size="7" letter-spacing="0.8">DECODE THE 44 CHARACTERS</text>
    <text x="816" y="144" class="f" font-size="7" text-anchor="end" letter-spacing="0.8">32 BYTES TOTAL</text>
    <line x1="24" y1="150" x2="816" y2="150" class="rule"/>
    <text x="24" y="174" class="f" font-size="7" letter-spacing="1.1">02 / THE TOKEN</text>
    <text x="24" y="192" class="t" font-size="10.5" font-weight="700">Five fields, one fixed order</text>
    <text x="816" y="192" class="m" font-size="7.5" text-anchor="end">73 bytes minimum · 100 base64url characters</text>
    <text x="246" y="212" class="m" font-size="7.2" text-anchor="middle" letter-spacing="0.9">HMAC-SHA256 INPUT // EVERY BYTE BELOW THIS BRACKET</text>
    <path d="M24 222 V218 H468 V222" fill="none" stroke="var(--mono-l5)" stroke-width="0.7"/>
    <rect x="24" y="230" width="12" height="62" fill="var(--mono-l1)" stroke="var(--mono-grid)" stroke-width="0.7"/>
    <rect x="36" y="230" width="88" height="62" fill="var(--mono-l2)" stroke="var(--mono-grid)" stroke-width="0.7"/>
    <rect x="124" y="230" width="172" height="62" fill="var(--mono-l7)" stroke="var(--mono-grid)" stroke-width="0.7"/>
    <rect x="296" y="230" width="172" height="62" fill="var(--mono-l5)" stroke="var(--mono-grid)" stroke-width="0.7"/>
    <rect x="468" y="230" width="348" height="62" fill="var(--mono-l1)" stroke="var(--mono-grid)" stroke-width="0.7"/>
    <text x="24" y="226" class="t mono" font-size="7" font-weight="700">0x80</text>
    <line x1="30" y1="228" x2="30" y2="230" stroke="var(--mono-l5)" stroke-width="0.7"/>
    <text x="80" y="256" fill="var(--mono-paper)" font-size="7" font-weight="700" text-anchor="middle" letter-spacing="0.06em">TIMESTAMP</text>
    <text x="80" y="271" fill="var(--mono-paper)" font-size="7" text-anchor="middle">8 B · BIG-ENDIAN</text>
    <text x="210" y="256" class="t" font-size="7.5" font-weight="700" text-anchor="middle" letter-spacing="0.06em">IV</text>
    <text x="210" y="271" class="m" font-size="7" text-anchor="middle">16 B · CSPRNG</text>
    <text x="382" y="256" class="t" font-size="7.5" font-weight="700" text-anchor="middle" letter-spacing="0.06em">CIPHERTEXT</text>
    <text x="382" y="271" class="m" font-size="7" text-anchor="middle">N × 16 B</text>
    <text x="642" y="256" fill="var(--mono-paper)" font-size="8" font-weight="700" text-anchor="middle" letter-spacing="0.06em">HMAC-SHA256</text>
    <text x="642" y="271" fill="var(--mono-paper)" font-size="7" text-anchor="middle">32 B · TAG</text>
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
    <text x="24" y="336" class="f" font-size="7">BYTE OFFSET · N = CIPHERTEXT LENGTH</text>
    <g font-size="8" fill="var(--mono-l2)">
      <text x="24" y="358" class="f" font-size="7">01</text>
      <text x="46" y="358">The header is readable. Version and timestamp are plaintext; the timestamp is still authenticated.</text>
      <text x="24" y="376" class="f" font-size="7">02</text>
      <text x="46" y="376">The payload is padded. PKCS7 adds 1–16 bytes, so ciphertext is never empty and always a multiple of 16.</text>
      <text x="24" y="394" class="f" font-size="7">03</text>
      <text x="46" y="394">The seal is 32 bytes. Change one bit in any earlier field and the tag no longer matches.</text>
    </g>
    <rect x="24" y="410" width="792" height="34" class="codebox"/>
    <text x="40" y="431" class="t mono" font-size="8">raw = 57 + 16 × ceil((n + 1) / 16) bytes   →   base64url = 4 × ceil(raw / 3) characters</text>
    <text x="24" y="462" class="m" font-size="7.5">Base64url is transport armor: it adds 33% and hides nothing. An empty message still produces 73 raw bytes.</text>
  </svg>
  </div>
  <div class="fer-fig-src">FERNET SPEC v0x80 · FIELD SIZES · KEY SPLIT</div>
</figure>

## Five fields, one seal

Every token is the base64url encoding of one concatenated record. There are no delimiters, no length prefixes, and no optional fields.

| Field | Size | Starts at | Visible | Job |
| :--- | ---: | ---: | :--- | :--- |
| Version | 1 byte | 0 | yes | `0x80`, the only version defined today |
| Timestamp | 8 bytes | 1 | yes | uint64 big-endian, seconds since the Unix epoch |
| IV | 16 bytes | 9 | yes | fresh random AES-CBC initialization vector |
| Ciphertext | N × 16 bytes | 25 | no | padded AES-128-CBC output |
| HMAC | 32 bytes | 25 + N | no | SHA-256 tag over the first 25 + N bytes |

Two size facts follow from that layout.

PKCS7 always adds at least one byte, even when the message already ends on a block boundary. An empty message therefore produces one 16-byte ciphertext block, and the smallest token is `1 + 8 + 16 + 16 + 32 = 73` raw bytes. With base64url padding that is 100 characters. For an `n`-byte message, the raw size is `57 + 16 × ceil((n + 1) / 16)`.

The record is also not self-delimiting. The format has no length prefix, and the spec says the transport must know where a token ends. Put one token in one field, cookie, or database column. Do not concatenate two tokens and hope the parser finds the seam.

The timestamp deserves its own sentence. It is plaintext; anyone who sees the token learns the second it was created. It is also inside the HMAC input, so nobody can move it without breaking the tag. Visible and authenticated are different properties, and Fernet deliberately gives the timestamp both.

## Sealing: the encrypt path

Encryption runs in a fixed order:

1. Read the clock once. The timestamp is `int(time.time())`, encoded as an unsigned 64-bit big-endian integer.
2. Pad the plaintext with PKCS7 to a multiple of 16 bytes.
3. Generate 16 random bytes for the IV.
4. Encrypt the padded plaintext with AES-128-CBC under the encryption key.
5. Assemble `0x80 || timestamp || IV || ciphertext`.
6. Compute HMAC-SHA256 under the signing key over those exact bytes. Append the 32-byte tag.
7. Base64url-encode the whole record.

Note where the tag is computed: over the raw header and ciphertext, not over the plaintext and not over the base64 text. Version, timestamp, and IV are all covered. Change one bit anywhere earlier in the record and the tag changes.

The IV is public and random. It is not a secret and it is not derived from the key. Its only job is to make two encryptions of the same plaintext produce different ciphertexts. In CBC mode, reusing an IV across messages leaks whether their first blocks are equal. Fernet generates a fresh one per token from the OS CSPRNG.

```python
from cryptography.fernet import Fernet

key = Fernet.generate_key()          # 44 url-safe base64 characters
f = Fernet(key)

token = f.encrypt(b"account=42; scope=read")
```

Run that twice and the tokens differ. The plaintext is the same; the timestamp and IV are not. That is the point.

## Opening: the decrypt path

Decryption reverses the record, with the checks placed so that no unauthenticated plaintext escapes.

1. Decode base64url. The current implementation accepts padded or unpadded input and raises `InvalidToken` on malformed input.
2. Check the length and version. At least 9 bytes, first byte `0x80`. Unknown versions are rejected instead of guessed.
3. Read the timestamp — still unverified — and apply the TTL window if one was supplied. A token older than `ttl` seconds, or more than 60 seconds in the future, is rejected.
4. Recompute HMAC-SHA256 over every byte except the last 32 and compare with a constant-time function. A mismatch is `InvalidToken`.
5. Only then decrypt with AES-128-CBC and remove the PKCS7 padding. Bad padding is also `InvalidToken`.
6. Return the plaintext.

One subtlety in the current implementation: the TTL window is checked before the tag, using the unverified timestamp. That can reject a token early, but it cannot accept a forged one. The tag check still stands between the ciphertext and AES, and plaintext is only returned after both checks pass. The order is fail-fast, not trust-the-timestamp.

The architectural rule is authenticate-then-decrypt. If AES-CBC decryption ran before the MAC check and the application revealed padding errors, an attacker would get a padding oracle. Fernet never exposes that path. The tag is verified before any ciphertext is decrypted, and every failure collapses into one exception with no detail.

```python
from cryptography.fernet import InvalidToken

try:
    plaintext = f.decrypt(token, ttl=300)
except InvalidToken:
    ...  # fail closed; do not branch on the reason
```

`InvalidToken` is deliberately uninformative. Malformed base64, wrong version, expired TTL, bad tag, bad padding — the caller sees the same exception. Do not build logic that tries to distinguish them from the outside.

<figure class="fer-fig">
  <figcaption>
    <span class="card-tag">PIPELINE // 02</span>
    <h3 class="fer-fig-title">Seal every byte, then open only after the tag agrees</h3>
    <p class="fer-fig-sub">Encryption builds the record before it signs it. Decryption checks the record before it decrypts it.</p>
  </figcaption>
  <div class="fer-scroll">
  <svg class="fer-svg" viewBox="0 0 840 400" role="img" aria-labelledby="fer-f2-title fer-f2-desc">
    <title id="fer-f2-title">Fernet encryption and decryption pipelines</title>
    <desc id="fer-f2-desc">Encryption: plaintext is padded and encrypted with AES-128-CBC, assembled with version and timestamp, signed with HMAC-SHA256, then base64url encoded. Decryption reverses the steps and rejects any failure with InvalidToken.</desc>
    <defs>
      <marker id="fer-arrow" viewBox="0 0 5 5" refX="4.4" refY="2.5" markerWidth="5" markerHeight="5" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L5 2.5 L0 5 z" fill="var(--mono-ink)"/></marker>
    </defs>
    <text x="24" y="18" class="f" font-size="7.5" letter-spacing="1.2">PIPELINE // ENCRYPT-THEN-MAC</text>
    <text x="816" y="18" class="f" font-size="7.5" text-anchor="end" letter-spacing="1">ONE KEY · TWO DIRECTIONS</text>
    <line x1="24" y1="26" x2="816" y2="26" class="rule"/>
    <text x="24" y="56" class="t" font-size="12" font-weight="800">SEAL</text>
    <text x="24" y="72" class="f" font-size="7" letter-spacing="0.6">encrypt()</text>
    <text x="108" y="36" class="f" font-size="7" letter-spacing="0.8">01</text>
    <text x="252" y="36" class="f" font-size="7" letter-spacing="0.8">02</text>
    <text x="396" y="36" class="f" font-size="7" letter-spacing="0.8">03</text>
    <text x="540" y="36" class="f" font-size="7" letter-spacing="0.8">04</text>
    <text x="684" y="36" class="f" font-size="7" letter-spacing="0.8">05</text>
    <rect x="108" y="42" width="132" height="64" class="term"/>
    <text x="174" y="64" class="t" font-size="8.5" font-weight="700" text-anchor="middle">PLAINTEXT</text>
    <text x="174" y="80" class="m" font-size="7" text-anchor="middle">bytes, any length</text>
    <text x="174" y="93" class="f" font-size="7" text-anchor="middle">the message</text>
    <rect x="252" y="42" width="132" height="64" class="box"/>
    <text x="318" y="64" class="t" font-size="8.5" font-weight="700" text-anchor="middle">PAD + AES</text>
    <text x="318" y="80" class="m" font-size="7" text-anchor="middle">PKCS7 · AES-128-CBC</text>
    <text x="318" y="93" class="f" font-size="7" text-anchor="middle">fresh random IV</text>
    <text x="372" y="56" class="f" font-size="7" text-anchor="end" letter-spacing="0.06em">EK</text>
    <rect x="396" y="42" width="132" height="64" class="box"/>
    <text x="462" y="64" class="t" font-size="8.5" font-weight="700" text-anchor="middle">ASSEMBLE</text>
    <text x="462" y="80" class="m" font-size="7" text-anchor="middle">80 | ts | IV | ct</text>
    <text x="462" y="93" class="f" font-size="7" text-anchor="middle">header + ciphertext</text>
    <rect x="540" y="42" width="132" height="64" class="box"/>
    <text x="606" y="64" class="t" font-size="8.5" font-weight="700" text-anchor="middle">SEAL</text>
    <text x="606" y="80" class="m" font-size="7" text-anchor="middle">HMAC-SHA256</text>
    <text x="606" y="93" class="f" font-size="7" text-anchor="middle">append 32-byte tag</text>
    <text x="660" y="56" class="f" font-size="7" text-anchor="end" letter-spacing="0.06em">SK</text>
    <rect x="684" y="42" width="132" height="64" class="box"/>
    <text x="750" y="64" class="t" font-size="8.5" font-weight="700" text-anchor="middle">ENCODE</text>
    <text x="750" y="80" class="m" font-size="7" text-anchor="middle">base64url</text>
    <text x="750" y="93" class="f" font-size="7" text-anchor="middle">→ token</text>
    <line x1="242" y1="74" x2="250" y2="74" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="386" y1="74" x2="394" y2="74" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="530" y1="74" x2="538" y2="74" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="674" y1="74" x2="682" y2="74" class="arrow" marker-end="url(#fer-arrow)"/>
    <text x="108" y="124" class="m" font-size="7.5">The tag covers the raw header and ciphertext. Base64url happens afterwards.</text>
    <line x1="108" y1="132" x2="816" y2="132" class="rule"/>
    <line x1="24" y1="146" x2="816" y2="146" class="dash"/>
    <rect x="344" y="138" width="152" height="16" fill="var(--mono-paper)"/>
    <text x="420" y="149" class="f" font-size="7" text-anchor="middle" letter-spacing="0.8">SAME KEY · OPPOSITE DIRECTION</text>
    <text x="24" y="188" class="t" font-size="12" font-weight="800">OPEN</text>
    <text x="24" y="204" class="f" font-size="7" letter-spacing="0.6">decrypt(ttl)</text>
    <text x="108" y="168" class="f" font-size="7" letter-spacing="0.8">01</text>
    <text x="228" y="168" class="f" font-size="7" letter-spacing="0.8">02</text>
    <text x="348" y="168" class="f" font-size="7" letter-spacing="0.8">03</text>
    <text x="468" y="168" class="f" font-size="7" letter-spacing="0.8">04</text>
    <text x="588" y="168" class="f" font-size="7" letter-spacing="0.8">05</text>
    <text x="708" y="168" class="f" font-size="7" letter-spacing="0.8">06</text>
    <rect x="108" y="174" width="108" height="64" class="term"/>
    <text x="162" y="196" class="t" font-size="8" font-weight="700" text-anchor="middle">TOKEN</text>
    <text x="162" y="212" class="m" font-size="7" text-anchor="middle">bytes or str</text>
    <text x="162" y="225" class="f" font-size="7" text-anchor="middle">the record</text>
    <rect x="228" y="174" width="108" height="64" class="box"/>
    <text x="282" y="196" class="t" font-size="8" font-weight="700" text-anchor="middle">DECODE</text>
    <text x="282" y="212" class="m" font-size="7" text-anchor="middle">base64url</text>
    <text x="282" y="225" class="f" font-size="7" text-anchor="middle">version 0x80</text>
    <rect x="348" y="174" width="108" height="64" class="box"/>
    <text x="402" y="196" class="t" font-size="8" font-weight="700" text-anchor="middle">WINDOW</text>
    <text x="402" y="212" class="m" font-size="7" text-anchor="middle">ts + ttl ≥ now</text>
    <text x="402" y="225" class="f" font-size="7" text-anchor="middle">≤ 60 s future</text>
    <rect x="468" y="174" width="108" height="64" class="box"/>
    <text x="522" y="196" class="t" font-size="8" font-weight="700" text-anchor="middle">VERIFY</text>
    <text x="522" y="212" class="m" font-size="7" text-anchor="middle">HMAC-SHA256</text>
    <text x="522" y="225" class="f" font-size="7" text-anchor="middle">constant time</text>
    <text x="564" y="186" class="f" font-size="7" text-anchor="end" letter-spacing="0.06em">SK</text>
    <rect x="588" y="174" width="108" height="64" class="box"/>
    <text x="642" y="196" class="t" font-size="8" font-weight="700" text-anchor="middle">DECRYPT</text>
    <text x="642" y="212" class="m" font-size="7" text-anchor="middle">AES-128-CBC</text>
    <text x="642" y="225" class="f" font-size="7" text-anchor="middle">PKCS7 unpad</text>
    <text x="684" y="186" class="f" font-size="7" text-anchor="end" letter-spacing="0.06em">EK</text>
    <rect x="708" y="174" width="108" height="64" class="term"/>
    <text x="762" y="196" class="t" font-size="8" font-weight="700" text-anchor="middle">PLAINTEXT</text>
    <text x="762" y="212" class="m" font-size="7" text-anchor="middle">authenticated</text>
    <text x="762" y="225" class="f" font-size="7" text-anchor="middle">or nothing</text>
    <line x1="216" y1="206" x2="226" y2="206" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="336" y1="206" x2="346" y2="206" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="456" y1="206" x2="466" y2="206" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="576" y1="206" x2="586" y2="206" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="696" y1="206" x2="706" y2="206" class="arrow" marker-end="url(#fer-arrow)"/>
    <line x1="108" y1="252" x2="816" y2="252" class="rule"/>
    <text x="108" y="270" class="t" font-size="9" font-weight="800">×</text>
    <text x="126" y="270" class="t" font-size="8" font-weight="700" letter-spacing="0.02em">ANY FAILURE ABOVE → cryptography.fernet.InvalidToken</text>
    <text x="126" y="284" class="m" font-size="7.5">one exception · no reason code · no partial plaintext</text>
    <text x="816" y="270" class="f" font-size="7" text-anchor="end">FAIL CLOSED</text>
    <line x1="24" y1="316" x2="816" y2="316" class="rule"/>
    <text x="24" y="336" class="f" font-size="7" letter-spacing="0.9">WHY THE ORDER HOLDS</text>
    <text x="24" y="352" class="t" font-size="8" font-weight="700">Authenticate first</text>
    <text x="24" y="366" class="m" font-size="7">The tag is checked before AES sees the</text>
    <text x="24" y="378" class="m" font-size="7">ciphertext, so padding errors never become</text>
    <text x="24" y="390" class="m" font-size="7">an oracle.</text>
    <line x1="288" y1="326" x2="288" y2="394" class="rule"/>
    <text x="312" y="336" class="f" font-size="7" letter-spacing="0.9">WHY TWO KEYS</text>
    <text x="312" y="352" class="t" font-size="8" font-weight="700">No shared material</text>
    <text x="312" y="366" class="m" font-size="7">HMAC and AES use separate halves of</text>
    <text x="312" y="378" class="m" font-size="7">the 32-byte key. A weakness in one</text>
    <text x="312" y="390" class="m" font-size="7">cannot pivot through the other.</text>
    <line x1="576" y1="326" x2="576" y2="394" class="rule"/>
    <text x="600" y="336" class="f" font-size="7" letter-spacing="0.9">WHY THE IV IS PUBLIC</text>
    <text x="600" y="352" class="t" font-size="8" font-weight="700">Freshness, not secrecy</text>
    <text x="600" y="366" class="m" font-size="7">A random IV makes equal plaintexts</text>
    <text x="600" y="378" class="m" font-size="7">seal into different ciphertexts. It is</text>
    <text x="600" y="390" class="m" font-size="7">shipped in the clear on purpose.</text>
  </svg>
  </div>
  <div class="fer-fig-src">FERNET v0x80 · ENCRYPT-THEN-MAC · AUTHENTICATE-THEN-DECRYPT</div>
</figure>

## The tamper desk

The seal is only useful if it covers the right bytes. Pick an experiment below and follow the first check that fails.

<figure class="fer-lab">
  <figcaption>
    <span class="card-tag">TAMPER DESK // 03</span>
    <h3 class="fer-fig-title">The seal covers the header, not just the payload</h3>
    <p class="fer-fig-sub">Choose an edit. The verdict names the first check that can stop it.</p>
  </figcaption>
  <div class="fer-chips" role="group" aria-label="Choose a tampering experiment">
    <label class="fer-chip"><input type="radio" name="fer-tamper" id="fer-t0" checked><span>Intact</span></label>
    <label class="fer-chip"><input type="radio" name="fer-tamper" id="fer-t1"><span>Flip a ciphertext bit</span></label>
    <label class="fer-chip"><input type="radio" name="fer-tamper" id="fer-t2"><span>Add one second</span></label>
    <label class="fer-chip"><input type="radio" name="fer-tamper" id="fer-t3"><span>Use an old token</span></label>
    <label class="fer-chip"><input type="radio" name="fer-tamper" id="fer-t4"><span>Bump the version</span></label>
  </div>
  <div class="fer-lab-scroll">
    <div class="fer-lab-strip-wrap">
      <div class="fer-strip" aria-hidden="true">
        <div class="fer-seg fer-seg-v"><b>80</b></div>
        <div class="fer-seg fer-seg-ts"><b>TIMESTAMP</b><span>8 B</span></div>
        <div class="fer-seg fer-seg-iv"><b>IV</b><span>16 B</span></div>
        <div class="fer-seg fer-seg-ct"><b>CIPHERTEXT</b><span>N × 16 B</span></div>
        <div class="fer-seg fer-seg-tag"><b>HMAC</b><span>32 B</span></div>
      </div>
      <div class="fer-strip-legend" aria-hidden="true">
        <span>VER</span><span>TIMESTAMP</span><span>IV</span><span>CIPHERTEXT</span><span>TAG</span>
      </div>
    </div>
  </div>
  <div class="fer-verdicts">
    <div class="fer-verdict fer-verdict-0">
      <span class="fer-stamp">Accept</span>
      <p><b>All five fields parse, the tag matches, the window is open, and the padding is valid.</b> Fernet returns the plaintext. Two encryptions of the same message would still look different, because the IV and timestamp changed.</p>
    </div>
    <div class="fer-verdict fer-verdict-1">
      <span class="fer-stamp fer-stamp--reject">Reject</span>
      <p><b>The first failing check is VERIFY.</b> One flipped bit changes the HMAC input, so the 32-byte tag no longer matches. AES never runs. This is the case that turns a malleable CBC ciphertext into an all-or-nothing record.</p>
    </div>
    <div class="fer-verdict fer-verdict-2">
      <span class="fer-stamp fer-stamp--reject">Reject</span>
      <p><b>The first failing check is VERIFY.</b> The timestamp sits outside the ciphertext but inside the tag. Adding one second still leaves the TTL window open, so the HMAC is what catches it. A larger jump into the future would also trip the 60-second skew check.</p>
    </div>
    <div class="fer-verdict fer-verdict-3">
      <span class="fer-stamp fer-stamp--reject">Reject</span>
      <p><b>The first failing check is WINDOW.</b> The tag is valid and the message is authentic; it is simply too old for the TTL the receiver chose. Rejecting an authentic but stale token is a policy decision, not a cryptographic failure.</p>
    </div>
    <div class="fer-verdict fer-verdict-4">
      <span class="fer-stamp fer-stamp--reject">Reject</span>
      <p><b>The first failing check is DECODE.</b> An unknown version byte is rejected before any key is used. The version field is how the format can evolve without guessing at the meaning of a future layout.</p>
    </div>
  </div>
  <div class="fer-fig-src">PURE CSS · NO JAVASCRIPT · THE STRIP IS SCHEMATIC</div>
</figure>

## What the seal proves — and what it does not

Fernet is an authenticated-encryption recipe: confidentiality, integrity, and authenticity delivered through a composition rather than a single AEAD primitive. The distinction matters when you start asking for features.

| Property | How Fernet gets it | Where the boundary is |
| :--- | :--- | :--- |
| Confidentiality | AES-128-CBC with a fresh random IV | The key holder can read it; the timestamp stays visible |
| Integrity | HMAC-SHA256 over the header and ciphertext | Any single-bit change rejects the whole token |
| Authenticity | HMAC under a separate signing key | Anyone with the key can forge a valid token |
| Freshness | TTL window over the timestamp that the tag covers | Not replay prevention; 60 seconds of clock skew is tolerated |
| Format agility | The `0x80` version byte | Unknown versions are rejected, not negotiated |

The missing feature that bites most often is **associated data**. Fernet has no AAD parameter. If a token is valid for tenant A, Fernet will not notice when you accept it for tenant B. The tag authenticates bytes, not meaning.

Bind context at the payload layer. Put the tenant, purpose, or route inside the encrypted JSON and verify it after decryption. Or derive a separate key per context with HKDF. Do not prepend a context string to the token and call it authenticated; only bytes inside the HMAC input are covered.

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

This does not stop a token from being replayed in the same context. A captured token is a bearer credential until its TTL expires. If the operation is one-time — a password reset, a payment, an invitation — store a nonce or token ID inside the plaintext, record it server-side, and reject duplicates. TTL shortens the replay window; it does not close it.

Forward secrecy is not on the menu either. One long-lived key decrypts every token it ever encrypted. Rotation limits the blast radius; it does not retrofit per-message keys. If you need forward secrecy, a symmetric file format is the wrong tool.

## Rotation, passwords, and the boring operational parts

### Rotating keys without a flag day

`MultiFernet` takes a list of `Fernet` instances. It encrypts with the first key and tries every key on decrypt.

```python
from cryptography.fernet import Fernet, MultiFernet

ring = MultiFernet([Fernet(new_key), Fernet(old_key)])
new_token = ring.rotate(old_token)   # re-seal under the new key
```

`rotate()` preserves the original timestamp. That also preserves the original TTL: a token five minutes from expiry stays five minutes from expiry after rotation. If you need a fresh lifetime, decrypt and encrypt again — but only for data whose age you actually want to reset.

Rotation is not finished when the list changes. Re-encrypt stored tokens, keep the old key only as long as the oldest token can live, then remove it. `extract_timestamp()` verifies the tag before returning the timestamp, so it is safe to use when scheduling re-encryption.

### Passwords are not keys

`Fernet` expects a key, not a passphrase. If a human supplies the secret, run it through a key derivation function with a per-user salt. The cryptography documentation recommends Argon2id; the output is 32 bytes, which you base64url-encode.

```python
import base64
import os
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.kdf.argon2 import Argon2id

password = os.environ["FERNET_PASSPHRASE"].encode()  # bytes, supplied at runtime
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

Store the salt next to the ciphertext. Never log the password or the derived key. The parameters above follow the RFC 9106 guidance quoted in the docs. If your `cryptography` release predates the Argon2id API, upgrade it or use `Scrypt` with explicit parameters — not a raw SHA-256 of the password.

### Treat the token as a credential

A Fernet token is encrypted, but it is also a bearer credential until it expires. Do not put tokens in URLs, analytics events, or error messages. Log the operation and a key version from your own envelope, not the token itself.

Fernet has no key identifier field. `MultiFernet` tries keys in order and does not tell you which one succeeded. If rotation telemetry matters, wrap the token in your own envelope with a key ID, or record the key version alongside the ciphertext in storage.

## Open a token yourself

To see the layout without trusting a diagram, decode a token with the standard library. This uses the same key that encrypted it.

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

Then break it on purpose. Flip a bit in the ciphertext and re-encode the record:

```python
raw = bytearray(base64.urlsafe_b64decode(token))
raw[-40] ^= 0x01                  # inside the ciphertext, before the tag
tampered = base64.urlsafe_b64encode(bytes(raw))
f.decrypt(tampered)               # InvalidToken
```

Byte `-40` is always inside the ciphertext for a token with at least one block: the tag occupies the last 32 bytes, so `-40` is eight bytes before the tag. Change a timestamp byte and the tag fails. If you decrypt with a TTL, a large jump may be rejected by the window before the tag is checked; either way, no plaintext. That is why the header is inside the MAC.

## A short checklist

- Generate keys with `Fernet.generate_key()` and store them in a secret manager, not in code.
- Pass a TTL when decrypting anything that expires. The sender cannot enforce an expiry; the receiver chooses it.
- Bind context inside the plaintext. Fernet has no associated data.
- Add a nonce for one-time operations. A TTL is not replay protection.
- Rotate with `MultiFernet`, re-encrypt stored tokens, and retire old keys on a schedule.
- Derive keys from passwords with Argon2id or Scrypt, never with a bare hash.
- Catch `InvalidToken`, fail closed, and log nothing sensitive.
- Treat tokens as bearer credentials; shorten the TTL for high-value actions.
- Keep clocks synchronized. The implementation tolerates 60 seconds of future skew, not an unbounded one.
- If you implement the format in another language, run the spec's acceptance tests before trusting your parser.

## References

- [Fernet specification v0x80](https://github.com/fernet/spec/blob/master/Spec.md) — the field layout, key format, and generation steps.
- [cryptography: Fernet (symmetric encryption)](https://cryptography.io/en/latest/fernet/) — API, `MultiFernet`, password derivation, and limitations.
- [cryptography `fernet.rs`](https://github.com/pyca/cryptography/blob/main/src/rust/src/fernet.rs) — the current implementation, including the 60-second skew and check order.
- [fernet-rb](https://github.com/fernet/fernet-rb) — the original Ruby implementation.
- [RFC 4648](https://www.rfc-editor.org/rfc/rfc4648) — base64url.
- [RFC 5652 §6.3](https://www.rfc-editor.org/rfc/rfc5652#section-6.3) — PKCS#7 padding.
- [RFC 2104](https://www.rfc-editor.org/rfc/rfc2104) — HMAC.
- [NIST SP 800-38A](https://csrc.nist.gov/pubs/sp/800/38/a/final) — CBC mode.
- [RFC 9106](https://www.rfc-editor.org/rfc/rfc9106) — Argon2 parameters.

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
