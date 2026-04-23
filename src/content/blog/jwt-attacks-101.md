---
title: "Jwt Attacks 101"
description: "In this write-up I’ll cover several JWT attack techniques I encountered while solving labs, reading articles, and attending talks. You’ll get practical examples, notes I took while learning, and clear"
pubDate: 2026-04-22
tags: ["Security Research", "Red Team"]
author: "Mohamed Eletrepy (maverick)"
readingTime: 7
coverImage: "https://cdn-images-1.medium.com/max/800/0*Z-gF0darI6WcLj4V.png"
---

---

### Jwt Attacks 101

![](https://cdn-images-1.medium.com/max/800/0*Z-gF0darI6WcLj4V.png)

#### Introduction

In this write-up I’ll cover several JWT attack techniques I encountered while solving labs, reading articles, and attending talks. You’ll get practical examples, notes I took while learning, and clear guidance on how these issues show up in real systems. Ready? Let’s get started.

---

### JWT Structure

A JSON Web Token (JWT) is made up of **three parts** separated by dots (`.`):
 `header.payload.signature`

Each part is **Base64URL-encoded** (a variant of Base64 that removes padding `=` and uses URL-safe characters). The final JWT looks something like this:

```text
xxxxx.yyyyy.zzzzz
```

Now, let’s break down what each part actually does:

### Header

The header defines the **type of token** (usually `JWT`) and the **signing algorithm** used to protect it such as `HS256`, `RS256`, or `PS256`.

Example:

```json
{  "alg": "HS256",  "typ": "JWT"}
```

### Payload

This is where the **juicy stuff** lives — the actual data.
 It contains **claims**, which can be user information (like username, role, or session ID), as well as metadata such as token expiration (`exp`) or issuer (`iss`).
 In many cases, this is where you’ll find something like `role: admin` and that’s usually where attackers get interested. 😏

Example:

```json
{  "sub": "mohamed",  "role": "admin",  "exp": 1738700000}
```

### Signature

The signature is like the **fingerprint** of the JWT it proves the token hasn’t been tampered with.
 It’s created by taking the encoded **header** and **payload**, joining them with a dot, and then signing the result using the chosen algorithm and a secret key.

In short:

```text
signature = sign( base64url(header) + "." + base64url(payload), secret )
```

If someone changes even one character in the header or payload, the signature will no longer match, and the token becomes invalid unless, of course, the app isn’t verifying it properly (and that’s where the fun starts).

---

### JWT Signing Algorithms

During labs or web pentesting you’ll see different [JWT algorithms](https://auth0.com/docs/get-started/applications/signing-algorithms). You need to know how they differ because that knowledge helps when manipulating tokens during attacks. In practice you’ll often create your own keys and test how a target validates (or fails to validate) signatures. Also remember: some algorithms especially HMAC-based ones using weak secrets can be cracked offline, so include secret-guessing or brute-force checks in your workflow. Now is the time to learn the common JSON Web algorithms.

![](https://cdn-images-1.medium.com/max/1200/1*hLptiRak-gkY_wytwehhog.png)

*Json Web Alogrithms*

---

Now we’re ready to demonstrate common JWT misconfigurations that lead to full authentication and authorization bypasses in web applications. One annoying reality is that JWTs aren’t limited to the main domain, login, or SSO pages they can appear on any endpoint. You **must** check and test every single endpoint. Different endpoints are often written in different languages and use different libraries, which means each one can have its own unique validation mistakes. Scan broadly, test each token flow, and don’t assume consistency across the app.

### No Signature Check

First, I used two Burp extensions to speed up JWT testing: **JWT Editor** and **JSON Web Tokens**. These extensions let me intercept and modify tokens on the fly edit header, payload, and signature, change the `alg` field, replay tokens through Repeater/Intruder, and quickly test whether the server accepts modified tokens. They integrate smoothly with Burp and make iterative manipulation (and verification checks) much faster when you’re hunting for misconfigurations.

![](https://cdn-images-1.medium.com/max/2560/1*kVdhp8BK_RcPn2d69kyfsw.png)

Now we move to the classic: the developer forgot to call any `verify()` function. The attack is embarrassingly simple in a lab: the JWT is intercepted, the `role` claim in the payload is changed from `user` to `admin`, and the modified token is replayed the server accepts it because it never actually verifies the signature. In my workflow the Burp JWT extensions made this trivial: they highlight requests that contain JWTs, I send the request to Repeater, edit the payload (change `role: "user"` → `role: "admin"`), and resend. If the server ignores signature verification, that request becomes an immediate privilege escalation.

![](https://cdn-images-1.medium.com/max/1200/1*8HGuKYcWBtDVoeUVFGY7Qw.png)

*send the reqeust to repeater*

![](https://cdn-images-1.medium.com/max/1200/1*Mn6EewOq7JAP5A7YLz_teQ.png)

*removeuserand setadminas user and send the reqeust*

---

### None Algorithm Attack

This one’s embarrassingly simple and a classic CTF/lab find: some servers accept tokens with `"alg": "none"` (meaning “no signature”) and never actually verify a signature. The exploit is straightforward in a lab change the header to use `alg: "none"`, modify the payload (e.g., change `role: "user"` → `role: "admin"`), remove the signature, and resend the token. If the application doesn’t validate signatures, the modified token will be accepted and you get elevated access.

### Testing workflow (authorized testing only)

1. Identify a request that carries a JWT (extensions or Burp’s search/highlight help here).
2. Inspect the token header note the original `alg`.
3. Edit the token header to: `{"alg":"none","typ":"JWT"}`.
4. Edit the payload to escalate privileges (e.g., change `role` or `username` to an admin).
5. Remove the signature portion (the token becomes `header.payload.` or header.payload with an empty signature field depending on tooling).
6. Replay the request (Repeater) and observe the server response. If the server accepts the request as authenticated/authorized, it’s vulnerable.

![](https://cdn-images-1.medium.com/max/1200/1*I1wkE8-CLc7qnOr3XeNYzw.png)

*Here we intercepted a low-privilege user winner, not admin. and send it in repeater*

![](https://cdn-images-1.medium.com/max/1200/1*QDXqDM2neXuYvfGKIhboQA.png)

*Step completed: changedalg→none, stripped the signature, turned the user into an admin, and walked straight into/admin.*

Damn you rarely see this attack in real engagements anymore because vulnerable libraries get patched quickly. Still, once you know the technique it’s worth testing against big platforms (Azure, etc.). [**dirkjanm**](https://dirkjanm.io/)** **has some excellent research on this topic check[ his write-up](https://dirkjanm.io/obtaining-global-admin-in-every-entra-id-tenant-with-actor-tokens/)s for practical examples and deeper context.

---

#### Weak Keys

Think of a JWT signature like any other hash — if the signing secret is weak, you can crack it. For example, an `HS256` token signed with a short or guessable secret can be brute-forced (e.g., with Hashcat) in a lab. Once you recover the secret, you can re-sign tokens at will: change the payload (e.g., set `role` → `admin`), re-create the signature, and replay the full JWT in requests. I tested this in a lab using jwt.io’s debugger to verify the signature after recovering the secret — when verification succeeded I injected the modified token and it worked.

cracking the hash

```bash
└─# hashcat -m 16500 ctf.txt /usr/share/wordlists/rockyou.txthashcat (v6.2.6) startingOpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]====================================================================================================================================================* Device #1: cpu-penryn-AMD Ryzen 7 4800H with Radeon Graphics, 1823/3710 MB (512 MB allocatable), 4MCUMinimum password length supported by kernel: 0Maximum password length supported by kernel: 256Hashes: 1 digests; 1 unique digests, 1 unique saltsBitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotatesRules: 1Optimizers applied:* Zero-Byte* Not-Iterated* Single-Hash* Single-SaltWatchdog: Temperature abort trigger set to 90cHost memory required for this attack: 0 MBDictionary cache hit:* Filename..: /usr/share/wordlists/rockyou.txt* Passwords.: 14344385* Bytes.....: 139921507* Keyspace..: 14344385Cracking performance lower than expected?                 * Append -w 3 to the commandline.  This can cause your screen to lag.* Append -S to the commandline.  This has a drastic speed impact but can be better for specific attacks.  Typical scenarios are a small wordlist but a large ruleset.* Update your backend API runtime / driver the right way:  https://hashcat.net/faq/wrongdriver* Create more work items to make use of your parallelization power:  https://hashcat.net/faq/moreworkeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoidGVzdCJ9.IAu_YSHppFe8hXH_BSPb4OLJYGUi8wXqXdS0T33cKbA:ilovepico                                                          Session..........: hashcatStatus...........: CrackedHash.Mode........: 16500 (JWT (JSON Web Token))Hash.Target......: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoidG...33cKbATime.Started.....: Wed Oct  8 19:04:01 2025 (14 secs)Time.Estimated...: Wed Oct  8 19:04:15 2025 (0 secs)Kernel.Feature...: Pure KernelGuess.Base.......: File (/usr/share/wordlists/rockyou.txt)Guess.Queue......: 1/1 (100.00%)Speed.#1.........:   529.0 kH/s (0.46ms) @ Accel:256 Loops:1 Thr:1 Vec:4Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)Progress.........: 7395328/14344385 (51.56%)Rejected.........: 0/7395328 (0.00%)Restore.Point....: 7394304/14344385 (51.55%)Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:0-1Candidate.Engine.: Device GeneratorCandidates.#1....: ilovequay -> ilovepaul0Hardware.Mon.#1..: Util: 35%Started: Wed Oct  8 19:03:51 2025Stopped: Wed Oct  8 19:04:16 2025
```

After cracking the JWT secret, I can re-sign the token using that secret and encode a new token with `role: "admin"`. Then I place the new JWT into the request and replay it and it succeeds. In short: once you recover the HMAC key, you can forge valid tokens and escalate privileges at will.

![](https://cdn-images-1.medium.com/max/1200/1*gwavHarw5kCL_vHfYbl9Xw.png)

![](https://cdn-images-1.medium.com/max/1200/1*xUNTW59fWGp8HIXsDWsMZA.png)

Done we are Admin now

---

### Algorithm Confusion

View original.

Exported from Medium on April 20, 2026.