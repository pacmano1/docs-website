import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Open Integration Engine",
  description: "Open Integration Engine documentation",
  srcDir: './docs',

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Documentation', link: '/engine/' },
      { text: 'Launchers', link: '/launchers/' },
      { text: 'Examples', link: '/examples/' },
    ],

    logo: 'https://raw.githubusercontent.com/OpenIntegrationEngine/governance/refs/heads/main/branding/logos/oie_logo_only_white_background.svg',

    editLink: {
      text: 'Edit this page on GitHub',
      pattern: 'https://github.com/openintegrationengine/docs-website/edit/main/docs/:path'
    },

    search: {
      provider: 'local'
    },

    lastUpdated: true,

    outline: [2, 3],

    sidebar: [
      { text: 'Overview', link: '/engine/' },
      {
        text: 'Concepts',
        collapsed: false,
        items: [
          { text: 'Architecture', link: '/engine/architecture_overview' },
          { text: 'Message Lifecycle and Storage', link: '/engine/message_lifecycle' },
          { text: 'Threading and Ordering', link: '/engine/threading_and_ordering' },
          { text: 'Queueing', link: '/engine/queueing' },
          { text: 'Deploy, Start, and Channel State', link: '/engine/channel_state' },
          { text: 'Data Types and Formats', link: '/engine/data_types_and_formats' },
        ]
      },
      {
        text: 'Getting Started',
        collapsed: true,
        items: [
          { text: 'Installation', link: '/engine/installation' },
          { text: 'Server Process Management', link: '/engine/server_process_management' },
          { text: 'Accessing the Administrator', link: '/engine/accessing_the_administrator' },
        ]
      },
      {
        text: 'Administrators',
        collapsed: true,
        items: [
          { text: 'Desktop Administrator', link: '/engine/desktop_administrator' },
          { text: 'Web Administrator', link: '/engine/web_administrator' },
          { text: 'Dashboard and Monitoring', link: '/engine/dashboard_and_monitoring' },
        ]
      },
      {
        text: 'Channels',
        collapsed: true,
        items: [
          { text: 'Channels and Connectors', link: '/engine/channels_and_connectors' },
          { text: 'Channel Development Guide', link: '/engine/channel_development_guide' },
          { text: 'Connector Reference', link: '/engine/connector_reference' },
          { text: 'Polling Settings', link: '/engine/polling_settings' },
          { text: 'Filters and Transformers', link: '/engine/filters_and_transformers' },
        ]
      },
      {
        text: 'Scripting',
        collapsed: true,
        items: [
          { text: 'JavaScript Scripting Reference', link: '/engine/javascript_scripting_reference' },
          { text: 'JavaScript Editor', link: '/engine/javascript_editor' },
          { text: 'Code Templates', link: '/engine/code_templates' },
          { text: 'Global Scripts', link: '/engine/global_scripts' },
          { text: 'Velocity Variable Replacement', link: '/engine/velocity_variable_replacement' },
          { text: 'Source Map Variables', link: '/engine/source_map_variables' },
          { text: 'Debugger', link: '/engine/debugger' },
        ]
      },
      {
        text: 'Configuration',
        collapsed: true,
        items: [
          { text: 'Server Configuration', link: '/engine/server_configuration' },
          { text: 'Database Support', link: '/engine/database_support' },
          { text: 'Configuration Properties Reference', link: '/engine/configuration_properties_reference' },
        ]
      },
      {
        text: 'Operations',
        collapsed: true,
        items: [
          { text: 'User Management', link: '/engine/user_management' },
          { text: 'Alerts and Notifications', link: '/engine/alerts_and_notifications' },
          { text: 'Logging', link: '/engine/logging' },
          { text: 'Data Pruning and Maintenance', link: '/engine/data_pruning_and_maintenance' },
          { text: 'Upgrade Guide', link: '/engine/upgrade_guide' },
        ]
      },
      {
        text: 'Security',
        collapsed: true,
        items: [
          { text: 'Security and Compliance', link: '/engine/security_and_compliance' },
          { text: 'Security Posture and Hardening', link: '/engine/security_posture_and_hardening' },
        ]
      },
      {
        text: 'Extensions',
        collapsed: true,
        items: [
          { text: 'Plugin Guide', link: '/engine/plugins' },
          { text: 'Extension Catalog', link: '/engine/extension_catalog' },
        ]
      },
      {
        text: 'Automation',
        collapsed: true,
        items: [
          { text: 'Command Line Interface', link: '/engine/command_line_interface' },
          { text: 'REST API', link: '/engine/rest_api' },
        ]
      },
      { text: 'Contributing', link: '/engine/contributing' },
      { text: 'Launchers', link: '/launchers/' },
      { text: 'Examples', link: '/examples/' },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/openintegrationengine' },
      { icon: 'discord', link: 'https://discord.gg/azdehW2Zrx' },
      { icon: 'docker', link: 'https://hub.docker.com/u/openintegrationengine' },
    ]
  },
})
