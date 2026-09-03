import{_ as a,c as n,o as e,ag as p}from"./chunks/framework.CoPVQkzc.js";const u=JSON.parse('{"title":"Command Line Interface","description":"CLI commands and scripting","frontmatter":{"title":"Command Line Interface","description":"CLI commands and scripting"},"headers":[],"relativePath":"engine/command_line_interface.md","filePath":"engine/command_line_interface.md","lastUpdated":1788476353000}'),t={name:"engine/command_line_interface.md"};function i(l,s,o,c,r,d){return e(),n("div",null,s[0]||(s[0]=[p(`<h1 id="command-line-interface" tabindex="-1">Command Line Interface <a class="header-anchor" href="#command-line-interface" aria-label="Permalink to &quot;Command Line Interface&quot;">​</a></h1><p>The OIE CLI provides a terminal-based interface for managing the server. It connects over the same REST API as the desktop and web administrators and is useful for scripting, automation, and headless administration.</p><h2 id="configuration" tabindex="-1">Configuration <a class="header-anchor" href="#configuration" aria-label="Permalink to &quot;Configuration&quot;">​</a></h2><p>The CLI configuration file is located at:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>OIE_HOME/conf/mirth-cli-config.properties</span></span></code></pre></div><p>Default contents:</p><div class="language-properties vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">properties</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">address</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=https://127.0.0.1:8443</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">user</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=admin</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">password</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=admin</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">version</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=0.0.0</span></span></code></pre></div><h3 id="environment-variable-substitution" tabindex="-1">Environment variable substitution <a class="header-anchor" href="#environment-variable-substitution" aria-label="Permalink to &quot;Environment variable substitution&quot;">​</a></h3><p>As of 4.6.0 the config file is read through Apache Commons Configuration2, which performs variable interpolation. Environment variables can be referenced with <code>\${env:VARIABLE_NAME}</code>:</p><div class="language-properties vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">properties</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">address</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=\${env:OIE_SERVER_URL}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">user</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=\${env:OIE_USER}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">password</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=\${env:OIE_PASSWORD}</span></span></code></pre></div><p>This keeps credentials out of the file itself, which matters because the CLI config otherwise stores a password in plain text.</p><div class="info custom-block"><p class="custom-block-title">INFO</p><p>If you point at a config file explicitly with <code>-c</code> and it cannot be loaded, the CLI reports the failure and exits with status 2. If you rely on the default path and that file cannot be loaded, the CLI continues silently, and you will only find out when it complains that address, user, and password are missing.</p></div><h2 id="launching-the-cli" tabindex="-1">Launching the CLI <a class="header-anchor" href="#launching-the-cli" aria-label="Permalink to &quot;Launching the CLI&quot;">​</a></h2><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Using the launcher</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">java</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -jar</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> mirth-cli-launcher.jar</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># With command-line options</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">java</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -jar</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> mirth-cli-launcher.jar</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -a</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://host:8443</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -u</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> admin</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -p</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> password</span></span></code></pre></div><h3 id="command-line-options" tabindex="-1">Command-line options <a class="header-anchor" href="#command-line-options" aria-label="Permalink to &quot;Command-line options&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Flag</th><th>Description</th></tr></thead><tbody><tr><td><code>-a &lt;address&gt;</code></td><td>Server address (e.g., <code>https://localhost:8443</code>)</td></tr><tr><td><code>-u &lt;user&gt;</code></td><td>Username</td></tr><tr><td><code>-p &lt;password&gt;</code></td><td>Password</td></tr><tr><td><code>-s &lt;script&gt;</code></td><td>Execute a script file and exit</td></tr><tr><td><code>-v &lt;version&gt;</code></td><td>Server version</td></tr><tr><td><code>-c &lt;config file&gt;</code></td><td>Path to CLI config file (default: <code>conf/mirth-cli-config.properties</code>)</td></tr><tr><td><code>-h</code></td><td>Show help</td></tr><tr><td><code>-d</code></td><td>Enable debug mode (prints stack traces on errors)</td></tr></tbody></table><h2 id="commands-reference" tabindex="-1">Commands reference <a class="header-anchor" href="#commands-reference" aria-label="Permalink to &quot;Commands reference&quot;">​</a></h2><h3 id="channel-status-and-control" tabindex="-1">Channel status and control <a class="header-anchor" href="#channel-status-and-control" aria-label="Permalink to &quot;Channel status and control&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>status</span></span>
<span class="line"><span>    Returns status of all deployed channels</span></span>
<span class="line"><span></span></span>
<span class="line"><span>channel list</span></span>
<span class="line"><span>    Lists all channels</span></span>
<span class="line"><span></span></span>
<span class="line"><span>channel start id|&quot;name&quot;|*</span></span>
<span class="line"><span>    Starts specified channel(s)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>channel stop id|&quot;name&quot;|*</span></span>
<span class="line"><span>    Stops specified channel(s)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>channel halt id|&quot;name&quot;|*</span></span>
<span class="line"><span>    Force-stops specified channel(s) immediately</span></span>
<span class="line"><span></span></span>
<span class="line"><span>channel pause id|&quot;name&quot;|*</span></span>
<span class="line"><span>    Pauses specified channel(s)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>channel resume id|&quot;name&quot;|*</span></span>
<span class="line"><span>    Resumes paused channel(s)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>channel deploy id|&quot;name&quot;|*</span></span>
<span class="line"><span>    Deploys specified channel(s)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>channel undeploy id|&quot;name&quot;|*</span></span>
<span class="line"><span>    Undeploys specified channel(s)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>channel stats id|&quot;name&quot;|*</span></span>
<span class="line"><span>    Shows statistics for specified channel(s)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>channel enable id|&quot;name&quot;|*</span></span>
<span class="line"><span>    Enables specified channel(s)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>channel disable id|&quot;name&quot;|*</span></span>
<span class="line"><span>    Disables specified channel(s)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>channel rename id|&quot;name&quot; newname</span></span>
<span class="line"><span>    Renames specified channel</span></span>
<span class="line"><span></span></span>
<span class="line"><span>channel remove id|&quot;name&quot;|*</span></span>
<span class="line"><span>    Removes specified channel(s)</span></span></code></pre></div><p>Use <code>*</code> to target all channels.</p><h3 id="deploy" tabindex="-1">Deploy <a class="header-anchor" href="#deploy" aria-label="Permalink to &quot;Deploy&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>deploy [timeout]</span></span>
<span class="line"><span>    Deploys all channels with optional timeout (in seconds)</span></span></code></pre></div><h3 id="import-export-channels" tabindex="-1">Import / export channels <a class="header-anchor" href="#import-export-channels" aria-label="Permalink to &quot;Import / export channels&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>import &quot;path&quot; [force]</span></span>
<span class="line"><span>    Imports channel from file. &#39;force&#39; overwrites existing.</span></span>
<span class="line"><span></span></span>
<span class="line"><span>export id|&quot;name&quot;|* &quot;path&quot;</span></span>
<span class="line"><span>    Exports channel(s) to file</span></span></code></pre></div><h3 id="import-export-server-configuration" tabindex="-1">Import / export server configuration <a class="header-anchor" href="#import-export-server-configuration" aria-label="Permalink to &quot;Import / export server configuration&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>importcfg &quot;path&quot; [nodeploy] [overwriteconfigmap]</span></span>
<span class="line"><span>    Imports full server configuration.</span></span>
<span class="line"><span>    &#39;nodeploy&#39; prevents auto-deployment.</span></span>
<span class="line"><span>    &#39;overwriteconfigmap&#39; replaces the Configuration Map.</span></span>
<span class="line"><span></span></span>
<span class="line"><span>exportcfg &quot;path&quot;</span></span>
<span class="line"><span>    Exports full server configuration to file</span></span></code></pre></div><h3 id="alerts" tabindex="-1">Alerts <a class="header-anchor" href="#alerts" aria-label="Permalink to &quot;Alerts&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>importalert &quot;path&quot; [force]</span></span>
<span class="line"><span>    Imports alert from file. &#39;force&#39; overwrites existing.</span></span>
<span class="line"><span></span></span>
<span class="line"><span>exportalert id|&quot;name&quot;|* &quot;path&quot;</span></span>
<span class="line"><span>    Exports alert(s) to file</span></span></code></pre></div><h3 id="scripts" tabindex="-1">Scripts <a class="header-anchor" href="#scripts" aria-label="Permalink to &quot;Scripts&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>importscripts &quot;path&quot;</span></span>
<span class="line"><span>    Imports global scripts from file</span></span>
<span class="line"><span></span></span>
<span class="line"><span>exportscripts &quot;path&quot;</span></span>
<span class="line"><span>    Exports global scripts to file</span></span></code></pre></div><h3 id="code-templates" tabindex="-1">Code templates <a class="header-anchor" href="#code-templates" aria-label="Permalink to &quot;Code templates&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>codetemplate library list [includecodetemplates]</span></span>
<span class="line"><span>    Lists all code template libraries.</span></span>
<span class="line"><span>    &#39;includecodetemplates&#39; shows templates within each library.</span></span>
<span class="line"><span></span></span>
<span class="line"><span>codetemplate list</span></span>
<span class="line"><span>    Lists all code templates</span></span>
<span class="line"><span></span></span>
<span class="line"><span>codetemplate import &quot;path&quot; [force]</span></span>
<span class="line"><span>    Imports code templates from file</span></span>
<span class="line"><span></span></span>
<span class="line"><span>codetemplate library import &quot;path&quot; [force]</span></span>
<span class="line"><span>    Imports code template libraries from file</span></span>
<span class="line"><span></span></span>
<span class="line"><span>codetemplate export id|&quot;name&quot; &quot;path&quot;</span></span>
<span class="line"><span>    Exports a code template to file</span></span>
<span class="line"><span></span></span>
<span class="line"><span>codetemplate library export id|&quot;name&quot;|* &quot;path&quot;</span></span>
<span class="line"><span>    Exports code template library(ies) to file</span></span>
<span class="line"><span></span></span>
<span class="line"><span>codetemplate remove id|&quot;name&quot;</span></span>
<span class="line"><span>    Removes a code template</span></span>
<span class="line"><span></span></span>
<span class="line"><span>codetemplate library remove id|&quot;name&quot;|*</span></span>
<span class="line"><span>    Removes code template library(ies)</span></span></code></pre></div><h3 id="messages" tabindex="-1">Messages <a class="header-anchor" href="#messages" aria-label="Permalink to &quot;Messages&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>importmessages &quot;path&quot; id</span></span>
<span class="line"><span>    Imports messages from file into the specified channel</span></span>
<span class="line"><span></span></span>
<span class="line"><span>exportmessages &quot;path/file-pattern&quot; id [format] [pageSize]</span></span>
<span class="line"><span>    Exports all messages for a channel.</span></span>
<span class="line"><span>    Formats: xml, xml-attach, raw, processedraw, transformed, encoded, sent, response, responsetransformed, processedresponse</span></span></code></pre></div><h3 id="configuration-map" tabindex="-1">Configuration Map <a class="header-anchor" href="#configuration-map" aria-label="Permalink to &quot;Configuration Map&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>importmap &quot;path&quot;</span></span>
<span class="line"><span>    Imports configuration map from file</span></span>
<span class="line"><span></span></span>
<span class="line"><span>exportmap &quot;path&quot;</span></span>
<span class="line"><span>    Exports configuration map to file</span></span></code></pre></div><h3 id="statistics-and-events" tabindex="-1">Statistics and events <a class="header-anchor" href="#statistics-and-events" aria-label="Permalink to &quot;Statistics and events&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>resetstats [lifetime]</span></span>
<span class="line"><span>    Resets all channel statistics. &#39;lifetime&#39; also resets lifetime stats.</span></span>
<span class="line"><span></span></span>
<span class="line"><span>clearallmessages</span></span>
<span class="line"><span>    Removes all messages from all channels (running channels will restart)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>dump stats &quot;path&quot;</span></span>
<span class="line"><span>    Dumps channel statistics to file</span></span>
<span class="line"><span></span></span>
<span class="line"><span>dump events &quot;path&quot;</span></span>
<span class="line"><span>    Dumps events to file</span></span></code></pre></div><h3 id="user-management" tabindex="-1">User management <a class="header-anchor" href="#user-management" aria-label="Permalink to &quot;User management&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>user list</span></span>
<span class="line"><span>    Lists all users</span></span>
<span class="line"><span></span></span>
<span class="line"><span>user add username &quot;password&quot; &quot;firstName&quot; &quot;lastName&quot; &quot;organization&quot; &quot;email&quot;</span></span>
<span class="line"><span>    Creates a new user</span></span>
<span class="line"><span></span></span>
<span class="line"><span>user remove id|username</span></span>
<span class="line"><span>    Removes a user</span></span>
<span class="line"><span></span></span>
<span class="line"><span>user changepw id|username &quot;newpassword&quot;</span></span>
<span class="line"><span>    Changes a user&#39;s password</span></span></code></pre></div><h3 id="session" tabindex="-1">Session <a class="header-anchor" href="#session" aria-label="Permalink to &quot;Session&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>quit</span></span>
<span class="line"><span>    Exits the CLI shell</span></span></code></pre></div><h2 id="scripting" tabindex="-1">Scripting <a class="header-anchor" href="#scripting" aria-label="Permalink to &quot;Scripting&quot;">​</a></h2><p>The CLI can execute commands from a script file:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">java</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -jar</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> mirth-cli-launcher.jar</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -s</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /path/to/script.txt</span></span></code></pre></div><h3 id="script-file-example" tabindex="-1">Script file example <a class="header-anchor" href="#script-file-example" aria-label="Permalink to &quot;Script file example&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>deploy</span></span>
<span class="line"><span>channel start *</span></span>
<span class="line"><span>status</span></span>
<span class="line"><span>exportcfg &quot;/backups/config_backup.xml&quot;</span></span>
<span class="line"><span>quit</span></span></code></pre></div><p>This is useful for:</p><ul><li>Automated deployments</li><li>Scheduled backups</li><li>CI/CD pipelines</li><li>Bulk channel management</li></ul>`,49)]))}const m=a(t,[["render",i]]);export{u as __pageData,m as default};
