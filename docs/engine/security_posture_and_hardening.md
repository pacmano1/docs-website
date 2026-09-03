---
title: Security Posture and Hardening
description: Threat boundary, design properties, disclosure, and the hardening checklist
---

# Security Posture and Hardening

The security posture of an OIE deployment is a different question from what a scanner reports about the shipped artifact.

An integration engine is not a finished application. It is a runtime for code the deployer writes, so its posture depends almost entirely on decisions made after installation: where it sits on the network, what the channels do, who can deploy them, and how the host is configured. Scanning a stock install and cataloguing its JAR versions measures none of that.

For the feature-level view of TLS, authentication, and audit settings, see [Security and Compliance](./security_and_compliance.md).

## Scope: OIE, Mirth Connect, and BridgeLink

OIE is a fork of Mirth Connect™, and BridgeLink is another descendant of the same codebase. All three share the architecture described here: channel-scoped scripting executed in the server JVM, an extension model that loads customer and third-party code, and an administration API that is by definition privileged.

An organization evaluating any engine in this lineage, or a vendor shipping a product built on one, inherits the same properties and owes the same assessment. Conclusions drawn about one generally transfer to the others, and so do the obligations. Nothing on this page is unique to OIE except where it names an OIE version.

*Mirth Connect and NextGen are trademarks of NextGen Healthcare. BridgeLink is a trademark of its respective owner. None of them is affiliated with, endorses, or sponsors this project.*

## Customer code runs in the server JVM

Channels contain JavaScript transformers, filters, and scripts that run in the server JVM with the privileges of the service account. Code templates and custom extensions do the same. This is the core product capability, not an oversight, and it is why organizations choose this class of tool in the first place.

Three things follow from that, and all of them matter more than any dependency inventory.

A user with channel deploy permission has code execution on the host. Deploy permission should be treated as equivalent to shell access on that server and granted with the same care. The engine cannot make that decision for the deployer, which makes it the most important access control decision in a deployment.

**Authorization controls do not contain a channel author.** This follows from the first point and is worth stating on its own, because it is the part people most often get wrong. A user who can write and deploy a channel can execute arbitrary code as the service account. From there they can read the keystore and the properties file, reach the database with the engine's own credentials, modify whatever tables an authorization scheme stores its roles in, and call out to anything the host can reach. Role separation is therefore useful for accountability, for limiting accidental damage, and for keeping honest people inside their lane, but it is not a security boundary against someone who can author channels. Anyone granted that capability is effectively an administrator of the server, whatever the roles say.

The attack surface is whatever the implementer built: which connectors are enabled, which ports are bound, what the transformers do, what endpoints and credentials the channels reference, whether the message store is pruned, and whether the deployment is reachable beyond its intended segment. Two installations of the same version can have completely different exposure.

## Properties regularly reported as vulnerabilities

Four properties of a stock installation are reported as findings on a recurring basis. Each is verifiable in the source, and each is either a deliberate design decision or an unset configuration default rather than a defect.

| Property | Status | What actually controls it |
|---|---|---|
| The Rhino script engine runs without a `ClassShutter` or sandbox | By design | Channel authors have full JVM access; that is the product. The control is restricting who can author and deploy channels, not sandboxing a language customers deliberately use to call Java |
| The default authorization controller permits every operation for any authenticated user | By design in the core | An authorization controller can be substituted. Note the limit below: no authorization scheme constrains a user who can author channels |
| The default password policy permits weak passwords | Unset default | Every `password.*` requirement ships at `0`, meaning unenforced. Set them at install |
| Keystore passwords are stored in the configuration file | Hardening item | Tighten file permissions on the keystore and properties file. It requires local read access, and an attacker with that already has a larger problem |

These are accurate observations about a product nobody has configured yet. Each one is closed by a deployment decision, so reporting them against the engine sends the work to the wrong place.

## Scans and penetration tests

A vulnerability scan of an unconfigured engine exercises an admin API and a login form. It then reports the design properties above as defects, plus whatever its dependency database says about the JARs in the release. Neither result transfers to a real deployment, and both go stale with the next version.

The scanner assesses an artifact, while the risk lives in a configuration the scanner never sees. A deployment with the admin port on a public IP and a single administrator account is badly exposed however current its libraries are. A deployment behind a load balancer, with channel authoring restricted to trusted staff and pruning aligned to retention, is in reasonable shape even a few patch versions back.

The assessment that produces actionable findings is one scoped to a *specific* deployment: its network placement, its channel set, its authentication configuration, its host and JVM hardening, and the code its own team wrote into the transformers. Organizations that require penetration test evidence for compliance should scope it that way, and vendors shipping a product built on this engine should expect to perform and stand behind that assessment themselves rather than pointing upstream.

The project does not restrict security testing of self-hosted instances. Findings that turn out to be engine defects rather than configuration issues are welcome at **security@openintegrationengine.org**.

## Network placement

OIE is a back-office integration runtime. It belongs in a protected internal segment or a private subnet, reachable only from the systems it integrates with and from an administrative network. It is not a public-facing application and should not be placed on the general internet. Any assessment that ignores network placement is measuring the wrong thing.

::: info
**The engine can still serve external partners.** Most production deployments receive traffic from outside the perimeter, and that is normal and supported. What changes is where that traffic terminates: at purpose-built edge infrastructure, with the engine behind it. The paragraph above is only half the answer, so read [When External Connectivity Is Required](#when-external-connectivity-is-required) next.
:::

The recommended posture, for the engine itself:

- The Administrator and API port (default 8443) is reachable only from a jump host, VPN, or admin VLAN. Not from the general user population, and not from the internet.
- Inbound channel listeners (MLLP, HTTP, TCP, SFTP) are bound to specific interfaces and restricted by security group, host firewall, or ACL to known peer addresses.
- Outbound connections go through a controlled egress path.
- The database is not directly exposed. The OIE database holds message content, which in a clinical deployment is PHI.

## When external connectivity is required

Most production deployments do need inbound traffic from outside the perimeter: trading partners, cloud-hosted EHRs, FHIR clients, state registries. The rule is not that the engine never receives external traffic. The rule is that the engine's own listener is never the internet edge. Terminate at infrastructure built for that job, and put the engine behind it in a private subnet with no public IP.

In AWS that looks like:

- **HTTP, REST, and FHIR endpoints behind an ALB.** ALB in public subnets, engine targets in private subnets, ACM-managed certificates, TLS 1.2 minimum, a modern security policy. The target security group references the ALB security group rather than a CIDR, so the engine is unreachable except through the load balancer.
- **AWS WAF associated with the ALB.** Rate-based rules, an IP set allowlist for known partner ranges, and managed rule groups. This is inspection you do not get by exposing the engine directly.
- **API Gateway in front of the ALB** where request throttling, OAuth2 or SMART on FHIR token validation, and per-consumer usage plans should be enforced before traffic reaches a channel.
- **MLLP and raw TCP behind an NLB.** ALB is HTTP-only, so HL7 v2 over MLLP terminates on an NLB with a TLS listener. An NLB gives no L7 inspection, so source restriction moves to the security group allowlist and mTLS. Set the connection idle timeout and TCP keepalive deliberately, or long-lived MLLP sessions will be silently reaped.
- **mTLS at the edge or passthrough.** Either ALB mutual TLS with a trust store of partner CAs, or TLS passthrough on an NLB so the engine performs client certificate validation and per-connector cipher and version control is retained.
- **SFTP through AWS Transfer Family into S3**, with the engine polling S3, rather than binding an SFTP listener to a public address.
- **Private connectivity where the partner supports it.** Site-to-site VPN, Direct Connect, or PrivateLink. If the counterparty is also in AWS, PrivateLink removes the public path entirely and is the strongest option available.
- **Deterministic egress.** A NAT gateway with a static Elastic IP so partners can allowlist the deployment, with outbound restricted to known destinations.
- **The Administrator and API port stays off any public listener.** Internal ALB only, reached over VPN or SSM Session Manager. The [Web Administrator](./web_administrator.md) is still an admin plane and gets the same treatment.

The equivalent pattern applies elsewhere: Azure Application Gateway or Front Door with WAF, Google Cloud Load Balancing with Cloud Armor, or an F5 or nginx tier in a DMZ on-premises. The requirement is a managed, patched, purpose-built termination layer with inspection and certificate management in front of the engine, not the engine holding a public IP.

## Dependency currency

Keeping third-party libraries current is necessary but does not by itself say much about a deployment's posture. What the project does is set out below so the question can be answered and closed.

Renovate manages dependency updates on the engine repository, on a monthly schedule with a 14-day minimum release age, automerge disabled, and major updates gated behind dependency-dashboard approval. OSV vulnerability alerts are enabled, so a disclosed vulnerability raises a pull request outside the monthly cadence.

The build resolves from Maven Central, and Gradle enforces a SHA-256 checksum for every resolved artifact against `gradle/verification-metadata.xml`, which is committed to the repository. Two limits are worth stating rather than leaving for a reviewer to find. Signature verification is off (`verify-signatures` is `false`), so this checks integrity rather than publisher provenance. And the checksums were generated from the artifacts Gradle first resolved rather than validated against a publisher signature, which makes it trust on first use. It is a real control against an artifact changing underneath the build, and it is not proof of who published it. The same manifest is maintained by Renovate alongside the updates themselves.

4.6.0 remediated 24 known CVEs and removed the unmaintained Xerces and xml-apis stack. CVE remediation is published per release rather than tracked privately.

The entire codebase is open source under MPL 2.0, so full source review is available at no cost and without an NDA. For most healthcare security teams that is stronger evidence than a redacted summary from a closed-source vendor.

None of it changes the deployment questions above.

## Shared responsibility

| Area | Owner |
|---|---|
| Network segmentation, firewall and security group rules | Deployer |
| OS and JVM patching, host hardening | Deployer |
| Database placement, encryption at rest, credential management | Deployer |
| TLS certificates, cipher policy, mTLS peer configuration | Deployer |
| Authentication, password policy, authorization, admin account lifecycle | Deployer |
| Secrets in channel configuration and the configuration map | Deployer |
| Message store retention and pruning relative to record retention obligations | Deployer |
| Log forwarding to SIEM, alerting, monitoring | Deployer |
| Security of the JavaScript written into channels | Deployer |
| Backup and recovery of channel configuration and the message database | Deployer |
| Assessment of the deployed configuration | Deployer |
| Engine code, dependency currency, CVE remediation | Project |

On a managed or vendor-supported deployment, several of the deployer rows shift to that vendor. Establish which ones explicitly rather than leaving it assumed. A vendor shipping a product built on this engine owns every deployer row for the configuration it ships.

## Hardening checklist

1. Run 4.6.0 or later on a patched Java 17 or newer.
2. **No public IP on the engine.** External traffic terminates at an ALB, NLB, API Gateway, or equivalent, with WAF and source allowlisting where the protocol supports it. The admin port stays on an internal listener, reached over VPN or SSM.
3. Restrict channel authoring and deployment to people trusted with shell access on the host, because that is what it amounts to. Role separation is worth configuring for accountability and for limiting accidental damage, but do not count it as a boundary against someone who can write a channel.
4. Enforce a real password policy, or front authentication with a directory service. Every `password.*` setting defaults to `0` and enforces nothing.
5. TLS 1.2 minimum, mTLS for peers that support it, restricted cipher list.
6. Run under a dedicated service account with least privilege. Tighten file permissions on the keystore, properties files, and the appdata directory.
7. Use a dedicated database instance, encrypted at rest, with credentials not shared with other applications.
8. Set message storage to the minimum content level each channel actually needs, with a pruning schedule aligned to the retention policy. Do not store full raw content indefinitely on channels that do not need it.
9. Forward server and channel event logs to a SIEM. Alert on failed logins, channel deploys, and configuration changes.
10. Keep channel configuration in version control and review changes like code.
11. Scope penetration testing to the deployed configuration, not to a stock install.

See [Data Pruning and Maintenance](./data_pruning_and_maintenance.md) for retention settings and [Security and Compliance](./security_and_compliance.md) for the TLS and audit configuration available in the engine.
